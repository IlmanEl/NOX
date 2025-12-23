/**
 * Phrasebook Categories Configuration
 *
 * Organized by real-life situations
 */

import type { PhrasebookCategory } from '../types/phrasebook.types'

export const phrasebookCategories: PhrasebookCategory[] = [
  {
    id: 'greetings',
    title: 'Приветствия и знакомство',
    description: 'Как поздороваться, представиться и познакомиться',
    icon: '👋',
    gradient: 'from-blue-400 via-blue-500 to-indigo-600',
    dbCategories: ['greeting', 'greetings', 'greetings_questions', 'greetings_response', 'acquaintance', 'meeting', 'farewells', 'parting']
  },
  {
    id: 'politeness',
    title: 'Вежливость',
    description: 'Спасибо, извинения, просьбы и комплименты',
    icon: '🙏',
    gradient: 'from-purple-400 via-purple-500 to-pink-600',
    dbCategories: ['politeness', 'gratitude', 'apology', 'requests', 'compliment', 'agreement', 'wishes']
  },
  {
    id: 'family',
    title: 'Семья и дом',
    description: 'Разговоры о семье, доме и быте',
    icon: '🏠',
    gradient: 'from-pink-400 via-rose-400 to-red-500',
    dbCategories: ['family', 'house', 'hospitality', 'customs']
  },
  {
    id: 'daily',
    title: 'Повседневная жизнь',
    description: 'Распорядок дня, время, погода',
    icon: '☀️',
    gradient: 'from-amber-300 via-yellow-400 to-orange-500',
    dbCategories: ['daily_routine', 'time', 'weather', 'calendar']
  },
  {
    id: 'questions',
    title: 'Вопросы',
    description: 'Как задавать вопросы и отвечать на них',
    icon: '❓',
    gradient: 'from-cyan-400 via-sky-500 to-blue-600',
    dbCategories: ['questions', 'question', 'question_words', 'question_examples', 'answer_examples']
  },
  {
    id: 'travel',
    title: 'Путешествия и транспорт',
    description: 'В дороге, отель, направления',
    icon: '✈️',
    gradient: 'from-indigo-400 via-purple-500 to-violet-600',
    dbCategories: ['travel', 'transport', 'car', 'hotel', 'location', 'city', 'address']
  },
  {
    id: 'food',
    title: 'Еда и рестораны',
    description: 'Заказ еды, в ресторане, на кухне',
    icon: '🍽️',
    gradient: 'from-red-400 via-rose-500 to-pink-600',
    dbCategories: ['food']
  },
  {
    id: 'shopping',
    title: 'Покупки и услуги',
    description: 'Магазины, банк, почта, парикмахерская',
    icon: '🛍️',
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
    dbCategories: ['shopping', 'bank', 'post', 'barber', 'services']
  },
  {
    id: 'health',
    title: 'Здоровье и экстренные ситуации',
    description: 'В больнице, аптеке, полиции',
    icon: '🏥',
    gradient: 'from-red-500 via-red-600 to-orange-600',
    dbCategories: ['health', 'emergency', 'police', 'warning']
  },
  {
    id: 'emotions',
    title: 'Эмоции и чувства',
    description: 'Выражение эмоций, настроения, состояния',
    icon: '😊',
    gradient: 'from-yellow-300 via-amber-400 to-orange-500',
    dbCategories: ['emotions', 'feelings', 'state']
  },
  {
    id: 'work',
    title: 'Работа и образование',
    description: 'На работе, в школе, документы',
    icon: '💼',
    gradient: 'from-slate-400 via-gray-500 to-zinc-600',
    dbCategories: ['work', 'education', 'docs']
  },
  {
    id: 'events',
    title: 'Особые события',
    description: 'Свадьба, похороны, религиозные события',
    icon: '🕊️',
    gradient: 'from-slate-300 via-gray-400 to-slate-500',
    dbCategories: ['religious', 'condolences']
  },
  {
    id: 'common',
    title: 'Общие фразы',
    description: 'Часто используемые выражения',
    icon: '💬',
    gradient: 'from-gray-400 via-slate-500 to-gray-600',
    dbCategories: ['common', 'common_phrases', 'expressions', 'conversation', 'communication']
  },
  {
    id: 'proverbs',
    title: 'Пословицы',
    description: 'Чеченская мудрость и пословицы',
    icon: '📜',
    gradient: 'from-teal-400 via-cyan-500 to-blue-600',
    dbCategories: ['proverbs', 'proverb']
  }
]
