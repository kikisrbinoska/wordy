package wp.finki.wordy.service.domain.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import wp.finki.wordy.model.domain.Document;
import wp.finki.wordy.model.domain.DocumentPermission;
import wp.finki.wordy.model.domain.DocumentVersion;
import wp.finki.wordy.model.domain.User;
import wp.finki.wordy.model.enumerations.DocumentRole;
import wp.finki.wordy.model.exceptions.*;
import wp.finki.wordy.repository.DocumentPermissionRepository;
import wp.finki.wordy.repository.DocumentRepository;
import wp.finki.wordy.repository.DocumentVersionRepository;
import wp.finki.wordy.repository.UserRepository;
import wp.finki.wordy.service.domain.DocumentService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentPermissionRepository permissionRepository;
    private final DocumentVersionRepository versionRepository;


    private Document getDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    private DocumentPermission getPermission(Long docId, String username) {
        return permissionRepository.findByDocumentIdAndUserUsername(docId, username)
                .orElseThrow(() -> new DocumentPermissionException(
                        "User " + username + " does not have access to document " + docId));
    }

    private void requireRole(DocumentPermission perm, DocumentRole... allowed) {
        boolean hasRole = Arrays.stream(allowed)
                .anyMatch(r -> r == perm.getRole());
        if (!hasRole) {
            throw new DocumentPermissionException(
                    "User does not have the required role for this action");
        }
    }

    @Override
    public List<Document> findAll() {
        return documentRepository.findAll();
    }

    @Override
    public Optional<Document> findById(Long id) {
        return documentRepository.findById(id);
    }

    @Override
    public Optional<Document> save(Document document) {
        Document saved = documentRepository.save(document);

        DocumentPermission ownerPerm = new DocumentPermission();
        ownerPerm.setDocument(saved);
        ownerPerm.setUser(saved.getOwner());
        ownerPerm.setRole(DocumentRole.OWNER);
        ownerPerm.setInvitedAt(LocalDateTime.now());
        permissionRepository.save(ownerPerm);

        return Optional.of(saved);
    }

    @Override
    public Optional<Document> update(Long id, Document document) {
        Document existing = getDocument(id);
        existing.setTitle(document.getTitle());
        existing.setContent(document.getContent());
        existing.setUpdatedAt(LocalDateTime.now());
        return Optional.of(documentRepository.save(existing));
    }

    @Override
    public void deleteById(Long id) {
        documentRepository.deleteById(id);
    }

    @Override
    public List<Document> findByOwner(String username) {
        User user = getUser(username);
        return documentRepository.findAllByOwner(user);
    }

    @Override
    public Optional<Document> updateContent(Long id, String content) {
        Document doc = getDocument(id);
        doc.setContent(content);
        doc.setUpdatedAt(LocalDateTime.now());
        return Optional.of(documentRepository.save(doc));
    }

    @Override
    public Optional<Document> updateTitle(Long id, String title) {
        Document doc = getDocument(id);
        doc.setTitle(title);
        doc.setUpdatedAt(LocalDateTime.now());
        return Optional.of(documentRepository.save(doc));
    }


    @Override
    public void inviteUser(Long docId, String ownerUsername,
                           String inviteeUsername, DocumentRole role) {
        DocumentPermission ownerPerm = getPermission(docId, ownerUsername);
        requireRole(ownerPerm, DocumentRole.OWNER);

        if (permissionRepository.existsByDocumentIdAndUserUsername(docId, inviteeUsername)) {
            throw new UserAlreadyHasAccessException(inviteeUsername);
        }

        Document doc = getDocument(docId);
        User invitee = getUser(inviteeUsername);

        DocumentPermission perm = new DocumentPermission();
        perm.setDocument(doc);
        perm.setUser(invitee);
        perm.setRole(role);
        perm.setInvitedAt(LocalDateTime.now());
        permissionRepository.save(perm);
    }

    @Override
    public void changeUserRole(Long docId, String ownerUsername,
                               String targetUsername, DocumentRole role) {
        DocumentPermission ownerPerm = getPermission(docId, ownerUsername);
        requireRole(ownerPerm, DocumentRole.OWNER);

        if (ownerUsername.equals(targetUsername)) {
            throw new DocumentPermissionException(
                    "You cannot change your own role");
        }

        DocumentPermission targetPerm = getPermission(docId, targetUsername);
        targetPerm.setRole(role);
        permissionRepository.save(targetPerm);
    }

    @Override
    public void removeUser(Long docId, String ownerUsername, String targetUsername) {
        DocumentPermission ownerPerm = getPermission(docId, ownerUsername);
        requireRole(ownerPerm, DocumentRole.OWNER);

        DocumentPermission targetPerm = getPermission(docId, targetUsername);
        permissionRepository.delete(targetPerm);
    }

    @Override
    public List<DocumentPermission> getPermissions(Long docId) {
        return permissionRepository.findAllByDocumentId(docId);
    }

    @Override
    public List<DocumentVersion> getVersions(Long docId) {
        return versionRepository.findAllByDocumentIdOrderByVersionNumberDesc(docId);
    }

    @Override
    public void createSnapshot(Long docId, String authorUsername, String label) {
        Document doc = getDocument(docId);
        User author = getUser(authorUsername);

        int nextVersion = versionRepository
                .findTopByDocumentIdOrderByVersionNumberDesc(docId)
                .map(v -> v.getVersionNumber() + 1)
                .orElse(1);

        DocumentVersion version = new DocumentVersion();
        version.setDocument(doc);
        version.setAuthor(author);
        version.setSnapshot(doc.getContent());
        version.setVersionNumber(nextVersion);
        version.setLabel(label);
        version.setCreatedAt(LocalDateTime.now());
        versionRepository.save(version);
    }

    @Override
    public void restoreVersion(Long docId, Long versionId) {
        Document doc = getDocument(docId);

        DocumentVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new DocumentVersionNotFoundException(versionId));

        doc.setContent(version.getSnapshot());
        doc.setUpdatedAt(LocalDateTime.now());
        documentRepository.save(doc);

        createSnapshot(docId, doc.getOwner().getUsername(),
                "Restored from v" + version.getVersionNumber());
    }

    @Override
    public byte[] exportAsPdf(Long docId) {
        Document doc = getDocument(docId);
        return doc.getContent() != null
                ? doc.getContent().getBytes()
                : new byte[0];
    }

    @Override
    public byte[] exportAsDocx(Long docId) {
        Document doc = getDocument(docId);
        return doc.getContent() != null
                ? doc.getContent().getBytes()
                : new byte[0];
    }
}