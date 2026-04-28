package wp.finki.wordy.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wp.finki.wordy.model.domain.Document;
import wp.finki.wordy.model.domain.DocumentPermission;
import wp.finki.wordy.model.domain.DocumentVersion;
import wp.finki.wordy.model.enumerations.DocumentRole;
import wp.finki.wordy.service.domain.DocumentService;
import wp.finki.wordy.service.domain.UserService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document collaboration and export operations")
public class DocumentController {

    private final DocumentService documentService;
    private final UserService userService;

    @Operation(summary = "List all documents")
    @ApiResponse(responseCode = "200", description = "List of documents")
    @GetMapping
    public ResponseEntity<List<Document>> findAll() {
        return ResponseEntity.ok(documentService.findAll());
    }

    @Operation(summary = "Get a document by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Document found"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping("/{docId}")
    public ResponseEntity<Document> findById(
            @Parameter(description = "Document ID") @PathVariable Long docId) {
        return documentService.findById(docId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new document")
    @ApiResponse(responseCode = "200", description = "Document created")
    @PostMapping
    public ResponseEntity<Document> create(@RequestBody CreateRequest req) {
        var owner = userService.findByUsername(req.getOwnerUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getOwnerUsername()));
        Document document = new Document();
        document.setOwner(owner);
        document.setTitle(req.getTitle());
        document.setContent(req.getContent());
        document.setIs_template(req.getIsTemplate() != null ? req.getIsTemplate() : false);
        document.setCreatedAt(LocalDateTime.now());
        document.setUpdatedAt(LocalDateTime.now());
        return documentService.save(document)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @Operation(summary = "Update a document")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Document updated"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @PutMapping("/{docId}")
    public ResponseEntity<Document> update(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @RequestBody UpdateRequest req) {
        Document document = new Document();
        document.setTitle(req.getTitle());
        document.setContent(req.getContent());
        return documentService.update(docId, document)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a document")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Document deleted"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @DeleteMapping("/{docId}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Document ID") @PathVariable Long docId) {
        documentService.deleteById(docId);
        return ResponseEntity.noContent().build();
    }


    @Operation(summary = "Get all documents owned by a user")
    @ApiResponse(responseCode = "200", description = "List of documents")
    @GetMapping("/owner/{username}")
    public ResponseEntity<List<Document>> findByOwner(
            @Parameter(description = "Owner username") @PathVariable String username) {
        return ResponseEntity.ok(documentService.findByOwner(username));
    }


    @Operation(summary = "Get the current content of a document")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Document content", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping("/{docId}/content")
    public ResponseEntity<String> getContent(
            @Parameter(description = "Document ID") @PathVariable Long docId) {
        return documentService.findById(docId)
                .map(Document::getContent)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Update the content of a document")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Content updated"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @PatchMapping("/{docId}/content")
    public ResponseEntity<Document> updateContent(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @RequestBody ContentRequest req) {
        return documentService.updateContent(docId, req.getContent())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Update the title of a document")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Title updated"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @PatchMapping("/{docId}/title")
    public ResponseEntity<Document> updateTitle(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @RequestBody TitleRequest req) {
        return documentService.updateTitle(docId, req.getTitle())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @Operation(summary = "List all collaborators and their roles")
    @ApiResponse(responseCode = "200", description = "List of permissions")
    @GetMapping("/{docId}/collab")
    public ResponseEntity<List<DocumentPermission>> getPermissions(
            @Parameter(description = "Document ID") @PathVariable Long docId) {
        return ResponseEntity.ok(documentService.getPermissions(docId));
    }

    @Operation(summary = "Invite a user to collaborate on a document")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User invited"),
            @ApiResponse(responseCode = "403", description = "Not the document owner"),
            @ApiResponse(responseCode = "404", description = "Document or user not found")
    })
    @PostMapping("/{docId}/collab/invite")
    public ResponseEntity<Void> invite(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @Parameter(description = "Owner username", required = true) @RequestHeader("X-User-Username") String ownerUsername,
            @RequestBody InviteRequest req) {
        documentService.inviteUser(docId, ownerUsername, req.getInviteeUsername(), req.getRole());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Change a collaborator's role")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Role updated"),
            @ApiResponse(responseCode = "403", description = "Not the document owner"),
            @ApiResponse(responseCode = "404", description = "Document or user not found")
    })
    @PostMapping("/{docId}/collab/change-role")
    public ResponseEntity<Void> changeRole(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @Parameter(description = "Owner username", required = true) @RequestHeader("X-User-Username") String ownerUsername,
            @RequestBody ChangeRoleRequest req) {
        documentService.changeUserRole(docId, ownerUsername, req.getTargetUsername(), req.getRole());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Remove a collaborator from a document")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User removed"),
            @ApiResponse(responseCode = "403", description = "Not the document owner"),
            @ApiResponse(responseCode = "404", description = "Document or user not found")
    })
    @DeleteMapping("/{docId}/collab/{targetUsername}")
    public ResponseEntity<Void> removeUser(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @Parameter(description = "Owner username", required = true) @RequestHeader("X-User-Username") String ownerUsername,
            @Parameter(description = "Username to remove") @PathVariable String targetUsername) {
        documentService.removeUser(docId, ownerUsername, targetUsername);
        return ResponseEntity.noContent().build();
    }


    @Operation(summary = "List all versions of a document")
    @ApiResponse(responseCode = "200", description = "List of versions")
    @GetMapping("/{docId}/versions")
    public ResponseEntity<List<DocumentVersion>> getVersions(
            @Parameter(description = "Document ID") @PathVariable Long docId) {
        return ResponseEntity.ok(documentService.getVersions(docId));
    }

    @Operation(summary = "Create a snapshot (version) of a document")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Snapshot created"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @PostMapping("/{docId}/versions/snapshot")
    public ResponseEntity<Void> createSnapshot(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @Parameter(description = "Author username", required = true) @RequestHeader("X-User-Username") String authorUsername,
            @RequestBody SnapshotRequest req) {
        documentService.createSnapshot(docId, authorUsername, req.getLabel());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Restore a document to a previous version")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Version restored"),
            @ApiResponse(responseCode = "404", description = "Document or version not found")
    })
    @PostMapping("/{docId}/versions/{versionId}/restore")
    public ResponseEntity<Void> restoreVersion(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @Parameter(description = "Version ID") @PathVariable Long versionId) {
        documentService.restoreVersion(docId, versionId);
        return ResponseEntity.noContent().build();
    }


    @Operation(summary = "Export document as PDF")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF file", content = @Content(mediaType = "application/pdf")),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping("/{docId}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @Parameter(description = "Document ID") @PathVariable Long docId) {
        byte[] data = documentService.exportAsPdf(docId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document-" + docId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    @Operation(summary = "Export document as DOCX")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "DOCX file", content = @Content(mediaType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping("/{docId}/export/docx")
    public ResponseEntity<byte[]> exportDocx(
            @Parameter(description = "Document ID") @PathVariable Long docId) {
        byte[] data = documentService.exportAsDocx(docId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document-" + docId + ".docx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(data);
    }


    @Data
    static class UpdateRequest {
        private String title;
        private String content;
    }

    @Data
    static class CreateRequest {
        private String ownerUsername;
        private String title;
        private String content;
        private Boolean isTemplate;
    }

    @Data
    static class ContentRequest {
        private String content;
    }

    @Data
    static class TitleRequest {
        private String title;
    }

    @Data
    static class InviteRequest {
        private String inviteeUsername;
        private DocumentRole role;
    }

    @Data
    static class ChangeRoleRequest {
        private String targetUsername;
        private DocumentRole role;
    }

    @Data
    static class SnapshotRequest {
        private String label;
    }
}
