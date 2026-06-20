package wp.finki.wordy.service.domain;

import org.springframework.web.multipart.MultipartFile;
import wp.finki.wordy.model.domain.DocumentAsset;

import java.io.IOException;
import java.util.List;

public interface DocumentAssetService {

    DocumentAsset upload(Long docId, String uploaderUsername,
                         MultipartFile file) throws IOException;
    DocumentAsset findById(Long assetId);
    byte[] download(Long assetId);
    List<DocumentAsset> findByDocument(Long docId);
    void delete(Long assetId, String username);
}
