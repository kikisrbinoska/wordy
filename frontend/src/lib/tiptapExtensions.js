import StarterKit from '@tiptap/starter-kit';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Extension } from '@tiptap/core';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { ResizableImage } from './resizableImageExtension.jsx';
import { TrackChangesExtension, InsertionMark, DeletionMark } from './trackChangesExtension.js';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

// Extends BulletList to support a listStyle attribute (disc/circle/square/arrow/check)
const StyledBulletList = BulletList.extend({
  addAttributes() {
    return {
      listStyle: {
        default: 'disc',
        parseHTML: (el) => el.getAttribute('data-list-style') || 'disc',
        renderHTML: (attrs) => ({ 'data-list-style': attrs.listStyle }),
      },
    };
  },
});

// Extends Paragraph to support indent (padding-left) as a node attribute
const INDENT_STEP = 40; // px per indent level
const MAX_INDENT = 8;

const IndentableParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      indent: {
        default: 0,
        parseHTML: (el) => {
          const pl = el.style.paddingLeft;
          return pl ? Math.round(parseInt(pl) / INDENT_STEP) : 0;
        },
        renderHTML: (attrs) => {
          if (!attrs.indent) return {};
          return { style: `padding-left: ${attrs.indent * INDENT_STEP}px` };
        },
      },
    };
  },
});

// Standalone extension so commands appear on editor.commands
const IndentCommands = Extension.create({
  name: 'indentCommands',
  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection;
          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === 'paragraph') {
              const current = node.attrs.indent || 0;
              if (current < MAX_INDENT) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: current + 1 });
                changed = true;
              }
            }
          });
          if (changed && dispatch) dispatch(tr);
          return changed;
        },
      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection;
          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === 'paragraph') {
              const current = node.attrs.indent || 0;
              if (current > 0) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: current - 1 });
                changed = true;
              }
            }
          });
          if (changed && dispatch) dispatch(tr);
          return changed;
        },
    };
  },
});

// Extends TextStyle to support fontSize and lineHeight as inline style attributes
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize || null,
        renderHTML: (attrs) => {
          if (!attrs.fontSize) return {};
          return { style: `font-size: ${attrs.fontSize}` };
        },
      },
      lineHeight: {
        default: null,
        parseHTML: (el) => el.style.lineHeight || null,
        renderHTML: (attrs) => {
          if (!attrs.lineHeight) return {};
          return { style: `line-height: ${attrs.lineHeight}` };
        },
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark(this.name, { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark(this.name, { fontSize: null }).removeEmptyTextStyle().run(),
      setLineHeight:
        (lineHeight) =>
        ({ chain }) =>
          chain().setMark(this.name, { lineHeight }).run(),
    };
  },
});

export const tiptapExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    history: true,
    bulletList: false,  // replaced by StyledBulletList
    paragraph: false,   // replaced by IndentableParagraph
  }),
  StyledBulletList,
  IndentableParagraph,
  IndentCommands,
  Underline,
  FontSize,
  Color,
  Highlight.configure({ multicolor: true }),
  FontFamily,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({ nested: true }),
  ResizableImage,
  InsertionMark,
  DeletionMark,
  TrackChangesExtension,
  Link.configure({ openOnClick: false, autolink: true }),
  Placeholder.configure({ placeholder: 'Start typing…' }),
  CharacterCount,
];
