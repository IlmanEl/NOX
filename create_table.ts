import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Используем service_role ключ для полных прав
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTable() {
  console.log('🔨 Создание таблицы dictionary в Supabase...\n');
  console.log('⚠️  К сожалению, Supabase REST API не поддерживает выполнение DDL операций');
  console.log('   (создание таблиц) даже с service_role ключом.\n');
  console.log('📋 Пожалуйста, выполните SQL один раз в Supabase Dashboard:\n');
  console.log('1. Откройте SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/sxwikzepzdcjapbrgymw/sql/new\n');
  console.log('2. Вставьте этот SQL и нажмите RUN:\n');
  console.log('----------------------------------------');
  console.log(`
CREATE TABLE dictionary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ce TEXT NOT NULL,
  ru TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('word', 'phrase')),
  category TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ce)
);

CREATE INDEX idx_dictionary_type ON dictionary(type);
CREATE INDEX idx_dictionary_category ON dictionary(category);
CREATE INDEX idx_dictionary_ce ON dictionary(ce);
  `);
  console.log('----------------------------------------\n');
  console.log('3. После успешного выполнения напишите мне "готово"\n');
  console.log('💡 Это нужно сделать только ОДИН РАЗ. После этого всё будет работать автоматически!');
}

createTable();
