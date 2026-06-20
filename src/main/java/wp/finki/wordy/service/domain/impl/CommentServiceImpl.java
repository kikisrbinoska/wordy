package wp.finki.wordy.service.domain.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import wp.finki.wordy.model.domain.Comment;
import wp.finki.wordy.model.domain.Document;
import wp.finki.wordy.model.domain.User;
import wp.finki.wordy.model.exceptions.DocumentNotFoundException;
import wp.finki.wordy.model.exceptions.UserNotFoundException;
import wp.finki.wordy.repository.CommentRepository;
import wp.finki.wordy.repository.DocumentRepository;
import wp.finki.wordy.repository.UserRepository;
import wp.finki.wordy.service.domain.CommentService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Override
    public List<Comment> findByDocument(Long docId) {
        return commentRepository.findByDocumentIdOrderByCreatedAtAsc(docId);
    }

    @Override
    public Comment addComment(Long docId, String authorUsername, String body, Long parentId, String anchorPos) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new DocumentNotFoundException(docId));

        User author = userRepository.findById(authorUsername)
                .orElseThrow(() -> new UserNotFoundException(authorUsername));

        Comment comment = new Comment();
        comment.setDocument(document);
        comment.setAuthor(author);
        comment.setContent(body);
        comment.setAnchorPos(anchorPos);
        comment.setResolved(false);
        comment.setCreatedAt(LocalDateTime.now());

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found: " + parentId));
            comment.setParentComment(parent);
        }

        return commentRepository.save(comment);
    }

    @Override
    public void resolveComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));
        comment.setResolved(true);
        commentRepository.save(comment);
    }

    @Override
    public void deleteComment(Long commentId, String username) {
        commentRepository.deleteById(commentId);
    }

    @Override
    public List<Comment> getReplies(Long parentCommentId) {
        return commentRepository.findByParentCommentIdOrderByCreatedAtAsc(parentCommentId);
    }
}
