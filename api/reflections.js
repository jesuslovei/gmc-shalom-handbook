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

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseActive = !!(supabaseUrl && supabaseKey);

  if (req.method === 'GET') {
    try {
      if (isSupabaseActive) {
        const response = await fetch(`${supabaseUrl}/rest/v1/reflections?order=created_at.desc&limit=100`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (!response.ok) throw new Error("Supabase reflections fetch failed");
        const rows = await response.json();
        const data = rows.map(row => {
          let content = { q_notes: {}, e_notes: {} };
          try {
            content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
          } catch(e) {}
          return {
            id: row.post_id,
            name: row.name,
            day_idx: row.day_idx,
            date_str: row.date_str,
            q_notes: content.q_notes || {},
            e_notes: content.e_notes || {},
            created_at: row.created_at
          };
        });
        return res.status(200).json(data);
      } else {
        const getRes = await fetch(EXTENDSCLASS_BIN_URL);
        if (!getRes.ok) return res.status(200).json([]);
        const data = await getRes.json();
        return res.status(200).json(data || []);
      }
    } catch (err) {
      console.error("Fetch reflections error:", err);
      return res.status(500).json({ error: "Failed to fetch reflections" });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      
      if (isSupabaseActive) {
        const generatedId = body.id || `post_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        // 1. Check if post exists to perform update
        if (body.id) {
          const fetchRes = await fetch(`${supabaseUrl}/rest/v1/reflections?post_id=eq.${body.id}`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          if (fetchRes.ok) {
            const rows = await fetchRes.json();
            if (rows && rows.length > 0) {
              let currentContent = { q_notes: {}, e_notes: {} };
              try {
                currentContent = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content;
              } catch(e) {}
              
              const mergedQ = { ...(currentContent.q_notes || {}) };
              if (body.q_notes) {
                Object.entries(body.q_notes).forEach(([k, v]) => {
                  if (v && v.trim()) mergedQ[k] = v;
                });
              }
              
              const mergedE = { ...(currentContent.e_notes || {}) };
              if (body.e_notes) {
                Object.entries(body.e_notes).forEach(([k, v]) => {
                  if (v && v.trim()) mergedE[k] = v;
                });
              }

              const patchRes = await fetch(`${supabaseUrl}/rest/v1/reflections?post_id=eq.${body.id}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                  name: body.name || 'Anonymous',
                  content: JSON.stringify({ q_notes: mergedQ, e_notes: mergedE }),
                  created_at: new Date().toISOString()
                })
              });
              if (!patchRes.ok) throw new Error("Supabase reflections patch failed");
              return res.status(200).json({ success: true, id: body.id });
            }
          }
        }

        // 2. Default: Insert new reflection
        const response = await fetch(`${supabaseUrl}/rest/v1/reflections`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            post_id: generatedId,
            name: body.name || 'Anonymous',
            day_idx: body.day_idx,
            date_str: body.date_str,
            content: JSON.stringify({ q_notes: body.q_notes || {}, e_notes: body.e_notes || {} }),
            created_at: new Date().toISOString()
          })
        });
        if (!response.ok) throw new Error("Supabase reflections write failed");
        return res.status(200).json({ success: true, id: generatedId });
      } else {
        const getRes = await fetch(EXTENDSCLASS_BIN_URL);
        let reflections = [];
        if (getRes.ok) {
          try {
            reflections = await getRes.json();
          } catch(e) {
            reflections = [];
          }
        }

        const existingPostIdx = body.id ? (reflections || []).findIndex(p => p && p.id === body.id) : -1;
        
        if (existingPostIdx > -1) {
          const currentPost = reflections[existingPostIdx];
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

      if (isSupabaseActive) {
        const response = await fetch(`${supabaseUrl}/rest/v1/reflections?post_id=eq.${postId}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (!response.ok) throw new Error("Supabase reflections delete failed");
        return res.status(200).json({ success: true });
      } else {
        const getRes = await fetch(EXTENDSCLASS_BIN_URL);
        if (!getRes.ok) return res.status(500).json({ error: "Failed to read database" });
        const reflections = await getRes.json();
        const updatedReflections = (reflections || []).filter(p => p && p.id !== postId);

        const putRes = await fetch(EXTENDSCLASS_BIN_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedReflections)
        });
        
        if (!putRes.ok) throw new Error("Failed to write to database");
        return res.status(200).json({ success: true });
      }
    } catch (err) {
      console.error("Delete reflection error:", err);
      return res.status(500).json({ error: "Failed to delete reflection" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
