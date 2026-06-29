const EXTENDSCLASS_BIN_URL = "https://extendsclass.com/api/json-storage/bin/fcabdaa";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // Disable Vercel Edge caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const getRes = await fetch(EXTENDSCLASS_BIN_URL);
      if (!getRes.ok) return res.status(200).json([]);
      const data = await getRes.json();
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Fetch signatures error:", err);
      return res.status(500).json({ error: "Failed to fetch signatures" });
    }
  }

  if (req.method === 'POST') {
    try {
      // 1. Parse body
      const body = req.body;
      const name = body.name ? body.name.trim() : '';
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      // 2. Fetch current array of signatures
      const getRes = await fetch(EXTENDSCLASS_BIN_URL);
      let signatures = [];
      if (getRes.ok) {
        try {
          signatures = await getRes.json();
        } catch(e) {
          signatures = [];
        }
      }

      const sigId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newSig = {
        id: sigId,
        name: name,
        created_at: new Date().toISOString()
      };

      // Prevent duplicate signatures
      if (signatures && signatures.some(s => s && s.name && s.name.toLowerCase() === name.toLowerCase())) {
        return res.status(200).json({ success: true, duplicated: true });
      }

      signatures.push(newSig);

      // 3. Save back (PUT)
      const putRes = await fetch(EXTENDSCLASS_BIN_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signatures)
      });
      
      if (!putRes.ok) {
        throw new Error("Failed to write to database");
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Save signature error:", err);
      return res.status(500).json({ error: "Failed to save signature" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
