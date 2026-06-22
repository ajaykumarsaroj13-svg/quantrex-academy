/**
 * MathRenderer.jsx
 * Renders text containing $...$ inline math using KaTeX.
 * Splits text by $ delimiters and renders math blocks with KaTeX,
 * plain text as normal React text nodes, and handles newlines as <br>.
 * Also renders markdown-style bold (**text**) and HTML tables (| ... |).
 */
import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Parse a single line that may contain $...$ (inline) and $$...$$ (display) math.
 * Returns an array of React elements.
 */
function parseMathLine(text, keyOffset = 0) {
  if (!text) return [];

  const parts = [];
  let remaining = text;
  let key = keyOffset;

  while (remaining.length > 0) {
    const displayStart = remaining.indexOf('$$');
    const inlineStart = remaining.indexOf('$');

    if (inlineStart === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    const isDisplay = displayStart === inlineStart;

    if (inlineStart > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, inlineStart)}</span>);
      remaining = remaining.slice(inlineStart);
      continue;
    }

    if (isDisplay && remaining.startsWith('$$')) {
      const end = remaining.indexOf('$$', 2);
      if (end === -1) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
      const mathStr = remaining.slice(2, end);
      parts.push(
        <span key={key++} className="inline-block my-1">
          <BlockMath math={mathStr} errorColor="#ef4444" />
        </span>
      );
      remaining = remaining.slice(end + 2);
    } else if (remaining.startsWith('$')) {
      const end = remaining.indexOf('$', 1);
      if (end === -1) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
      const mathStr = remaining.slice(1, end);
      parts.push(
        <InlineMath key={key++} math={mathStr} errorColor="#ef4444" />
      );
      remaining = remaining.slice(end + 1);
    } else {
      parts.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }

  return parts;
}

/**
 * Render markdown bold **text** in a line.
 * Returns array of React nodes.
 */
function renderBold(text, keyOffset = 0) {
  const parts = [];
  let key = keyOffset;
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(<strong key={key++}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }
  return parts;
}

/**
 * Parse a full text with lines, tables, bold, and math.
 */
function parseFullText(text) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const result = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect markdown table: lines starting with |
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|---')) {
      // It's a table — collect all rows
      const tableLines = [];
      // header row
      tableLines.push(line);
      i++; // separator row
      i++; // skip separator
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }

      // Parse table
      const headerCells = tableLines[0].split('|').slice(1, -1).map(c => c.trim());
      const dataRows = tableLines.slice(1).map(row =>
        row.split('|').slice(1, -1).map(c => c.trim())
      );

      result.push(
        <div key={key++} className="overflow-x-auto my-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-50 border-b-2 border-blue-200">
                {headerCells.map((cell, ci) => (
                  <th key={ci} className="px-4 py-2 text-left font-bold text-blue-800 border border-blue-200 min-w-[180px]">
                    {parseMathLine(cell, key * 100 + ci)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 border border-gray-200 align-top leading-relaxed">
                      {parseMathLine(cell, key * 100 + ri * 10 + ci)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Empty line => paragraph break
    if (line.trim() === '') {
      result.push(<br key={key++} />);
      i++;
      continue;
    }

    // Normal line with possible bold + math
    const lineKey = key++;
    // Apply bold then math
    const boldParts = [];
    let bKey = lineKey * 1000;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    const segments = [];

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: line.slice(lastIndex, match.index) });
      }
      segments.push({ type: 'bold', content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      segments.push({ type: 'text', content: line.slice(lastIndex) });
    }

    const lineElements = [];
    for (const seg of segments) {
      if (seg.type === 'bold') {
        lineElements.push(<strong key={bKey++}>{parseMathLine(seg.content, bKey * 10)}</strong>);
      } else {
        lineElements.push(...parseMathLine(seg.content, bKey * 10));
        bKey++;
      }
    }

    result.push(
      <div key={lineKey} className="leading-relaxed">
        {lineElements}
      </div>
    );
    i++;
  }

  return result;
}

/**
 * MathRenderer component
 * @param {string} text - The text containing optional $...$ math, markdown bold, and tables
 * @param {string} className - Additional CSS class names
 */
export default function MathRenderer({ text, className = '' }) {
  if (!text) return null;

  return (
    <div className={`math-renderer ${className}`}>
      {parseFullText(text)}
    </div>
  );
}
