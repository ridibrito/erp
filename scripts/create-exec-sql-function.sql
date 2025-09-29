-- Função para executar SQL dinâmico via RPC
-- Esta função deve ser executada no Supabase SQL Editor

CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'OK';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$$;
