package wp.finki.wordy.service.domain.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import wp.finki.wordy.model.domain.Document;
import wp.finki.wordy.model.domain.DocumentAsset;
import wp.finki.wordy.model.domain.DocumentPermission;
import wp.finki.wordy.model.domain.User;
import wp.finki.wordy.repository.DocumentAssetRepository;
import wp.finki.wordy.repository.DocumentPermissionRepository;
import wp.finki.wordy.repository.DocumentRepository;
import wp.finki.wordy.repository.UserRepository;
import wp.finki.wordy.service.domain.DocumentAssetService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentAssetServiceImpl implements DocumentAssetService {

	private final DocumentAssetRepository assetRepository;
	private final DocumentRepository documentRepository;
	private final UserRepository userRepository;
	private final DocumentPermissionRepository permissionRepository;

	@Value("${file.storage.path:uploads}")
	private String storagePath;

	private Document getDocument(Long id) {
		return documentRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));
	}

	private User getUser(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
	}

	private boolean hasAccess(Long docId, String username) {
		return permissionRepository.findByDocumentIdAndUserUsername(docId, username).isPresent();
	}

	@Override
	public DocumentAsset upload(Long docId, String uploaderUsername, MultipartFile file) throws IOException {
		Document doc = getDocument(docId);
		if (!hasAccess(docId, uploaderUsername)) {
			throw new SecurityException("User does not have access to document " + docId);
		}

		User uploader = getUser(uploaderUsername);

		Path dir = Path.of(storagePath);
		if (!Files.exists(dir)) Files.createDirectories(dir);

		String storedName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
		Path dest = dir.resolve(storedName);
		Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

		DocumentAsset asset = new DocumentAsset();
		asset.setDocument(doc);
		asset.setUploader(uploader);
		asset.setFileName(file.getOriginalFilename());
		asset.setMimeType(file.getContentType());
		asset.setSizeBytes(file.getSize());
		asset.setFilePath(dest.toAbsolutePath().toString());
		asset.setCreatedAt(LocalDateTime.now());
		return assetRepository.save(asset);
	}

	@Override
	public byte[] download(Long assetId) {
		DocumentAsset asset = assetRepository.findById(assetId)
				.orElseThrow(() -> new IllegalArgumentException("Asset not found: " + assetId));
		try {
			return Files.readAllBytes(Path.of(asset.getFilePath()));
		} catch (IOException e) {
			throw new RuntimeException("Failed to read asset file", e);
		}
	}

	@Override
	public List<DocumentAsset> findByDocument(Long docId) {
		return assetRepository.findAllByDocumentId(docId);
	}

	@Override
	public void delete(Long assetId, String username) {
		DocumentAsset asset = assetRepository.findById(assetId)
				.orElseThrow(() -> new IllegalArgumentException("Asset not found: " + assetId));

		boolean owner = asset.getUploader() != null && username.equals(asset.getUploader().getUsername());
		boolean hasPerm = permissionRepository.findByDocumentIdAndUserUsername(asset.getDocument().getId(), username)
				.map(DocumentPermission::getRole)
				.map(r -> r.name().equals("OWNER"))
				.orElse(false);

		if (!owner && !hasPerm) {
			throw new SecurityException("User not authorized to delete this asset");
		}

		try {
			Files.deleteIfExists(Path.of(asset.getFilePath()));
		} catch (IOException e) {
			// ignore deletion failure of file 4now
		}
		assetRepository.delete(asset);
	}
}


