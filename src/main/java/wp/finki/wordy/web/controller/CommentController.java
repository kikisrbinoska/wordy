package wp.finki.wordy.web.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import wp.finki.wordy.model.domain.Comment;
import wp.finki.wordy.service.domain.CommentService;

import java.util.List;

@RestController
@RequestMapping("/api/documents/{docId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<Comment>> list(@PathVariable Long docId) {
        return ResponseEntity.ok(commentService.findByDocument(docId));
    }

    @PostMapping
    public ResponseEntity<Comment> add(
            @PathVariable Long docId,
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody CommentRequest req) {
        Comment comment = commentService.addComment(
                docId,
                principal.getUsername(),
                req.getContent(),
                req.getParentCommentId(),
                req.getAnchorPos()
        );
        return ResponseEntity.ok(comment);
    }

    @PatchMapping("/{commentId}/resolve")
    public ResponseEntity<Void> resolve(
            @PathVariable Long docId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails principal) {
        commentService.resolveComment(commentId, principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long docId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails principal) {
        commentService.deleteComment(commentId, principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @Data
    static class CommentRequest {
        private String content;
        private Long parentCommentId;
        private String anchorPos;
    }
}
