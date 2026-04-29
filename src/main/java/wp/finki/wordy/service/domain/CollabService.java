package wp.finki.wordy.service.domain;

import org.springframework.data.redis.connection.MessageListener;
import wp.finki.wordy.model.dto.DocUpdateDto;

public interface CollabService {

    /**
     * Serialises {@code dto} to JSON and publishes it on the document's Redis channel.
     * Every Spring node subscribed to that channel will receive the message.
     */
    void publishUpdate(Long docId, String fromUsername, DocUpdateDto dto);

    /** Registers a MessageListener on the channel for the given document. */
    void subscribeToDocument(Long docId, MessageListener listener);

    /** Removes a MessageListener from the channel for the given document. */
    void unsubscribeFromDocument(Long docId, MessageListener listener);

    /** Returns the Redis pub/sub channel name for a document. */
    static String channelFor(Long docId) {
        return "collab:doc:" + docId;
    }
}
