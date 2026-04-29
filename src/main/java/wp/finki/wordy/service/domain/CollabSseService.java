package wp.finki.wordy.service.domain;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages one SseEmitter per (docId, username) pair.
 * A single instance lives for the lifetime of the application; emitters come and go.
 */
@Slf4j
@Service
public class CollabSseService {

    /** docId → { username → SseEmitter } */
    private final ConcurrentHashMap<Long, ConcurrentHashMap<String, SseEmitter>> rooms =
            new ConcurrentHashMap<>();

    /**
     * Creates (or replaces) an SseEmitter for the given user inside a document room.
     * The emitter has a 30-minute timeout; on completion/timeout/error it removes itself.
     */
    public SseEmitter register(Long docId, String username) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        Runnable cleanup = () -> removeEmitter(docId, username);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(ex -> {
            log.debug("SSE error for user {} in doc {}: {}", username, docId, ex.getMessage());
            cleanup.run();
        });

        rooms.computeIfAbsent(docId, id -> new ConcurrentHashMap<>()).put(username, emitter);
        log.debug("Registered SSE emitter for user {} in doc {}", username, docId);
        return emitter;
    }

    /**
     * Broadcasts a JSON payload to every connected user in the room except the sender.
     *
     * @param docId        target document
     * @param senderUsername user who originated the change (excluded from fan-out)
     * @param jsonPayload  serialised {@link wp.finki.wordy.model.dto.DocUpdateDto}
     */
    public void broadcast(Long docId, String senderUsername, String jsonPayload) {
        Map<String, SseEmitter> room = rooms.get(docId);
        if (room == null || room.isEmpty()) {
            return;
        }

        room.forEach((username, emitter) -> {
            if (username.equals(senderUsername)) {
                return;
            }
            try {
                emitter.send(SseEmitter.event()
                        .name("doc-update")
                        .data(jsonPayload));
            } catch (IOException e) {
                log.debug("Failed to send SSE to user {} in doc {}, removing emitter", username, docId);
                removeEmitter(docId, username);
            }
        });
    }

    /** Returns true if there is at least one connected emitter for this document. */
    public boolean hasActiveEmitters(Long docId) {
        Map<String, SseEmitter> room = rooms.get(docId);
        return room != null && !room.isEmpty();
    }

    private void removeEmitter(Long docId, String username) {
        Map<String, SseEmitter> room = rooms.get(docId);
        if (room != null) {
            room.remove(username);
            if (room.isEmpty()) {
                rooms.remove(docId);
            }
        }
    }
}
