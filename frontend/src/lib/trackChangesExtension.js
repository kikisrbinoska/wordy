import { Extension, Mark } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const TRACK_KEY = new PluginKey('trackChanges');

// Mark: inserted text shown in green
export const InsertionMark = Mark.create({
  name: 'insertion',
  spanning: true,
  inclusive: true,
  addAttributes() {
    return {
      author: { default: null },
      date:   { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-track="insertion"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-track': 'insertion', class: 'track-insertion', ...HTMLAttributes }, 0];
  },
});

// Mark: deleted text shown in red strikethrough (text is kept, not removed)
export const DeletionMark = Mark.create({
  name: 'deletion',
  spanning: true,
  inclusive: false,
  addAttributes() {
    return {
      author: { default: null },
      date:   { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-track="deletion"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-track': 'deletion', class: 'track-deletion', ...HTMLAttributes }, 0];
  },
});

export const TrackChangesExtension = Extension.create({
  name: 'trackChanges',

  addOptions() {
    return { author: 'Unknown' };
  },

  addProseMirrorPlugins() {
    const getAuthor = () => this.options.author;

    return [
      new Plugin({
        key: TRACK_KEY,
        state: {
          init: () => false,
          apply(tr, val) {
            const meta = tr.getMeta(TRACK_KEY);
            return meta !== undefined ? meta : val;
          },
        },
        props: {
          handleKeyDown(view, event) {
            const enabled = TRACK_KEY.getState(view.state);
            if (!enabled) return false;

            const { state, dispatch } = view;
            const { selection, schema } = state;
            const { from, to, empty } = selection;

            const author = getAuthor();
            const date = new Date().toISOString();

            const insertionMark = schema.marks.insertion?.create({ author, date });
            const deletionMark  = schema.marks.deletion?.create({ author, date });

            if (!insertionMark || !deletionMark) return false;

            // Backspace: instead of deleting, mark the character as deleted
            if (event.key === 'Backspace') {
              event.preventDefault();
              let tr = state.tr;
              if (!empty) {
                // Selection: mark whole selection as deleted
                tr.addMark(from, to, deletionMark);
              } else if (from > 0) {
                // Single char behind cursor
                tr.addMark(from - 1, from, deletionMark);
              }
              dispatch(tr);
              return true;
            }

            // Delete key: mark char ahead as deleted
            if (event.key === 'Delete') {
              event.preventDefault();
              let tr = state.tr;
              if (!empty) {
                tr.addMark(from, to, deletionMark);
              } else if (to < state.doc.content.size - 1) {
                tr.addMark(from, from + 1, deletionMark);
              }
              dispatch(tr);
              return true;
            }

            // Printable character: insert with insertion mark active
            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
              event.preventDefault();
              let tr = state.tr;
              // If there's a selection, mark it as deleted first, then insert
              if (!empty) {
                tr.addMark(from, to, deletionMark);
                tr.setSelection(state.selection.constructor.near(tr.doc.resolve(from)));
              }
              const node = schema.text(event.key, [insertionMark]);
              tr.insert(from, node);
              dispatch(tr);
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setTrackChanges:
        (enabled) =>
        ({ tr, dispatch }) => {
          if (dispatch) dispatch(tr.setMeta(TRACK_KEY, enabled));
          return true;
        },
      acceptChange:
        (from, to) =>
        ({ tr, state, dispatch }) => {
          // Remove insertion marks (keep text), remove deletion marks + text
          let newTr = state.tr;
          // First collect deletions to remove (iterate backwards to preserve positions)
          const deletions = [];
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.isText && node.marks.some((m) => m.type.name === 'deletion')) {
              deletions.push({ from: pos, to: pos + node.nodeSize });
            }
          });
          // Remove deletions in reverse order
          for (let i = deletions.length - 1; i >= 0; i--) {
            newTr.delete(deletions[i].from, deletions[i].to);
          }
          // Remove insertion marks (keep the text, just remove the green highlight)
          newTr.removeMark(from, to, state.schema.marks.insertion);
          if (dispatch) dispatch(newTr);
          return true;
        },
      rejectChange:
        (from, to) =>
        ({ tr, state, dispatch }) => {
          // Remove insertion marks + text, remove deletion marks (restore text)
          let newTr = state.tr;
          const insertions = [];
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.isText && node.marks.some((m) => m.type.name === 'insertion')) {
              insertions.push({ from: pos, to: pos + node.nodeSize });
            }
          });
          for (let i = insertions.length - 1; i >= 0; i--) {
            newTr.delete(insertions[i].from, insertions[i].to);
          }
          newTr.removeMark(from, to, state.schema.marks.deletion);
          if (dispatch) dispatch(newTr);
          return true;
        },
    };
  },
});
