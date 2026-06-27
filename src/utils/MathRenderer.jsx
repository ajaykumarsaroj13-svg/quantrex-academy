/**
 * MathRenderer.jsx
 * Renders text containing $...$ inline math using KaTeX.
 * Splits text by $ delimiters and renders math blocks with KaTeX,
 * and plain text as normal React text nodes.
 */
import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Parse a string with $...$ (inline) and $$...$$ (display) math
 * and return an array of React elements.
 */
function parseMath(text) {
  if (!text) return null;

  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Check for display math $$...$$
    const displayStart = remaining.indexOf('$$');
    // Check for inline math $...$
    const inlineStart = remaining.indexOf('$');

    if (inlineStart === -1) {
      // No more math — just plain text
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    const isDisplay = displayStart === inlineStart;

    if (inlineStart > 0) {
      // Text before the math
      parts.push(<span key={key++}>{remaining.slice(0, inlineStart)}</span>);
      remaining = remaining.slice(inlineStart);
      continue;
    }

    // We're at the start of a math block
    if (isDisplay && remaining.startsWith('$$')) {
      const end = remaining.indexOf('$$', 2);
      if (end === -1) {
        // Malformed — treat rest as text
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
        // Malformed — treat rest as text
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
      const mathStr = remaining.slice(1, end);
        parts.push(
          <InlineMath key={key++} math={`\\displaystyle ${mathStr}`} renderError={(error) => {
            return <span className="text-red-500 font-mono text-sm" title={error.message}>{mathStr}</span>;
          }} />
        );
      remaining = remaining.slice(end + 1);
    } else {
      // Shouldn't happen, but guard anyway
      parts.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }

  return parts;
}

/**
 * MathRenderer component
 * @param {string} text - The text containing optional $...$ math
 * @param {string} className - Additional CSS class names
 */
export default function MathRenderer({ text, className = '' }) {
  if (!text) return null;

  return (
    <span className={`math-renderer ${className}`}>
      {parseMath(text)}
    </span>
  );
}
