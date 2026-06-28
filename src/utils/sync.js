/**
 * Synchronized Reflection & Signature Sharing Utility for Shalom Handbook
 * Supports instant public cloud KV sync out-of-the-box,
 * and secure custom Supabase database configuration.
 */

// Registered ExtendsClass Bins for public fallback
const PUBLIC_REFLECTIONS_BIN = "acaaebf";
const PUBLIC_SIGNATURES_BIN = "fcabdaa";
const EXTENDSCLASS_BASE_URL = "https://extendsclass.com/api/json-storage/bin/";

/**
 * Get the current database configuration (Supabase or public fallback)
 */
export function getDbConfig() {
  const customUrl = localStorage.getItem('shalom_supabase_url');
  const customKey = localStorage.getItem('shalom_supabase_key');
  
  if (customUrl && customKey) {
    return { type: 'supabase', url: customUrl, key: customKey };
  }
  
  return { 
    type: 'public_kv', 
    reflectionsUrl: `${EXTENDSCLASS_BASE_URL}${PUBLIC_REFLECTIONS_BIN}`, 
    signaturesUrl: `${EXTENDSCLASS_BASE_URL}${PUBLIC_SIGNATURES_BIN}` 
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
 * Share a reflection to the community feed
 */
export async function shareReflection(name, dayIdx, dateStr, qNotes, eNotes) {
  const config = getDbConfig();
  const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  const postData = {
    id: postId,
    name: name || 'Anonymous',
    day_idx: dayIdx,
    date_str: dateStr,
    q_notes: qNotes || {},
    e_notes: eNotes || {},
    created_at: new Date().toISOString()
  };

  if (config.type === 'supabase') {
    try {
      const response = await fetch(`${config.url}/rest/v1/reflections`, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          post_id: postData.id,
          name: postData.name,
          day_idx: postData.day_idx,
          date_str: postData.date_str,
          content: JSON.stringify({ q_notes: postData.q_notes, e_notes: postData.e_notes }),
          created_at: postData.created_at
        })
      });
      if (!response.ok) throw new Error("Supabase write failed");
      return true;
    } catch (err) {
      console.error("Supabase share error:", err);
      throw err;
    }
  } else {
    try {
      // 1. Fetch current array of reflections
      const getRes = await fetch(config.reflectionsUrl);
      let reflections = [];
      if (getRes.ok) {
        reflections = await getRes.json();
      }
      
      // 2. Append new post data
      reflections.push(postData);

      // 3. Save back (PUT)
      const putRes = await fetch(config.reflectionsUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reflections)
      });
      if (!putRes.ok) throw new Error("ExtendsClass reflections write failed");
      return true;
    } catch (err) {
      console.error("Public sharing write error:", err);
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
      
      return posts
        .filter(p => p !== null && p.day_idx === dayIdx)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) {
      console.error("Public reflections fetch error:", err);
      return [];
    }
  }
}

/**
 * Share a vow signature to the community list
 */
export async function shareSignature(name) {
  const config = getDbConfig();
  const sigId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  const sigData = {
    id: sigId,
    name: name.trim(),
    created_at: new Date().toISOString()
  };

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
          sig_id: sigData.id,
          name: sigData.name,
          created_at: sigData.created_at
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
      // 1. Fetch current array of signatures
      const getRes = await fetch(config.signaturesUrl);
      let signatures = [];
      if (getRes.ok) {
        signatures = await getRes.json();
      }

      // Prevent duplicate signatures on double clicks
      if (signatures.some(s => s.name.toLowerCase() === sigData.name.toLowerCase())) {
        return true;
      }

      // 2. Append new signature
      signatures.push(sigData);

      // 3. Save back (PUT)
      const putRes = await fetch(config.signaturesUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signatures)
      });
      if (!putRes.ok) throw new Error("ExtendsClass signatures write failed");
      return true;
    } catch (err) {
      console.error("Public signature write error:", err);
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
      
      return signatures
        .filter(s => s !== null)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } catch (err) {
      console.error("Public signatures fetch error:", err);
      return [];
    }
  }
}
