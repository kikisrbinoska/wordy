package wp.finki.wordy.service.domain;

import wp.finki.wordy.model.domain.Document;
import wp.finki.wordy.model.domain.DocumentPermission;
import wp.finki.wordy.model.domain.DocumentVersion;
import wp.finki.wordy.model.enumerations.DocumentRole;

import java.util.List;
import java.util.Optional;

public interface DocumentService {

    List<Document> findAll();
    Optional<Document> findById(Long id);
    Optional<Document> save(Document document);
    Optional<Document> update(Long id, Document document);
    void deleteById(Long id);

    List<Document> findByOwner(String username);
    List<Document> findSharedWith(String username);
    Optional<Document> updateContent(Long id, String content);
    Optional<Document> updateTitle(Long id, String title);

    void inviteUser(Long docId, String ownerUsername, String inviteeUsername, DocumentRole role);
    void changeUserRole(Long docId, String ownerUsername, String targetUsername, DocumentRole role);
    void removeUser(Long docId, String ownerUsername, String targetUsername);
    List<DocumentPermission> getPermissions(Long docId);

    List<DocumentVersion> getVersions(Long docId);
    void createSnapshot(Long docId, String authorUsername, String label);
    void restoreVersion(Long docId, Long versionId);

    byte[] exportAsPdf(Long docId);
    byte[] exportAsDocx(Long docId);
}