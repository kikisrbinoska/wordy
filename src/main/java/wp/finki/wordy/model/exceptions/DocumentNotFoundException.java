package wp.finki.wordy.model.exceptions;

public class DocumentNotFoundException extends RuntimeException {
    public DocumentNotFoundException(Long id) {
        super("Document with id " + id + " was not found");
    }
}
