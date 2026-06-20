package wp.finki.wordy.model.domain;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private User owner;
    private String title;
    @Column(columnDefinition = "TEXT")
    private String content;
    @Lob
    private byte[] ydocState;

    private Boolean is_template;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
