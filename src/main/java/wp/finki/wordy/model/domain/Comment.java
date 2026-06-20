package wp.finki.wordy.model.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Frontend never needs the full document object — ignore to prevent proxy serialization
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    // EAGER so it's always loaded before the transaction closes
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_username")
    @JsonIgnoreProperties({"password", "email", "role", "authorities",
            "accountNonExpired", "accountNonLocked", "credentialsNonExpired",
            "enabled", "createdAt", "lastSeenAt"})
    private User author;

    // Only serialize the parent's id so the frontend can group replies
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_id")
    @JsonIgnoreProperties({"document", "parentComment", "author",
            "content", "anchorPos", "resolved", "createdAt"})
    private Comment parentComment;

    private String anchorPos;
    @Column(columnDefinition = "TEXT")
    private String content;
    private Boolean resolved = false;
    private LocalDateTime createdAt;
}
