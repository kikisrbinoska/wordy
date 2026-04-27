package wp.finki.wordy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import wp.finki.wordy.model.domain.DocumentAsset;

import java.util.List;

@Repository
public interface DocumentAssetRepository extends JpaRepository<DocumentAsset, Long> {
    List<DocumentAsset> findAllByDocumentId(Long documentId);
}

