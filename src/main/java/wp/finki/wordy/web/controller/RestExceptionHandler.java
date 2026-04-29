package wp.finki.wordy.web.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import wp.finki.wordy.model.exceptions.DocumentNotFoundException;
import wp.finki.wordy.model.exceptions.DocumentPermissionException;
import wp.finki.wordy.model.exceptions.DocumentVersionNotFoundException;
import wp.finki.wordy.model.exceptions.UserAlreadyHasAccessException;
import wp.finki.wordy.model.exceptions.UserNotFoundException;

@ControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler({
            DocumentNotFoundException.class,
            DocumentVersionNotFoundException.class,
            UserNotFoundException.class
    })
    public ResponseEntity<String> handleNotFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(DocumentPermissionException.class)
    public ResponseEntity<String> handlePermission(DocumentPermissionException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    @ExceptionHandler(UserAlreadyHasAccessException.class)
    public ResponseEntity<String> handleAlreadyHasAccess(UserAlreadyHasAccessException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<String> handleForbidden(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleOther(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}

