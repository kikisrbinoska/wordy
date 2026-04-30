package wp.finki.wordy.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;
import wp.finki.wordy.model.dto.DocUpdateDto;
import wp.finki.wordy.service.domain.impl.CollabSseService;

/**
 * Single application-level Redis MessageListener.
 * Registered/unregistered per document room by CollabSseController as clients connect/disconnect.
 *
 * Each incoming Redis message carries the channel name (collab:doc:{docId}) and a JSON body.
 * We extract the docId from the channel, parse the payload, and forward it to CollabSseService.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisDocumentListener implements MessageListener {

    private final CollabSseService collabSseService;
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel());
        String payload = new String(message.getBody());

        Long docId = extractDocId(channel);
        if (docId == null) {
            log.warn("Received message on unexpected channel: {}", channel);
            return;
        }

        try {
            DocUpdateDto dto = objectMapper.readValue(payload, DocUpdateDto.class);
            collabSseService.broadcast(docId, dto.getFromUserId(), payload);
        } catch (Exception e) {
            log.error("Failed to process Redis message on channel {}: {}", channel, e.getMessage());
        }
    }

    /** Parses the docId from a channel name of the form {@code collab:doc:<id>}. */
    private Long extractDocId(String channel) {
        try {
            String[] parts = channel.split(":");
            return Long.parseLong(parts[parts.length - 1]);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
