const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkForeignKeys() {
  try {
    console.log('=== VERIFICANDO FOREIGN KEYS ===\n');
    
    const checkFKSQL = `
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'user_sessions';
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: checkFKSQL
    });
    
    if (error) {
      console.error('Erro:', error);
    } else {
      console.log('Foreign Keys encontradas:');
      console.log(data);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkForeignKeys();
