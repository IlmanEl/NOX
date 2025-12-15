import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkDatabase() {
  console.log('🔍 Проверка базы данных Supabase...\n');

  // Получаем все записи
  const { data: allRecords, error: allError } = await supabase
    .from('dictionary')
    .select('*')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Ошибка:', allError);
    return;
  }

  console.log(`📊 Всего записей в базе: ${allRecords?.length || 0}\n`);

  // Проверяем новые категории (house, kitchen)
  const houseRecords = allRecords?.filter(r => r.category === 'house') || [];
  const kitchenRecords = allRecords?.filter(r => r.category === 'kitchen') || [];

  console.log('🏠 Категория "house":');
  console.log(`   Найдено записей: ${houseRecords.length}`);
  if (houseRecords.length > 0) {
    console.log('   Примеры:');
    houseRecords.slice(0, 5).forEach(r => {
      console.log(`   - ${r.ce} → ${r.ru} (${r.type})`);
    });
  }
  console.log();

  console.log('🍴 Категория "kitchen":');
  console.log(`   Найдено записей: ${kitchenRecords.length}`);
  if (kitchenRecords.length > 0) {
    console.log('   Примеры:');
    kitchenRecords.slice(0, 5).forEach(r => {
      console.log(`   - ${r.ce} → ${r.ru} (${r.type})`);
    });
  }
  console.log();

  // Показываем последние 10 записей
  console.log('📝 Последние 10 записей (по дате создания):');
  allRecords?.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. ${r.ce} → ${r.ru} (${r.type}, ${r.category})`);
  });

  // Статистика по категориям
  const categories = allRecords?.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  console.log('\n📈 Статистика по категориям:');
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
}

checkDatabase();
