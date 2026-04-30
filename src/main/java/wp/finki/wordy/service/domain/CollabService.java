package wp.finki.wordy.service.domain;

import org.springframework.data.redis.connection.MessageListener;
import wp.finki.wordy.model.dto.DocUpdateDto;

public interface CollabService {

    void publishUpdate(Long docId, String fromUsername, DocUpdateDto dto);

    void subscribeToDocument(Long docId, MessageListener listener);

    void unsubscribeFromDocument(Long docId, MessageListener listener);

    //Returns the Redis pub/sub channel name for a document.
    static String channelFor(Long docId) {
        return "collab:doc:" + docId;
    }
}
