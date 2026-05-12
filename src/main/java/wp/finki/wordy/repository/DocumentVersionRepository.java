package wp.finki.wordy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import wp.finki.wordy.model.domain.DocumentVersion;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentVersionRepository
        extends JpaRepository<DocumentVersion, Long> {
    List<DocumentVersion> findAllByDocumentIdOrderByVersionNumberDesc(Long docId);
    Optional<DocumentVersion> findTopByDocumentIdOrderByVersionNumberDesc(Long docId);
    void deleteAllByDocumentId(Long docId);
}