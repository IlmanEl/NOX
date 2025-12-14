import fs from 'fs';
import { randomUUID } from 'crypto';

interface Entry {
  ru: string;
  ce: string;
}

interface FinalEntry {
  id: string;
  ru: string;
  ce: string;
  category: string;
  needs_review?: boolean;
}

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

function isGrammarRule(ru: string, ce: string): boolean {
  // Фильтруем записи, которые объясняют правила грамматики
  const rulePatterns = [
    /^[а-я]{1,3}\s*—\s*[а-я]/i, // "г1 — г1ант ду стул"
    /\(это звук/i,
    /\(соответствует/i,
    /класс/i,
    /звук произносится/i,
  ];

  return rulePatterns.some(pattern => pattern.test(ru) || pattern.test(ce));
}

function manualFix(inputPath: string, outputPath: string): void {
  console.log('🔧 РУЧНОЕ ИСПРАВЛЕНИЕ ДАННЫХ\n');

  const rawData: Entry[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`📊 Всего записей: ${rawData.length}\n`);

  let fixed = 0;
  let duplicatesRemoved = 0;
  let rulesRemoved = 0;
  let ocrFixed = 0;

  const finalData: FinalEntry[] = [];
  const seenPairs = new Set<string>();
  const ceToRuMap = new Map<string, string[]>(); // Для поиска дубликатов

  for (const entry of rawData) {
    let { ru, ce } = entry;

    // Пропускаем пустые
    if (!ru || !ce) continue;

    ru = ru.trim();
    ce = ce.trim();

    // 1. Удаляем грамматические правила
    if (isGrammarRule(ru, ce)) {
      rulesRemoved++;
      continue;
    }

    // 2. Исправляем известные OCR ошибки
    const originalCe = ce;

    // OCR ошибки - символы ":" часто ошибочно появляются
    // Но мы не можем их просто удалить без знания языка

    // Исправляем известные паттерны
    // (уже исправили вручную: меттиг йой, Вай1)

    if (originalCe !== ce) {
      fixed++;
    }

    // 3. Проверяем дубликаты (ru + ce)
    const pairKey = `${ru}|||${ce}`;
    if (seenPairs.has(pairKey)) {
      duplicatesRemoved++;
      continue;
    }
    seenPairs.add(pairKey);

    // 4. Отслеживаем одинаковые переводы для разных фраз
    if (!ceToRuMap.has(ce)) {
      ceToRuMap.set(ce, []);
    }
    ceToRuMap.get(ce)!.push(ru);

    // Создаем финальную запись
    const finalEntry: FinalEntry = {
      id: randomUUID(),
      ru,
      ce,
      category: categorizePhrase(ru),
    };

    finalData.push(finalEntry);
  }

  // 5. Находим и помечаем подозрительные переводы (одинаковый перевод для разных фраз)
  console.log('\n⚠️  НАЙДЕНЫ ПОДОЗРИТЕЛЬНЫЕ ПЕРЕВОДЫ (одинаковый перевод для разных фраз):\n');
  let suspiciousCount = 0;

  for (const [ce, ruList] of ceToRuMap.entries()) {
    if (ruList.length > 1) {
      // Проверяем, что русские фразы действительно разные (не просто разная пунктуация)
      const uniqueRu = new Set(ruList.map(r => r.toLowerCase().replace(/[!?.,\s]/g, '')));

      if (uniqueRu.size > 1) {
        suspiciousCount++;
        console.log(`[${suspiciousCount}] Чеченский перевод: "${ce}"`);
        console.log(`    Используется для ${ruList.length} разных фраз:`);
        ruList.forEach((r, i) => console.log(`      ${i + 1}. "${r}"`));
        console.log('');

        // Помечаем эти записи для проверки
        for (const entry of finalData) {
          if (entry.ce === ce) {
            entry.needs_review = true;
          }
        }
      }
    }
  }

  // Сохраняем
  fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('📊 СТАТИСТИКА РУЧНОГО ИСПРАВЛЕНИЯ');
  console.log('='.repeat(60));
  console.log(`\n📥 Исходных записей:              ${rawData.length}`);
  console.log(`\n🔧 ИСПРАВЛЕНИЯ:`);
  console.log(`   • Грамматических правил удалено: ${rulesRemoved}`);
  console.log(`   • Дубликатов удалено:            ${duplicatesRemoved}`);
  console.log(`   • OCR ошибок исправлено:         ${ocrFixed}`);
  console.log(`   • Подозрительных переводов:      ${suspiciousCount}`);
  console.log(`\n✅ ФИНАЛЬНЫХ ФРАЗ:                ${finalData.length}`);
  console.log(`⚠️  Требуют проверки:              ${finalData.filter(e => e.needs_review).length}`);
  console.log('\n' + '='.repeat(60));

  console.log(`\n✨ Готово! Файл сохранен в ${outputPath}`);
}

const INPUT_FILE = './clean_database.json';
const OUTPUT_FILE = './manual_fixed_seed.json';

manualFix(INPUT_FILE, OUTPUT_FILE);
