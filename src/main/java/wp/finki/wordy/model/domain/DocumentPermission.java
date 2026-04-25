package wp.finki.wordy.model.domain;
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
    private User user;

    @ManyToOne
    private Document document;

    @Enumerated(EnumType.STRING)
    private DocumentRole role;

    private LocalDateTime invitedAt;
    private LocalDateTime expiresAt;
}
