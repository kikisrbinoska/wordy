package wp.finki.wordy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import wp.finki.wordy.model.domain.DocumentPermission;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentPermissionRepository
        extends JpaRepository<DocumentPermission, Long> {
    Optional<DocumentPermission> findByDocumentIdAndUserUsername(Long docId, String username);
    List<DocumentPermission> findAllByDocumentId(Long docId);
    boolean existsByDocumentIdAndUserUsername(Long docId, String username);
    void deleteAllByDocumentId(Long docId);
}