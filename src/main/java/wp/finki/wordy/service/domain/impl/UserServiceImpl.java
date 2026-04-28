package wp.finki.wordy.service.domain.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import wp.finki.wordy.model.domain.User;
import wp.finki.wordy.model.enumerations.SystemRole;
import wp.finki.wordy.model.exceptions.UserNotFoundException;
import wp.finki.wordy.repository.UserRepository;
import wp.finki.wordy.service.domain.UserService;
import wp.finki.wordy.util.JwtService;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public User register(String username, String password, String name, String surname, String email) {
        if (userRepository.existsById(username)) {
            throw new IllegalArgumentException("Username already taken: " + username);
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setSurname(surname);
        user.setEmail(email);
        user.setRole(SystemRole.ROLE_USER);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public String login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }
        user.setLastSeenAt(LocalDateTime.now());
        userRepository.save(user);
        return jwtService.generateToken(user);
    }
}
