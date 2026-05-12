import { useEffect, useState } from 'react';

/**
 * Builds a TOC from the editor's heading nodes and scrolls to them on click.
 *
 * @param {{ editor: import('@tiptap/react').Editor|null }} props
 */
export default function NavigatorPanel({ editor }) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    if (!editor) return;

    function extractHeadings() {
      const items = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          items.push({
            level: node.attrs.level,
            text: node.textContent,
            pos,
          });
        }
      });
      setHeadings(items);
    }

    extractHeadings();
    editor.on('update', extractHeadings);
    return () => editor.off('update', extractHeadings);
  }, [editor]);

  function scrollTo(pos) {
    if (!editor) return;
    editor.commands.focus();
    editor.commands.setTextSelection(pos);
    const domNode = editor.view.domAtPos(pos)?.node;
    domNode?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="navigator-panel">
      <h3 className="navigator-panel__title">Document Outline</h3>
      {headings.length === 0 ? (
        <p className="navigator-panel__empty">No headings found.</p>
      ) : (
        <ul className="navigator-panel__list">
          {headings.map((h, i) => (
            <li
              key={i}
              className={`navigator-panel__item navigator-panel__item--h${h.level}`}
              style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
              onClick={() => scrollTo(h.pos)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && scrollTo(h.pos)}
            >
              {h.text || '(empty heading)'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
