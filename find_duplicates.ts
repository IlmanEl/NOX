import { readFileSync } from 'fs';

interface Entry {
  ce: string;
  ru: string;
  type: string;
  category: string;
}

const data: Entry[] = JSON.parse(readFileSync('./master_seed.json', 'utf-8'));

console.log('🔍 Поиск дубликатов в master_seed.json...\n');

// Находим дубликаты
const seen = new Map<string, number[]>();

data.forEach((entry, index) => {
  if (!seen.has(entry.ce)) {
    seen.set(entry.ce, []);
  }
  seen.get(entry.ce)!.push(index);
});

// Фильтруем только дубликаты
const duplicates = Array.from(seen.entries())
  .filter(([_, indices]) => indices.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

if (duplicates.length === 0) {
  console.log('✅ Дубликатов не найдено!');
} else {
  console.log(`❌ Найдено дубликатов: ${duplicates.length}\n`);

  duplicates.forEach(([ce, indices]) => {
    console.log(`📌 "${ce}" встречается ${indices.length} раз(а):`);
    indices.forEach(idx => {
      const entry = data[idx];
      console.log(`   Строка ${idx + 1}: ce="${entry.ce}", ru="${entry.ru}", type="${entry.type}", category="${entry.category}"`);
    });
    console.log();
  });

  console.log(`\n💡 Решение: Удалите дубликаты из master_seed.json и запустите npm run setup снова`);
}

console.log(`\n📊 Всего записей: ${data.length}`);
console.log(`📊 Уникальных записей: ${seen.size}`);
console.log(`📊 Дубликатов: ${data.length - seen.size}`);
