package wp.finki.wordy.model.domain;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import wp.finki.wordy.model.enumerations.DocumentRole;

import java.time.LocalDateTime;

@Data
@Entity
public class DocumentPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnoreProperties({"permissions", "content", "ydocState"})
    private User user;

    @ManyToOne
    @JsonIgnoreProperties({"owner", "content", "ydocState"})
    private Document document;

    @Enumerated(EnumType.STRING)
    private DocumentRole role;

    private LocalDateTime invitedAt;
    private LocalDateTime expiresAt;
}
