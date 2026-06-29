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

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseActive = !!(supabaseUrl && supabaseKey);

  if (req.method === 'GET') {
    try {
      if (isSupabaseActive) {
        const response = await fetch(`${supabaseUrl}/rest/v1/signatures?order=created_at.asc`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (!response.ok) throw new Error("Supabase signature fetch failed");
        const rows = await response.json();
        const data = rows.map(row => ({
          id: row.sig_id,
          name: row.name,
          created_at: row.created_at
        }));
        return res.status(200).json(data);
      } else {
        const getRes = await fetch(EXTENDSCLASS_BIN_URL + "?cb=" + Date.now());
        if (!getRes.ok) return res.status(200).json([]);
        const data = await getRes.json();
        return res.status(200).json(data || []);
      }
    } catch (err) {
      console.error("Fetch signatures error:", err);
      return res.status(500).json({ error: "Failed to fetch signatures" });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const name = body.name ? body.name.trim() : '';
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      if (isSupabaseActive) {
        // Prevent duplicate signatures in Supabase
        const checkRes = await fetch(`${supabaseUrl}/rest/v1/signatures?name=ilike.${encodeURIComponent(name)}`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (checkRes.ok) {
          const checkRows = await checkRes.json();
          if (checkRows && checkRows.length > 0) {
            return res.status(200).json({ success: true, duplicated: true });
          }
        }

        const sigId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const response = await fetch(`${supabaseUrl}/rest/v1/signatures`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            sig_id: sigId,
            name: name,
            created_at: new Date().toISOString()
          })
        });
        if (!response.ok) throw new Error("Supabase signature write failed");
        return res.status(200).json({ success: true });
      } else {
        const getRes = await fetch(EXTENDSCLASS_BIN_URL + "?cb=" + Date.now());
        let signatures = [];
        if (getRes.ok) {
          try {
            signatures = await getRes.json();
          } catch(e) {
            signatures = [];
          }
        }

        if (signatures && signatures.some(s => s && s.name && s.name.toLowerCase() === name.toLowerCase())) {
          return res.status(200).json({ success: true, duplicated: true });
        }

        const sigId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newSig = {
          id: sigId,
          name: name,
          created_at: new Date().toISOString()
        };

        signatures.push(newSig);

        const putRes = await fetch(EXTENDSCLASS_BIN_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signatures)
        });
        
        if (!putRes.ok) throw new Error("Failed to write to database");
        return res.status(200).json({ success: true });
      }
    } catch (err) {
      console.error("Save signature error:", err);
      return res.status(500).json({ error: "Failed to save signature" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
