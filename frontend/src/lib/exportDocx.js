import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  UnderlineType,
  NumberFormat,
  LevelFormat,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';

// ── Helpers ────────────────────────────────────────────────────────────────

function hexToDocxColor(hex) {
  if (!hex) return undefined;
  return hex.replace('#', '').toUpperCase();
}

function ptToHalfPt(pt) {
  return Math.round(parseFloat(pt) * 2);
}

function parseColor(cssColor) {
  if (!cssColor) return undefined;
  if (cssColor.startsWith('#')) return hexToDocxColor(cssColor);
  return undefined;
}

function parseFontSize(cssSize) {
  if (!cssSize) return undefined;
  // "16px" → half-points; "12pt" → half-points
  if (cssSize.endsWith('px')) return Math.round((parseFloat(cssSize) * 0.75) * 2);
  if (cssSize.endsWith('pt')) return ptToHalfPt(cssSize);
  return undefined;
}

const HEADING_LEVEL = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

const ALIGN_MAP = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

// ── Inline marks → TextRun options ────────────────────────────────────────

function marksToRunOptions(marks = []) {
  const opts = {};
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':       opts.bold = true; break;
      case 'italic':     opts.italics = true; break;
      case 'underline':  opts.underline = { type: UnderlineType.SINGLE }; break;
      case 'strike':     opts.strike = true; break;
      case 'code':       opts.font = 'Courier New'; break;
      case 'link':       opts.underline = { type: UnderlineType.SINGLE }; opts.color = '0563C1'; break;
      case 'textStyle': {
        const { color, fontSize, fontFamily } = mark.attrs ?? {};
        if (color) opts.color = parseColor(color);
        if (fontSize) opts.size = parseFontSize(fontSize);
        if (fontFamily) opts.font = fontFamily;
        break;
      }
      case 'highlight': {
        const { color } = mark.attrs ?? {};
        if (color) opts.highlight = parseColor(color);
        break;
      }
      default: break;
    }
  }
  return opts;
}

// ── Convert inline content nodes to TextRun[] ──────────────────────────────

function inlineToRuns(nodes = []) {
  const runs = [];
  for (const node of nodes) {
    if (node.type === 'text') {
      runs.push(new TextRun({ text: node.text ?? '', ...marksToRunOptions(node.marks) }));
    } else if (node.type === 'hardBreak') {
      runs.push(new TextRun({ break: 1 }));
    }
  }
  return runs.length ? runs : [new TextRun('')];
}

// ── Convert a block node to docx Paragraph / Table ────────────────────────

function blockToDocxElements(node) {
  switch (node.type) {

    case 'paragraph': {
      const indent = node.attrs?.indent ?? 0;
      const align = node.attrs?.textAlign;
      return [new Paragraph({
        children: inlineToRuns(node.content),
        alignment: ALIGN_MAP[align] ?? AlignmentType.LEFT,
        indent: indent ? { left: convertInchesToTwip(indent * 0.25) } : undefined,
      })];
    }

    case 'heading': {
      const level = node.attrs?.level ?? 1;
      const align = node.attrs?.textAlign;
      return [new Paragraph({
        children: inlineToRuns(node.content),
        heading: HEADING_LEVEL[level] ?? HeadingLevel.HEADING_1,
        alignment: ALIGN_MAP[align] ?? AlignmentType.LEFT,
      })];
    }

    case 'bulletList':
    case 'orderedList': {
      const isOrdered = node.type === 'orderedList';
      const items = [];
      for (const item of node.content ?? []) {
        for (const child of item.content ?? []) {
          items.push(new Paragraph({
            children: inlineToRuns(child.content),
            bullet: isOrdered ? undefined : { level: 0 },
            numbering: isOrdered ? { reference: 'default-numbering', level: 0 } : undefined,
          }));
        }
      }
      return items;
    }

    case 'taskList': {
      const items = [];
      for (const item of node.content ?? []) {
        const checked = item.attrs?.checked ?? false;
        for (const child of item.content ?? []) {
          const runs = inlineToRuns(child.content);
          items.push(new Paragraph({
            children: [new TextRun({ text: checked ? '☑ ' : '☐ ' }), ...runs],
          }));
        }
      }
      return items;
    }

    case 'blockquote': {
      const items = [];
      for (const child of node.content ?? []) {
        items.push(new Paragraph({
          children: inlineToRuns(child.content),
          indent: { left: convertInchesToTwip(0.5) },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 4 } },
        }));
      }
      return items;
    }

    case 'codeBlock': {
      const text = (node.content ?? []).map(n => n.text ?? '').join('');
      return [new Paragraph({
        children: [new TextRun({ text, font: 'Courier New' })],
        shading: { fill: 'F5F5F5' },
      })];
    }

    case 'horizontalRule': {
      return [new Paragraph({
        children: [new TextRun('')],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA', space: 1 } },
      })];
    }

    case 'table': {
      const rows = (node.content ?? []).map(rowNode =>
        new TableRow({
          children: (rowNode.content ?? []).map(cellNode => {
            const cellChildren = [];
            for (const child of cellNode.content ?? []) {
              cellChildren.push(...blockToDocxElements(child));
            }
            return new TableCell({
              children: cellChildren.length ? cellChildren : [new Paragraph('')],
              width: { size: 100 / (rowNode.content?.length ?? 1), type: WidthType.PERCENTAGE },
            });
          }),
        })
      );
      return [new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })];
    }

    case 'image': {
      // Images can't be embedded without fetching + converting to base64;
      // insert a placeholder paragraph instead.
      return [new Paragraph({
        children: [new TextRun({ text: '[Image]', italics: true, color: '888888' })],
      })];
    }

    default:
      return [];
  }
}

// ── Main export function ───────────────────────────────────────────────────

export async function exportToDocx(tiptapJson, filename = 'document') {
  const docContent = typeof tiptapJson === 'string' ? JSON.parse(tiptapJson) : tiptapJson;

  const children = [];
  for (const node of docContent.content ?? []) {
    children.push(...blockToDocxElements(node));
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}
