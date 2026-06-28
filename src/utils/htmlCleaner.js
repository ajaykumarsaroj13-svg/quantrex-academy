export function fixExamGoalHtml(html) {
  if (!html) return '';
  let cleaned = html;
  if (typeof cleaned === 'object') {
    cleaned = cleaned.en?.content || cleaned.en?.questionText || cleaned.en || cleaned.content || cleaned.questionText || '';
  }
  if (typeof cleaned !== 'string') {
    cleaned = String(cleaned);
  }

  // 1. Remove wrapping <center> tags which force block layout
  cleaned = cleaned.replace(/<center>/gi, '<span>').replace(/<\/center>/gi, '</span>');

  // 2. Remove <br> tags immediately before or after block math $$...$$
  cleaned = cleaned.replace(/<br\s*\/?>\s*(?=\$\$)/gi, '');
  cleaned = cleaned.replace(/(\$\$)\s*<br\s*\/?>/gi, '$1');

  // 3. For any <p> that just wraps math, replace <p> with <span>
  // E.g. <p>$$...$$</p> -> <span>$$...$$</span>
  cleaned = cleaned.replace(/<p>\s*(\$\$.*?\$\$)\s*<\/p>/gs, '<span class="inline-block my-1">$1</span>');

  // 4. Sometimes questions are completely broken into separate <p> tags for each sentence.
  // We can convert <p> to <span> to allow inline flowing, unless there's a real need for block.
  // By converting them to spans, they will flow naturally together.
  cleaned = cleaned.replace(/<p([^>]*)>/gi, '<span$1 class="inline-exam-p">');
  cleaned = cleaned.replace(/<\/p>/gi, ' </span>');

  return cleaned;
}
