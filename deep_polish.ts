import fs from 'fs';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

interface RawEntry {
  ru: string;
  ce: string;
}

interface AIFixedEntry {
  ru: string;
  ce: string;
  is_rule?: boolean;
  confidence?: string;
}

interface FinalEntry {
  id: string;
  ru: string;
  ce: string;
  category: string;
  is_rule?: boolean;
  needs_review?: boolean;
  original_ce?: string; // Исходный текст для корректного resume
}

interface FailedBatch {
  batchIndex: number;
  batch: RawEntry[];
  error: string;
  timestamp: string;
}

interface Statistics {
  total: number;
  already_processed: number;
  to_process: number;
  fixed: number;
  rules_detected: number;
  low_confidence: number;
  errors: number;
  final_count: number;
}

// Системный промпт для AI
const SYSTEM_PROMPT = `You are a strict Chief Editor of the Chechen language (Noxchiyn Mott).
Your ONLY goal is to fix spelling and grammar errors in OCR text.

CRITICAL RULES:
1. SPELLING IS PARAMOUNT. Every word must be spelled exactly as in the dictionary.
2. Fix "Palochka": The symbol '1' must be used for specific sounds (к1, п1, г1, х1, ц1, ч1, т1, 1а). Replace 'I', 'l', '!', '|' with '1' where appropriate.
3. Fix Grammar/Classes:
   - Check noun classes (ву/ю/бу/ду).
   - Example ERROR: "меттиг йой" (WRONG).
   - Example FIX: "меттиг юй" (CORRECT, because 'меттиг' is class 'ю').
4. INTELLIGENT REPAIR (Contextual Fix):
   - Do NOT just remove symbols from nonsense words.
   - Example: If you see "цло:р" or "Муьхьац", look at the Russian text ("с какого часа").
   - FIX: Replace the nonsense with the correct Chechen translation based on the Russian meaning.
   - Common fixes:
     * "Вай1" -> "Вайн" (Наш)
     * "Са\\"" -> "Сан" (Мой)
     * "цло:р" -> look at context and fix properly
5. Filter Rules: If a text looks like a grammar rule description instead of a conversational phrase, set "is_rule": true.
6. Confidence: If you're not 100% sure about a fix, set "confidence": "low".

INPUT: Array of {ru: string, ce: string} objects.
OUTPUT: JSON object with "phrases" array containing the same objects with fixed "ce" field, optional "is_rule" and "confidence" fields.

Return ONLY valid JSON. No markdown, no explanation.`;

// Категоризация
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  greeting: ['привет', 'здравствуй', 'добрый день', 'доброе утро', 'добрый вечер', 'спокойной ночи', 'до свидания', 'пока'],
  family: ['семья', 'мать', 'отец', 'брат', 'сестра', 'сын', 'дочь', 'жена', 'муж', 'родственник', 'бабушка', 'дедушка'],
  medicine: ['аптека', 'больница', 'врач', 'болезнь', 'лекарство', 'температура', 'боль', 'очки', 'близорукость', 'дальнозоркость'],
  food: ['еда', 'пища', 'хлеб', 'мясо', 'молоко', 'вода', 'чай', 'кофе', 'ресторан', 'кафе', 'завтрак', 'обед', 'ужин'],
  travel: ['дорога', 'путь', 'ехать', 'идти', 'приехал', 'уехал', 'автобус', 'машина', 'поезд', 'самолет', 'гостиница'],
  time: ['час', 'минута', 'день', 'неделя', 'месяц', 'год', 'сегодня', 'завтра', 'вчера', 'утро', 'вечер', 'ночь'],
  location: ['где', 'куда', 'откуда', 'здесь', 'там', 'дом', 'город', 'село', 'улица', 'площадь'],
  work: ['работа', 'работать', 'профессия', 'учитель', 'врач', 'инженер', 'офис', 'завод'],
  shopping: ['магазин', 'покупка', 'купить', 'продать', 'цена', 'дорого', 'дешево', 'деньги'],
  numbers: ['один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять'],
  questions: ['что', 'кто', 'где', 'когда', 'почему', 'как', 'сколько', 'какой'],
};

function categorizePhrase(ru: string): string {
  const lowerRu = ru.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerRu.includes(keyword))) {
      return category;
    }
  }
  return 'general';
}

// ============================================================================
// RESUME CAPABILITY: Загрузка уже обработанных данных
// ============================================================================
function loadProcessedData(outputPath: string): Map<string, FinalEntry> {
  const processedMap = new Map<string, FinalEntry>();

  if (!fs.existsSync(outputPath)) {
    console.log('📝 Файл результатов не найден. Начинаю с нуля.');
    return processedMap;
  }

  try {
    const content = fs.readFileSync(outputPath, 'utf-8').trim();
    if (!content || content === '[]') {
      console.log('📝 Файл результатов пуст. Начинаю с нуля.');
      return processedMap;
    }

    const existingData: FinalEntry[] = JSON.parse(content);
    console.log(`✅ Найдено ${existingData.length} уже обработанных фраз.`);

    // Создаем карту по ИСХОДНЫМ текстам для корректного resume
    for (const entry of existingData) {
      // Используем original_ce если есть, иначе ce (для обратной совместимости)
      const originalCe = entry.original_ce || entry.ce;
      const key = `${entry.ru}|||${originalCe}`;
      processedMap.set(key, entry);
    }

    return processedMap;
  } catch (error) {
    console.error('⚠️  Ошибка чтения файла результатов. Начинаю с нуля.');
    return processedMap;
  }
}

