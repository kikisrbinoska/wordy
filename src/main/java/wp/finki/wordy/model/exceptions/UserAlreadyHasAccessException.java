package wp.finki.wordy.model.exceptions;

public class UserAlreadyHasAccessException extends RuntimeException {
    public UserAlreadyHasAccessException(String username) {
        super("User " + username + " already has access to this document");
    }
}