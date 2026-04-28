package wp.finki.wordy.service.domain;

import wp.finki.wordy.model.domain.User;

import java.util.Optional;

public interface UserService {

    User register(String username, String password, String name, String surname, String email);

    Optional<User> findByUsername(String username);

    String login(String username, String password);
}