// ============================================================================
// INCREMENTAL SAVING: Сохранение после каждого батча
// ============================================================================
function appendToOutput(outputPath: string, newEntries: FinalEntry[]): void {
  if (newEntries.length === 0) return;

  let existingData: FinalEntry[] = [];

  // Читаем существующие данные
  if (fs.existsSync(outputPath)) {
    try {
      const content = fs.readFileSync(outputPath, 'utf-8').trim();
      if (content && content !== '[]') {
        existingData = JSON.parse(content);
      }
    } catch (error) {
      console.error('⚠️  Ошибка чтения файла при сохранении. Перезаписываю.');
      existingData = [];
    }
  }

  // Добавляем новые данные
  existingData.push(...newEntries);

  // Сохраняем
  fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2), 'utf-8');
}

// ============================================================================
// FAULT TOLERANCE: Логирование ошибок
// ============================================================================
function logFailedBatch(failedPath: string, batchIndex: number, batch: RawEntry[], error: any): void {
  let failedBatches: FailedBatch[] = [];

  if (fs.existsSync(failedPath)) {
    try {
      failedBatches = JSON.parse(fs.readFileSync(failedPath, 'utf-8'));
    } catch (e) {
      failedBatches = [];
    }
  }

  failedBatches.push({
    batchIndex,
    batch,
    error: error?.message || String(error),
    timestamp: new Date().toISOString(),
  });

  fs.writeFileSync(failedPath, JSON.stringify(failedBatches, null, 2), 'utf-8');
}

// ============================================================================
// AI PROCESSING: Обработка одного батча
// ============================================================================
async function fixBatchWithAI(
  client: OpenAI,
  batch: RawEntry[],
  batchIndex: number,
  outputPath: string,
  failedPath: string,
  stats: Statistics
): Promise<void> {
  try {
    console.log(`  📦 Батч ${batchIndex}: обработка ${batch.length} фраз...`);

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify(batch),
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from AI');
    }

    const parsed = JSON.parse(content);
    const fixedBatch: AIFixedEntry[] = parsed.phrases || [];

    // Обработка результатов
    const finalEntries: FinalEntry[] = [];
    const seenPairs = new Set<string>();

    for (let i = 0; i < batch.length; i++) {
      const original = batch[i];
      const fixed = fixedBatch[i] || original;

      // Валидация
      if (!fixed.ru || !fixed.ce || typeof fixed.ru !== 'string' || typeof fixed.ce !== 'string') {
        stats.errors++;
        continue;
      }

      // Подсчет исправлений
      if (original.ce !== fixed.ce) {
        stats.fixed++;
      }

      // Фильтруем правила грамматики
      if (fixed.is_rule) {
        stats.rules_detected++;
        continue;
      }

      // Фильтруем дубликаты
      const pairKey = `${fixed.ru}|||${fixed.ce}`;
      if (seenPairs.has(pairKey)) {
        continue;
      }
      seenPairs.add(pairKey);

      // Учитываем низкую уверенность
      if (fixed.confidence === 'low') {
        stats.low_confidence++;
      }

      // Создаем финальную запись
      const entry: FinalEntry = {
        id: randomUUID(),
        ru: fixed.ru.trim(),
        ce: fixed.ce.trim(),
        category: categorizePhrase(fixed.ru),
        original_ce: original.ce.trim(), // Сохраняем исходный текст для resume
      };

      if (fixed.confidence === 'low') {
        entry.needs_review = true;
      }

      finalEntries.push(entry);
    }

    // INCREMENTAL SAVING: Сохраняем сразу после обработки батча
    appendToOutput(outputPath, finalEntries);
    stats.final_count += finalEntries.length;

    console.log(`  ✅ Батч ${batchIndex}: обработано ${finalEntries.length} фраз, сохранено в файл`);
  } catch (error) {
    // FAULT TOLERANCE: Не падаем, а логируем ошибку
    console.error(`  ❌ Батч ${batchIndex}: ОШИБКА - ${error}`);
    logFailedBatch(failedPath, batchIndex, batch, error);
    stats.errors += batch.length;
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================
async function deepPolish(
  inputPath: string,
  outputPath: string,
  failedPath: string,
  concurrency: number = 5
): Promise<Statistics> {
  console.log('🚀 ГЛУБОКАЯ ОЧИСТКА С RESUME CAPABILITY\n');

  // 1. RESUME: Загружаем уже обработанные данные
  console.log('📖 Проверяю уже обработанные данные...');
  const processedMap = loadProcessedData(outputPath);

  // 2. Читаем исходные данные
  console.log('📖 Читаю исходный файл...');
  const rawData: RawEntry[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  // 3. RESUME: Фильтруем уже обработанные фразы
  const toProcess: RawEntry[] = [];
  for (const entry of rawData) {
    const key = `${entry.ru}|||${entry.ce}`;
    if (!processedMap.has(key)) {
      toProcess.push(entry);
    }
  }

  const stats: Statistics = {
    total: rawData.length,
    already_processed: processedMap.size,
    to_process: toProcess.length,
    fixed: 0,
    rules_detected: 0,
    low_confidence: 0,
    errors: 0,
    final_count: processedMap.size, // Начинаем с уже обработанных
  };

  console.log(`📊 Всего записей: ${stats.total}`);
  console.log(`✅ Уже обработано: ${stats.already_processed}`);
  console.log(`🔄 К обработке: ${stats.to_process}\n`);

  if (stats.to_process === 0) {
    console.log('🎉 Все фразы уже обработаны! Нечего делать.');
    return stats;
  }

  // Проверка API ключа
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('❌ OPENAI_API_KEY не найден в .env файле');
  }

  const client = new OpenAI({ apiKey });

  // Параметры батчинга
  const BATCH_SIZE = 50;
  const batches: RawEntry[][] = [];

  // Разбиваем на батчи
  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    batches.push(toProcess.slice(i, i + BATCH_SIZE));
  }

  console.log(`🤖 Запускаю AI обработку:`);
  console.log(`   • Батчей: ${batches.length} по ${BATCH_SIZE} фраз`);
  console.log(`   • Параллельность: ${concurrency} одновременно\n`);

  // ============================================================================
  // CONCURRENCY: Параллельная обработка батчей с p-limit
  // ============================================================================
  const limit = pLimit(concurrency);

  const tasks = batches.map((batch, index) =>
    limit(() => fixBatchWithAI(client, batch, index + 1, outputPath, failedPath, stats))
  );

  await Promise.all(tasks);

  console.log('\n✅ Все батчи обработаны!\n');

  return stats;
}

