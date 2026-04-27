package wp.finki.wordy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import wp.finki.wordy.model.domain.Document;
import wp.finki.wordy.model.domain.User;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findAllByOwner(User owner);
}
