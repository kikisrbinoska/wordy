package wp.finki.wordy.service.domain;

import wp.finki.wordy.model.domain.Comment;

import java.util.List;

public interface CommentService {

    List<Comment> findByDocument(Long docId);

    Comment addComment(Long docId, String authorUsername,
                       String body, Long parentId, String anchorPos);

    void resolveComment(Long commentId, String username);

    void deleteComment(Long commentId, String username);

    List<Comment> getReplies(Long parentCommentId);
}