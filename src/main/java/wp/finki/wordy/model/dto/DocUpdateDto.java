package wp.finki.wordy.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocUpdateDto {

    private String fromUserId;

    /** text-change | cursor | presence */
    private String type;

    /** Raw Tiptap JSON or cursor/presence payload — kept as Object so any shape passes through. */
    private Object content;

    private Instant timestamp;
}
