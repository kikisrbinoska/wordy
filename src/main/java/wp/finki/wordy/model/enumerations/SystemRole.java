package wp.finki.wordy.model.enumerations;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;

public enum SystemRole implements GrantedAuthority {
    ROLE_ADMIN,
    ROLE_USER,
    ROLE_GUEST;

    @Override
    @JsonIgnore
    public String getAuthority() {
        return name();
    }
}