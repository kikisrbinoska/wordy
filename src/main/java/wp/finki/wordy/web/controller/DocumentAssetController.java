package wp.finki.wordy.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import wp.finki.wordy.model.domain.DocumentAsset;
import wp.finki.wordy.service.domain.DocumentAssetService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Document Assets", description = "File upload and download for document attachments")
public class DocumentAssetController {

    private final DocumentAssetService assetService;

    @Operation(summary = "Upload a file asset to a document")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Asset uploaded"),
            @ApiResponse(responseCode = "403", description = "No write permission"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @PostMapping(value = "/documents/{docId}/assets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentAsset> upload(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @Parameter(description = "Uploader username", required = true) @RequestHeader(value = "X-User-Username") String username,
            @RequestParam("file") MultipartFile file) throws IOException {
        DocumentAsset asset = assetService.upload(docId, username, file);
        return ResponseEntity.ok(asset);
    }

    @Operation(summary = "Download an asset by ID (forces browser download)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Asset file", content = @Content(mediaType = "application/octet-stream")),
            @ApiResponse(responseCode = "404", description = "Asset not found")
    })
    @GetMapping("/assets/{assetId}/download")
    public ResponseEntity<byte[]> download(
            @Parameter(description = "Asset ID") @PathVariable Long assetId) {
        DocumentAsset asset = assetService.findById(assetId);
        byte[] data = assetService.download(assetId);
        MediaType mediaType = parseMediaType(asset.getMimeType());
        String fileName = asset.getFileName() != null ? asset.getFileName() : ("asset-" + assetId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .body(data);
    }

    @Operation(summary = "Preview an asset inline in the browser")
    @ApiResponse(responseCode = "200", description = "Asset file served inline")
    @GetMapping("/assets/{assetId}/preview")
    public ResponseEntity<byte[]> preview(
            @Parameter(description = "Asset ID") @PathVariable Long assetId) {
        DocumentAsset asset = assetService.findById(assetId);
        byte[] data = assetService.download(assetId);
        MediaType mediaType = parseMediaType(asset.getMimeType());
        String fileName = asset.getFileName() != null ? asset.getFileName() : ("asset-" + assetId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .body(data);
    }

    private MediaType parseMediaType(String mimeType) {
        if (mimeType != null && !mimeType.isBlank()) {
            try { return MediaType.parseMediaType(mimeType); } catch (Exception ignored) {}
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    @Operation(summary = "List all assets for a document")
    @ApiResponse(responseCode = "200", description = "List of assets")
    @GetMapping("/documents/{docId}/assets")
    public ResponseEntity<List<DocumentAsset>> listByDocument(
            @Parameter(description = "Document ID") @PathVariable Long docId) {
        return ResponseEntity.ok(assetService.findByDocument(docId));
    }

    @Operation(summary = "Delete an asset")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Asset deleted"),
            @ApiResponse(responseCode = "403", description = "No permission to delete"),
            @ApiResponse(responseCode = "404", description = "Asset not found")
    })
    @PostMapping("/assets/{assetId}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Asset ID") @PathVariable Long assetId,
            @Parameter(description = "Caller username", required = true) @RequestHeader(value = "X-User-Username") String username) {
        assetService.delete(assetId, username);
        return ResponseEntity.noContent().build();
    }
}

