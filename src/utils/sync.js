/**
 * Synchronized Reflection & Signature Sharing Utility for Shalom Handbook
 * Uses Vercel Serverless Functions (/api/*) to bypass browser CORS preflight blocks.
 * Supports secure custom Supabase database configurations.
 */

// Helper to determine the backend API base URL
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const hn = window.location.hostname;
    if (hn === 'localhost' || hn === '127.0.0.1') {
      return 'https://gmc-shalom.vercel.app';
    }
  }
  return '';
};

/**
 * Get the current database configuration (Supabase or public fallback)
 */
export function getDbConfig() {
  const customUrl = localStorage.getItem('shalom_supabase_url');
  const customKey = localStorage.getItem('shalom_supabase_key');
  
  if (customUrl && customKey) {
    return { type: 'supabase', url: customUrl, key: customKey };
  }
  
  const apiBase = getApiBase();
  return { 
    type: 'public_kv', 
    reflectionsUrl: `${apiBase}/api/reflections`, 
    signaturesUrl: `${apiBase}/api/signatures` 
  };
}

/**
 * Save custom Supabase credentials
 */
export function setDbConfig(url, key) {
  if (!url || !key) {
    localStorage.removeItem('shalom_supabase_url');
    localStorage.removeItem('shalom_supabase_key');
  } else {
    localStorage.setItem('shalom_supabase_url', url.trim());
    localStorage.setItem('shalom_supabase_key', key.trim());
  }
}

/**
 * Share a reflection to the community feed.
 * Returns the created or updated post's ID.
 */
export async function shareReflection(name, dayIdx, dateStr, qNotes, eNotes, existingPostId = null) {
  const config = getDbConfig();
  const generatedId = existingPostId || `post_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  if (config.type === 'supabase') {
    try {
      // For Supabase, check if row exists to perform upsert or update
      if (existingPostId) {
        // Fetch current content first to merge
        const fetchRes = await fetch(`${config.url}/rest/v1/reflections?post_id=eq.${existingPostId}`, {
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`
          }
        });
        if (fetchRes.ok) {
          const rows = await fetchRes.json();
          if (rows && rows.length > 0) {
            let currentContent = { q_notes: {}, e_notes: {} };
            try {
              currentContent = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content;
            } catch(e) {}
            
            // Merge notes
            const mergedQ = { ...(currentContent.q_notes || {}) };
            Object.entries(qNotes || {}).forEach(([k, v]) => {
              if (v && v.trim()) mergedQ[k] = v;
            });
            const mergedE = { ...(currentContent.e_notes || {}) };
            Object.entries(eNotes || {}).forEach(([k, v]) => {
              if (v && v.trim()) mergedE[k] = v;
            });

            const patchRes = await fetch(`${config.url}/rest/v1/reflections?post_id=eq.${existingPostId}`, {
              method: 'PATCH',
              headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                name: name || 'Anonymous',
                content: JSON.stringify({ q_notes: mergedQ, e_notes: mergedE }),
                created_at: new Date().toISOString()
              })
            });
            if (patchRes.ok) return existingPostId;
          }
        }
      }

      // Default: Insert new row
      const response = await fetch(`${config.url}/rest/v1/reflections`, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          post_id: generatedId,
          name: name || 'Anonymous',
          day_idx: dayIdx,
          date_str: dateStr,
          content: JSON.stringify({ q_notes: qNotes || {}, e_notes: eNotes || {} }),
          created_at: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error("Supabase write failed");
      return generatedId;
    } catch (err) {
      console.error("Supabase share error:", err);
      throw err;
    }
  } else {
    try {
      const response = await fetch(config.reflectionsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existingPostId,
          name: name || 'Anonymous',
          day_idx: dayIdx,
          date_str: dateStr,
          q_notes: qNotes || {},
          e_notes: eNotes || {}
        })
      });
      if (!response.ok) throw new Error("Serverless API reflections write failed");
      const resData = await response.json();
      return resData.id || generatedId;
    } catch (err) {
      console.error("Serverless reflections share error:", err);
      throw err;
    }
  }
}

/**
 * Fetch reflections shared by the community
 */
export async function fetchReflections(dayIdx) {
  const config = getDbConfig();

  if (config.type === 'supabase') {
    try {
      const response = await fetch(
        `${config.url}/rest/v1/reflections?day_idx=eq.${dayIdx}&order=created_at.desc&limit=40`,
        {
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`
          }
        }
      );
      if (!response.ok) throw new Error("Supabase fetch failed");
      const rows = await response.json();
      
      return rows.map(row => {
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
    } catch (err) {
      console.error("Supabase fetch error:", err);
      return [];
    }
  } else {
    try {
      const getRes = await fetch(config.reflectionsUrl);
      if (!getRes.ok) return [];
      const posts = await getRes.json();
      
      return (posts || [])
        .filter(p => p !== null && p.day_idx === dayIdx)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) {
      console.error("Serverless reflections fetch error:", err);
      return [];
    }
  }
}

/**
 * Delete a shared reflection post
 */
export async function deleteReflection(postId) {
  const config = getDbConfig();

  if (config.type === 'supabase') {
    try {
      const response = await fetch(`${config.url}/rest/v1/reflections?post_id=eq.${postId}`, {
        method: 'DELETE',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`
        }
      });
      if (!response.ok) throw new Error("Supabase delete failed");
      return true;
    } catch (err) {
      console.error("Supabase delete error:", err);
      throw err;
    }
  } else {
    try {
      const response = await fetch(`${config.reflectionsUrl}?postId=${postId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Serverless API delete failed");
      return true;
    } catch (err) {
      console.error("Serverless delete error:", err);
      throw err;
    }
  }
}

/**
 * Share a vow signature to the community list
 */
export async function shareSignature(name) {
  const config = getDbConfig();

  if (config.type === 'supabase') {
    try {
      const response = await fetch(`${config.url}/rest/v1/signatures`, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          sig_id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: name.trim(),
          created_at: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error("Supabase signature write failed");
      return true;
    } catch (err) {
      console.error("Supabase signature share error:", err);
      throw err;
    }
  } else {
    try {
      const response = await fetch(config.signaturesUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      if (!response.ok) throw new Error("Serverless API signatures write failed");
      return true;
    } catch (err) {
      console.error("Serverless signature share error:", err);
      throw err;
    }
  }
}

/**
 * Fetch all vow signatures
 */
export async function fetchSignatures() {
  const config = getDbConfig();

  if (config.type === 'supabase') {
    try {
      const response = await fetch(
        `${config.url}/rest/v1/signatures?order=created_at.asc`,
        {
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`
          }
        }
      );
      if (!response.ok) throw new Error("Supabase signatures fetch failed");
      const rows = await response.json();
      return rows.map(row => ({
        id: row.sig_id,
        name: row.name,
        created_at: row.created_at
      }));
    } catch (err) {
      console.error("Supabase signatures fetch error:", err);
      return [];
    }
  } else {
    try {
      const getRes = await fetch(config.signaturesUrl);
      if (!getRes.ok) return [];
      const signatures = await getRes.json();
      
      return (signatures || [])
        .filter(s => s !== null && s.name)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } catch (err) {
      console.error("Serverless signatures fetch error:", err);
      return [];
    }
  }
}
