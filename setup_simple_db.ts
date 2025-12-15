import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Загружаем переменные окружения
config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Ошибка: SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть установлены в .env');
  process.exit(1);
}

// Создаем клиент Supabase с service_role ключом для полных прав
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface DictionaryEntry {
  ce: string;
  ru: string;
  type: 'word' | 'phrase';
  category: string;
  class?: string | null;
}

type MasterSeed = DictionaryEntry[];

async function setupDatabase() {
  // Проверяем флаг --clean для полной очистки базы
  const shouldClean = process.argv.includes('--clean');

  console.log('🚀 Начинаем настройку базы данных...\n');
  if (shouldClean) {
    console.log('⚠️  РЕЖИМ ОЧИСТКИ: База будет полностью очищена перед загрузкой!\n');
  }

  try {
    // 1. Проверяем подключение
    console.log('🔌 Проверка подключения к Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('dictionary')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      if (testError.code === '42P01') {
        console.log('\n⚠️  ТАБЛИЦА "dictionary" НЕ НАЙДЕНА!\n');
        console.log('📋 Пожалуйста, создайте таблицу в Supabase Dashboard используя этот SQL:\n');
        console.log('----------------------------------------');
        console.log(`
-- Создаем таблицу dictionary
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
        `);
        console.log('----------------------------------------\n');
        console.log('После создания таблицы запустите скрипт снова: npm run setup\n');
        process.exit(1);
      } else {
        throw testError;
      }
    }

    console.log('✅ Подключение успешно\n');

    // 2. Опциональная очистка таблицы (только если указан флаг --clean)
    if (shouldClean) {
      console.log('🗑️  Очистка таблицы dictionary...');
      const { error: deleteError } = await supabase
        .from('dictionary')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.log('⚠️  Ошибка при очистке:', deleteError.message);
      } else {
        console.log('✅ Таблица очищена\n');
      }
    }

    // 3. Загружаем данные из master_seed.json
    // ВАЖНО: Используем upsert - обновляем существующие записи и добавляем новые
    console.log('📥 Загрузка данных из master_seed.json...');
    const masterSeed: MasterSeed = JSON.parse(
      readFileSync('./master_seed.json', 'utf-8')
    );

    // Преобразуем данные для загрузки в БД
    const allEntries = masterSeed.map(entry => ({
      ce: entry.ce,
      ru: entry.ru,
      type: entry.type,
      category: entry.category,
      is_verified: true
    }));

    // Удаляем дубликаты (оставляем последнее вхождение для каждого уникального ce)
    const uniqueMap = new Map<string, typeof allEntries[0]>();
    allEntries.forEach(entry => {
      uniqueMap.set(entry.ce, entry);
    });
    const dictionaryEntries = Array.from(uniqueMap.values());

    const duplicatesRemoved = allEntries.length - dictionaryEntries.length;
    if (duplicatesRemoved > 0) {
      console.log(`⚠️  Удалено дубликатов: ${duplicatesRemoved} (оставлены последние версии)\n`);
    }

    // Подсчитываем статистику
    const wordCount = dictionaryEntries.filter(e => e.type === 'word').length;
    const phraseCount = dictionaryEntries.filter(e => e.type === 'phrase').length;

    console.log(`📊 Всего записей для обработки: ${dictionaryEntries.length}`);
    console.log(`   - Слов: ${wordCount}`);
    console.log(`   - Фраз: ${phraseCount}\n`);

    // 4. Загружаем данные в базу (upsert по полю ce)
    console.log('⬆️  Синхронизация с Supabase (upsert)...');
    console.log('   → Существующие записи будут обновлены');
    console.log('   → Новые записи будут добавлены\n');

    const { data, error: upsertError } = await supabase
      .from('dictionary')
      .upsert(dictionaryEntries, {
        onConflict: 'ce',
        ignoreDuplicates: false
      })
      .select();

    if (upsertError) {
      console.error('❌ Ошибка при синхронизации данных:', upsertError);
      throw upsertError;
    }

    console.log(`✅ Успешно синхронизировано ${dictionaryEntries.length} записей!\n`);

    // 5. Проверяем результат
    const { data: allRecords, error: countError } = await supabase
      .from('dictionary')
      .select('type');

    if (countError) {
      console.error('⚠️  Не удалось получить количество записей:', countError);
    } else {
      const wordCount = allRecords?.filter(r => r.type === 'word').length || 0;
      const phraseCount = allRecords?.filter(r => r.type === 'phrase').length || 0;
      const totalCount = allRecords?.length || 0;

      console.log(`📈 Всего записей в базе: ${totalCount}`);
      console.log(`   - Слов и глаголов: ${wordCount}`);
      console.log(`   - Фраз: ${phraseCount}`);
    }

    console.log('\n🎉 База данных успешно настроена и заполнена!');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

// Запускаем настройку
setupDatabase();
