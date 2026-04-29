package wp.finki.wordy.service.domain.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Service;
import wp.finki.wordy.model.dto.DocUpdateDto;
import wp.finki.wordy.service.domain.CollabService;

@Slf4j
@Service
@RequiredArgsConstructor
public class CollabServiceImpl implements CollabService {

    private final RedisTemplate<String, String> redisTemplate;
    private final RedisMessageListenerContainer listenerContainer;
    private final ObjectMapper objectMapper;

    @Override
    public void publishUpdate(Long docId, String fromUsername, DocUpdateDto dto) {
        dto.setFromUserId(fromUsername);
        try {
            String payload = objectMapper.writeValueAsString(dto);
            redisTemplate.convertAndSend(CollabService.channelFor(docId), payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize DocUpdateDto for doc {}: {}", docId, e.getMessage());
        }
    }

    @Override
    public void subscribeToDocument(Long docId, MessageListener listener) {
        listenerContainer.addMessageListener(listener, new ChannelTopic(CollabService.channelFor(docId)));
        log.debug("Subscribed listener {} to channel {}", listener, CollabService.channelFor(docId));
    }

    @Override
    public void unsubscribeFromDocument(Long docId, MessageListener listener) {
        listenerContainer.removeMessageListener(listener, new ChannelTopic(CollabService.channelFor(docId)));
        log.debug("Unsubscribed listener {} from channel {}", listener, CollabService.channelFor(docId));
    }
}
