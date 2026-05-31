import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    if (action === 'get_chapter') {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await response.text();
      const $ = cheerio.load(html);

      const links = [];
      $('a[href^="/past-years/jee/question/"]').each((i, el) => {
        links.push(`https://questions.examside.com${$(el).attr('href')}`);
      });

      // Deduplicate
      const uniqueLinks = [...new Set(links)];
      return res.status(200).json({ urls: uniqueLinks });
    }

    if (action === 'get_question') {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract the raw LaTeX and HTML
      // We will grab the main content areas.
      // Often in examside, questions and options are in specific elements or split by <!-- HTML_TAG_START -->
      
      let rawContentChunks = [];
      const regex = /<!-- HTML_TAG_START -->([\s\S]*?)<!-- HTML_TAG_END -->/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        rawContentChunks.push(match[1].trim());
      }

      // Basic heuristic:
      // Chunk 0: Question Text
      // Chunk 1,2,3,4: Options
      // Chunk 5+: Solution/Explanation
      
      let questionText = rawContentChunks.length > 0 ? rawContentChunks[0] : "Failed to parse question";
      let options = rawContentChunks.slice(1, 5);
      // Ensure we always have 4 options
      while(options.length < 4) options.push("N/A");

      // We'll set a placeholder correctOption (since finding the exact correct option requires more complex DOM traversal or Gemini)
      // For POC/Importer, we just save the raw chunks, and admin can edit them, or we send the whole HTML to Gemini if they have API key.
      // Since they DO have Gemini API Key, we can optionally use Gemini here! But to save time and API limits, we'll just extract raw.

      return res.status(200).json({
        questionText: questionText,
        options: options,
        correctOption: "A", // Placeholder, requires manual review or Gemini
        explanation: rawContentChunks.slice(5).join('<br/>') || "",
        tags: []
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Scraper error:', error);
    return res.status(500).json({ error: error.message });
  }
}
