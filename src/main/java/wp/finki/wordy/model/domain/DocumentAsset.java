package wp.finki.wordy.model.domain;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties({"owner", "content", "ydocState"})
    private Document document;

    @ManyToOne
    @JsonIgnoreProperties({"permissions", "content", "ydocState"})
    private User uploader;

    private String fileName;
    private String mimeType;
    private Long sizeBytes;
    private String filePath;

    private LocalDateTime createdAt;
}