function printStatistics(stats: Statistics): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 СТАТИСТИКА ГЛУБОКОЙ ОЧИСТКИ');
  console.log('='.repeat(60));
  console.log(`\n📥 Исходных записей:              ${stats.total}`);
  console.log(`✅ Уже обработано (resume):        ${stats.already_processed}`);
  console.log(`🔄 Обработано в этой сессии:       ${stats.to_process}`);
  console.log(`\n✨ AI ИСПРАВЛЕНИЙ:`);
  console.log(`   • Фраз исправлено:              ${stats.fixed}`);
  console.log(`   • Грамматических правил удалено: ${stats.rules_detected}`);
  console.log(`   • Низкая уверенность (review):  ${stats.low_confidence}`);
  console.log(`   • Ошибок обработки:             ${stats.errors}`);
  console.log(`\n✅ ФИНАЛЬНЫХ ФРАЗ:                ${stats.final_count}`);
  if (stats.to_process > 0) {
    console.log(`\n📈 Процент исправлений:           ${((stats.fixed / stats.to_process) * 100).toFixed(1)}%`);
  }
  console.log('\n' + '='.repeat(60));
}

// ============================================================================
// ЗАПУСК СКРИПТА
// ============================================================================
const INPUT_FILE = './clean_database.json';
const OUTPUT_FILE = './perfect_seed.json';
const FAILED_FILE = './failed_batches.json';
const CONCURRENCY = 8; // 5-10 параллельных запросов (можно регулировать)

(async () => {
  try {
    const stats = await deepPolish(INPUT_FILE, OUTPUT_FILE, FAILED_FILE, CONCURRENCY);
    printStatistics(stats);

    console.log('\n✨ Готово! Файл сохранен в perfect_seed.json');

    // Показываем примеры категорий
    if (fs.existsSync(OUTPUT_FILE)) {
      const outputData: FinalEntry[] = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      const categoryCounts = outputData.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('\n📑 Распределение по категориям:');
      Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          console.log(`   ${category}: ${count}`);
        });

      // Показываем фразы требующие проверки
      const needsReview = outputData.filter(e => e.needs_review);
      if (needsReview.length > 0) {
        console.log(`\n⚠️  Фраз требующих ручной проверки: ${needsReview.length}`);
        console.log('\nПримеры (низкая уверенность AI):');
        needsReview.slice(0, 5).forEach(entry => {
          console.log(`   RU: ${entry.ru}`);
          console.log(`   CE: ${entry.ce}`);
          console.log('');
        });
      }
    }

    // Показываем информацию об ошибках
    if (fs.existsSync(FAILED_FILE)) {
      const failedBatches: FailedBatch[] = JSON.parse(fs.readFileSync(FAILED_FILE, 'utf-8'));
      if (failedBatches.length > 0) {
        console.log(`\n⚠️  Ошибочных батчей: ${failedBatches.length}`);
        console.log('   Они сохранены в failed_batches.json для ручной обработки.\n');
      }
    }

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
})();
