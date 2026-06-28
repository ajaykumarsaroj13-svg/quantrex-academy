import { connectToDatabase, BackupData } from './utils/db.js';

export default async function handler(req, res) {
  // Add CORS headers for the frontend to access it
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: 'Key query parameter is required' });
  }

  try {
    await connectToDatabase();
    const document = await BackupData.findOne({ key: key }).lean();

    if (!document) {
      return res.status(404).json({ error: 'Data not found' });
    }

    return res.status(200).json(document.data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
