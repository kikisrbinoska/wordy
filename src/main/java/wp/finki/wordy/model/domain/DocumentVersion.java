package wp.finki.wordy.model.domain;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class DocumentVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Document document;
    @ManyToOne
    private User author;

    private String snapshot;

    private Integer versionNumber;
    private String label;
    private LocalDateTime createdAt;
}
