package wp.finki.wordy.controller;

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
public class DocumentAssetController {

    private final DocumentAssetService assetService;

    @PostMapping(value = "/documents/{docId}/assets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentAsset> upload(@PathVariable Long docId,
                                                @RequestHeader(value = "X-User-Username") String username,
                                                @RequestParam("file") MultipartFile file) throws IOException {
        DocumentAsset asset = assetService.upload(docId, username, file);
        return ResponseEntity.ok(asset);
    }

    @GetMapping("/assets/{assetId}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long assetId) {
        byte[] data = assetService.download(assetId);
        // try to get MIME type from repository
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=asset-" + assetId)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @GetMapping("/documents/{docId}/assets")
    public ResponseEntity<List<DocumentAsset>> listByDocument(@PathVariable Long docId) {
        return ResponseEntity.ok(assetService.findByDocument(docId));
    }

    @PostMapping("/assets/{assetId}")
    public ResponseEntity<Void> delete(@PathVariable Long assetId,
                                       @RequestHeader(value = "X-User-Username") String username) {
        assetService.delete(assetId, username);
        return ResponseEntity.noContent().build();
    }
}

