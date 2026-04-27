package wp.finki.wordy.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wp.finki.wordy.model.domain.Document;
import wp.finki.wordy.model.domain.DocumentPermission;
import wp.finki.wordy.service.domain.DocumentService;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/{docId}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long docId) {
        byte[] data = documentService.exportAsPdf(docId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document-" + docId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    @GetMapping("/{docId}/export/docx")
    public ResponseEntity<byte[]> exportDocx(@PathVariable Long docId) {
        byte[] data = documentService.exportAsDocx(docId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document-" + docId + ".docx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(data);
    }

    @PostMapping("/{docId}/collab/invite")
    public ResponseEntity<Void> invite(@PathVariable Long docId,
                                       @RequestHeader(value = "X-User-Username") String ownerUsername,
                                       @RequestBody InviteRequest req) {
        documentService.inviteUser(docId, ownerUsername, req.getInviteeUsername(), req.getRole());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{docId}/collab/change-role")
    public ResponseEntity<Void> changeRole(@PathVariable Long docId,
                                           @RequestHeader(value = "X-User-Username") String ownerUsername,
                                           @RequestBody ChangeRoleRequest req) {
        documentService.changeUserRole(docId, ownerUsername, req.getTargetUsername(), req.getRole());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{docId}/collab/{targetUsername}")
    public ResponseEntity<Void> removeUser(@PathVariable Long docId,
                                           @RequestHeader(value = "X-User-Username") String ownerUsername,
                                           @PathVariable String targetUsername) {
        documentService.removeUser(docId, ownerUsername, targetUsername);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{docId}/collab")
    public ResponseEntity<List<DocumentPermission>> getPermissions(@PathVariable Long docId) {
        return ResponseEntity.ok(documentService.getPermissions(docId));
    }

    @GetMapping("/{docId}/collab/content")
    public ResponseEntity<String> getContent(@PathVariable Long docId) {
        return documentService.findById(docId)
                .map(Document::getContent)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{docId}/collab/patch")
    public ResponseEntity<Void> applyPatch(@PathVariable Long docId,
                                           @RequestHeader(value = "X-User-Username") String username,
                                           @RequestBody PatchRequest req) {
        documentService.updateContent(docId, req.getContent());
        return ResponseEntity.ok().build();
    }

    @Data
    private static class InviteRequest {
        private String inviteeUsername;
        private wp.finki.wordy.model.enumerations.DocumentRole role;
    }

    @Data
    private static class ChangeRoleRequest {
        private String targetUsername;
        private wp.finki.wordy.model.enumerations.DocumentRole role;
    }

    @Data
    private static class PatchRequest {
        private String content;
    }
}

