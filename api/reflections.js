const EXTENDSCLASS_BIN_URL = "https://extendsclass.com/api/json-storage/bin/acaaebf";

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
      console.error("Fetch reflections error:", err);
      return res.status(500).json({ error: "Failed to fetch reflections" });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      
      // Fetch current array of reflections
      const getRes = await fetch(EXTENDSCLASS_BIN_URL);
      let reflections = [];
      if (getRes.ok) {
        try {
          reflections = await getRes.json();
        } catch(e) {
          reflections = [];
        }
      }

      // Check if we are updating an existing post
      const existingPostIdx = body.id ? (reflections || []).findIndex(p => p && p.id === body.id) : -1;
      
      if (existingPostIdx > -1) {
        // Update / Merge into existing post
        const currentPost = reflections[existingPostIdx];
        
        // Merge q_notes and e_notes, prioritizing non-empty values
        const mergedQ = { ...(currentPost.q_notes || {}) };
        if (body.q_notes) {
          Object.entries(body.q_notes).forEach(([k, v]) => {
            if (v && v.trim()) mergedQ[k] = v;
          });
        }
        
        const mergedE = { ...(currentPost.e_notes || {}) };
        if (body.e_notes) {
          Object.entries(body.e_notes).forEach(([k, v]) => {
            if (v && v.trim()) mergedE[k] = v;
          });
        }

        reflections[existingPostIdx] = {
          ...currentPost,
          name: body.name || currentPost.name,
          q_notes: mergedQ,
          e_notes: mergedE,
          updated_at: new Date().toISOString()
        };

        const putRes = await fetch(EXTENDSCLASS_BIN_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reflections)
        });
        
        if (!putRes.ok) throw new Error("Failed to update database");
        return res.status(200).json({ success: true, id: body.id });
      } else {
        // Create new post
        const postId = body.id || `post_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newPost = {
          id: postId,
          name: body.name || 'Anonymous',
          day_idx: body.day_idx,
          date_str: body.date_str,
          q_notes: body.q_notes || {},
          e_notes: body.e_notes || {},
          created_at: new Date().toISOString()
        };

        reflections.push(newPost);

        const putRes = await fetch(EXTENDSCLASS_BIN_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reflections)
        });
        
        if (!putRes.ok) throw new Error("Failed to write to database");
        return res.status(200).json({ success: true, id: postId });
      }
    } catch (err) {
      console.error("Save reflection error:", err);
      return res.status(500).json({ error: "Failed to save reflection" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const postId = req.query.postId || (req.body && req.body.postId);
      if (!postId) {
        return res.status(400).json({ error: "postId is required" });
      }

      // Fetch reflections
      const getRes = await fetch(EXTENDSCLASS_BIN_URL);
      if (!getRes.ok) return res.status(500).json({ error: "Failed to read database" });
      const reflections = await getRes.json();

      // Filter out the post
      const updatedReflections = (reflections || []).filter(p => p && p.id !== postId);

      // Save back
      const putRes = await fetch(EXTENDSCLASS_BIN_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReflections)
      });
      
      if (!putRes.ok) throw new Error("Failed to write to database");
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Delete reflection error:", err);
      return res.status(500).json({ error: "Failed to delete reflection" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
