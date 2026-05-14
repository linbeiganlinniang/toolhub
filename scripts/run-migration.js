const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://lhjhtfsyzqrsxbftwzit.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoamh0ZnN5enFyc3hiZnR3eml0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1MDUzMSwiZXhwIjoyMDk0MzI2NTMxfQ.hqRyc1jaO31wdBMOKnvuN-CaPG7ZHso0eB1G7Oo7XTs';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function runSQL(sql) {
  // Split by semicolons but preserve dollar-quoted blocks
  const statements = [];
  let current = '';
  let inDollar = false;
  
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (sql.substring(i, i+2) === '$$' && !inDollar) {
      inDollar = true;
      current += '$$';
      i++;
      continue;
    }
    if (sql.substring(i, i+2) === '$$' && inDollar) {
      inDollar = false;
      current += '$$';
      i++;
      continue;
    }
    if (ch === ';' && !inDollar) {
      const stmt = current.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      current = '';
    } else {
      current += ch;
    }
  }
  const last = current.trim();
  if (last && !last.startsWith('--')) statements.push(last);

  console.log(`Executing ${statements.length} statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.length > 60 ? stmt.substring(0, 60) + '...' : stmt;
    try {
      const { data, error } = await supabase.rpc('exec', { query: stmt });
      if (error) {
        // Try direct REST API
        const res = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Prefer': 'resolution=merge-duplicates'
          }
        });
        console.log(`[${i+1}/${statements.length}] ${preview} - skipped (no exec rpc)`);
      } else {
        console.log(`[${i+1}/${statements.length}] ${preview} ✓`);
      }
    } catch (e) {
      console.log(`[${i+1}/${statements.length}] ${preview} - error: ${e.message}`);
    }
  }
}

const sql = fs.readFileSync('supabase/migrations/001_schema.sql', 'utf8');
runSQL(sql).then(() => console.log('Done!')).catch(e => console.error(e));
