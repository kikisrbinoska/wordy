package wp.finki.wordy.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import wp.finki.wordy.config.RedisDocumentListener;
import wp.finki.wordy.model.dto.DocUpdateDto;
import wp.finki.wordy.model.exceptions.DocumentNotFoundException;
import wp.finki.wordy.model.exceptions.DocumentPermissionException;
import wp.finki.wordy.repository.DocumentPermissionRepository;
import wp.finki.wordy.repository.DocumentRepository;
import wp.finki.wordy.service.domain.CollabService;
import wp.finki.wordy.service.domain.impl.CollabSseService;

import java.time.Instant;

@Slf4j
@RestController
@RequestMapping("/api/collab")
@RequiredArgsConstructor
@Tag(name = "Collaboration", description = "Real-time document collaboration via SSE and Redis pub/sub")
public class CollabSseController {

    private final CollabSseService collabSseService;
    private final CollabService collabService;
    private final RedisDocumentListener redisDocumentListener;
    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository documentPermissionRepository;


    @Operation(summary = "Open SSE stream for real-time document updates")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "SSE stream opened"),
            @ApiResponse(responseCode = "403", description = "No read access to document"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping(value = "/stream/{docId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @AuthenticationPrincipal UserDetails principal) {

        requireReadAccess(docId, principal.getUsername());

        boolean firstSubscriber = !collabSseService.hasActiveEmitters(docId);
        SseEmitter emitter = collabSseService.register(docId, principal.getUsername());

        if (firstSubscriber) {
            collabService.subscribeToDocument(docId, redisDocumentListener);
        }

        emitter.onCompletion(() -> unsubscribeIfEmpty(docId));
        emitter.onTimeout(() -> unsubscribeIfEmpty(docId));

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("{\"docId\":" + docId + "}"));
        } catch (Exception e) {
            log.debug("Could not send connected event to {}: {}", principal.getUsername(), e.getMessage());
        }

        log.info("User {} connected to SSE stream for doc {}", principal.getUsername(), docId);
        return emitter;
    }

    
    @Operation(summary = "Send a document update (publishes to Redis → SSE fan-out)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Update published"),
            @ApiResponse(responseCode = "403", description = "No write access to document"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @PatchMapping("/update/{docId}")
    public ResponseEntity<Void> update(
            @Parameter(description = "Document ID") @PathVariable Long docId,
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody UpdateRequest req) {

        requireWriteAccess(docId, principal.getUsername());

        DocUpdateDto dto = new DocUpdateDto(
                principal.getUsername(),
                req.getType(),
                req.getContent(),
                Instant.now()
        );

        collabService.publishUpdate(docId, principal.getUsername(), dto);
        return ResponseEntity.noContent().build();
    }

   

    private void requireReadAccess(Long docId, String username) {
        if (!documentRepository.existsById(docId)) {
            throw new DocumentNotFoundException(docId);
        }
        boolean isOwner = documentRepository.findById(docId)
                .map(d -> d.getOwner().getUsername().equals(username))
                .orElse(false);
        boolean hasPermission = documentPermissionRepository
                .existsByDocumentIdAndUserUsername(docId, username);
        if (!isOwner && !hasPermission) {
            throw new DocumentPermissionException(
                    "User " + username + " does not have access to document " + docId);
        }
    }

    private void requireWriteAccess(Long docId, String username) {
        if (!documentRepository.existsById(docId)) {
            throw new DocumentNotFoundException(docId);
        }
        boolean isOwner = documentRepository.findById(docId)
                .map(d -> d.getOwner().getUsername().equals(username))
                .orElse(false);
        if (isOwner) {
            return;
        }
        documentPermissionRepository
                .findByDocumentIdAndUserUsername(docId, username)
                .filter(p -> {
                    switch (p.getRole()) {
                        case OWNER:
                        case EDITOR:
                            return true;
                        default:
                            return false;
                    }
                })
                .orElseThrow(() -> new DocumentPermissionException(
                        "User " + username + " does not have write access to document " + docId));
    }

    private void unsubscribeIfEmpty(Long docId) {
        if (!collabSseService.hasActiveEmitters(docId)) {
            collabService.unsubscribeFromDocument(docId, redisDocumentListener);
            log.info("Unsubscribed Redis listener for doc {} (no active SSE clients)", docId);
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class UpdateRequest {
        /** text-change | cursor | presence */
        private String type;
        /** Raw Tiptap JSON delta or cursor/presence payload */
        private Object content;
    }
}
