package wp.finki.wordy.model.exceptions;

public class DocumentVersionNotFoundException extends RuntimeException {
    public DocumentVersionNotFoundException(Long id) {
        super("Document version with id " + id + " was not found");
    }
}
