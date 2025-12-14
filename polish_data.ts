import fs from 'fs';
import { randomUUID } from 'crypto';

interface RawEntry {
  ru: string;
  ce: string;
}

interface CleanEntry {
  id: string;
  ru: string;
  ce: string;
  category: string;
  needs_review?: boolean;
}

interface Statistics {
  total: number;
  duplicates: number;
  grammar_rules: number;
  too_long: number;
  russian_chars: number;
  cleaned: number;
  fixed_ocr: number;
}

// Категории на основе ключевых слов
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

function containsRussianChars(text: string): boolean {
  // Проверка на русские буквы, которых не должно быть в чеченском
  // Исключаем некоторые общие заимствования
  const excludedWords = ['аптека', 'автобус', 'телефон', 'компьютер', 'фото', 'факс', 'фильм', 'футбол'];

  // Если это одно из исключенных слов, не считаем ошибкой
  const lowerText = text.toLowerCase();
  if (excludedWords.some(word => lowerText.includes(word))) {
    return false;
  }

  // Проверяем на недопустимые буквы
  return /[ыэщ]/.test(text) || (/ф/.test(text) && !excludedWords.some(word => lowerText.includes(word)));
}

function fixOCRErrors(text: string): { fixed: string; hasChanges: boolean; needsReview: boolean } {
  let fixed = text;
  let hasChanges = false;
  let needsReview = false;

  // Замена Вай1 на Вайн (ошибка OCR в слове "Наш")
  if (fixed.includes('Вай1')) {
    fixed = fixed.replace(/Вай1/g, 'Вайн');
    hasChanges = true;
  }

  // Замена Аса на Ас в начале фразы (стандартизация местоимения "Я" в эргативе)
  if (fixed.startsWith('Аса ')) {
    fixed = fixed.replace(/^Аса /, 'Ас ');
    hasChanges = true;
  }

  // Исправление цло:р (ошибка OCR)
  if (fixed.includes('цло:р')) {
    // Вероятно должно быть "маьлха" (день) или другое слово
    // Помечаем для ручной проверки
    needsReview = true;
  }

  // Замена заглавной I на 1
  if (/[^\w]I[^\w]|^I[^\w]|[^\w]I$/.test(fixed)) {
    fixed = fixed.replace(/([^\w])I([^\w])/g, '$11$2');
    fixed = fixed.replace(/^I([^\w])/, '1$1');
    fixed = fixed.replace(/([^\w])I$/, '$11');
    hasChanges = true;
  }

  // Замена l на 1 в контексте чеченских букв (к1, п1, т1, х1, ц1, ч1)
  if (/(к|п|т|х|ц|ч)l/i.test(fixed)) {
    fixed = fixed.replace(/(к|п|т|х|ц|ч)l/gi, '$11');
    hasChanges = true;
  }

  // Замена кавычек в конце слов на н
  if (/"(?=\s|$|,|\.|\!|\?)/g.test(fixed)) {
    fixed = fixed.replace(/"(?=\s|$|,|\.|\!|\?)/g, 'н');
    hasChanges = true;
  }

  return { fixed, hasChanges, needsReview };
}

function cleanDatabase(inputPath: string, outputPath: string): Statistics {
  console.log('📖 Читаю исходный файл...');
  const rawData: RawEntry[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  const stats: Statistics = {
    total: rawData.length,
    duplicates: 0,
    grammar_rules: 0,
    too_long: 0,
    russian_chars: 0,
    cleaned: 0,
    fixed_ocr: 0,
  };

  console.log(`📊 Всего записей: ${stats.total}`);
  console.log('\n🧹 Начинаю очистку...\n');

  const cleanedData: CleanEntry[] = [];
  const seenPairs = new Set<string>();

  for (const entry of rawData) {
    // 1. Удаление дубликатов (если ru и ce одинаковы - это грамматические правила)
    if (entry.ru.trim() === entry.ce.trim()) {
      stats.grammar_rules++;
      continue;
    }

    // 2. Удаление слишком длинных фраз (объяснения грамматики)
    if (entry.ce.length > 100) {
      stats.too_long++;
      continue;
    }

    // 3. Проверка на русские буквы в чеченском тексте
    if (containsRussianChars(entry.ce)) {
      stats.russian_chars++;
      continue;
    }

    // 4. Исправление ошибок OCR
    const { fixed: fixedCe, hasChanges, needsReview } = fixOCRErrors(entry.ce);
    if (hasChanges) {
      stats.fixed_ocr++;
    }

    // 5. Проверка на дубликаты фраз
    const pairKey = `${entry.ru}|||${fixedCe}`;
    if (seenPairs.has(pairKey)) {
      stats.duplicates++;
      continue;
    }
    seenPairs.add(pairKey);

    // 6. Создание чистой записи
    const cleanEntry: CleanEntry = {
      id: randomUUID(),
      ru: entry.ru.trim(),
      ce: fixedCe.trim(),
      category: categorizePhrase(entry.ru),
    };

    if (needsReview) {
      cleanEntry.needs_review = true;
    }

    cleanedData.push(cleanEntry);
  }

  stats.cleaned = cleanedData.length;

  console.log('💾 Сохраняю очищенные данные...');
  fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), 'utf-8');

  return stats;
}

function printStatistics(stats: Statistics): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 СТАТИСТИКА ОЧИСТКИ');
  console.log('='.repeat(60));
  console.log(`\n📥 Исходных записей:              ${stats.total}`);
  console.log(`\n🗑️  УДАЛЕНО:`);
  console.log(`   • Грамматические правила:       ${stats.grammar_rules}`);
  console.log(`   • Слишком длинные (>100 символов): ${stats.too_long}`);
  console.log(`   • С русскими буквами:           ${stats.russian_chars}`);
  console.log(`   • Дубликаты:                    ${stats.duplicates}`);
  console.log(`   ────────────────────────────────────`);
  console.log(`   ИТОГО удалено:                  ${stats.grammar_rules + stats.too_long + stats.russian_chars + stats.duplicates}`);
  console.log(`\n🔧 Исправлено OCR ошибок:        ${stats.fixed_ocr}`);
  console.log(`\n✅ ЧИСТЫХ ФРАЗ:                   ${stats.cleaned}`);
  console.log(`\n📈 Процент сохранения:            ${((stats.cleaned / stats.total) * 100).toFixed(1)}%`);
  console.log('\n' + '='.repeat(60));
}

// Запуск скрипта
const INPUT_FILE = './clean_database.json';
const OUTPUT_FILE = './final_seed.json';

try {
  const stats = cleanDatabase(INPUT_FILE, OUTPUT_FILE);
  printStatistics(stats);

  console.log('\n✨ Готово! Файл сохранен в final_seed.json');

  // Показываем примеры категорий
  const outputData: CleanEntry[] = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
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
    console.log('\nПримеры:');
    needsReview.slice(0, 5).forEach(entry => {
      console.log(`   RU: ${entry.ru}`);
      console.log(`   CE: ${entry.ce}`);
      console.log('');
    });
  }

} catch (error) {
  console.error('❌ Ошибка:', error);
  process.exit(1);
}
