package wp.finki.wordy.model.domain;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Document document;
    @ManyToOne
    private User author;

    @ManyToOne
    private Comment parent;

    private String anchorPos;
    private String body;
    private Boolean resolved;
    private LocalDateTime createdAt;
}
