# Chechen Language App - Content Preparation

Подготовка контента для приложения изучения чеченского языка.

## Статус проекта

**MVP - Упрощенная архитектура**

Этап: Подготовка и загрузка словарной базы в Supabase.

## Структура данных

### База данных Supabase

**Таблица `dictionary`:**
- `id` (UUID) - уникальный идентификатор
- `ce` (TEXT) - чеченский текст
- `ru` (TEXT) - русский перевод
- `type` (TEXT) - тип: 'word' или 'phrase'
- `category` (TEXT) - категория/тег
- `is_verified` (BOOLEAN) - статус проверки


## Быстрый старт

### 1. Настройка .env

```bash
SUPABASE_URL=https://sxwikzepzdcjapbrgymw.supabase.co
SUPABASE_ANON_KEY=ваш_ключ_здесь
```

Получите `SUPABASE_ANON_KEY`:
- Dashboard: https://supabase.com/dashboard
- Settings → API → "anon public" key

### 2. Создание таблицы

Выполните SQL из файла `database_setup.sql` в Supabase SQL Editor.

### 3. Загрузка данных

```bash
npm run setup
```

## Скрипты

- `npm run setup` - Синхронизация данных (обновляет существующие + добавляет новые)
- `npm run setup:clean` - Полная очистка БД и загрузка заново (используйте осторожно!)

## Файлы

- `setup_simple_db.ts` - Скрипт настройки и загрузки
- `database_setup.sql` - SQL для создания таблицы
- `SETUP_INSTRUCTIONS.md` - Подробная инструкция
- `master_seed.json` - Исходные данные

## Следующие шаги

1. ✅ Очистка старых скриптов
2. ✅ Создание упрощенной структуры БД
3. ⏳ Добавление ANON_KEY в .env
4. ⏳ Создание таблицы в Supabase
5. ⏳ Загрузка данных через `npm run setup`
