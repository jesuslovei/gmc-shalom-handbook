export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const text = req.query.text;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const cleanText = text.replace(/¡|!|¿|\?/g, '').trim();
    const urlText = encodeURIComponent(cleanText);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=es&client=tw-ob&q=${urlText}`;

    const fetchRes = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    });

    if (!fetchRes.ok) {
      console.error(`Google TTS returned error status: ${fetchRes.status}`);
      return res.status(500).json({ error: "Failed to fetch TTS from Google" });
    }

    const buffer = await fetchRes.arrayBuffer();
    
    // Set headers for audio streaming and edge caching for performance
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); 
    
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("TTS proxy error:", err);
    return res.status(500).json({ error: "TTS proxy error" });
  }
}
