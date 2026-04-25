package wp.finki.wordy.model.enumerations;

import org.springframework.security.core.GrantedAuthority;

public enum SystemRole implements GrantedAuthority {
    ROLE_ADMIN,
    ROLE_USER,
    ROLE_GUEST;
    @Override
    public String getAuthority() {
        return name();
    }
}