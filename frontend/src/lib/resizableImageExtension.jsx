import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

const MIN_WIDTH = 40;

function ResizableImageView({ node, updateAttributes, selected }) {
  const { src, alt, width, height } = node.attrs;
  const imgRef = useRef(null);
  // dragging state: null when idle
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function startDrag(e, handle) {
    e.preventDefault();
    e.stopPropagation();
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const ratio = rect.height / rect.width;
    dragRef.current = {
      handle,
      startX: e.clientX,
      startW: rect.width,
      ratio,
    };
    setIsDragging(true);
  }

  useEffect(() => {
    if (!isDragging) return;

    function onMouseMove(e) {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      let newW;
      if (d.handle === 'sw' || d.handle === 'nw') {
        newW = Math.max(MIN_WIDTH, d.startW - dx);
      } else {
        newW = Math.max(MIN_WIDTH, d.startW + dx);
      }
      updateAttributes({
        width: Math.round(newW),
        height: Math.round(newW * d.ratio),
      });
    }

    function onMouseUp() {
      dragRef.current = null;
      setIsDragging(false);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, updateAttributes]);

  return (
    <NodeViewWrapper
      as="span"
      style={{ display: 'inline-block', position: 'relative', lineHeight: 0, userSelect: 'none' }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        draggable={false}
        style={{
          display: 'block',
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto',
          maxWidth: '100%',
          outline: selected ? '2px solid #2b579a' : 'none',
          cursor: isDragging ? 'ew-resize' : 'default',
        }}
      />

      {selected && ['nw', 'ne', 'sw', 'se'].map((handle) => (
        <div
          key={handle}
          className={`resizable-image__handle resizable-image__handle--${handle}`}
          onMouseDown={(e) => startDrag(e, handle)}
        />
      ))}
    </NodeViewWrapper>
  );
}

export const ResizableImage = Node.create({
  name: 'image',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src:    { default: null },
      alt:    { default: null },
      title:  { default: null },
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.getAttribute('width') || el.style.width;
          return w ? parseInt(w) : null;
        },
        renderHTML: (attrs) => attrs.width ? { width: attrs.width } : {},
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const h = el.getAttribute('height') || el.style.height;
          return h ? parseInt(h) : null;
        },
        renderHTML: (attrs) => attrs.height ? { height: attrs.height } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  addCommands() {
    return {
      setImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
