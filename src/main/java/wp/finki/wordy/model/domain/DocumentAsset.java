package wp.finki.wordy.model.domain;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class DocumentAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Document document;

    @ManyToOne
    private User uploader;

    private String fileName;
    private String mimeType;
    private Long sizeBytes;
    private String filePath;

    private LocalDateTime createdAt;
}