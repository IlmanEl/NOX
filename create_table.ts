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

  // SQL для создания таблицы
  const sql = `
-- Удаляем таблицу если существует
DROP TABLE IF EXISTS dictionary CASCADE;

-- Создаем новую таблицу
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

-- Создаем индексы для ускорения поиска
CREATE INDEX idx_dictionary_type ON dictionary(type);
CREATE INDEX idx_dictionary_category ON dictionary(category);
CREATE INDEX idx_dictionary_ce ON dictionary(ce);

-- Включаем Row Level Security
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (публичный доступ)
CREATE POLICY "Allow public read access"
ON dictionary FOR SELECT
TO public
USING (true);

-- Политика для вставки/обновления (только через service role или anon с правами)
CREATE POLICY "Allow anon insert"
ON dictionary FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anon update"
ON dictionary FOR UPDATE
TO anon, authenticated
USING (true);

CREATE POLICY "Allow anon delete"
ON dictionary FOR DELETE
TO anon, authenticated
USING (true);
  `.trim();

  try {
    // Выполняем SQL через Supabase REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Если rpc/exec не работает, пробуем через прямой SQL запрос
      console.log('⚠️  Прямое выполнение SQL через REST API не поддерживается');
      console.log('📋 Пожалуйста, выполните SQL вручную в Supabase Dashboard:\n');
      console.log('1. Откройте https://supabase.com/dashboard/project/sxwikzepzdcjapbrgymw/sql/new');
      console.log('2. Скопируйте содержимое файла database_setup.sql');
      console.log('3. Нажмите "Run"\n');
      console.log('После создания таблицы запустите: npm run setup');
      process.exit(1);
    }

    console.log('✅ Таблица dictionary успешно создана!\n');

  } catch (error) {
    console.error('❌ Ошибка при создании таблицы:', error);
    console.log('\n📋 Пожалуйста, создайте таблицу вручную через Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/sxwikzepzdcjapbrgymw/sql/new\n');
    console.log('Используйте файл: database_setup.sql');
    process.exit(1);
  }
}

createTable();
