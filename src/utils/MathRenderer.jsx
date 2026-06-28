/**
 * MathRenderer.jsx
 * Renders text containing optional $...$ or $$...$$ math and HTML tags.
 * Uses KaTeX renderToString to render math blocks, allowing raw HTML tags (like tables, br, b) to render natively.
 */
import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function convertMarkdownTableToHtml(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let inTable = false;
  let htmlLines = [];
  let tableHeader = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        htmlLines.push('<table class="w-full text-left border-collapse border border-gray-300 mt-4 mb-4 text-sm"><tbody>');
        tableHeader = true;
      }
      
      // Skip separator line (e.g. |---|---|)
      if (line.includes('---') || line.includes('- - -')) {
        tableHeader = false;
        continue;
      }
      
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      htmlLines.push('<tr>');
      cells.forEach(cell => {
        const tag = tableHeader ? 'th' : 'td';
        const classes = tableHeader 
          ? 'border border-gray-300 p-2 bg-gray-100 font-bold' 
          : 'border border-gray-300 p-2';
        htmlLines.push(`<${tag} class="${classes}">${cell}</${tag}>`);
      });
      htmlLines.push('</tr>');
      tableHeader = false; // only the first row is header
    } else {
      if (inTable) {
        inTable = false;
        htmlLines.push('</tbody></table>');
      }
      htmlLines.push(lines[i]);
    }
  }
  if (inTable) {
    htmlLines.push('</tbody></table>');
  }
  return htmlLines.join('\n');
}

function renderMathInText(text) {
  if (!text) return '';
  
  // Convert markdown tables first
  const parsedText = convertMarkdownTableToHtml(text);
  
  let remaining = String(parsedText);
  let html = '';
  
  while (remaining.length > 0) {
    const displayStart = remaining.indexOf('$$');
    const inlineStart = remaining.indexOf('$');
    
    if (inlineStart === -1) {
      html += remaining;
      break;
    }
    
    const isDisplay = displayStart === inlineStart;
    
    if (inlineStart > 0) {
      html += remaining.slice(0, inlineStart);
      remaining = remaining.slice(inlineStart);
      continue;
    }
    
    // We are at the start of a math block
    if (isDisplay && remaining.startsWith('$$')) {
      const end = remaining.indexOf('$$', 2);
      if (end === -1) {
        html += remaining;
        break;
      }
      const mathStr = remaining.slice(2, end);
      try {
        const mathHtml = katex.renderToString(mathStr, { displayMode: true, throwOnError: false });
        html += `<span class="inline-block my-1">${mathHtml}</span>`;
      } catch (e) {
        html += `<span class="text-red-500 font-mono text-sm">${mathStr}</span>`;
      }
      remaining = remaining.slice(end + 2);
    } else if (remaining.startsWith('$')) {
      const end = remaining.indexOf('$', 1);
      if (end === -1) {
        html += remaining;
        break;
      }
      const mathStr = remaining.slice(1, end);
      try {
        const mathHtml = katex.renderToString(mathStr, { displayMode: false, throwOnError: false });
        html += mathHtml;
      } catch (e) {
        html += `<span class="text-red-500 font-mono text-sm">${mathStr}</span>`;
      }
      remaining = remaining.slice(end + 1);
    } else {
      html += remaining[0];
      remaining = remaining.slice(1);
    }
  }
  
  return html;
}

/**
 * MathRenderer component
 * @param {string} text - The text containing optional $...$ math and HTML
 * @param {string} className - Additional CSS class names
 */
export default function MathRenderer({ text, className = '' }) {
  if (!text) return null;

  const html = useMemo(() => renderMathInText(text), [text]);

  return (
    <span 
      className={`math-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
