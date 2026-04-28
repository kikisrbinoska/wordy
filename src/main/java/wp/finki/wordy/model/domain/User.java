package wp.finki.wordy.model.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import wp.finki.wordy.model.enumerations.SystemRole;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Data
@Entity
@Table(name = "shop_users")
public class User implements UserDetails {
    @Id
    private String username;

    @JsonIgnore
    private String password;

    private String name;

    @Column(unique = true)
    private String email;

    private String surname;
    private String displayName;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastSeenAt;

    @JsonIgnore
    private boolean isAccountNonExpired = true;
    @JsonIgnore
    private boolean isAccountNonLocked = true;
    @JsonIgnore
    private boolean isCredentialsNonExpired = true;
    @JsonIgnore
    private boolean isEnabled = true;

    @Enumerated(value = EnumType.STRING)
    private SystemRole role;

    public User(String username, String password, String name, String email, String surname, String displayName, String avatarUrl, SystemRole role) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.email = email;
        this.surname = surname;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.role = role;
    }

    public User(String username, String password, String name, String surname, SystemRole role) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.surname = surname;
        this.role = role;
    }

    public User(String username, String password, String name, String surname) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.surname = surname;
        this.role = SystemRole.ROLE_USER;
    }

    public User(String username, String password, String name, String surname, String displayName, String avatarUrl, SystemRole role) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.surname = surname;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.role = role;
    }

    public User(UserDetails userDetails) {
        this.username = userDetails.getUsername();
        this.password = userDetails.getPassword();
    }

    public User() {
    }

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList((GrantedAuthority) role);
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return isAccountNonExpired;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return isAccountNonLocked;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return isCredentialsNonExpired;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return isEnabled;
    }
}
