package wp.finki.wordy.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wp.finki.wordy.model.domain.User;
import wp.finki.wordy.service.domain.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Register and login")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Register a new user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User registered"),
            @ApiResponse(responseCode = "400", description = "Username already taken")
    })
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest req) {
        User user = userService.register(
                req.getUsername(),
                req.getPassword(),
                req.getName(),
                req.getSurname(),
                req.getEmail()
        );
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Login and receive a JWT token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JWT token returned"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest req) {
        String token = userService.login(req.getUsername(), req.getPassword());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @Data
    static class RegisterRequest {
        private String username;
        private String password;
        private String name;
        private String surname;
        private String email;
    }

    @Data
    static class LoginRequest {
        private String username;
        private String password;
    }
}
