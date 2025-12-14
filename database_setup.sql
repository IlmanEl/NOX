-- SQL для создания таблицы dictionary в Supabase
-- Выполните этот SQL в Supabase Dashboard -> SQL Editor

-- 1. Удаляем таблицу если существует (опционально)
DROP TABLE IF EXISTS dictionary;

-- 2. Создаем новую таблицу
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

-- 3. Создаем индексы для ускорения поиска
CREATE INDEX idx_dictionary_type ON dictionary(type);
CREATE INDEX idx_dictionary_category ON dictionary(category);
CREATE INDEX idx_dictionary_ce ON dictionary(ce);

-- 4. Включаем Row Level Security (RLS) для безопасности
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;

-- 5. Создаем политику для чтения (публичный доступ)
CREATE POLICY "Allow public read access"
ON dictionary FOR SELECT
TO public
USING (true);

-- 6. Создаем политику для вставки (только сервис)
CREATE POLICY "Allow service role insert"
ON dictionary FOR INSERT
TO service_role
WITH CHECK (true);

-- 7. Создаем политику для обновления (только сервис)
CREATE POLICY "Allow service role update"
ON dictionary FOR UPDATE
TO service_role
USING (true);

-- 8. Создаем политику для удаления (только сервис)
CREATE POLICY "Allow service role delete"
ON dictionary FOR DELETE
TO service_role
USING (true);
