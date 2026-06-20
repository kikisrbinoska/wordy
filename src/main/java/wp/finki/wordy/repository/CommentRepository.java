package wp.finki.wordy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import wp.finki.wordy.model.domain.Comment;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByDocumentIdOrderByCreatedAtAsc(Long documentId);

    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(Long parentId);
}
