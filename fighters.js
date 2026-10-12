// Ростер бойцов и функции отрисовки фигур и оружия в бумажном стиле

// Старые браузеры Android могут не поддерживать Canvas.roundRect.
// Как и roundRect, эта функция добавляет контур в текущий путь.
function roundRectPath(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const FIGHTER_CLASSES = [
  {
    id: 'swordsman',
    num: 1,
    name: 'Мечник',
    shape: 'circle',
    baseColor: '#4692e8',
    hp: 100,
    speed: 3,
    damage: 10,
    cardSub: '10 урона',
    desc: '🗡️ Крутящийся меч • 10 ед. урона'
  },
  {
    id: 'archer',
    num: 2,
    name: 'Лучник',
    shape: 'triangle',
    baseColor: '#4692e8',
    hp: 85,
    speed: 3,
    damage: 12,
    cardSub: '2-3 с',
    desc: '🏹 Прицельный лук • перезарядка 2.5 с'
  },
  {
    id: 'shield',
    num: 3,
    name: 'Щитоносец',
    shape: 'square',
    baseColor: '#4692e8',
    hp: 140,
    speed: 2.5,
    damage: 5,
    cardSub: '5 урона',
    desc: '🛡️ Удар щитом (5 ур.) по голой стороне'
  },
  {
    id: 'gunslinger',
    num: 4,
    name: 'Стрелок',
    shape: 'circle',
    baseColor: '#4692e8',
    hp: 90,
    speed: 3,
    damage: 15,
    cardSub: '5 с',
    desc: '🔫 Пробивной залп из пистолетов (5 с)'
  },
  {
    id: 'pyro',
    num: 5,
    name: 'Пиромант',
    shape: 'triangle',
    baseColor: '#ef5b50',
    hp: 90,
    speed: 3,
    damage: 8,
    cardSub: 'огонь',
    desc: '🔥 Огненный шар и поджог врагов'
  },
  {
    id: 'cryo',
    num: 6,
    name: 'Криомант',
    shape: 'circle',
    baseColor: '#73bcf7',
    hp: 95,
    speed: 3,
    damage: 8,
    cardSub: 'холод',
    desc: '❄️ Заморозка: −50% скорости врагам'
  },
  {
    id: 'thunder',
    num: 7,
    name: 'Громовержец',
    shape: 'circle',
    baseColor: '#ef5b50',
    hp: 90,
    speed: 3.5,
    damage: 11,
    cardSub: 'молния',
    desc: '⚡ Цепная молния по 3 соперникам'
  },
  {
    id: 'alchemist',
    num: 8,
    name: 'Алхимик',
    shape: 'hexagon',
    baseColor: '#86d96a',
    hp: 100,
    speed: 2.8,
    damage: 6,
    cardSub: 'кислота',
    desc: '🧪 Кислотная лужа (урон + уязвимость)'
  },
  {
    id: 'spearman',
    num: 9,
    name: 'Копейщик',
    shape: 'square',
    baseColor: '#ef5b50',
    hp: 110,
    speed: 3.2,
    damage: 12,
    cardSub: 'выпад',
    desc: '🔱 Длинное копьё • урон от разгона'
  },
  {
    id: 'berserker',
    num: 10,
    name: 'Берсерк',
    shape: 'hexagon',
    baseColor: '#ef5b50',
    hp: 120,
    speed: 3,
    damage: 14,
    cardSub: 'ярость',
    desc: '🪓 Вращающийся топор • ярость при ранении'
  },
  {
    id: 'boomerang',
    num: 11,
    name: 'Бумеранг',
    shape: 'triangle',
    baseColor: '#4692e8',
    hp: 90,
    speed: 3.5,
    damage: 9,
    cardSub: 'возврат',
    desc: '🪃 Серп-бумеранг бьёт туда и обратно'
  },
  {
    id: 'summoner',
    num: 12,
    name: 'Призыватель',
    shape: 'circle',
    baseColor: '#a56be8',
    hp: 85,
    speed: 2.5,
    damage: 6,
    cardSub: 'миньоны',
    desc: '🟣 Призывает 2 сферы-спутника (6 с)'
  },
  {
    id: 'healer',
    num: 13,
    name: 'Лекарь',
    shape: 'circle',
    baseColor: '#86d96a',
    hp: 100,
    speed: 3,
    damage: 9,
    cardSub: 'лечение 6с',
    desc: '➕ Медленно исцеляет раненых союзников (раз в 6 с)'
  },
  {
    id: 'engineer',
    num: 14,
    name: 'Инженер',
    shape: 'hexagon',
    baseColor: '#ef5b50',
    hp: 105,
    speed: 2.5,
    damage: 7,
    cardSub: 'турель',
    desc: '⚙️ Ставит стреляющую мини-турель'
  },
  {
    id: 'assassin',
    num: 15,
    name: 'Ассасин',
    shape: 'triangle',
    baseColor: '#a56be8',
    hp: 75,
    speed: 4.5,
    damage: 10,
    cardSub: 'рывок ×2',
    desc: '⚔️ Теневой рывок в голую спину (×2 урон)'
  },
  {
    id: 'graviton',
    num: 16,
    name: 'Гравитатор',
    shape: 'circle',
    baseColor: '#a56be8',
    hp: 95,
    speed: 2.8,
    damage: 8,
    cardSub: 'вихрь',
    desc: '🌀 Стягивает врагов в грави-воронку'
  },

  // ==================== 9 НОВЫХ БОЙЦОВ ====================
  {
    id: 'superman',
    num: 17,
    name: 'Супермен',
    shape: 'hexagon',
    baseColor: '#2563eb',
    hp: 270,
    speed: 9.0,
    damage: 24,
    cardSub: 'лазер+рывок ×2',
    desc: '🦸 Усилен ×2! Лазеры (10 с) + каждые 5 с ускорение и ×2 урон на 2 с!'
  },
  {
    id: 'worm',
    num: 18,
    name: 'Червь',
    shape: 'circle',
    baseColor: '#65c454',
    hp: 115,
    speed: 5.2,
    damage: 9,
    cardSub: 'быстрый хвост',
    desc: '🐛 Длинный хвост гусеницы • стремительно носится по рингу'
  },
  {
    id: 'vampire',
    num: 19,
    name: 'Вампир',
    shape: 'circle',
    baseColor: '#7f1d1d',
    hp: 110,
    speed: 3.8,
    damage: 11,
    cardSub: 'клыки+погоня',
    desc: '🧛 2 белых клыка • сам летит за целью и пьёт HP!'
  },
  {
    id: 'soldier',
    num: 20,
    name: 'Солдат',
    shape: 'square',
    baseColor: '#4d7c0f',
    hp: 95,
    speed: 3.2,
    damage: 4,
    cardSub: '1 с пульки',
    desc: '🪖 Пистолет: каждую 1 с стреляет белыми пульками в цель'
  },
  {
    id: 'claws',
    num: 21,
    name: 'Росомаха',
    shape: 'hexagon',
    baseColor: '#eab308',
    hp: 125,
    speed: 4.0,
    damage: 10,
    cardSub: 'когти ×2',
    desc: '🐾 Острые когти: наносит ДВОЙНОЙ урон (×2) при столкновении!'
  },
  {
    id: 'giant',
    num: 22,
    name: 'Титан',
    shape: 'square',
    baseColor: '#d97706',
    hp: 150,
    speed: 2.6,
    damage: 12,
    cardSub: 'рост на 2 с',
    desc: '🗿 Каждые 5 с увеличивается в 2 раза на 2 секунды и таранит!'
  },
  {
    id: 'laser_bot',
    num: 23,
    name: 'Лазертрон',
    shape: 'triangle',
    baseColor: '#06b6d4',
    hp: 90,
    speed: 3.2,
    damage: 16,
    cardSub: 'луч-лазер',
    desc: '⚡ Каждые 3.5 с выжигает врагов сквозным лазерным лучом'
  },
  {
    id: 'teleporter',
    num: 24,
    name: 'Телепортер',
    shape: 'circle',
    baseColor: '#8b5cf6',
    hp: 85,
    speed: 3.6,
    damage: 13,
    cardSub: 'телепорт',
    desc: '✨ Каждые 3 с телепортируется к врагам с взрывной волной'
  },
  {
    id: 'plasma_rex',
    num: 25,
    name: 'Кибер-Коготь',
    shape: 'triangle',
    baseColor: '#ec4899',
    hp: 105,
    speed: 4.2,
    damage: 11,
    cardSub: 'блинк+когти',
    desc: '🔮 Телепорт + рост на 2 с + плазменные когти (×2 урон) и лазер!'
  },

  // ==================== 6 ЕЩЁ НОВЫХ БОЙЦОВ (№26 – №31) ====================
  {
    id: 'ninja',
    num: 26,
    name: 'Ниндзя',
    shape: 'triangle',
    baseColor: '#334155',
    hp: 100,
    speed: 4.0,
    damage: 15,
    cardSub: 'катана+сюрикен',
    desc: '🥷 Сюрикены (5 с, отталкивают) + удар катаной (15 ур.) при столкновении!'
  },
  {
    id: 'robo_mech',
    num: 27,
    name: 'Робо-Мех',
    shape: 'hexagon',
    baseColor: '#64748b',
    hp: 220,
    speed: 2.4,
    damage: 14,
    cardSub: '20% блок урона',
    desc: '🤖 Огромный запас HP + 20% шанс полностью проигнорировать любую атаку!'
  },
  {
    id: 'boxer',
    num: 28,
    name: 'Боксёр',
    shape: 'circle',
    baseColor: '#e11d48',
    hp: 125,
    speed: 3.6,
    damage: 11,
    cardSub: '10% апперкот',
    desc: '🥊 10% шанс апперкота: оглушает врага на 2.5 с с кружащимся нимбом!'
  },
  {
    id: 'hunter',
    num: 29,
    name: 'Охотник',
    shape: 'square',
    baseColor: '#854d0e',
    hp: 105,
    speed: 3.0,
    damage: 10,
    cardSub: 'дробовик 5x10',
    desc: '猎 Дробовик (раз в 4 с): 5 патронов веером по 10 урона (медленная дробь)'
  },
  {
    id: 'zombie',
    num: 30,
    name: 'Зомби',
    shape: 'circle',
    baseColor: '#4d7c0f',
    hp: 115,
    speed: 2.9,
    damage: 11,
    cardSub: 'заражение',
    desc: '🧟 Убитый им враг превращается в точно такого же Зомби с полным HP!'
  },
  {
    id: 'werewolf',
    num: 31,
    name: 'Оборотень',
    shape: 'circle',
    baseColor: '#8b5a2b',
    hp: 100,
    speed: 3.0,
    damage: 10,
    cardSub: 'смена команды',
    desc: '🐺 Коричневый с белыми когтями • каждые 40 с меняет команду через дым (кроме 1х1)'
  },

  // ==================== 6 НОВЫХ БОЙЦОВ (№32 – №37) ====================
  {
    id: 'bomber',
    num: 32,
    name: 'Подрывник',
    shape: 'circle',
    baseColor: '#dc2626',
    hp: 145,
    speed: 3.0,
    damage: 60,
    cardSub: 'бомба -60 (8с)',
    desc: '💣 Держит бомбу: кидает её и взрывает всех в радиусе на -60 HP (новая ровно через 8 с)!'
  },
  {
    id: 'checkmate',
    num: 33,
    name: 'Шах и Мат',
    shape: 'square',
    baseColor: '#1e293b',
    hp: 200,
    speed: 3.1,
    damage: 60,
    cardSub: '4 пешки ×60',
    desc: '♟️ Чёрно-белая доска (200 HP) • раз в 4 с пускает 4 пешки (по 60 ур.) прямо или наискосок!'
  },
  {
    id: 'death',
    num: 34,
    name: 'Смерть',
    shape: 'triangle',
    baseColor: '#0f172a',
    hp: 340,
    speed: 3.2,
    damage: 30,
    cardSub: 'коса 30 / +30 HP',
    desc: '💀 340 HP • Коса бьёт на 30 урона • за каждую смерть любого бойца на арене получает +30 HP!'
  },
  {
    id: 'fairy',
    num: 35,
    name: 'Фея',
    shape: 'circle',
    baseColor: '#f472b6',
    hp: 150,
    speed: 3.6,
    damage: 15,
    cardSub: 'палочка 7 чар',
    desc: '🧚 150 HP • Волшебная палочка (3.5 с): выпускает случайную атаку из 7 классов с их уроном!'
  },
  {
    id: 'card_master',
    num: 36,
    name: 'Карточник',
    shape: 'hexagon',
    baseColor: '#991b1b',
    hp: 240,
    speed: 3.4,
    damage: 30,
    cardSub: '3 карты ×30',
    desc: '🃏 240 HP • Каждые 2.5 с кидает 3 карты веером, каждая карта наносит по 30 ед. урона!'
  },
  {
    id: 'doubler',
    num: 37,
    name: 'Умножитель',
    shape: 'circle',
    baseColor: '#f59e0b',
    hp: 500,
    speed: 7.0,
    damage: 1,
    cardSub: 'урон 1→2→4→8…',
    desc: '📈 500 HP и скорость 7.0! Сначала бьёт на 1, затем 2, 4, 8, 16… (урон ×2 после каждого удара)!'
  },

  // ==================== 4 НОВЫХ БОЙЦА (№38 – №41) ====================
  {
    id: 'musician',
    num: 38,
    name: 'Музыкант',
    shape: 'circle',
    baseColor: '#d97706',
    hp: 200,
    speed: 3.3,
    damage: 55,
    cardSub: '3 ноты ×55',
    desc: '🪕 200 HP • Играет на балалайке и выпускает 3 ноты веером, каждая из которых сносит по 55 HP!'
  },
  {
    id: 'pavuk',
    num: 39,
    name: 'Павук',
    shape: 'circle',
    baseColor: '#312e81',
    hp: 210,
    speed: 3.4,
    damage: 80,
    cardSub: 'паутина / рывок 80',
    desc: '🕷️ С лапками: раз в 5 с стреляет паутиной (25% шанс кокона на 3.5 с) и раз в 10 с делает рывок на 80 HP!'
  },
  {
    id: 'bibizyana',
    num: 40,
    name: 'Бибизяна',
    shape: 'circle',
    baseColor: '#92400e',
    hp: 220,
    speed: 3.5,
    damage: 50,
    cardSub: 'удар 50 / банан 45',
    desc: '🐒 Обезьяна: при задевании соперника сносит 50 HP • каждые 7 с кидает 1 банан, наносящий 45 HP!'
  },
  {
    id: 'medusa',
    num: 41,
    name: 'Медуза',
    shape: 'circle',
    baseColor: '#06b6d4',
    hp: 250,
    speed: 3.3,
    damage: 10,
    cardSub: 'электро-след 10/0.5с',
    desc: '🪼 250 HP • Бьётся о стенки без урона от удара, но оставляет электрический след: 10 HP каждые 0.5 с на 5 с!'
  },

  // ==================== 15 НОВЫХ БОЙЦОВ (ПО 3 В КАЖДУЮ РЕДКОСТЬ: №42 – №56) ====================
  // ⚪ ОБЫЧНЫЕ (+3):
  {
    id: 'lumberjack',
    num: 42,
    name: 'Дровосек',
    shape: 'square',
    baseColor: '#b91c1c',
    hp: 115,
    speed: 2.9,
    damage: 14,
    cardSub: 'топор 14 (25% ×2)',
    desc: '🪓 Дровосек с топором: сносит 14 HP при ударе, а с шансом 25% рубит с двойной силой (28 HP)!'
  },
  {
    id: 'slinger',
    num: 43,
    name: 'Пращник',
    shape: 'triangle',
    baseColor: '#a16207',
    hp: 90,
    speed: 3.3,
    damage: 11,
    cardSub: 'камень 2с / отброс',
    desc: '🪨 Каждые 2 с раскручивает пращу и кидает камень (11 HP), который отталкивает врага назад!'
  },
  {
    id: 'blacksmith',
    num: 44,
    name: 'Кузнец',
    shape: 'hexagon',
    baseColor: '#475569',
    hp: 130,
    speed: 2.7,
    damage: 12,
    cardSub: 'молот 12 + броня',
    desc: '🔨 Бьёт раскалённым молотом (12 HP с искрами) и каждые 5 с выковывает себе +12 HP брони!'
  },

  // 🟢 РЕДКИЕ (+3):
  {
    id: 'musketeer',
    num: 45,
    name: 'Мушкетёр',
    shape: 'triangle',
    baseColor: '#1d4ed8',
    hp: 135,
    speed: 3.6,
    damage: 18,
    cardSub: 'шпага 18 / парирование',
    desc: '🤺 Быстрый фехтовальщик со шпагой (18 HP): с шансом 30% парирует атаку врага и отвечает уколом!'
  },
  {
    id: 'beekeeper',
    num: 46,
    name: 'Пчеловод',
    shape: 'circle',
    baseColor: '#eab308',
    hp: 140,
    speed: 3.1,
    damage: 14,
    cardSub: 'рой из 3 пчёл ×14',
    desc: '🐝 Каждые 3.5 с выпускает из улья 3 злых пчелы, которые летят во врага и жалят по 14 HP каждая!'
  },
  {
    id: 'ice_golem',
    num: 47,
    name: 'Ледяной Голем',
    shape: 'hexagon',
    baseColor: '#38bdf8',
    hp: 210,
    speed: 2.4,
    damage: 16,
    cardSub: '210 HP / мороз',
    desc: '🧊 Мощный ледяной танк (210 HP): замораживает врагов при ударе и раз в 5 с пускает кольцо льдинок!'
  },

  // 🟣 ЭПИЧЕСКИЕ (+3):
  {
    id: 'samurai',
    num: 48,
    name: 'Самурай',
    shape: 'triangle',
    baseColor: '#991b1b',
    hp: 185,
    speed: 3.6,
    damage: 28,
    cardSub: 'рывок Иайдо 45',
    desc: '⛩️ Мастер клинка (185 HP): рубит на 28 HP и каждые 4.5 с делает молниеносный разрез сквозь врага на 45 HP!'
  },
  {
    id: 'cactus',
    num: 49,
    name: 'Кактус',
    shape: 'circle',
    baseColor: '#15803d',
    hp: 220,
    speed: 3.0,
    damage: 20,
    cardSub: 'шипы + 8 иголок',
    desc: '🌵 Колючий Кактус (220 HP): возвращает 40% урона шипами при ударе и раз в 4 с стреляет 8 иголками вокруг!'
  },
  {
    id: 'magician_hat',
    num: 50,
    name: 'Фокусник',
    shape: 'square',
    baseColor: '#6d28d9',
    hp: 170,
    speed: 3.4,
    damage: 26,
    cardSub: 'фокус из шляпы 3.5с',
    desc: '🎩 Каждые 3.5 с достаёт из цилиндра фокус: 3 магических голубя (по 26 HP) или взрывного кролика (-48 HP)!'
  },

  // 🔴 МИФИЧЕСКИЕ (+3):
  {
    id: 'anubis',
    num: 51,
    name: 'Анубис',
    shape: 'triangle',
    baseColor: '#b45309',
    hp: 260,
    speed: 3.4,
    damage: 38,
    cardSub: 'проклятие + вампиризм',
    desc: '🐺 Бог пустыни (260 HP): каждые 4 с пускает песчаный луч, который сносит 38 HP врагу и лечит Анубиса на +25 HP!'
  },
  {
    id: 'poseidon',
    num: 52,
    name: 'Посейдон',
    shape: 'hexagon',
    baseColor: '#0284c7',
    hp: 270,
    speed: 3.5,
    damage: 42,
    cardSub: 'трезубец / цунами ×3',
    desc: '🔱 Владыка морей (270 HP): каждые 4 с обрушивает 3 водяные волны по 42 HP, смывающие врагов назад!'
  },
  {
    id: 'meteor_knight',
    num: 53,
    name: 'Метеорит',
    shape: 'circle',
    baseColor: '#c2410c',
    hp: 280,
    speed: 4.0,
    damage: 48,
    cardSub: 'таран 48 / взрыв 65',
    desc: '☄️ Пылающий Метеорит (280 HP): несётся с огромной скоростью (48 HP) и раз в 5 с взрывается огненной волной на 65 HP!'
  },

  // 🟡 ЛЕГЕНДАРНЫЕ (+3):
  {
    id: 'dragon',
    num: 54,
    name: 'Дракон',
    shape: 'triangle',
    baseColor: '#dc2626',
    hp: 380,
    speed: 3.8,
    damage: 55,
    cardSub: '5 шаров дракона ×45',
    desc: '🐉 Древний Дракон (380 HP): каждые 3.5 с выдыхает веер из 5 огненных шаров (по 45 HP) и поджигает арену!'
  },
  {
    id: 'chronos',
    num: 55,
    name: 'Хронос',
    shape: 'hexagon',
    baseColor: '#ca8a04',
    hp: 340,
    speed: 3.7,
    damage: 50,
    cardSub: 'стоп времени + 4 клинка',
    desc: '⏳ Повелитель Времени (340 HP): каждые 5.5 с останавливает врагов на 2.5 с и выпускает 4 стрелки-клинка по 50 HP!'
  },
  {
    id: 'zeus',
    num: 56,
    name: 'Зевс',
    shape: 'circle',
    baseColor: '#eab308',
    hp: 400,
    speed: 3.8,
    damage: 65,
    cardSub: '400 HP / гроза Олимпа 65',
    desc: '⚡ Верховный Зевс (400 HP): каждые 3.5 с поражает врагов небесной молнией Олимпа на 65 HP с оглушением!'
  },
  // 👼 ЭКСКЛЮЗИВ МАГАЗИНА РЯДОМ С КОНТЕЙНЕРОМ (№57):
  {
    id: 'sky_guardian',
    num: 57,
    name: 'Стражник небес',
    shape: 'hexagon',
    baseColor: '#38bdf8',
    hp: 700,
    speed: 3.2,
    damage: 150,
    squadWeight: 3,
    shopPrice: 50000,
    cardSub: '700 HP • луч 150 (3 места)',
    desc: '👼 Стражник небес (700 HP, занимает сразу 3 места!): пока движется — сам не наносит урона от столкновений и просто отлетает. Каждые 10 с замирает на 1.5 с в непробиваемом щите и стреляет лучом во все стороны, снося всем соперникам ровно по 150 HP!'
  },

  // ==================== 16 НОВЫХ БОЙЦОВ ИЗ «БОКСА БОЙЦОВ» (№58–73) ====================
  // 5 НОВЫХ ОБЫЧНЫХ (ОЧЕНЬ СЛАБЫЕ, БЕЗ СПОСОБНОСТЕЙ):
  {
    id: 'paper_recruit',
    num: 58,
    name: 'Новобранец',
    shape: 'circle',
    baseColor: '#94a3b8',
    hp: 55,
    speed: 2.6,
    damage: 5,
    inFighterBox: true,
    noActiveAbility: true,
    cardSub: '55 HP • без способностей (5)',
    desc: '📄 Бумажный Новобранец (55 HP): очень слабый боец без всяких способностей — просто катается и толкается корпусом на 5 урона!'
  },
  {
    id: 'cardboard_pug',
    num: 59,
    name: 'Картонный Мопс',
    shape: 'square',
    baseColor: '#d6a87c',
    hp: 60,
    speed: 2.8,
    damage: 6,
    inFighterBox: true,
    noActiveAbility: true,
    cardSub: '60 HP • без способностей (6)',
    desc: '🐶 Картонный Мопс (60 HP): очень слабый боец без способностей — бегает по рингу и бодается при столкновении на 6 урона!'
  },
  {
    id: 'wooden_dummy',
    num: 60,
    name: 'Манекен',
    shape: 'hexagon',
    baseColor: '#b48252',
    hp: 70,
    speed: 2.3,
    damage: 4,
    inFighterBox: true,
    noActiveAbility: true,
    cardSub: '70 HP • без способностей (4)',
    desc: '🪵 Деревянный Манекен (70 HP): учебная мишень без способностей — медленно отскакивает от стенок и наносит всего 4 урона при касании!'
  },
  {
    id: 'origami_frog',
    num: 61,
    name: 'Оригами-Жаба',
    shape: 'triangle',
    baseColor: '#86efac',
    hp: 50,
    speed: 3.1,
    damage: 5,
    inFighterBox: true,
    noActiveAbility: true,
    cardSub: '50 HP • без способностей (5)',
    desc: '🐸 Оригами-Жаба (50 HP): маленькая бумажная лягушка без способностей — прыгает от бортов и сносит 5 HP корпусом!'
  },
  {
    id: 'tin_peasant',
    num: 62,
    name: 'Пехотинец',
    shape: 'square',
    baseColor: '#a1a1aa',
    hp: 65,
    speed: 2.5,
    damage: 6,
    inFighterBox: true,
    noActiveAbility: true,
    cardSub: '65 HP • без способностей (6)',
    desc: '🪖 Бумажный Пехотинец (65 HP): очень слабый рядовой без навыков — просто идёт на таран и наносит 6 урона при ударе!'
  },

  // 5 НОВЫХ РЕДКИХ БОЙЦОВ ИЗ «БОКСА БОЙЦОВ»:
  {
    id: 'crossbow_scout',
    num: 63,
    name: 'Арбалетчик',
    shape: 'triangle',
    baseColor: '#15803d',
    hp: 115,
    speed: 3.3,
    damage: 18,
    inFighterBox: true,
    cardSub: 'болт арбалета 18 + толчок',
    desc: '🏹 Арбалетчик (115 HP): каждые 2.1 с выпускает тяжёлый болт из арбалета на 18 урона, слегка отбрасывающий врага!'
  },
  {
    id: 'fencer_fox',
    num: 64,
    name: 'Лис-Дуэлянт',
    shape: 'triangle',
    baseColor: '#ea580c',
    hp: 120,
    speed: 3.7,
    damage: 16,
    inFighterBox: true,
    cardSub: 'двойной укол рапирой',
    desc: '🦊 Лис-Дуэлянт (120 HP): при каждом столкновении делает молниеносный двойной укол рапирой (×1.8 урона) и ускоряется!'
  },
  {
    id: 'snow_thrower',
    num: 65,
    name: 'Снежкомёт',
    shape: 'circle',
    baseColor: '#60a5fa',
    hp: 130,
    speed: 3.0,
    damage: 15,
    inFighterBox: true,
    cardSub: '2 снежка по 15 + холод',
    desc: '⛄ Снежкомёт (130 HP): каждые 2.2 с запускает 2 морозных снежка подряд по 15 урона с замедлением!'
  },
  {
    id: 'torch_bearer',
    num: 66,
    name: 'Факелоносец',
    shape: 'square',
    baseColor: '#d97706',
    hp: 135,
    speed: 3.1,
    damage: 14,
    inFighterBox: true,
    cardSub: 'крутящийся факел + ожог',
    desc: '🔥 Факелоносец (135 HP): вращает вокруг себя горящий факел на 14 урона и поджигает задетых врагов на 2.5 с!'
  },
  {
    id: 'anchor_sailor',
    num: 67,
    name: 'Моряк с Якорем',
    shape: 'hexagon',
    baseColor: '#0369a1',
    hp: 150,
    speed: 2.7,
    damage: 22,
    inFighterBox: true,
    cardSub: 'бросок якоря 22 + оглуш.',
    desc: '⚓ Моряк с Якорем (150 HP): каждые 3.5 с швыряет тяжёлый якорь на 22 урона с кратким оглушением цели!'
  },

  // 6 НОВЫХ ЭПИЧЕСКИХ БОЙЦОВ ИЗ «БОКСА БОЙЦОВ»:
  {
    id: 'wind_ronin',
    num: 68,
    name: 'Ронин Ветра',
    shape: 'triangle',
    baseColor: '#0d9488',
    hp: 165,
    speed: 3.6,
    damage: 28,
    inFighterBox: true,
    cardSub: 'сквозной клинок ветра 28',
    desc: '🌪️ Ронин Ветра (165 HP): каждые 3.0 с взмахивает катаной и пускает сквозную воздушную волну на 28 урона!'
  },
  {
    id: 'tesla_bot',
    num: 69,
    name: 'Тесла-Дрон',
    shape: 'hexagon',
    baseColor: '#0284c7',
    hp: 160,
    speed: 3.3,
    damage: 24,
    inFighterBox: true,
    cardSub: 'кольцо тока 24 вокруг',
    desc: '⚡ Тесла-Дрон (160 HP): каждые 3.0 с выпускает электрическое кольцо вокруг себя, нанося 24 урона всем врагам рядом!'
  },
  {
    id: 'witch_brew',
    num: 70,
    name: 'Лесная Ведьма',
    shape: 'circle',
    baseColor: '#7e22ce',
    hp: 155,
    speed: 3.2,
    damage: 26,
    inFighterBox: true,
    cardSub: '2 мыши по 26 + вампиризм',
    desc: '🦇 Лесная Ведьма (155 HP): каждые 3.2 с выпускает 2 ночных мышей по 26 урона и исцеляется на +12 HP!'
  },
  {
    id: 'magma_guard',
    num: 71,
    name: 'Лавовый Страж',
    shape: 'square',
    baseColor: '#b91c1c',
    hp: 210,
    speed: 2.8,
    damage: 25,
    inFighterBox: true,
    cardSub: '210 HP / взрыв лавы 25',
    desc: '🌋 Лавовый Страж (210 HP): каждые 3.8 с ударяет раскалённым щитом, вызывая взрыв магмы вокруг себя на 25 урона + поджог!'
  },
  {
    id: 'crystal_sniper',
    num: 72,
    name: 'Кристалл-Стрелок',
    shape: 'hexagon',
    baseColor: '#ec4899',
    hp: 145,
    speed: 3.5,
    damage: 32,
    inFighterBox: true,
    cardSub: '3 алмазных луча по 32',
    desc: '💎 Кристалл-Стрелок (145 HP): каждые 2.8 с выпускает веером 3 острых кристалла, каждый наносит 32 урона!'
  },
  {
    id: 'shadow_scythe',
    num: 73,
    name: 'Теневой Жнец',
    shape: 'triangle',
    baseColor: '#4c1d95',
    hp: 175,
    speed: 3.7,
    damage: 30,
    inFighterBox: true,
    cardSub: 'прыжок за спину + серп 30',
    desc: '🌑 Теневой Жнец (175 HP): каждые 3.6 с мгновенно прыгает сквозь тень к врагу и рубит серпом на 30 урона!'
  },

  // ==================== 22 НОВЫХ БОЙЦА ИЗ «ЯЩИКА ЗА 500 МОНЕТ» (12 РЕДКИХ, 6 ЭПИЧЕСКИХ, 4 МИФИЧЕСКИХ: №74–95) ====================
  // 🟢 12 НОВЫХ РЕДКИХ БОЙЦОВ (ЯЩИК ЗА 500 МОНЕТ):
  {
    id: 'halberd_guard',
    num: 74,
    name: 'Алебардщик',
    shape: 'square',
    baseColor: '#15803d',
    hp: 155,
    speed: 2.9,
    damage: 21,
    inCrate500: true,
    cardSub: 'алебарда 21 + отпор',
    desc: '🪓 Алебардщик (155 HP): каждые 2.9 с делает мощный взмах стальной алебардой на 21 урона и отбрасывает врагов!'
  },
  {
    id: 'dart_frog',
    num: 75,
    name: 'Дротикомёт',
    shape: 'triangle',
    baseColor: '#22c55e',
    hp: 120,
    speed: 3.6,
    damage: 16,
    inCrate500: true,
    cardSub: 'ядовитый дротик 16',
    desc: '🎯 Дротикомёт (120 HP): каждые 2.2 с выдувает из духовой трубки быстрый ядовитый дротик на 16 урона!'
  },
  {
    id: 'shield_maiden',
    num: 76,
    name: 'Валькирия',
    shape: 'hexagon',
    baseColor: '#0ea5e9',
    hp: 160,
    speed: 3.3,
    damage: 19,
    inCrate500: true,
    cardSub: 'рывок со щитом 19',
    desc: '🛡️ Валькирия (160 HP): каждые 3.0 с совершает стремительный рывок с крылатым щитом на 19 урона!'
  },
  {
    id: 'cannon_pirate',
    num: 77,
    name: 'Канонир',
    shape: 'circle',
    baseColor: '#334155',
    hp: 145,
    speed: 2.8,
    damage: 24,
    inCrate500: true,
    cardSub: 'пушечное ядро 24',
    desc: '💣 Канонир (145 HP): каждые 3.2 с стреляет из ручной мортиры тяжёлым ядром на 24 урона с отдачей!'
  },
  {
    id: 'whip_tamer',
    num: 78,
    name: 'Укротитель',
    shape: 'triangle',
    baseColor: '#b45309',
    hp: 130,
    speed: 3.5,
    damage: 18,
    inCrate500: true,
    cardSub: 'удар хлыстом 18 + стан',
    desc: '🪢 Укротитель (130 HP): каждые 2.6 с щёлкает длинным кнутом по врагу на 18 урона и кратко оглушает!'
  },
  {
    id: 'bone_warrior',
    num: 79,
    name: 'Костяной Воин',
    shape: 'square',
    baseColor: '#94a3b8',
    hp: 140,
    speed: 3.2,
    damage: 19,
    inCrate500: true,
    cardSub: 'бросок кости 19',
    desc: '🦴 Костяной Воин (140 HP): каждые 2.7 с швыряет вращающуюся кость-бумеранг на 19 урона!'
  },
  {
    id: 'rune_monk',
    num: 80,
    name: 'Монах Посоха',
    shape: 'circle',
    baseColor: '#eab308',
    hp: 150,
    speed: 3.4,
    damage: 17,
    inCrate500: true,
    cardSub: 'волна ци 17 + лечение',
    desc: '🧘 Монах Посоха (150 HP): каждые 3.1 с выпускает золотую сферу Ци на 17 урона и восстанавливает себе +8 HP!'
  },
  {
    id: 'saw_bot',
    num: 81,
    name: 'Пило-Бот',
    shape: 'hexagon',
    baseColor: '#64748b',
    hp: 145,
    speed: 3.3,
    damage: 20,
    inCrate500: true,
    cardSub: 'дисковая пила 20',
    desc: '⚙️ Пило-Бот (145 HP): каждые 2.7 с запускает стальную дисковую пилу на 20 урона!'
  },
  {
    id: 'flail_templar',
    num: 82,
    name: 'Крестоносец',
    shape: 'square',
    baseColor: '#dc2626',
    hp: 165,
    speed: 2.8,
    damage: 22,
    inCrate500: true,
    cardSub: 'кистень 22 + толчок',
    desc: '⛓️ Крестоносец (165 HP): каждые 3.0 с обрушивает шипастый кистень на цепи на 22 урона!'
  },
  {
    id: 'sand_nomad',
    num: 83,
    name: 'Кочевник Бури',
    shape: 'triangle',
    baseColor: '#d97706',
    hp: 135,
    speed: 3.6,
    damage: 17,
    inCrate500: true,
    cardSub: 'песчаный вихрь 17',
    desc: '🏜️ Кочевник Бури (135 HP): каждые 2.8 с пускает песчаный порыв на 17 урона, замедляющий цель!'
  },
  {
    id: 'harpoon_diver',
    num: 84,
    name: 'Гарпунщик',
    shape: 'hexagon',
    baseColor: '#0284c7',
    hp: 150,
    speed: 3.0,
    damage: 21,
    inCrate500: true,
    cardSub: 'морской гарпун 21',
    desc: '🔱 Гарпунщик (150 HP): каждые 2.9 с выстреливает тяжёлым морским гарпуном на 21 урона!'
  },
  {
    id: 'drum_shaman',
    num: 85,
    name: 'Шаман Ритма',
    shape: 'circle',
    baseColor: '#16a34a',
    hp: 145,
    speed: 3.1,
    damage: 18,
    inCrate500: true,
    cardSub: 'бой барабана 18 вокруг',
    desc: '🥁 Шаман Ритма (145 HP): каждые 3.0 с бьёт в боевой тамтам, поражая звуковой волной врагов вокруг на 18 урона!'
  },

  // 🟣 6 НОВЫХ ЭПИЧЕСКИХ БОЙЦОВ (ЯЩИК ЗА 500 МОНЕТ):
  {
    id: 'phantom_duelist',
    num: 86,
    name: 'Фантом-Клинок',
    shape: 'triangle',
    baseColor: '#7c3aed',
    hp: 180,
    speed: 3.8,
    damage: 31,
    inCrate500: true,
    cardSub: 'призрачный выпад 31',
    desc: '👻 Фантом-Клинок (180 HP): каждые 3.1 с совершает призрачный рывок сквозь тень и выпускает 2 эфирных клинка по 31 урона!'
  },
  {
    id: 'cyber_sniper',
    num: 87,
    name: 'Кибер-Снайпер',
    shape: 'hexagon',
    baseColor: '#06b6d4',
    hp: 165,
    speed: 3.4,
    damage: 36,
    inCrate500: true,
    cardSub: 'рельсотрон 36 насквозь',
    desc: '🎯 Кибер-Снайпер (165 HP): каждые 3.0 с делает сверхзвуковой выстрел из рельсотрона на 36 пробивного урона!'
  },
  {
    id: 'frost_valkyrie',
    num: 88,
    name: 'Ледяная Дева',
    shape: 'circle',
    baseColor: '#38bdf8',
    hp: 190,
    speed: 3.5,
    damage: 29,
    inCrate500: true,
    cardSub: '3 ледяных копья ×29',
    desc: '❄️ Ледяная Дева (190 HP): каждые 3.1 с метает веер из 3 ледяных копий по 29 урона с заморозкой!'
  },
  {
    id: 'inferno_executioner',
    num: 89,
    name: 'Палач Пламени',
    shape: 'square',
    baseColor: '#dc2626',
    hp: 215,
    speed: 3.0,
    damage: 33,
    inCrate500: true,
    cardSub: '2 волны пламени ×33',
    desc: '🔥 Палач Пламени (215 HP): каждые 3.3 с обрушивает пылающую секиру и пускает 2 огненных шара по 33 урона!'
  },
  {
    id: 'storm_caller',
    num: 90,
    name: 'Ловец Молний',
    shape: 'hexagon',
    baseColor: '#6366f1',
    hp: 175,
    speed: 3.6,
    damage: 30,
    inCrate500: true,
    cardSub: 'цепь шторма 30',
    desc: '🌩️ Ловец Молний (175 HP): каждые 3.0 с бьёт грозовым разрядом по врагам на 30 урона с микро-станом!'
  },
  {
    id: 'venom_queen',
    num: 91,
    name: 'Королева Яда',
    shape: 'circle',
    baseColor: '#9333ea',
    hp: 185,
    speed: 3.4,
    damage: 28,
    inCrate500: true,
    cardSub: '2 колбы яда ×28',
    desc: '🧪 Королева Яда (185 HP): каждые 3.2 с швыряет 2 ядовитых флакона по 28 урона!'
  },

  // 🔴 4 НОВЫХ МИФИЧЕСКИХ БОЙЦА (ЯЩИК ЗА 500 МОНЕТ):
  {
    id: 'solar_pharaoh',
    num: 92,
    name: 'Фараон Солнца',
    shape: 'triangle',
    baseColor: '#f59e0b',
    hp: 275,
    speed: 3.6,
    damage: 44,
    inCrate500: true,
    cardSub: 'луч Ра 44 + исцеление 20',
    desc: '☀️ Фараон Солнца (275 HP): каждые 3.4 с поражает врагов солнечным лучом Ра на 44 урона и лечит себя на +20 HP!'
  },
  {
    id: 'void_reaper',
    num: 93,
    name: 'Вестник Бездны',
    shape: 'hexagon',
    baseColor: '#be123c',
    hp: 265,
    speed: 3.8,
    damage: 46,
    inCrate500: true,
    cardSub: '3 серпа бездны ×46',
    desc: '🌌 Вестник Бездны (265 HP): каждые 3.4 с выпускает 3 всепроникающих клинка бездны по 46 урона!'
  },
  {
    id: 'mecha_titan',
    num: 94,
    name: 'Меха-Колосс',
    shape: 'square',
    baseColor: '#e11d48',
    hp: 310,
    speed: 3.1,
    damage: 42,
    inCrate500: true,
    cardSub: '310 HP • залп 4 ракет ×42',
    desc: '🤖 Меха-Колосс (310 HP): бронированный гигант, который каждые 3.5 с даёт залп из 4 тяжёлых ракет по 42 урона!'
  },
  {
    id: 'blood_archduke',
    num: 95,
    name: 'Кровавый Лорд',
    shape: 'circle',
    baseColor: '#9f1239',
    hp: 280,
    speed: 3.7,
    damage: 45,
    inCrate500: true,
    cardSub: 'багровый взрыв 45 + вампир',
    desc: '🩸 Кровавый Лорд (280 HP): каждые 3.3 с поражает врагов багровой молнией на 45 урона и забирает +22 HP себе!'
  },

  // ==================== 11 НОВЫХ БОЙЦОВ ИЗ «МАЛЕНЬКОГО ЯЩИКА ЗА 20 МОНЕТ» (5 ОБЫЧНЫХ, 4 РЕДКИХ, 2 ЭПИЧЕСКИХ: №96–106) ====================
  // ⚪ 5 НОВЫХ ОБЫЧНЫХ БОЙЦОВ (МАЛЕНЬКИЙ ЯЩИК ЗА 20 МОНЕТ):
  {
    id: 'broom_janitor',
    num: 96,
    name: 'Дворник',
    shape: 'circle',
    baseColor: '#64748b',
    hp: 85,
    speed: 3.0,
    damage: 9,
    inMiniCrate20: true,
    cardSub: 'метла 9 + отталкивание',
    desc: '🧹 Дворник с Метлой (85 HP): выметает соперников с пути метлой на 9 урона!'
  },
  {
    id: 'cook_pan',
    num: 97,
    name: 'Повар',
    shape: 'square',
    baseColor: '#94a3b8',
    hp: 95,
    speed: 2.8,
    damage: 10,
    inMiniCrate20: true,
    cardSub: 'сковородка 10 урона',
    desc: '🍳 Повар (95 HP): отбивается чугунной сковородкой и наносит 10 урона при столкновении!'
  },
  {
    id: 'gardener_fork',
    num: 98,
    name: 'Садовник',
    shape: 'triangle',
    baseColor: '#4ade80',
    hp: 90,
    speed: 3.1,
    damage: 9,
    inMiniCrate20: true,
    cardSub: 'садовые вилы 9',
    desc: '🌱 Садовник (90 HP): бодро бегает по рингу с садовыми вилами и колет врагов на 9 урона!'
  },
  {
    id: 'postman_bag',
    num: 99,
    name: 'Почтальон',
    shape: 'circle',
    baseColor: '#3b82f6',
    hp: 88,
    speed: 3.3,
    damage: 8,
    inMiniCrate20: true,
    cardSub: 'бросок конверта 8',
    desc: '✉️ Почтальон (88 HP): каждые 2.5 с кидает во врага бумажное письмо-конверт на 8 урона!'
  },
  {
    id: 'miner_pickaxe',
    num: 100,
    name: 'Шахтёр',
    shape: 'hexagon',
    baseColor: '#78716c',
    hp: 100,
    speed: 2.7,
    damage: 11,
    inMiniCrate20: true,
    cardSub: 'удар киркой 11',
    desc: '⛏️ Шахтёр (100 HP): крепкий работяга в каске, который бьёт стальной киркой на 11 урона!'
  },

  // 🟢 4 НОВЫХ РЕДКИХ БОЙЦА (МАЛЕНЬКИЙ ЯЩИК ЗА 20 МОНЕТ):
  {
    id: 'jester_cards',
    num: 101,
    name: 'Шут',
    shape: 'triangle',
    baseColor: '#16a34a',
    hp: 125,
    speed: 3.6,
    damage: 16,
    inMiniCrate20: true,
    cardSub: '2 бубенца по 16',
    desc: '🃏 Шут с Бубенцами (125 HP): каждые 2.6 с бросает во врага 2 звенящих бубенца по 16 урона!'
  },
  {
    id: 'ice_skater',
    num: 102,
    name: 'Фигурист',
    shape: 'circle',
    baseColor: '#38bdf8',
    hp: 120,
    speed: 3.9,
    damage: 15,
    inMiniCrate20: true,
    cardSub: 'ледяной конёк 15',
    desc: '⛸️ Фигурист (120 HP): стремительно скользит по арене и каждые 2.7 с пускает ледяной росчерк на 15 урона!'
  },
  {
    id: 'bamboo_panda',
    num: 103,
    name: 'Бамбук-Панда',
    shape: 'hexagon',
    baseColor: '#15803d',
    hp: 155,
    speed: 2.8,
    damage: 18,
    inMiniCrate20: true,
    cardSub: '155 HP • бамбук 18',
    desc: '🐼 Бамбук-Панда (155 HP): каждые 2.9 с бьёт бамбуковым шестом на 18 урона и отталкивает соперника!'
  },
  {
    id: 'alchemist_apprentice',
    num: 104,
    name: 'Чародей-Ученик',
    shape: 'square',
    baseColor: '#0d9488',
    hp: 125,
    speed: 3.2,
    damage: 17,
    inMiniCrate20: true,
    cardSub: 'магический шар 17',
    desc: '✨ Чародей-Ученик (125 HP): каждые 2.7 с выпускает из книги заклинаний искрящийся снаряд на 17 урона!'
  },

  // 🟣 2 НОВЫХ ЭПИЧЕСКИХ БОЙЦА (МАЛЕНЬКИЙ ЯЩИК ЗА 20 МОНЕТ — МАЛЕНЬКИЙ ШАНС ВЫПАДЕНИЯ!):
  {
    id: 'emerald_valkyrie',
    num: 105,
    name: 'Изумрудный Страж',
    shape: 'hexagon',
    baseColor: '#10b981',
    hp: 195,
    speed: 3.6,
    damage: 32,
    inMiniCrate20: true,
    cardSub: '3 изумрудных луча ×32',
    desc: '💚 Изумрудный Страж (195 HP): редчайший эпический боец маленького ящика — каждые 3.0 с выпускает 3 изумрудных копья по 32 урона!'
  },
  {
    id: 'eclipse_ninja',
    num: 106,
    name: 'Ниндзя Затмения',
    shape: 'triangle',
    baseColor: '#6d28d9',
    hp: 180,
    speed: 3.9,
    damage: 34,
    inMiniCrate20: true,
    cardSub: '3 теневых сюрикена ×34',
    desc: '🌑 Ниндзя Затмения (180 HP): редчайший эпический боец маленького ящика — каждые 3.1 с метает веер из 3 сюрикенов затмения по 34 урона!'
  },

  // ==================== 24 НОВЫХ БОЙЦА ИЗ ЯЩИКА «ЭКСКЛЮЗИВ» ЗА 1 000 МОНЕТ (10 ЭПИЧЕСКИХ, 7 МИФИЧЕСКИХ, 5 ЛЕГЕНДАРНЫХ, 2 ГАЛАКТИЧЕСКИХ: №107–130) ====================
  // 🟣 10 НОВЫХ ЭПИЧЕСКИХ БОЙЦОВ (ЯЩИК «ЭКСКЛЮЗИВ»):
  {
    id: 'chrono_assassin',
    num: 107,
    name: 'Хроно-Ассасин',
    shape: 'triangle',
    baseColor: '#6366f1',
    hp: 185,
    speed: 4.0,
    damage: 32,
    inExclusiveCrate: true,
    cardSub: 'прыжок времени 32 + холод',
    desc: '⏱️ Хроно-Ассасин (185 HP): каждые 3.2 с совершает скачок сквозь время к врагу, наносит 32 урона и замедляет цель!'
  },
  {
    id: 'lava_berserker',
    num: 108,
    name: 'Берсерк Лавы',
    shape: 'hexagon',
    baseColor: '#ea580c',
    hp: 215,
    speed: 3.3,
    damage: 34,
    inExclusiveCrate: true,
    cardSub: '2 сгустка лавы ×34',
    desc: '🌋 Берсерк Лавы (215 HP): каждые 3.3 с швыряет 2 раскалённых сгустка магмы по 34 урона с поджогом!'
  },
  {
    id: 'electro_spear',
    num: 109,
    name: 'Громовой Улан',
    shape: 'square',
    baseColor: '#0284c7',
    hp: 195,
    speed: 3.6,
    damage: 31,
    inExclusiveCrate: true,
    cardSub: 'электро-копьё 31 + стан',
    desc: '⚡ Громовой Улан (195 HP): каждые 3.0 с метает электрическое копьё на 31 урона, оглушающее цель на 0.4 с!'
  },
  {
    id: 'mirror_mage',
    num: 110,
    name: 'Зеркальный Маг',
    shape: 'circle',
    baseColor: '#ec4899',
    hp: 175,
    speed: 3.4,
    damage: 29,
    inExclusiveCrate: true,
    cardSub: '3 зеркальных луча ×29',
    desc: '🪞 Зеркальный Маг (175 HP): каждые 3.1 с выпускает веером 3 сквозных зеркальных осколка по 29 урона!'
  },
  {
    id: 'plague_doctor',
    num: 111,
    name: 'Чумной Доктор',
    shape: 'hexagon',
    baseColor: '#16a34a',
    hp: 190,
    speed: 3.2,
    damage: 28,
    inExclusiveCrate: true,
    cardSub: 'колба 28 + лечение 14',
    desc: '🧪 Чумной Доктор (190 HP): каждые 3.2 с бросает токсичную колбу на 28 урона и исцеляет себя на +14 HP!'
  },
  {
    id: 'gravity_hammer',
    num: 112,
    name: 'Грави-Молот',
    shape: 'square',
    baseColor: '#7c3aed',
    hp: 225,
    speed: 2.9,
    damage: 35,
    inExclusiveCrate: true,
    cardSub: 'грави-удар 35 + стяжка',
    desc: '🔨 Грави-Молот (225 HP): каждые 3.5 с создаёт гравитационный импульс на 35 урона, притягивающий соперников!'
  },
  {
    id: 'starlight_archer',
    num: 113,
    name: 'Звёздный Лучник',
    shape: 'triangle',
    baseColor: '#38bdf8',
    hp: 170,
    speed: 3.7,
    damage: 30,
    inExclusiveCrate: true,
    cardSub: '3 звёздные стрелы ×30',
    desc: '🌟 Звёздный Лучник (170 HP): каждые 2.8 с выпускает веером 3 сияющие астральные стрелы по 30 урона!'
  },
  {
    id: 'iron_juggernaut',
    num: 114,
    name: 'Джаггернаут',
    shape: 'hexagon',
    baseColor: '#475569',
    hp: 240,
    speed: 2.8,
    damage: 30,
    inExclusiveCrate: true,
    cardSub: '240 HP • таран 30 + отброс',
    desc: '🛡️ Стальной Джаггернаут (240 HP): каждые 3.3 с идёт на неудержимый таран на 30 урона, отбрасывая врагов!'
  },
  {
    id: 'crimson_duelist',
    num: 115,
    name: 'Алый Дуэлянт',
    shape: 'triangle',
    baseColor: '#e11d48',
    hp: 185,
    speed: 3.9,
    damage: 33,
    inExclusiveCrate: true,
    cardSub: 'багровый выпад 33',
    desc: '🤺 Алый Дуэлянт (185 HP): каждые 2.9 с делает молниеносный выпад и пускает багровую волну рапиры на 33 урона!'
  },
  {
    id: 'frost_shaman',
    num: 116,
    name: 'Морозный Шаман',
    shape: 'circle',
    baseColor: '#06b6d4',
    hp: 190,
    speed: 3.3,
    damage: 30,
    inExclusiveCrate: true,
    cardSub: '4 льдины бурана ×30',
    desc: '❄️ Морозный Шаман (190 HP): каждые 3.2 с вызывает вихрь из 4 ледяных кристаллов по 30 урона с замедлением!'
  },

  // 🔴 7 НОВЫХ МИФИЧЕСКИХ БОЙЦОВ (ЯЩИК «ЭКСКЛЮЗИВ»):
  {
    id: 'astral_monk',
    num: 117,
    name: 'Астральный Монах',
    shape: 'circle',
    baseColor: '#8b5cf6',
    hp: 275,
    speed: 3.7,
    damage: 45,
    inExclusiveCrate: true,
    cardSub: '3 удара Ци ×45 + хил 18',
    desc: '🧘 Астральный Монах (275 HP): каждые 3.2 с выпускает 3 астральных импульса по 45 урона и лечит себя на +18 HP!'
  },
  {
    id: 'cyber_valkyrie',
    num: 118,
    name: 'Кибер-Валькирия',
    shape: 'hexagon',
    baseColor: '#06b6d4',
    hp: 285,
    speed: 3.8,
    damage: 47,
    inExclusiveCrate: true,
    cardSub: '2 неоновых лазера ×47',
    desc: '🤖 Кибер-Валькирия (285 HP): каждые 3.2 с пикирует на цель и стреляет 2 пробивными лазерами по 47 урона!'
  },
  {
    id: 'magma_behemoth',
    num: 119,
    name: 'Магмовый Бегемот',
    shape: 'square',
    baseColor: '#dc2626',
    hp: 325,
    speed: 3.0,
    damage: 48,
    inExclusiveCrate: true,
    cardSub: '325 HP • взрыв вулкана 60',
    desc: '🌋 Магмовый Бегемот (325 HP): каждые 3.6 с сотрясает арену взрывом лавы вокруг себя на 60 урона!'
  },
  {
    id: 'shadow_emperor',
    num: 120,
    name: 'Император Теней',
    shape: 'triangle',
    baseColor: '#312e81',
    hp: 270,
    speed: 3.9,
    damage: 46,
    inExclusiveCrate: true,
    cardSub: 'теневой блинк + 2 серпа 46',
    desc: '🌑 Император Теней (270 HP): каждые 3.3 с телепортируется к врагу, рубит на 46 урона и выпускает 2 серпа тени!'
  },
  {
    id: 'crystal_archon',
    num: 121,
    name: 'Кристальный Архонт',
    shape: 'hexagon',
    baseColor: '#ec4899',
    hp: 280,
    speed: 3.5,
    damage: 44,
    inExclusiveCrate: true,
    cardSub: '4 алмазных луча ×44',
    desc: '💎 Кристальный Архонт (280 HP): каждые 3.2 с выпускает крестом 4 призматических снаряда по 44 урона!'
  },
  {
    id: 'tempest_djinn',
    num: 122,
    name: 'Джинн Урагана',
    shape: 'circle',
    baseColor: '#0284c7',
    hp: 265,
    speed: 4.0,
    damage: 45,
    inExclusiveCrate: true,
    cardSub: '3 штормовых вихря ×45',
    desc: '🌪️ Джинн Урагана (265 HP): каждые 3.1 с запускает веером 3 ураганных снаряда по 45 урона с мощным отбросом!'
  },
  {
    id: 'necro_alchemist',
    num: 123,
    name: 'Некро-Алхимик',
    shape: 'square',
    baseColor: '#65a30d',
    hp: 290,
    speed: 3.3,
    damage: 43,
    inExclusiveCrate: true,
    cardSub: 'эликсир 43 + вампир 20',
    desc: '🧪 Некро-Алхимик (290 HP): каждые 3.3 с кидает 2 некро-колбы по 43 урона и похищает +20 HP здоровья!'
  },

  // 🟡 5 НОВЫХ ЛЕГЕНДАРНЫХ БОЙЦОВ (ЯЩИК «ЭКСКЛЮЗИВ»):
  {
    id: 'celestial_phoenix',
    num: 124,
    name: 'Небесный Феникс',
    shape: 'triangle',
    baseColor: '#f97316',
    hp: 390,
    speed: 4.1,
    damage: 58,
    inExclusiveCrate: true,
    cardSub: '5 огненных перьев + хил 25',
    desc: '🦅 Небесный Феникс (390 HP): каждые 3.3 с выпускает веер из 5 солнечных шаров пламени и возрождает себе +25 HP!'
  },
  {
    id: 'abyss_leviathan',
    num: 125,
    name: 'Левиафан Бездны',
    shape: 'hexagon',
    baseColor: '#1e3a8a',
    hp: 430,
    speed: 3.5,
    damage: 62,
    inExclusiveCrate: true,
    cardSub: '430 HP • 3 цунами ×62',
    desc: '🐉 Левиафан Бездны (430 HP): каждые 3.5 с обрушивает 3 сокрушительные волны глубин по 62 урона с замедлением!'
  },
  {
    id: 'omega_prime',
    num: 126,
    name: 'Омега-Прайм',
    shape: 'square',
    baseColor: '#2563eb',
    hp: 420,
    speed: 3.6,
    damage: 60,
    inExclusiveCrate: true,
    cardSub: 'омега-луч 60 + 3 снаряда',
    desc: '🤖 Омега-Прайм (420 HP): каждые 3.4 с выжигает врагов сквозным омега-лучом на 60 урона и даёт залп из 3 плазма-ракет!'
  },
  {
    id: 'valkyrie_queen',
    num: 127,
    name: 'Королева Валькирий',
    shape: 'hexagon',
    baseColor: '#eab308',
    hp: 400,
    speed: 4.0,
    damage: 64,
    inExclusiveCrate: true,
    cardSub: 'копья света 64 + стан',
    desc: '👑 Королева Валькирий (400 HP): каждые 3.3 с поражает врагов небесными копьями на 64 урона с оглушением!'
  },
  {
    id: 'chaos_overlord',
    num: 128,
    name: 'Владыка Хаоса',
    shape: 'circle',
    baseColor: '#991b1b',
    hp: 410,
    speed: 3.8,
    damage: 62,
    inExclusiveCrate: true,
    cardSub: 'взрыв и 4 клинка хаоса ×62',
    desc: '🔥 Владыка Хаоса (410 HP): каждые 3.5 с выпускает 4 багровых метеора хаоса по 62 урона и поджигает арену!'
  },

  // 🌌 2 НОВЫХ ГАЛАКТИЧЕСКИХ БОЙЦА (ЯЩИК «ЭКСКЛЮЗИВ» • КАЖДЫЙ ЗАНИМАЕТ СРАЗУ 3 МЕСТА!):
  {
    id: 'galactic_lightning',
    num: 129,
    name: 'Молния',
    shape: 'hexagon',
    baseColor: '#38bdf8',
    hp: 850,
    speed: 5.2,
    damage: 100,
    squadWeight: 3,
    inExclusiveCrate: true,
    cardSub: '850 HP • молния 3.5с • рывок 100 (3 места)',
    desc: '⚡ Галактический боец «Молния» (850 HP, занимает сразу 3 места!): очень быстро двигается, каждые 3.5 с стреляет молнией во врагов, а каждые 5 с делает стремительный рывок и при задевании сносит 100 HP! Когда просто двигается без рывка — касанием урона не наносит.'
  },
  {
    id: 'skeleton_king',
    num: 130,
    name: 'Король скелетов',
    shape: 'hexagon',
    baseColor: '#f5f5f4',
    hp: 1100,
    speed: 2.1,
    damage: 65,
    squadWeight: 3,
    inExclusiveCrate: true,
    cardSub: '1100 HP • скелеты + 3 черепа (3 места)',
    desc: '👑💀 Галактический боец «Король скелетов» (1100 HP, занимает сразу 3 места!): в королевской мантии и золотой короне с двуручным костяным мечом (65 урона + 18 вампиризма). Каждые 4 с пускает веером 3 черепа душ (по 50 HP) и призывает скелетов-стражей! Дебаф: медленно ходит, раз в 7 с корона душ отнимает 20 HP и получает +20% урона от огня/взрывов.'
  },

  // ==================== 20 НОВЫХ БОЙЦОВ ИЗ «ЯЩИКА ЗА 35 МОНЕТ» (10 ОБЫЧНЫХ, 5 РЕДКИХ, 5 ЭПИЧЕСКИХ: №131–150) ====================
  // ⚪ 10 НОВЫХ ОБЫЧНЫХ БОЙЦОВ (ЯЩИК ЗА 35 МОНЕТ):
  {
    id: 'baker_pin',
    num: 131,
    name: 'Пекарь',
    shape: 'circle',
    baseColor: '#f59e0b',
    hp: 92,
    speed: 2.9,
    damage: 10,
    inCrate35: true,
    cardSub: 'скалка 10 урона',
    desc: '🥖 Пекарь со Скалкой (92 HP): размахивает тяжёлой деревянной скалкой и наносит 10 урона при столкновении!'
  },
  {
    id: 'fisherman_rod',
    num: 132,
    name: 'Рыбак',
    shape: 'triangle',
    baseColor: '#0284c7',
    hp: 88,
    speed: 3.1,
    damage: 9,
    inCrate35: true,
    cardSub: 'заброс крючка 9',
    desc: '🎣 Рыбак (88 HP): каждые 2.5 с забрасывает удочку с блесной во врага на 9 урона!'
  },
  {
    id: 'carpenter_saw',
    num: 133,
    name: 'Плотник',
    shape: 'square',
    baseColor: '#b45309',
    hp: 98,
    speed: 2.8,
    damage: 11,
    inCrate35: true,
    cardSub: 'ручная пила 11',
    desc: '🪚 Плотник (98 HP): вооружён острой столярной ножовкой и наносит 11 урона в ближнем бою!'
  },
  {
    id: 'tailor_scissors',
    num: 134,
    name: 'Портной',
    shape: 'triangle',
    baseColor: '#ec4899',
    hp: 86,
    speed: 3.3,
    damage: 10,
    inCrate35: true,
    cardSub: 'ножницы 10 урона',
    desc: '✂️ Портной (86 HP): проворно бегает по арене со стальными ножницами и стрижёт соперников на 10 урона!'
  },
  {
    id: 'lantern_watchman',
    num: 135,
    name: 'Сторож',
    shape: 'hexagon',
    baseColor: '#475569',
    hp: 104,
    speed: 2.7,
    damage: 10,
    inCrate35: true,
    cardSub: 'фонарь 10 урона',
    desc: '🏮 Ночной Сторож (104 HP): обходит дозором ринг и бьёт кованым фонарём на 10 урона!'
  },
  {
    id: 'shepherd_crook',
    num: 136,
    name: 'Пастух',
    shape: 'circle',
    baseColor: '#84cc16',
    hp: 94,
    speed: 3.1,
    damage: 9,
    inCrate35: true,
    cardSub: 'посох 9 + толчок',
    desc: '🐏 Пастух (94 HP): орудует изогнутым деревянным посохом, нанося 9 урона при ударе!'
  },
  {
    id: 'potter_jug',
    num: 137,
    name: 'Гончар',
    shape: 'square',
    baseColor: '#d97706',
    hp: 90,
    speed: 3.0,
    damage: 9,
    inCrate35: true,
    cardSub: 'бросок кувшина 9',
    desc: '🏺 Гончар (90 HP): каждые 2.6 с запускает во врага обожжённый глиняный кувшин на 9 урона!'
  },
  {
    id: 'chimney_sweep',
    num: 138,
    name: 'Трубочист',
    shape: 'circle',
    baseColor: '#334155',
    hp: 92,
    speed: 3.2,
    damage: 10,
    inCrate35: true,
    cardSub: 'ёршик на гире 10',
    desc: '🧹 Трубочист (92 HP): крутит чугунную гирю с ёршиком и сносит 10 HP при столкновении!'
  },
  {
    id: 'drummer_boy',
    num: 139,
    name: 'Барабанщик',
    shape: 'hexagon',
    baseColor: '#ef4444',
    hp: 95,
    speed: 3.1,
    damage: 9,
    inCrate35: true,
    cardSub: 'маршевый барабан 9',
    desc: '🥁 Полковой Барабанщик (95 HP): бодро марширует по арене и бьёт палочками на 9 урона!'
  },
  {
    id: 'bell_ringer',
    num: 140,
    name: 'Звонарь',
    shape: 'square',
    baseColor: '#eab308',
    hp: 102,
    speed: 2.8,
    damage: 11,
    inCrate35: true,
    cardSub: 'бронзовый колокол 11',
    desc: '🔔 Звонарь (102 HP): оглушительно бьёт тяжёлым медным колоколом на 11 урона!'
  },

  // 🟢 5 НОВЫХ РЕДКИХ БОЙЦОВ (ЯЩИК ЗА 35 МОНЕТ):
  {
    id: 'falconer_hawk',
    num: 141,
    name: 'Сокольник',
    shape: 'triangle',
    baseColor: '#a16207',
    hp: 130,
    speed: 3.5,
    damage: 18,
    inCrate35: true,
    cardSub: 'налёт сокола 18',
    desc: '🦅 Сокольник (130 HP): каждые 2.6 с отправляет в полёт охотничьего сокола, клюющего врага на 18 урона!'
  },
  {
    id: 'alchemist_bomb',
    num: 142,
    name: 'Гренадёр',
    shape: 'circle',
    baseColor: '#dc2626',
    hp: 140,
    speed: 3.0,
    damage: 20,
    inCrate35: true,
    cardSub: 'пороховая петарда 20',
    desc: '🧨 Гренадёр (140 HP): каждые 2.9 с кидает горящую пороховую петарду на 20 огненного урона!'
  },
  {
    id: 'gladiator_net',
    num: 143,
    name: 'Ретиарий',
    shape: 'square',
    baseColor: '#d97706',
    hp: 150,
    speed: 3.2,
    damage: 19,
    inCrate35: true,
    cardSub: 'трезубец и сеть 19',
    desc: '🔱 Гладиатор-Ретиарий (150 HP): каждые 2.8 с делает выпад с сетью и трезубцем на 19 урона с замедлением!'
  },
  {
    id: 'glacier_pikeman',
    num: 144,
    name: 'Ледоруб',
    shape: 'hexagon',
    baseColor: '#0284c7',
    hp: 155,
    speed: 2.9,
    damage: 20,
    inCrate35: true,
    cardSub: 'ледяной осколок 20',
    desc: '⛏️ Северный Ледоруб (155 HP): каждые 2.8 с откалывает ледяную глыбу и пускает её во врага на 20 урона!'
  },
  {
    id: 'desert_dervish',
    num: 145,
    name: 'Дервиш',
    shape: 'triangle',
    baseColor: '#eab308',
    hp: 135,
    speed: 3.8,
    damage: 17,
    inCrate35: true,
    cardSub: 'танец сабель 17',
    desc: '⚔️ Пустынный Дервиш (135 HP): каждые 2.6 с совершает вихревой рывок с парными саблями на 17 урона!'
  },

  // 🟣 5 НОВЫХ ЭПИЧЕСКИХ БОЙЦОВ (ЯЩИК ЗА 35 МОНЕТ):
  {
    id: 'arcane_arbalester',
    num: 146,
    name: 'Маго-Арбалетчик',
    shape: 'triangle',
    baseColor: '#7c3aed',
    hp: 175,
    speed: 3.5,
    damage: 30,
    inCrate35: true,
    cardSub: '2 рунных болта ×30',
    desc: '🏹 Маго-Арбалетчик (175 HP): каждые 2.9 с стреляет дуплетом из 2 пробивных магических болтов по 30 урона!'
  },
  {
    id: 'blood_samurai',
    num: 147,
    name: 'Кровавый Ронин',
    shape: 'triangle',
    baseColor: '#be123c',
    hp: 185,
    speed: 3.7,
    damage: 31,
    inCrate35: true,
    cardSub: 'клинок крови 31 + хил 12',
    desc: '🗡️ Кровавый Ронин (185 HP): каждые 3.0 с делает багровый разрез на 31 урона и восстанавливает +12 HP!'
  },
  {
    id: 'thunder_golem',
    num: 148,
    name: 'Грозовой Голем',
    shape: 'hexagon',
    baseColor: '#2563eb',
    hp: 220,
    speed: 2.7,
    damage: 29,
    inCrate35: true,
    cardSub: '220 HP • кулак грома 29',
    desc: '⚡ Грозовой Голем (220 HP): каждые 3.2 с выпускает разряд шаровой молнии на 29 урона с оглушением!'
  },
  {
    id: 'toxic_arachnid',
    num: 149,
    name: 'Тарантул',
    shape: 'circle',
    baseColor: '#15803d',
    hp: 180,
    speed: 3.6,
    damage: 28,
    inCrate35: true,
    cardSub: '2 плевка яда ×28',
    desc: '🕷️ Ядовитый Тарантул (180 HP): каждые 3.0 с выстреливает 2 сгустками едкого яда по 28 урона!'
  },
  {
    id: 'sun_paladin',
    num: 150,
    name: 'Паладин Света',
    shape: 'square',
    baseColor: '#f59e0b',
    hp: 210,
    speed: 3.1,
    damage: 30,
    inCrate35: true,
    cardSub: 'молот света 30 + хил 15',
    desc: '☀️ Паладин Света (210 HP): каждые 3.1 с поражает врага солнечным лучом на 30 урона и исцеляется на +15 HP!'
  }
];

// ==================== СИСТЕМА РЕДКОСТИ (6 РЕДКОСТЕЙ ВКЛЮЧАЯ ГАЛАКТИЧЕСКУЮ) И 6 ЯЩИКОВ/БОКСОВ В МАГАЗИНЕ ====================
const FIGHTER_RARITIES = [
  {
    id: 'common',
    order: 1,
    name: 'Обычная',
    badge: 'Обычный',
    color: '#64748b',
    bg: '#f1f5f9',
    border: '#475569',
    tierChance: 53.5,          // Контейнер бойцов (1 000 🪙)
    boxTierChance: 58,         // Бокс бойцов (50 🪙)
    crate500TierChance: 0,     // Ящик за 500 🪙
    miniCrate20TierChance: 75, // Маленький ящик за 20 🪙
    exclusiveTierChance: 0,    // Ящик «Эксклюзив» за 1 000 🪙
    crate35TierChance: 65,     // Ящик за 35 🪙 (10 обычных бойцов)
    fighters: [
      'swordsman', 'archer', 'shield', 'spearman', 'soldier',
      'healer', 'alchemist', 'boomerang', 'worm', 'werewolf',
      'lumberjack', 'slinger', 'blacksmith',
      // 5 обычных бойцов без способностей из «Бокса бойцов» (50 🪙):
      'paper_recruit', 'cardboard_pug', 'wooden_dummy', 'origami_frog', 'tin_peasant',
      // 5 обычных бойцов из «Маленького ящика» (20 🪙):
      'broom_janitor', 'cook_pan', 'gardener_fork', 'postman_bag', 'miner_pickaxe',
      // 10 обычных бойцов из «Ящика за 35 🪙»:
      'baker_pin', 'fisherman_rod', 'carpenter_saw', 'tailor_scissors', 'lantern_watchman',
      'shepherd_crook', 'potter_jug', 'chimney_sweep', 'drummer_boy', 'bell_ringer'
    ]
  },
  {
    id: 'rare',
    order: 2,
    name: 'Редкая',
    badge: 'Редкий',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#15803d',
    tierChance: 33,            // Контейнер бойцов (1 000 🪙)
    boxTierChance: 30,         // Бокс бойцов (50 🪙)
    crate500TierChance: 64,    // Ящик за 500 🪙 (12 редких бойцов)
    miniCrate20TierChance: 22, // Маленький ящик за 20 🪙 (4 редких бойца)
    exclusiveTierChance: 0,    // Ящик «Эксклюзив» за 1 000 🪙
    crate35TierChance: 25,     // Ящик за 35 🪙 (5 редких бойцов)
    fighters: [
      'gunslinger', 'pyro', 'cryo', 'thunder', 'berserker',
      'engineer', 'summoner', 'graviton', 'hunter', 'boxer',
      'musketeer', 'beekeeper', 'ice_golem',
      // 5 редких бойцов из «Бокса бойцов» (50 🪙):
      'crossbow_scout', 'fencer_fox', 'snow_thrower', 'torch_bearer', 'anchor_sailor',
      // 12 редких бойцов из «Ящика за 500 🪙»:
      'halberd_guard', 'dart_frog', 'shield_maiden', 'cannon_pirate', 'whip_tamer', 'bone_warrior',
      'rune_monk', 'saw_bot', 'flail_templar', 'sand_nomad', 'harpoon_diver', 'drum_shaman',
      // 4 редких бойца из «Маленького ящика за 20 🪙»:
      'jester_cards', 'ice_skater', 'bamboo_panda', 'alchemist_apprentice',
      // 5 редких бойцов из «Ящика за 35 🪙»:
      'falconer_hawk', 'alchemist_bomb', 'gladiator_net', 'glacier_pikeman', 'desert_dervish'
    ]
  },
  {
    id: 'epic',
    order: 3,
    name: 'Эпическая',
    badge: 'Эпический',
    color: '#9333ea',
    bg: '#f3e8ff',
    border: '#7e22ce',
    tierChance: 8,            // Контейнер бойцов (1 000 🪙)
    boxTierChance: 12,        // Бокс бойцов (50 🪙)
    crate500TierChance: 26,   // Ящик за 500 🪙 (6 эпических бойцов)
    miniCrate20TierChance: 3, // Маленький ящик за 20 🪙 (2 эпических бойца)
    exclusiveTierChance: 54,  // Ящик «Эксклюзив» за 1 000 🪙 (10 эпических бойцов)
    crate35TierChance: 10,    // Ящик за 35 🪙 (5 эпических бойцов)
    fighters: [
      'assassin', 'vampire', 'claws', 'giant', 'laser_bot',
      'teleporter', 'ninja', 'zombie', 'bibizyana',
      'samurai', 'cactus', 'magician_hat',
      // 6 эпических бойцов из «Бокса бойцов» (50 🪙):
      'wind_ronin', 'tesla_bot', 'witch_brew', 'magma_guard', 'crystal_sniper', 'shadow_scythe',
      // 6 эпических бойцов из «Ящика за 500 🪙»:
      'phantom_duelist', 'cyber_sniper', 'frost_valkyrie', 'inferno_executioner', 'storm_caller', 'venom_queen',
      // 2 эпических бойца из «Маленького ящика за 20 🪙»:
      'emerald_valkyrie', 'eclipse_ninja',
      // 10 эпических бойцов из ящика «Эксклюзив» (1 000 🪙):
      'chrono_assassin', 'lava_berserker', 'electro_spear', 'mirror_mage', 'plague_doctor',
      'gravity_hammer', 'starlight_archer', 'iron_juggernaut', 'crimson_duelist', 'frost_shaman',
      // 5 эпических бойцов из «Ящика за 35 🪙»:
      'arcane_arbalester', 'blood_samurai', 'thunder_golem', 'toxic_arachnid', 'sun_paladin'
    ]
  },
  {
    id: 'mythic',
    order: 4,
    name: 'Мифическая',
    badge: 'Мифический',
    color: '#e11d48',
    bg: '#ffe4e6',
    border: '#be123c',
    tierChance: 4,
    boxTierChance: 0,
    crate500TierChance: 10,  // Ящик за 500 🪙 (4 мифических бойца)
    miniCrate20TierChance: 0,
    exclusiveTierChance: 28, // Ящик «Эксклюзив» за 1 000 🪙 (7 мифических бойцов)
    crate35TierChance: 0,
    fighters: [
      'plasma_rex', 'robo_mech', 'bomber', 'fairy', 'card_master',
      'medusa', 'pavuk',
      'anubis', 'poseidon', 'meteor_knight',
      // 4 мифических бойца из «Ящика за 500 🪙»:
      'solar_pharaoh', 'void_reaper', 'mecha_titan', 'blood_archduke',
      // 7 мифических бойцов из ящика «Эксклюзив» (1 000 🪙):
      'astral_monk', 'cyber_valkyrie', 'magma_behemoth', 'shadow_emperor',
      'crystal_archon', 'tempest_djinn', 'necro_alchemist'
    ]
  },
  {
    id: 'legendary',
    order: 5,
    name: 'Легендарная',
    badge: 'Легендарный',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#b45309',
    tierChance: 1.5,
    boxTierChance: 0,
    crate500TierChance: 0,
    miniCrate20TierChance: 0,
    exclusiveTierChance: 15, // Ящик «Эксклюзив» за 1 000 🪙 (5 легендарных бойцов)
    crate35TierChance: 0,
    fighters: [
      'superman', 'checkmate', 'death', 'doubler', 'musician',
      'dragon', 'chronos', 'zeus', 'sky_guardian',
      // 5 легендарных бойцов из ящика «Эксклюзив» (1 000 🪙):
      'celestial_phoenix', 'abyss_leviathan', 'omega_prime', 'valkyrie_queen', 'chaos_overlord'
    ]
  },
  {
    id: 'galactic',
    order: 6,
    name: 'Галактическая',
    badge: 'Галактический',
    color: '#4f46e5',
    bg: '#e0e7ff',
    border: '#3730a3',
    tierChance: 0,
    boxTierChance: 0,
    crate500TierChance: 0,
    miniCrate20TierChance: 0,
    exclusiveTierChance: 3, // Ящик «Эксклюзив» за 1 000 🪙 (2 галактических бойца: Молния и Король скелетов)
    crate35TierChance: 0,
    fighters: [
      'galactic_lightning', 'skeleton_king'
    ]
  }
];

function isTripleSlotFighter(id) {
  if (!id) return false;
  const fc = FIGHTER_CLASSES.find(c => c.id === id);
  return Boolean(fc && fc.squadWeight === 3);
}

// Проставляем каждому бойцу его редкость, цвет редкости и шанс выпадения в соответствующем ящике/боксе
(function assignFighterRarities() {
  for (const fc of FIGHTER_CLASSES) {
    let foundTier = FIGHTER_RARITIES[0];
    for (const tier of FIGHTER_RARITIES) {
      if (tier.fighters.includes(fc.id)) {
        foundTier = tier;
        break;
      }
    }
    fc.rarity = foundTier.id;
    fc.rarityOrder = foundTier.order;
    fc.rarityName = foundTier.name;
    fc.rarityBadge = fc.id === 'sky_guardian'
      ? 'Небесный (3 места)'
      : (fc.squadWeight === 3 ? `${foundTier.badge} (3 места)` : foundTier.badge);
    fc.rarityColor = fc.id === 'sky_guardian' ? '#0284c7' : foundTier.color;
    fc.rarityBg = foundTier.bg;
    fc.rarityBorder = fc.id === 'sky_guardian' ? '#0284c7' : foundTier.border;
    fc.tierChance = foundTier.tierChance;
    fc.boxTierChance = foundTier.boxTierChance || 0;
    fc.crate500TierChance = foundTier.crate500TierChance || 0;
    fc.miniCrate20TierChance = foundTier.miniCrate20TierChance || 0;
    fc.exclusiveTierChance = foundTier.exclusiveTierChance || 0;
    fc.crate35TierChance = foundTier.crate35TierChance || 0;

    fc.inFighterBox = Boolean(fc.inFighterBox);
    fc.inCrate500 = Boolean(fc.inCrate500);
    fc.inMiniCrate20 = Boolean(fc.inMiniCrate20);
    fc.inExclusiveCrate = Boolean(fc.inExclusiveCrate);
    fc.inCrate35 = Boolean(fc.inCrate35);
    fc.inCrate =
      !fc.inFighterBox &&
      !fc.inCrate500 &&
      !fc.inMiniCrate20 &&
      !fc.inExclusiveCrate &&
      !fc.inCrate35 &&
      fc.id !== 'swordsman' &&
      fc.id !== 'sky_guardian';

    const crateCountInTier = foundTier.fighters.filter(id => {
      const fObj = FIGHTER_CLASSES.find(x => x.id === id);
      return id !== 'swordsman' && id !== 'sky_guardian' &&
        !(fObj && (fObj.inFighterBox || fObj.inCrate500 || fObj.inMiniCrate20 || fObj.inExclusiveCrate || fObj.inCrate35));
    }).length || 1;

    const boxCountInTier = foundTier.fighters.filter(id => {
      const fObj = FIGHTER_CLASSES.find(x => x.id === id);
      return Boolean(fObj && fObj.inFighterBox);
    }).length || 1;

    const crate500CountInTier = foundTier.fighters.filter(id => {
      const fObj = FIGHTER_CLASSES.find(x => x.id === id);
      return Boolean(fObj && fObj.inCrate500);
    }).length || 1;

    const miniCrate20CountInTier = foundTier.fighters.filter(id => {
      const fObj = FIGHTER_CLASSES.find(x => x.id === id);
      return Boolean(fObj && fObj.inMiniCrate20);
    }).length || 1;

    const exclusiveCountInTier = foundTier.fighters.filter(id => {
      const fObj = FIGHTER_CLASSES.find(x => x.id === id);
      return Boolean(fObj && fObj.inExclusiveCrate);
    }).length || 1;

    const crate35CountInTier = foundTier.fighters.filter(id => {
      const fObj = FIGHTER_CLASSES.find(x => x.id === id);
      return Boolean(fObj && fObj.inCrate35);
    }).length || 1;

    if (fc.inCrate) {
      fc.dropChance = Number((foundTier.tierChance / crateCountInTier).toFixed(2));
    } else if (fc.inFighterBox) {
      fc.dropChance = Number(((foundTier.boxTierChance || 0) / boxCountInTier).toFixed(2));
    } else if (fc.inCrate500) {
      fc.dropChance = Number(((foundTier.crate500TierChance || 0) / crate500CountInTier).toFixed(2));
    } else if (fc.inMiniCrate20) {
      fc.dropChance = Number(((foundTier.miniCrate20TierChance || 0) / miniCrate20CountInTier).toFixed(2));
    } else if (fc.inExclusiveCrate) {
      fc.dropChance = Number(((foundTier.exclusiveTierChance || 0) / exclusiveCountInTier).toFixed(2));
    } else if (fc.inCrate35) {
      fc.dropChance = Number(((foundTier.crate35TierChance || 0) / crate35CountInTier).toFixed(2));
    } else {
      fc.dropChance = 0;
    }
  }
})();

function getRarityInfo(rarityId) {
  return FIGHTER_RARITIES.find(r => r.id === rarityId) || FIGHTER_RARITIES[0];
}

function getFightersSortedByRarity() {
  return [...FIGHTER_CLASSES].sort((a, b) => {
    if (a.rarityOrder !== b.rarityOrder) return a.rarityOrder - b.rarityOrder;
    return a.num - b.num;
  });
}

function getFighterClass(id) {
  return FIGHTER_CLASSES.find(c => c.id === id) || FIGHTER_CLASSES[0];
}

// Цвет заливки фигуры в зависимости от команды и класса
function getUnitTeamColor(team, classId) {
  if (classId === 'sky_guardian') return team === 'player' ? '#38bdf8' : '#0284c7';
  if (classId === 'paper_recruit') return team === 'player' ? '#94a3b8' : '#64748b';
  if (classId === 'cardboard_pug') return team === 'player' ? '#d6a87c' : '#b48252';
  if (classId === 'wooden_dummy') return team === 'player' ? '#b48252' : '#854d0e';
  if (classId === 'origami_frog') return team === 'player' ? '#4ade80' : '#16a34a';
  if (classId === 'tin_peasant') return team === 'player' ? '#a1a1aa' : '#71717a';
  if (classId === 'crossbow_scout') return team === 'player' ? '#22c55e' : '#15803d';
  if (classId === 'fencer_fox') return team === 'player' ? '#fb923c' : '#ea580c';
  if (classId === 'snow_thrower') return team === 'player' ? '#60a5fa' : '#2563eb';
  if (classId === 'torch_bearer') return team === 'player' ? '#f59e0b' : '#d97706';
  if (classId === 'anchor_sailor') return team === 'player' ? '#0284c7' : '#0369a1';
  if (classId === 'wind_ronin') return team === 'player' ? '#14b8a6' : '#0f766e';
  if (classId === 'tesla_bot') return team === 'player' ? '#38bdf8' : '#0284c7';
  if (classId === 'witch_brew') return team === 'player' ? '#a855f7' : '#7e22ce';
  if (classId === 'magma_guard') return team === 'player' ? '#ef4444' : '#b91c1c';
  if (classId === 'crystal_sniper') return team === 'player' ? '#f472b6' : '#db2777';
  if (classId === 'shadow_scythe') return team === 'player' ? '#6d28d9' : '#4c1d95';
  if (classId === 'halberd_guard') return team === 'player' ? '#475569' : '#334155';
  if (classId === 'dart_frog') return team === 'player' ? '#10b981' : '#059669';
  if (classId === 'shield_maiden') return team === 'player' ? '#0284c7' : '#0369a1';
  if (classId === 'cannon_pirate') return team === 'player' ? '#b91c1c' : '#7f1d1d';
  if (classId === 'whip_tamer') return team === 'player' ? '#d97706' : '#b45309';
  if (classId === 'bone_warrior') return team === 'player' ? '#a8a29e' : '#78716c';
  if (classId === 'rune_monk') return team === 'player' ? '#06b6d4' : '#0891b2';
  if (classId === 'saw_bot') return team === 'player' ? '#64748b' : '#475569';
  if (classId === 'flail_templar') return team === 'player' ? '#eab308' : '#ca8a04';
  if (classId === 'sand_nomad') return team === 'player' ? '#f59e0b' : '#d97706';
  if (classId === 'harpoon_diver') return team === 'player' ? '#0ea5e9' : '#0284c7';
  if (classId === 'drum_shaman') return team === 'player' ? '#16a34a' : '#15803d';
  if (classId === 'phantom_duelist') return team === 'player' ? '#8b5cf6' : '#6d28d9';
  if (classId === 'cyber_sniper') return team === 'player' ? '#06b6d4' : '#0e7490';
  if (classId === 'frost_valkyrie') return team === 'player' ? '#38bdf8' : '#0284c7';
  if (classId === 'inferno_executioner') return team === 'player' ? '#dc2626' : '#991b1b';
  if (classId === 'storm_caller') return team === 'player' ? '#3b82f6' : '#1d4ed8';
  if (classId === 'venom_queen') return team === 'player' ? '#84cc16' : '#4d7c0f';
  if (classId === 'solar_pharaoh') return team === 'player' ? '#facc15' : '#ca8a04';
  if (classId === 'void_reaper') return team === 'player' ? '#4c1d95' : '#2e1065';
  if (classId === 'mecha_titan') return team === 'player' ? '#2563eb' : '#1e40af';
  if (classId === 'blood_archduke') return team === 'player' ? '#9f1239' : '#881337';
  if (classId === 'broom_janitor') return team === 'player' ? '#78716c' : '#57534e';
  if (classId === 'cook_pan') return team === 'player' ? '#fb923c' : '#ea580c';
  if (classId === 'gardener_fork') return team === 'player' ? '#22c55e' : '#16a34a';
  if (classId === 'postman_bag') return team === 'player' ? '#3b82f6' : '#2563eb';
  if (classId === 'miner_pickaxe') return team === 'player' ? '#eab308' : '#ca8a04';
  if (classId === 'jester_cards') return team === 'player' ? '#ec4899' : '#db2777';
  if (classId === 'ice_skater') return team === 'player' ? '#7dd3fc' : '#38bdf8';
  if (classId === 'bamboo_panda') return team === 'player' ? '#4ade80' : '#16a34a';
  if (classId === 'alchemist_apprentice') return team === 'player' ? '#a855f7' : '#7e22ce';
  if (classId === 'emerald_valkyrie') return team === 'player' ? '#10b981' : '#047857';
  if (classId === 'eclipse_ninja') return team === 'player' ? '#312e81' : '#1e1b4b';
  // 24 новых бойца из ящика «Эксклюзив» (1 000 🪙):
  if (classId === 'chrono_assassin') return team === 'player' ? '#6366f1' : '#4338ca';
  if (classId === 'lava_berserker') return team === 'player' ? '#ea580c' : '#c2410c';
  if (classId === 'electro_spear') return team === 'player' ? '#0284c7' : '#0369a1';
  if (classId === 'mirror_mage') return team === 'player' ? '#ec4899' : '#be185d';
  if (classId === 'plague_doctor') return team === 'player' ? '#16a34a' : '#15803d';
  if (classId === 'gravity_hammer') return team === 'player' ? '#7c3aed' : '#5b21b6';
  if (classId === 'starlight_archer') return team === 'player' ? '#38bdf8' : '#0284c7';
  if (classId === 'iron_juggernaut') return team === 'player' ? '#475569' : '#334155';
  if (classId === 'crimson_duelist') return team === 'player' ? '#e11d48' : '#9f1239';
  if (classId === 'frost_shaman') return team === 'player' ? '#06b6d4' : '#0e7490';
  if (classId === 'astral_monk') return team === 'player' ? '#8b5cf6' : '#6d28d9';
  if (classId === 'cyber_valkyrie') return team === 'player' ? '#06b6d4' : '#0891b2';
  if (classId === 'magma_behemoth') return team === 'player' ? '#dc2626' : '#991b1b';
  if (classId === 'shadow_emperor') return team === 'player' ? '#312e81' : '#1e1b4b';
  if (classId === 'crystal_archon') return team === 'player' ? '#ec4899' : '#db2777';
  if (classId === 'tempest_djinn') return team === 'player' ? '#0284c7' : '#075985';
  if (classId === 'necro_alchemist') return team === 'player' ? '#65a30d' : '#3f6212';
  if (classId === 'celestial_phoenix') return team === 'player' ? '#f97316' : '#ea580c';
  if (classId === 'abyss_leviathan') return team === 'player' ? '#1e3a8a' : '#172554';
  if (classId === 'omega_prime') return team === 'player' ? '#2563eb' : '#1d4ed8';
  if (classId === 'valkyrie_queen') return team === 'player' ? '#eab308' : '#ca8a04';
  if (classId === 'chaos_overlord') return team === 'player' ? '#991b1b' : '#7f1d1d';
  if (classId === 'galactic_lightning') return team === 'player' ? '#38bdf8' : '#0284c7';
  if (classId === 'skeleton_king') return team === 'player' ? '#f5f5f4' : '#d6d3d1';
  // 20 новых бойцов из ящика за 35 🪙:
  if (classId === 'baker_pin') return team === 'player' ? '#f59e0b' : '#d97706';
  if (classId === 'fisherman_rod') return team === 'player' ? '#0284c7' : '#0369a1';
  if (classId === 'carpenter_saw') return team === 'player' ? '#b45309' : '#92400e';
  if (classId === 'tailor_scissors') return team === 'player' ? '#ec4899' : '#db2777';
  if (classId === 'lantern_watchman') return team === 'player' ? '#475569' : '#334155';
  if (classId === 'shepherd_crook') return team === 'player' ? '#84cc16' : '#65a30d';
  if (classId === 'potter_jug') return team === 'player' ? '#d97706' : '#b45309';
  if (classId === 'chimney_sweep') return team === 'player' ? '#334155' : '#1e293b';
  if (classId === 'drummer_boy') return team === 'player' ? '#ef4444' : '#dc2626';
  if (classId === 'bell_ringer') return team === 'player' ? '#eab308' : '#ca8a04';
  if (classId === 'falconer_hawk') return team === 'player' ? '#a16207' : '#854d0e';
  if (classId === 'alchemist_bomb') return team === 'player' ? '#dc2626' : '#b91c1c';
  if (classId === 'gladiator_net') return team === 'player' ? '#d97706' : '#b45309';
  if (classId === 'glacier_pikeman') return team === 'player' ? '#0284c7' : '#0369a1';
  if (classId === 'desert_dervish') return team === 'player' ? '#eab308' : '#ca8a04';
  if (classId === 'arcane_arbalester') return team === 'player' ? '#7c3aed' : '#6d28d9';
  if (classId === 'blood_samurai') return team === 'player' ? '#be123c' : '#9f1239';
  if (classId === 'thunder_golem') return team === 'player' ? '#2563eb' : '#1d4ed8';
  if (classId === 'toxic_arachnid') return team === 'player' ? '#15803d' : '#166534';
  if (classId === 'sun_paladin') return team === 'player' ? '#f59e0b' : '#d97706';
  if (classId === 'lumberjack') return team === 'player' ? '#dc2626' : '#991b1b';
  if (classId === 'slinger') return team === 'player' ? '#ca8a04' : '#854d0e';
  if (classId === 'blacksmith') return team === 'player' ? '#475569' : '#334155';
  if (classId === 'musketeer') return team === 'player' ? '#2563eb' : '#1e40af';
  if (classId === 'beekeeper') return team === 'player' ? '#eab308' : '#ca8a04';
  if (classId === 'ice_golem') return team === 'player' ? '#38bdf8' : '#0284c7';
  if (classId === 'samurai') return team === 'player' ? '#b91c1c' : '#7f1d1d';
  if (classId === 'cactus') return team === 'player' ? '#16a34a' : '#15803d';
  if (classId === 'magician_hat') return team === 'player' ? '#7c3aed' : '#5b21b6';
  if (classId === 'anubis') return team === 'player' ? '#d97706' : '#92400e';
  if (classId === 'poseidon') return team === 'player' ? '#0284c7' : '#0369a1';
  if (classId === 'meteor_knight') return team === 'player' ? '#ea580c' : '#9a3412';
  if (classId === 'dragon') return team === 'player' ? '#ef4444' : '#b91c1c';
  if (classId === 'chronos') return team === 'player' ? '#eab308' : '#a16207';
  if (classId === 'zeus') return team === 'player' ? '#facc15' : '#ca8a04';

  if (classId === 'musician') return team === 'player' ? '#d97706' : '#b45309';
  if (classId === 'pavuk') return team === 'player' ? '#3730a3' : '#4c1d95';
  if (classId === 'bibizyana') return team === 'player' ? '#92400e' : '#78350f';
  if (classId === 'medusa') return team === 'player' ? '#06b6d4' : '#0891b2';

  if (classId === 'bomber') return team === 'player' ? '#ea580c' : '#dc2626';
  if (classId === 'checkmate') return team === 'player' ? '#334155' : '#1e293b';
  if (classId === 'death') return team === 'player' ? '#1e293b' : '#0f172a';
  if (classId === 'fairy') return team === 'player' ? '#f472b6' : '#ec4899';
  if (classId === 'card_master') return team === 'player' ? '#b45309' : '#991b1b';
  if (classId === 'doubler') return team === 'player' ? '#f59e0b' : '#d97706';

  // Оборотень: коричневый цвет, который меняет оттенок при смене команды!
  if (classId === 'werewolf') return team === 'player' ? '#8b5a2b' : '#a84225';
  if (classId === 'ninja') return team === 'player' ? '#334155' : '#475569';
  if (classId === 'robo_mech') return team === 'player' ? '#64748b' : '#78716c';
  if (classId === 'boxer') return team === 'player' ? '#2563eb' : '#e11d48';
  if (classId === 'hunter') return team === 'player' ? '#78350f' : '#9a3412';
  if (classId === 'zombie') return team === 'player' ? '#4d7c0f' : '#3f6212';

  if (classId === 'vampire') return team === 'player' ? '#581c87' : '#881337';
  if (classId === 'worm') return team === 'player' ? '#65c454' : '#e07a2b';
  if (classId === 'superman') return team === 'player' ? '#2563eb' : '#dc2626';
  if (classId === 'soldier') return team === 'player' ? '#5c8d36' : '#b45309';
  if (classId === 'claws') return team === 'player' ? '#eab308' : '#d97706';
  if (classId === 'giant') return team === 'player' ? '#3b82f6' : '#ea580c';
  if (classId === 'laser_bot') return team === 'player' ? '#06b6d4' : '#e11d48';
  if (classId === 'teleporter') return team === 'player' ? '#8b5cf6' : '#c026d3';
  if (classId === 'plasma_rex') return team === 'player' ? '#ec4899' : '#be123c';

  if (team === 'player') {
    if (classId === 'healer' || classId === 'alchemist') return '#7fd962';
    if (classId === 'summoner' || classId === 'assassin' || classId === 'graviton') return '#9e68e6';
    if (classId === 'cryo') return '#75c0fa';
    return '#4692e8';
  } else {
    if (classId === 'healer' || classId === 'alchemist') return '#e38846';
    if (classId === 'summoner' || classId === 'assassin' || classId === 'graviton') return '#d9527a';
    return '#ef5b50';
  }
}

// Отрисовка геометрической фигуры бойца
function drawFighterBody(ctx, shape, x, y, radius, fillColor, strokeColor = '#1c1a17', lineWidth = 2.6, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
  } else if (shape === 'triangle') {
    const r = radius * 1.15;
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.92, r * 0.82);
    ctx.lineTo(-r * 0.92, r * 0.82);
    ctx.closePath();
  } else if (shape === 'square') {
    const s = radius * 1.65;
    ctx.rect(-s / 2, -s / 2, s, s);
  } else if (shape === 'hexagon') {
    const r = radius * 1.08;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Отрисовка корпуса бойца «Шах и Мат» в раскраске шахматной доски (чёрно-белые клетки)
function drawChessboardBody(ctx, shape, x, y, radius, strokeColor = '#1c1a17', lineWidth = 2.6, flashWhite = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
  } else if (shape === 'triangle') {
    const r = radius * 1.15;
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.92, r * 0.82);
    ctx.lineTo(-r * 0.92, r * 0.82);
    ctx.closePath();
  } else if (shape === 'hexagon') {
    const r = radius * 1.08;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    const s = radius * 1.65;
    ctx.rect(-s / 2, -s / 2, s, s);
  }

  ctx.save();
  ctx.clip();
  const box = radius * 1.75;
  const cells = 4;
  const cellSize = (box * 2) / cells;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isDark = (r + c) % 2 === 1;
      ctx.fillStyle = flashWhite ? '#ffffff' : (isDark ? '#1c1a17' : '#ffffff');
      ctx.fillRect(-box + c * cellSize, -box + r * cellSize, cellSize + 0.5, cellSize + 0.5);
    }
  }
  ctx.restore();

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

// Отрисовка 2 маленьких белых клыков Вампира прямо на его теле
function drawVampireFangs(ctx, x, y, radius, aimAngle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(aimAngle);

  // Два маленьких белых клыка, торчащих спереди
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 1.8;
  ctx.lineJoin = 'round';

  for (const dir of [-1, 1]) {
    const fy = dir * (radius * 0.36);
    const fx = radius * 0.72;
    ctx.beginPath();
    ctx.moveTo(fx, fy - 3.8);
    ctx.lineTo(fx + 10, fy);
    ctx.lineTo(fx, fy + 3.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Зловещие красные глазки
  ctx.fillStyle = '#ff2e2e';
  ctx.beginPath();
  ctx.arc(radius * 0.28, -radius * 0.32, 2.5, 0, Math.PI * 2);
  ctx.arc(radius * 0.28, radius * 0.32, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Отрисовка иконки оружия / способности рядом с бойцом
function drawWeaponGraphic(ctx, abilityId, x, y, scale = 1, angle = -Math.PI / 4, team = 'player') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  switch (abilityId) {
    case 'swordsman': {
      ctx.fillStyle = '#e8ecf2';
      ctx.beginPath();
      ctx.moveTo(4, -3);
      ctx.lineTo(22, -3);
      ctx.lineTo(27, 0);
      ctx.lineTo(22, 3);
      ctx.lineTo(4, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, -7);
      ctx.lineTo(4, 7);
      ctx.stroke();
      ctx.fillStyle = '#8b5e3c';
      ctx.fillRect(-3, -2, 7, 4);
      ctx.strokeRect(-3, -2, 7, 4);
      break;
    }

    case 'archer': {
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(-2, 0, 13, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(1, -12.5);
      ctx.lineTo(1, 12.5);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-1, 0);
      ctx.lineTo(18, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, -4);
      ctx.lineTo(19, 0);
      ctx.lineTo(14, 4);
      ctx.stroke();
      break;
    }

    case 'shield': {
      ctx.fillStyle = '#e5ebf0';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.quadraticCurveTo(9, -11, 9, 0);
      ctx.quadraticCurveTo(9, 11, 0, 13);
      ctx.quadraticCurveTo(-4, 6, -4, 0);
      ctx.quadraticCurveTo(-4, -6, 0, -11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'gunslinger': {
      ctx.fillStyle = '#d8dee6';
      ctx.beginPath();
      ctx.rect(0, -5, 16, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7c6f64';
      ctx.beginPath();
      ctx.rect(-2, 1, 6, 7);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, -2);
      ctx.lineTo(12, -2);
      ctx.stroke();
      break;
    }

    case 'soldier': {
      // Компактный скорострельный тактический пистолет Солдата + белые пульки
      ctx.fillStyle = '#4b5563';
      ctx.beginPath();
      ctx.rect(0, -4.5, 15, 5.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.rect(-2, 1, 5.5, 6.5);
      ctx.fill();
      ctx.stroke();
      // Белая пулька у дула
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(19, -2, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'pyro': {
      ctx.rotate(-angle);
      ctx.fillStyle = '#ff9233';
      ctx.strokeStyle = '#d9411e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.bezierCurveTo(9, -4, 10, 7, 0, 11);
      ctx.bezierCurveTo(-10, 7, -9, -4, 0, -13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.bezierCurveTo(4, 0, 4, 6, 0, 9);
      ctx.bezierCurveTo(-4, 6, -4, 0, 0, -5);
      ctx.fill();
      break;
    }

    case 'cryo': {
      ctx.rotate(-angle);
      ctx.strokeStyle = '#3898ec';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 3) * i);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -12);
        ctx.moveTo(0, -7);
        ctx.lineTo(-3.5, -10);
        ctx.moveTo(0, -7);
        ctx.lineTo(3.5, -10);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'thunder': {
      ctx.rotate(-angle);
      ctx.fillStyle = '#ff5733';
      ctx.strokeStyle = '#c72c1c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(3, -13);
      ctx.lineTo(-6, 1);
      ctx.lineTo(0, 1);
      ctx.lineTo(-4, 13);
      ctx.lineTo(7, -2);
      ctx.lineTo(1, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'alchemist': {
      ctx.rotate(-angle);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-3, -11);
      ctx.lineTo(3, -11);
      ctx.lineTo(3, -5);
      ctx.lineTo(10, 9);
      ctx.quadraticCurveTo(10, 12, 7, 12);
      ctx.lineTo(-7, 12);
      ctx.quadraticCurveTo(-10, 12, -10, 9);
      ctx.lineTo(-3, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7ce058';
      ctx.beginPath();
      ctx.moveTo(-5, 2);
      ctx.lineTo(5, 2);
      ctx.lineTo(8.5, 9.5);
      ctx.lineTo(-8.5, 9.5);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'spearman': {
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();

      ctx.fillStyle = '#e8ecf2';
      ctx.beginPath();
      ctx.moveTo(18, -4.5);
      ctx.lineTo(29, 0);
      ctx.lineTo(18, 4.5);
      ctx.lineTo(20, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'berserker': {
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();

      ctx.fillStyle = '#dce2e8';
      ctx.beginPath();
      ctx.moveTo(12, -2);
      ctx.quadraticCurveTo(21, -12, 23, -3);
      ctx.quadraticCurveTo(24, 5, 19, 11);
      ctx.quadraticCurveTo(13, 6, 12, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'boomerang': {
      ctx.fillStyle = '#eef2f7';
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.arc(0, 0, 12, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.arc(4, 0, 9, Math.PI * 0.4, -Math.PI * 0.4, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'summoner': {
      ctx.rotate(-angle);
      ctx.fillStyle = '#efe8fa';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(4, -5, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-4, 6, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'healer': {
      ctx.rotate(-angle);
      ctx.fillStyle = '#86d96a';
      ctx.lineWidth = 2.2;
      const w = 4, l = 10;
      ctx.beginPath();
      ctx.moveTo(-w, -l);
      ctx.lineTo(w, -l);
      ctx.lineTo(w, -w);
      ctx.lineTo(l, -w);
      ctx.lineTo(l, w);
      ctx.lineTo(w, w);
      ctx.lineTo(w, l);
      ctx.lineTo(-w, l);
      ctx.lineTo(-w, w);
      ctx.lineTo(-l, w);
      ctx.lineTo(-l, -w);
      ctx.lineTo(-w, -w);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'engineer': {
      ctx.rotate(-angle);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-9, 2);
      ctx.lineTo(0, 2);
      ctx.stroke();

      ctx.fillStyle = team === 'bot' ? '#ef5b50' : '#4692e8';
      ctx.fillRect(0, -5, 13, 13);
      ctx.strokeRect(0, -5, 13, 13);

      ctx.fillRect(4, -9, 5, 4);
      ctx.strokeRect(4, -9, 5, 4);
      ctx.beginPath();
      ctx.moveTo(9, -7);
      ctx.lineTo(15, -7);
      ctx.stroke();
      break;
    }

    case 'assassin': {
      ctx.rotate(-angle);
      ctx.lineWidth = 2.4;
      for (const dir of [-1, 1]) {
        ctx.save();
        ctx.rotate(dir * 0.65);
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(0, -11);
        ctx.moveTo(-4.5, 4);
        ctx.lineTo(4.5, 4);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'graviton': {
      ctx.rotate(-angle);
      ctx.fillStyle = '#5c3c92';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#d3b8ff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 1.4);
      ctx.stroke();
      ctx.strokeStyle = '#1c1a17';
      ctx.beginPath();
      ctx.arc(0, 0, 12, -0.5, 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 12, 2.5, 4.2);
      ctx.stroke();
      break;
    }

    // ==================== ОРУЖИЕ 9 НОВЫХ БОЙЦОВ ====================
    case 'superman': {
      // Алмазный щит Супермена с лазерными лучами
      ctx.rotate(-angle);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-8, -9);
      ctx.lineTo(8, -9);
      ctx.lineTo(11, -2);
      ctx.lineTo(0, 11);
      ctx.lineTo(-11, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = '900 12px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', 0, -1);
      break;
    }

    case 'worm': {
      // Мини-сегменты хвоста гусеницы
      ctx.rotate(-angle);
      const cols = ['#86efac', '#4ade80', '#22c55e'];
      for (let i = 2; i >= 0; i--) {
        ctx.fillStyle = cols[i];
        ctx.beginPath();
        ctx.arc(-6 + i * 6, i * 2 - 2, 6 - i * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    case 'vampire': {
      // Пара острых белых клыков с каплями
      ctx.rotate(-angle);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2;
      for (const dx of [-5, 5]) {
        ctx.beginPath();
        ctx.moveTo(dx - 3.5, -7);
        ctx.lineTo(dx + 3.5, -7);
        ctx.lineTo(dx, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(5, 9, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'claws': {
      // Тройные стальные когти Росомахи
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2;
      for (const offset of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.moveTo(0, offset - 1.8);
        ctx.lineTo(18, offset);
        ctx.lineTo(0, offset + 1.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    case 'giant': {
      // Кулак / символ увеличения ×2
      ctx.rotate(-angle);
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2;
      ctx.beginPath();
      roundRectPath(ctx, -9, -9, 18, 18, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1c1a17';
      ctx.font = '900 10px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('2X', 0, 1);
      break;
    }

    case 'laser_bot': {
      // Лазерный излучатель с лучом
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();
      break;
    }

    case 'teleporter': {
      // Двойное кольцо портала
      ctx.rotate(-angle);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#c4b5fd';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'plasma_rex': {
      // Энергетические розово-неоновые когти + лазерный прицел
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2;
      for (const offset of [-5, 5]) {
        ctx.beginPath();
        ctx.moveTo(0, offset - 2);
        ctx.lineTo(19, offset);
        ctx.lineTo(0, offset + 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(23, 0);
      ctx.stroke();
      break;
    }

    // ==================== ОРУЖИЕ 6 ЕЩЁ НОВЫХ БОЙЦОВ (№26 – №31) ====================
    case 'ninja': {
      // Узкая изогнутая катана ниндзя + сюрикен сбоку
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(3, -2);
      ctx.quadraticCurveTo(15, -3.5, 28, -0.5);
      ctx.lineTo(24, 2.5);
      ctx.quadraticCurveTo(14, 1.5, 3, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Круглая гарда (цуба) и чёрная рукоять
      ctx.beginPath();
      ctx.moveTo(3, -5.5);
      ctx.lineTo(3, 5.5);
      ctx.stroke();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4, -2, 7, 4);
      ctx.strokeRect(-4, -2, 7, 4);
      break;
    }

    case 'robo_mech': {
      // Массивный стальной бронещит с заклёпками (20% шанс полного блока)
      ctx.rotate(-angle);
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(10, -10);
      ctx.lineTo(12, 2);
      ctx.lineTo(0, 12);
      ctx.lineTo(-12, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Светящийся визор-ядро
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.rect(-6, -5, 12, 4);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'boxer': {
      // Красная боксёрская перчатка
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(9, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Большой палец перчатки и манжета
      ctx.beginPath();
      ctx.arc(6, -6.5, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -5.5, 4.5, 11);
      ctx.strokeRect(-1, -5.5, 4.5, 11);
      break;
    }

    case 'hunter': {
      // Дробовик с широким стволом и деревянным прикладом
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-5, 3);
      ctx.lineTo(5, 0);
      ctx.lineTo(5, 5);
      ctx.lineTo(-4, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.fillRect(2, -4, 19, 5);
      ctx.strokeRect(2, -4, 19, 5);
      // Цевьё помпы
      ctx.fillStyle = '#92400e';
      ctx.fillRect(7, 1, 8, 3.5);
      ctx.strokeRect(7, 1, 8, 3.5);
      break;
    }

    case 'zombie': {
      // Вытянутые зелёные руки зомби + значок биологической угрозы / черепка
      ctx.fillStyle = '#65a30d';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.1;
      for (const dy of [-5, 5]) {
        ctx.beginPath();
        roundRectPath(ctx, -1, dy - 2.5, 14, 5, 2.5);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    case 'werewolf': {
      // Маленькие белые когти Оборотня (отрисовываются также прямо на корпусе)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.9;
      for (const offset of [-4.5, 0, 4.5]) {
        ctx.beginPath();
        ctx.moveTo(0, offset - 1.5);
        ctx.lineTo(10, offset);
        ctx.lineTo(0, offset + 1.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    // ==================== ОРУЖИЕ 6 НОВЫХ БОЙЦОВ (№32 – №37) ====================
    case 'bomber': {
      // Круглая чёрная бомба с горящим фитилём в руках Подрывника
      ctx.rotate(-angle);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 2, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Блик на бомбе
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(-3, -1, 2.3, 0, Math.PI * 2);
      ctx.fill();

      // Горловина и искрящийся фитиль
      ctx.fillStyle = '#475569';
      ctx.fillRect(-3, -9.5, 6, 3.5);
      ctx.strokeRect(-3, -9.5, 6, 3.5);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -9.5);
      ctx.quadraticCurveTo(4, -14, 7, -12);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(7.5, -12, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'checkmate': {
      // Фигурка шахматной пешки
      ctx.rotate(-angle);
      drawChessPawn(ctx, 0, 0, 1.25, '#ffffff');
      break;
    }

    case 'death': {
      // Большая изогнутая Коса Смерти (наносит 30 урона при столкновении)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-6, 10);
      ctx.lineTo(18, -10);
      ctx.stroke();

      // Широкое серповидное лезвие косы
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(15, -11);
      ctx.quadraticCurveTo(28, -2, 22, 13);
      ctx.quadraticCurveTo(18, 2, 11, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'fairy': {
      // Волшебная палочка Феи со звездой на верхушке
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-4, 7);
      ctx.lineTo(11, -5);
      ctx.stroke();

      // Золотая 5-конечная звёздочка на конце палочки
      ctx.save();
      ctx.translate(13, -7);
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        ctx.lineTo(Math.cos(a1) * 7.5, Math.sin(a1) * 7.5);
        ctx.lineTo(Math.cos(a2) * 3.2, Math.sin(a2) * 3.2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'card_master': {
      // Веер из 3 игральных карт Карточника
      ctx.rotate(-angle);
      const suitsColors = ['#dc2626', '#1c1a17', '#dc2626'];
      const angles = [-0.28, 0, 0.28];
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate(angles[i]);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1c1a17';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        roundRectPath(ctx, -5.5, -10, 11, 16, 2);
        ctx.fill();
        ctx.stroke();
        //ромбик масти в центре карты
        ctx.fillStyle = suitsColors[i];
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(3, -2);
        ctx.lineTo(0, 1);
        ctx.lineTo(-3, -2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'doubler': {
      // Знак геометрического умножения «×2»
      ctx.rotate(-angle);
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      roundRectPath(ctx, -10, -9, 20, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.font = '900 10px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('×2', 0, 0.5);
      break;
    }

    // ==================== ОРУЖИЕ 4 НОВЫХ БОЙЦОВ (№38 – №41) ====================
    case 'musician': {
      // Треугольная деревянная балалайка с грифом и струнами
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.1;
      // Треугольный корпус балалайки
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-9, -11);
      ctx.lineTo(-9, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Гриф балалайки
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, -2.2, 16, 4.4);
      ctx.strokeRect(6, -2.2, 16, 4.4);

      // Резонаторное отверстие (розетка)
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(-2.5, 0, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Струны
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-6, -1);
      ctx.lineTo(20, -1);
      ctx.moveTo(-6, 1);
      ctx.lineTo(20, 1);
      ctx.stroke();
      break;
    }

    case 'pavuk': {
      // Значок паутины Павука
      ctx.rotate(-angle);
      drawSpiderWebGraphic(ctx, 0, 0, 11, '#ffffff', '#1c1a17');
      break;
    }

    case 'bibizyana': {
      // Спелый жёлтый банан Бибизяны
      ctx.rotate(-angle);
      drawBananaGraphic(ctx, 0, 0, 1.05, -0.2);
      break;
    }

    case 'medusa': {
      // Электрические щупальца Медузы с искрами молний
      ctx.rotate(-angle);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.3;
      for (const dy of [-5, 0, 5]) {
        ctx.beginPath();
        ctx.moveTo(-8, dy);
        ctx.quadraticCurveTo(-2, dy - 3.5, 3, dy);
        ctx.quadraticCurveTo(8, dy + 3.5, 13, dy);
        ctx.stroke();
      }
      // Искры электричества
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(2, -9);
      ctx.lineTo(-2, -1);
      ctx.lineTo(2, -1);
      ctx.lineTo(-1, 8);
      ctx.lineTo(6, 0);
      ctx.lineTo(2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    // ==================== ОРУЖИЕ 15 НОВЫХ БОЙЦОВ ====================
    case 'lumberjack': {
      // Топор Дровосека
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      roundRectPath(ctx, -12, -2.5, 28, 5, 2);
      ctx.fill();
      ctx.stroke();
      // Лезвие топора
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(6, -2);
      ctx.lineTo(15, -13);
      ctx.quadraticCurveTo(19, 0, 15, 13);
      ctx.lineTo(6, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'slinger': {
      // Праща с камнем
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 10, -Math.PI * 0.7, Math.PI * 0.7);
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(9, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'blacksmith': {
      // Раскалённый молот Кузнеца
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      roundRectPath(ctx, -10, -2.5, 22, 5, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      roundRectPath(ctx, 6, -10, 11, 20, 3);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'musketeer': {
      // Изящная шпага-рапира Мушкетёра с золотой гардой
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, -1.8);
      ctx.lineTo(30, 0);
      ctx.lineTo(0, 1.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Чашеобразная золотая гарда
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, -Math.PI * 0.5, Math.PI * 0.5, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'beekeeper': {
      // Пчелиный улей и пчёлка
      ctx.rotate(-angle);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, -3);
      ctx.lineTo(8, -3);
      ctx.moveTo(-8, 3);
      ctx.lineTo(8, 3);
      ctx.stroke();
      ctx.fillStyle = '#1c1a17';
      ctx.beginPath();
      ctx.arc(0, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'ice_golem': {
      // Огромный ледяной кристалл-кулак
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(-6, -9);
      ctx.lineTo(8, -11);
      ctx.lineTo(16, 0);
      ctx.lineTo(8, 11);
      ctx.lineTo(-6, 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'samurai': {
      // Длинная изогнутая катана Самурая с красной рукоятью
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      roundRectPath(ctx, -11, -2.5, 11, 5, 1.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      roundRectPath(ctx, -1, -6.5, 3.5, 13, 1);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(2, -2.5);
      ctx.quadraticCurveTo(18, -4.5, 30, -1);
      ctx.lineTo(27, 2.5);
      ctx.quadraticCurveTo(15, 0.5, 2, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'cactus': {
      // Ветвистый зелёный кактус с красным цветком сверху
      ctx.rotate(-angle);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      roundRectPath(ctx, -4, -11, 8, 22, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      roundRectPath(ctx, -10, -4, 6, 8, 3);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      roundRectPath(ctx, 4, -6, 6, 8, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, -12, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'magician_hat': {
      // Чёрный цилиндр Фокусника с фиолетовой лентой
      ctx.rotate(-angle);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      roundRectPath(ctx, -12, 5, 24, 4, 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      roundRectPath(ctx, -8, -10, 16, 15, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.rect(-8, 1, 16, 4);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'anubis': {
      // Золотой египетский посох Уас / Анкх Анубиса
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      roundRectPath(ctx, -10, -2, 26, 4, 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(17, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.arc(17, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'poseidon': {
      // Золотой морской Трезубец Посейдона
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      roundRectPath(ctx, -12, -2, 24, 4, 1.5);
      ctx.fill();
      ctx.stroke();
      // Три зубца
      ctx.beginPath();
      ctx.moveTo(10, -9);
      ctx.lineTo(22, -9);
      ctx.lineTo(18, -5);
      ctx.lineTo(12, -5);
      ctx.moveTo(12, -2);
      ctx.lineTo(25, 0);
      ctx.lineTo(12, 2);
      ctx.moveTo(10, 9);
      ctx.lineTo(22, 9);
      ctx.lineTo(18, 5);
      ctx.lineTo(12, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'meteor_knight': {
      // Пылающий метеорит с огненным шлейфом
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(4, -10);
      ctx.lineTo(8, 0);
      ctx.lineTo(4, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.arc(6, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'dragon': {
      // Огненное крыло и пламя Дракона
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.quadraticCurveTo(10, -14, 20, 0);
      ctx.quadraticCurveTo(10, 14, -6, 8);
      ctx.quadraticCurveTo(2, 0, -6, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(9, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'chronos': {
      // Золотые песочные часы Хроноса
      ctx.rotate(-angle);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-8, -10);
      ctx.lineTo(8, -10);
      ctx.lineTo(2, 0);
      ctx.lineTo(8, 10);
      ctx.lineTo(-8, 10);
      ctx.lineTo(-2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'zeus': {
      // Великая золотая молния Зевса
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(4, -11);
      ctx.lineTo(1, -2);
      ctx.lineTo(18, -5);
      ctx.lineTo(-2, 11);
      ctx.lineTo(2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'sky_guardian': {
      // Небесное солнечное ядро-скипетр Стражника небес (пускает лучи во все стороны)
      ctx.rotate(-angle);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5);
        ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
        ctx.stroke();
      }
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ==================== 16 БОЙЦОВ ИЗ «БОКСА БОЙЦОВ» ====================
    case 'paper_recruit': {
      // Бумажная пилотка Новобранца (без способностей)
      ctx.rotate(-angle);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-9, 4);
      ctx.lineTo(0, -6);
      ctx.lineTo(9, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'cardboard_pug': {
      // Маленькая косточка Картонного Мопса (без способностей)
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.rect(-5, -2.5, 10, 5);
      ctx.fill();
      ctx.stroke();
      for (const sx of [-5.5, 5.5]) {
        for (const sy of [-2.5, 2.5]) {
          ctx.beginPath();
          ctx.arc(sx, sy, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      break;
    }

    case 'wooden_dummy': {
      // Деревянная учебная дощечка Манекена (без способностей)
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      roundRectPath(ctx, -4, -9, 8, 18, 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'origami_frog': {
      // Зелёный кувшинковый листок Оригами-Жабы (без способностей)
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0.25, Math.PI * 2 - 0.25);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'tin_peasant': {
      // Маленькая деревянная палочка Пехотинца (без способностей)
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      roundRectPath(ctx, -2, -9, 4, 18, 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'crossbow_scout': {
      // Деревянный арбалет со стальной дугой
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      roundRectPath(ctx, -8, -2.2, 16, 4.4, 1.5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(4, 0, 9, -Math.PI * 0.48, Math.PI * 0.48);
      ctx.stroke();
      break;
    }

    case 'fencer_fox': {
      // Изящная дуэльная рапира с золотой гардой
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, -1.5);
      ctx.lineTo(22, 0);
      ctx.lineTo(0, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 4.2, -Math.PI * 0.5, Math.PI * 0.5, true);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'snow_thrower': {
      // Ледяная трубочка-снежкомёт со снежком
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      roundRectPath(ctx, -6, -4, 13, 8, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, 0, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'torch_bearer': {
      // Горящий факел
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      roundRectPath(ctx, -2.5, 0, 5, 13, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.quadraticCurveTo(7, -4, 0, 2);
      ctx.quadraticCurveTo(-7, -4, 0, -12);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'anchor_sailor': {
      // Тяжёлый морской якорь
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, 7);
      ctx.moveTo(-5, -4);
      ctx.lineTo(5, -4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 2, 7.5, 0.25, Math.PI - 0.25);
      ctx.stroke();
      break;
    }

    case 'wind_ronin': {
      // Изумрудная катана ветра
      ctx.fillStyle = '#5eead4';
      ctx.beginPath();
      ctx.moveTo(0, -2.2);
      ctx.lineTo(20, -1);
      ctx.lineTo(23, 1.5);
      ctx.lineTo(0, 2.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'tesla_bot': {
      // Катушка Теслы с голубым разрядом
      ctx.rotate(-angle);
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      roundRectPath(ctx, -4, -6, 8, 12, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -8, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'witch_brew': {
      // Магический посох Лесной Ведьмы с фиолетовым кристаллом
      ctx.rotate(-angle);
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      roundRectPath(ctx, -2, -8, 4, 18, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, -10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'magma_guard': {
      // Раскалённый лавовый щит
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      roundRectPath(ctx, -5, -12, 10, 24, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'crystal_sniper': {
      // Розовый алмазный кристалл-призма
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(0, -7);
      ctx.lineTo(13, 0);
      ctx.lineTo(0, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'shadow_scythe': {
      // Фиолетовый серп Теневого Жнеца
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(2, 0, 10, -Math.PI * 0.65, Math.PI * 0.45);
      ctx.quadraticCurveTo(6, 0, 2, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'halberd_guard': {
      // Длинная стальная алебарда
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-10, -2, 24, 4);
      ctx.strokeRect(-10, -2, 24, 4);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(8, -10);
      ctx.lineTo(18, 0);
      ctx.lineTo(8, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'dart_frog': {
      // Бамбуковая духовая трубка с зелёным дротиком
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(-6, -2.5, 18, 5);
      ctx.strokeRect(-6, -2.5, 18, 5);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(12, -3);
      ctx.lineTo(18, 0);
      ctx.lineTo(12, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'shield_maiden': {
      // Круглый норманнский щит с золотым умбоном
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'cannon_pirate': {
      // Чугунная ручная мортира пирата
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      roundRectPath(ctx, -6, -5, 18, 10, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(13, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'whip_tamer': {
      // Кожаный кнут укротителя
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-8, -2.5, 8, 5);
      ctx.strokeRect(-8, -2.5, 8, 5);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(8, -8, 16, 2);
      ctx.stroke();
      break;
    }

    case 'bone_warrior': {
      // Зазубренная костяная булава
      ctx.fillStyle = '#f5f5f4';
      ctx.beginPath();
      roundRectPath(ctx, -8, -3, 18, 6, 3);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(10, -4, 4, 0, Math.PI * 2);
      ctx.arc(10, 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'rune_monk': {
      // Светящийся рунический посох
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(-8, -2, 18, 4);
      ctx.strokeRect(-8, -2, 18, 4);
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(11, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'saw_bot': {
      // Зубчатая циркулярная пила
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(2, 0, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(2, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'flail_templar': {
      // Цепной моргенштерн храмовника
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-9, -2, 10, 4);
      ctx.strokeRect(-9, -2, 10, 4);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(9, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'sand_nomad': {
      // Изогнутый золотистый ятаган пустыни
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.quadraticCurveTo(8, -8, 17, -2);
      ctx.quadraticCurveTo(8, 5, -4, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'harpoon_diver': {
      // Морской стальной гарпун с зазубринами
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-8, -2, 18, 4);
      ctx.strokeRect(-8, -2, 18, 4);
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(9, -6);
      ctx.lineTo(11, 0);
      ctx.lineTo(9, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'drum_shaman': {
      // Ритуальный боевой барабан с колотушкой
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(2, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(2, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'phantom_duelist': {
      // Призрачная фиолетовая шпага
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(-2, 0, 4.5, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e9d5ff';
      ctx.beginPath();
      ctx.moveTo(2, -2);
      ctx.lineTo(20, 0);
      ctx.lineTo(2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'cyber_sniper': {
      // Высокотехнологичный неоновый рельсотрон
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -4, 22, 8);
      ctx.strokeRect(-8, -4, 22, 8);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-4, -1.5, 18, 3);
      break;
    }

    case 'frost_valkyrie': {
      // Кристальное ледяное копьё Валькирии
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, -6);
      ctx.lineTo(19, 0);
      ctx.lineTo(6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'inferno_executioner': {
      // Раскалённая секира Палача Инферно
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(-8, -2, 18, 4);
      ctx.strokeRect(-8, -2, 18, 4);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(4, -11);
      ctx.quadraticCurveTo(16, 0, 4, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'storm_caller': {
      // Грозовой скипетр с молнией
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(4, -7);
      ctx.lineTo(2, -1);
      ctx.lineTo(15, -4);
      ctx.lineTo(4, 6);
      ctx.lineTo(6, 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'venom_queen': {
      // Изумрудный ядовитый скипетр Королевы
      ctx.fillStyle = '#365314';
      ctx.fillRect(-8, -2, 16, 4);
      ctx.strokeRect(-8, -2, 16, 4);
      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.arc(10, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'solar_pharaoh': {
      // Золотой солнечный посох Ра
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-8, -2, 16, 4);
      ctx.strokeRect(-8, -2, 16, 4);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(10, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'void_reaper': {
      // Коса Чёрной Бездны
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-8, -2, 18, 4);
      ctx.strokeRect(-8, -2, 18, 4);
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(6, 0, 10, -Math.PI * 0.7, Math.PI * 0.4);
      ctx.quadraticCurveTo(9, 0, 6, -7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'mecha_titan': {
      // Сдвоенная ракетно-плазменная пушка Меха-Титана
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-7, -7, 18, 5);
      ctx.strokeRect(-7, -7, 18, 5);
      ctx.fillRect(-7, 2, 18, 5);
      ctx.strokeRect(-7, 2, 18, 5);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(11, -6, 4, 3);
      ctx.fillRect(11, 3, 4, 3);
      break;
    }

    case 'blood_archduke': {
      // Багровый королевский клинок Архигерцога
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(19, 0);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-6, -7, 3, 14);
      ctx.strokeRect(-6, -7, 3, 14);
      break;
    }

    case 'broom_janitor': {
      // Деревянная метла уборщика
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-9, -1.8, 15, 3.6);
      ctx.strokeRect(-9, -1.8, 15, 3.6);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(6, -5);
      ctx.lineTo(16, -8);
      ctx.lineTo(16, 8);
      ctx.lineTo(6, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'cook_pan': {
      // Чугунная сковородка поварёнка с глазуньей
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-10, -2, 9, 4);
      ctx.strokeRect(-10, -2, 9, 4);
      ctx.beginPath();
      ctx.arc(5, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(5, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'gardener_fork': {
      // Садовые вилы
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-9, -2, 14, 4);
      ctx.strokeRect(-9, -2, 14, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(5, -6, 3, 12);
      ctx.strokeRect(5, -6, 3, 12);
      ctx.fillRect(8, -5, 8, 2);
      ctx.fillRect(8, -1, 8, 2);
      ctx.fillRect(8, 3, 8, 2);
      break;
    }

    case 'postman_bag': {
      // Почтовый конверт с печатью
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-7, -6, 16, 12);
      ctx.strokeRect(-7, -6, 16, 12);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(1, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'miner_pickaxe': {
      // Стальная кирка шахтёра
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-8, -2, 16, 4);
      ctx.strokeRect(-8, -2, 16, 4);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(6, -10);
      ctx.quadraticCurveTo(12, 0, 6, 10);
      ctx.lineTo(3, 8);
      ctx.quadraticCurveTo(7, 0, 3, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'jester_cards': {
      // Веер ярких карт шута
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-4, -7, 12, 9);
      ctx.strokeRect(-4, -7, 12, 9);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, -3, 12, 9);
      ctx.strokeRect(0, -3, 12, 9);
      break;
    }

    case 'ice_skater': {
      // Серебристое лезвие конька
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      roundRectPath(ctx, -6, -4, 18, 8, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-4, -1.5, 14, 3);
      break;
    }

    case 'bamboo_panda': {
      // Зелёный стебель бамбука
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-8, -3.5, 22, 7);
      ctx.strokeRect(-8, -3.5, 22, 7);
      ctx.beginPath();
      ctx.moveTo(-1, -3.5);
      ctx.lineTo(-1, 3.5);
      ctx.moveTo(7, -3.5);
      ctx.lineTo(7, 3.5);
      ctx.stroke();
      break;
    }

    case 'alchemist_apprentice': {
      // Маленькая фиолетовая колба ученика
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(2, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(8, -2.5, 4, 5);
      ctx.strokeRect(8, -2.5, 4, 5);
      break;
    }

    case 'emerald_valkyrie': {
      // Изумрудное копьё Валькирии
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(5, -6.5);
      ctx.lineTo(19, 0);
      ctx.lineTo(5, 6.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'eclipse_ninja': {
      // Четырёхконечный сюрикен Затмения с золотым ядром
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rad = i % 2 === 0 ? 10 : 4;
        const a = (i * Math.PI) / 4;
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // =========================================================================
    // ЯЩИК «ЭКСКЛЮЗИВ» ЗА 1000 МОНЕТ (24 БОЙЦА: #107–#130)
    // =========================================================================
    case 'chrono_assassin': {
      // Хроно-клинок в форме стрелки часов с песочными часами на гарде
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-4, -3);
      ctx.lineTo(18, 0);
      ctx.lineTo(-4, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(-5, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'lava_berserker': {
      // Двуручная раскалённая секира с лавовыми прожилками
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(14, 0);
      ctx.stroke();
      ctx.fillStyle = '#ea580c';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, -12);
      ctx.quadraticCurveTo(16, -8, 14, 0);
      ctx.quadraticCurveTo(16, 8, 2, 12);
      ctx.lineTo(4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'electro_spear': {
      // Громовое копьё с зигзагообразным остриём
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(6, -5);
      ctx.lineTo(20, 0);
      ctx.lineTo(6, 5);
      ctx.lineTo(9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'mirror_mage': {
      // Зеркальная призма в золотой оправе
      ctx.fillStyle = '#e0f2fe';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-2, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'plague_doctor': {
      // Чумное кадило с зелёным дымом на цепи
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(4, 0);
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(8, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(8, -2, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'gravity_hammer': {
      // Гравитационный фиолетовый молот
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      ctx.fillStyle = '#7c3aed';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(4, -10, 11, 20, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c4b5fd';
      ctx.beginPath();
      ctx.arc(9.5, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'starlight_archer': {
      // Звёздный лук со светящейся стрелой
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-2, 0, 11, -Math.PI * 0.48, Math.PI * 0.48);
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(15, 0);
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(15, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'iron_juggernaut': {
      // Шипастый стальной таранный щит
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-5, -11, 12, 22, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      for (const sy of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.moveTo(7, sy - 2.5);
        ctx.lineTo(14, sy);
        ctx.lineTo(7, sy + 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case 'crimson_duelist': {
      // Алая рапира с чашеобразной золотой гардой
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(-4, 0, 5, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(1, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();
      break;
    }
    case 'frost_shaman': {
      // Посох вечной мерзлоты с ледяным кристаллом
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(8, -7);
      ctx.lineTo(17, 0);
      ctx.lineTo(8, 7);
      ctx.lineTo(4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'astral_monk': {
      // Астральные золотые чакры-сферы
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(4, -5, 4.5, 0, Math.PI * 2);
      ctx.arc(8, 4, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'cyber_valkyrie': {
      // Неоновое плазменное копьё Валькирии
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(4, -6);
      ctx.lineTo(21, 0);
      ctx.lineTo(4, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'magma_behemoth': {
      // Огромный кулак из магмы и базальта
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-5, -9, 14, 18, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(3, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'shadow_emperor': {
      // Скипетр Императора Теней с тёмным кристаллом
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      ctx.fillStyle = '#581c87';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(11, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e879f9';
      ctx.beginPath();
      ctx.arc(11, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'crystal_archon': {
      // Парящий радужный кристалл Архонта
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(5, -9);
      ctx.lineTo(16, 0);
      ctx.lineTo(5, 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'tempest_djinn': {
      //Золотая волшебная лампа бури с вихрем
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(2, 2, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(11, -3, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'necro_alchemist': {
      // Колба с бурлящим некро-эликсиром
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(4, 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(1, -8, 6, 4);
      ctx.strokeRect(1, -8, 6, 4);
      break;
    }
    case 'celestial_phoenix': {
      // Пылающее крыло-клинок Небесного Феникса
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-6, 4);
      ctx.quadraticCurveTo(6, -12, 20, -2);
      ctx.quadraticCurveTo(10, 6, -6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(4, -1, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'abyss_leviathan': {
      // Трезубец глубин Левиафана
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(16, 0);
      ctx.moveTo(7, -7);
      ctx.lineTo(15, -5);
      ctx.moveTo(7, 7);
      ctx.lineTo(15, 5);
      ctx.stroke();
      break;
    }
    case 'omega_prime': {
      // Двухствольная омега-пушка аннигиляции
      ctx.fillStyle = '#334155';
      ctx.fillRect(-6, -7, 18, 14);
      ctx.strokeRect(-6, -7, 18, 14);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(12, -3.5, 2.5, 0, Math.PI * 2);
      ctx.arc(12, 3.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'valkyrie_queen': {
      // Королевский золотой меч-копьё Зари
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(-6, -5);
      ctx.lineTo(21, 0);
      ctx.lineTo(-6, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-2, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'chaos_overlord': {
      // Двуручный зазубренный клинок Хаоса
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(20, 0);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(2, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'galactic_lightning': {
      // Галактический зигзаг-молния в руке бойца «Молния»
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(4, -9);
      ctx.lineTo(1, -2);
      ctx.lineTo(19, -5);
      ctx.lineTo(4, 8);
      ctx.lineTo(7, 1);
      ctx.lineTo(-8, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'skeleton_king': {
      // Проклятый двуручный костяной меч Короля скелетов с черепом на гарде
      ctx.fillStyle = '#f5f5f4';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(23, 0);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Изумрудная руна на лезвии
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(14, 0);
      ctx.stroke();
      // Золотая гарда с черепом
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-5, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(-5, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // =========================================================================
    // ЯЩИК ЗА 35 МОНЕТ (20 БОЙЦОВ: #131–#150)
    // =========================================================================
    case 'baker_pin': {
      // Деревянная скалка Пекаря
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(-8, -4, 20, 8, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-13, -2, 5, 4);
      ctx.fillRect(12, -2, 5, 4);
      break;
    }
    case 'fisherman_rod': {
      // Удочка Рыбака с крючком
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.lineTo(15, -5);
      ctx.stroke();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(15, -5);
      ctx.lineTo(15, 5);
      ctx.arc(13, 5, 2, 0, Math.PI);
      ctx.stroke();
      break;
    }
    case 'carpenter_saw': {
      // Зубчатая ножовка Плотника
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(16, -3);
      ctx.lineTo(16, 4);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-10, -5, 6, 10);
      ctx.strokeRect(-10, -5, 6, 10);
      break;
    }
    case 'tailor_scissors': {
      // Острые портновские ножницы
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(15, 4);
      ctx.moveTo(-4, 4);
      ctx.lineTo(15, -4);
      ctx.stroke();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-7, -4, 3.5, 0, Math.PI * 2);
      ctx.arc(-7, 4, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'lantern_watchman': {
      // Кованый фонарь Ночного сторожа
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.roundRect(-2, -6, 12, 12, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(4, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'shepherd_crook': {
      // Изогнутый посох Пастуха
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(8, 0);
      ctx.arc(8, -4, 4, Math.PI * 0.5, -Math.PI * 0.8, true);
      ctx.stroke();
      break;
    }
    case 'potter_jug': {
      // Глиняный кувшин Гончара
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.arc(4, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(1, -9, 6, 4);
      ctx.strokeRect(1, -9, 6, 4);
      break;
    }
    case 'chimney_sweep': {
      // Круглая щётка Трубочиста на шесте
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(10, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'drummer_boy': {
      // Походный барабан с палочками
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(-3, -7, 12, 14, 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, -6);
      ctx.lineTo(9, 6);
      ctx.moveTo(9, -6);
      ctx.lineTo(-3, 6);
      ctx.stroke();
      break;
    }
    case 'bell_ringer': {
      // Бронзовый колокол Звонаря
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(11, -9);
      ctx.lineTo(11, 9);
      ctx.lineTo(-2, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(12, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'falconer_hawk': {
      // Перчатка Сокольничего с когтями ястреба
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-4, -6, 12, 12, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.lineTo(16, 0);
      ctx.lineTo(8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'alchemist_bomb': {
      // Круглая бомба-колба Подрывника с фитилём
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(4, 1, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(10, -6, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'gladiator_net': {
      // Трезубец и ловчая сеть Ретиария
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(15, 0);
      ctx.moveTo(9, -5);
      ctx.lineTo(15, -4);
      ctx.moveTo(9, 5);
      ctx.lineTo(15, 4);
      ctx.stroke();
      break;
    }
    case 'glacier_pikeman': {
      // Длинная ледяная пика
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(5, -4);
      ctx.lineTo(20, 0);
      ctx.lineTo(5, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'desert_dervish': {
      // Изогнутый золотой ятаган Дервиша
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.quadraticCurveTo(8, -8, 18, -2);
      ctx.quadraticCurveTo(9, 6, -4, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'arcane_arbalester': {
      // Рунический арбалет с фиолетовым кристаллом
      ctx.fillStyle = '#6d28d9';
      ctx.fillRect(-6, -3, 16, 6);
      ctx.strokeRect(-6, -3, 16, 6);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(6, -10);
      ctx.lineTo(11, 0);
      ctx.lineTo(6, 10);
      ctx.stroke();
      break;
    }
    case 'blood_samurai': {
      // Багровая катана Кровавого ронина
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-4, -2.5);
      ctx.lineTo(20, 0);
      ctx.lineTo(-4, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1c1a17';
      ctx.fillRect(-11, -2, 7, 4);
      break;
    }
    case 'thunder_golem': {
      // Громовой каменный кулак с молнией
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-4, -8, 13, 16, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(3, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'toxic_arachnid': {
      // Ядовитые зелёные жвалы Вдовы
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(14, -2);
      ctx.lineTo(-2, -1);
      ctx.moveTo(-2, 6);
      ctx.lineTo(14, 2);
      ctx.lineTo(-2, 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'sun_paladin': {
      // Солнечный молот Паладина Света
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(7, 0);
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(4, -9, 10, 18, 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

// Отрисовка небесных ангельских крыльев, золотого нимба и символа солнца Стражника небес
function drawSkyGuardianDetails(ctx, x, y, radius, timeSec = 0) {
  ctx.save();
  ctx.translate(x, y);

  const flap = Math.sin(timeSec * 5) * 0.08;
  // Величественные бело-золотые крылья по бокам
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    ctx.rotate(flap);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1c1a17';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(radius * 0.55, -radius * 0.25);
    ctx.quadraticCurveTo(radius * 1.65, -radius * 1.05, radius * 1.85, -radius * 0.2);
    ctx.quadraticCurveTo(radius * 1.55, radius * 0.35, radius * 1.25, radius * 0.45);
    ctx.quadraticCurveTo(radius * 0.95, radius * 0.65, radius * 0.55, radius * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Золотистые перья внутри крыла
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radius * 0.75, -radius * 0.1);
    ctx.lineTo(radius * 1.45, -radius * 0.35);
    ctx.moveTo(radius * 0.75, radius * 0.12);
    ctx.lineTo(radius * 1.35, radius * 0.12);
    ctx.stroke();
    ctx.restore();
  }

  // Сияющий золотой нимб над головой
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, -radius * 1.22, radius * 0.68, radius * 0.22, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Небесная золотая звезда в центре груди
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? radius * 0.48 : radius * 0.22;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Отрисовка галактических дуг молний, электрической короны и символа грозы для бойца «Молния» (3 слота)
function drawGalacticLightningDetails(ctx, x, y, radius, timeSec = 0) {
  ctx.save();
  ctx.translate(x, y);

  // Вращающееся кольцо галактической плазмы вокруг тела
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
  ctx.lineWidth = 2.2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.18, timeSec * 3, timeSec * 3 + Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Электрические рога-молнии по бокам шлема
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#1c1a17';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(radius * 0.55, -radius * 0.45);
    ctx.lineTo(radius * 1.35, -radius * 0.95);
    ctx.lineTo(radius * 1.02, -radius * 0.35);
    ctx.lineTo(radius * 1.48, -radius * 0.52);
    ctx.lineTo(radius * 0.72, radius * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Яркая эмблема молнии в центре груди
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(radius * 0.12, -radius * 0.55);
  ctx.lineTo(-radius * 0.32, radius * 0.05);
  ctx.lineTo(radius * 0.04, radius * 0.05);
  ctx.lineTo(-radius * 0.14, radius * 0.58);
  ctx.lineTo(radius * 0.34, -radius * 0.06);
  ctx.lineTo(0, -radius * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Отрисовка королевской мантии, черепа с горящими глазами и проклятой золотой короны «Короля скелетов» (3 слота)
function drawSkeletonKingDetails(ctx, x, y, radius, timeSec = 0) {
  ctx.save();
  ctx.translate(x, y);

  // Тёмно-пурпурная королевская мантия позади плеч с золотой каймой
  ctx.fillStyle = '#4c1d95';
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, radius * 0.12, radius * 1.15, Math.PI * 0.15, Math.PI * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Глазницы черепа с призрачно-изумрудным свечением некроманта
  for (const side of [-1, 1]) {
    const ex = side * radius * 0.34;
    const ey = -radius * 0.12;
    ctx.fillStyle = '#1c1a17';
    ctx.beginPath();
    ctx.arc(ex, ey, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    const pulse = 0.75 + Math.sin(timeSec * 6) * 0.25;
    ctx.fillStyle = `rgba(16, 185, 129, ${pulse})`;
    ctx.beginPath();
    ctx.arc(ex, ey, radius * 0.11, 0, Math.PI * 2);
    ctx.fill();
  }

  // Треугольная носовая впадина и зубастый оскал черепа
  ctx.fillStyle = '#1c1a17';
  ctx.beginPath();
  ctx.moveTo(0, radius * 0.02);
  ctx.lineTo(-radius * 0.1, radius * 0.2);
  ctx.lineTo(radius * 0.1, radius * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.38, radius * 0.42);
  ctx.lineTo(radius * 0.38, radius * 0.42);
  for (const tx of [-0.24, -0.08, 0.08, 0.24]) {
    ctx.moveTo(radius * tx, radius * 0.32);
    ctx.lineTo(radius * tx, radius * 0.52);
  }
  ctx.stroke();

  // Проклятая зубчатая золотая корона на голове с кристаллом душ
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.65, -radius * 0.62);
  ctx.lineTo(-radius * 0.72, -radius * 1.18);
  ctx.lineTo(-radius * 0.32, -radius * 0.88);
  ctx.lineTo(0, -radius * 1.32);
  ctx.lineTo(radius * 0.32, -radius * 0.88);
  ctx.lineTo(radius * 0.72, -radius * 1.18);
  ctx.lineTo(radius * 0.65, -radius * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Изумрудный камень душ в центре короны
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(0, -radius * 0.88, radius * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Отрисовка ноты для снарядов Музыканта
function drawMusicNoteGraphic(ctx, x, y, scale = 1, color = '#a855f7') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 1.8;

  // Головка ноты
  ctx.beginPath();
  ctx.ellipse(-2, 4, 4.8, 3.6, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Штиль и флажок ноты
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(2, 3);
  ctx.lineTo(2, -7);
  ctx.quadraticCurveTo(8, -5, 7, 0);
  ctx.stroke();
  ctx.restore();
}

// Отрисовка паутины (иконка и летящий снаряд Павука)
function drawSpiderWebGraphic(ctx, x, y, radius = 11, fill = 'rgba(255,255,255,0.75)', stroke = '#1c1a17') {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;
  ctx.lineWidth = 1.6;

  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Внутреннее кольцо и лучи паутины
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.52, 0, Math.PI * 2);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }
  ctx.stroke();
  ctx.restore();
}

// Отрисовка маленьких паучьих лапок, торчащих из тела Павука, и его глаз
function drawSpiderLegs(ctx, x, y, radius, aimAngle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(aimAngle);
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 2.3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // По 4 маленьких сгибающихся лапки с каждой стороны туловища
  const legAngles = [-0.85, -0.35, 0.25, 0.78];
  for (const side of [-1, 1]) {
    for (let i = 0; i < legAngles.length; i++) {
      const baseA = side * (Math.PI * 0.5) + legAngles[i] * 0.55;
      const sx = Math.cos(baseA) * (radius * 0.92);
      const sy = Math.sin(baseA) * (radius * 0.92);
      const kx = Math.cos(baseA + side * 0.22) * (radius + 6.5);
      const ky = Math.sin(baseA + side * 0.22) * (radius + 6.5);
      const ex = Math.cos(baseA - side * 0.18) * (radius + 10.5);
      const ey = Math.sin(baseA - side * 0.18) * (radius + 10.5);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(kx, ky);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }

  // Паучьи красные глазки спереди
  ctx.fillStyle = '#ef4444';
  for (const dy of [-4.5, -1.6, 1.6, 4.5]) {
    ctx.beginPath();
    ctx.arc(radius * 0.48, dy, Math.abs(dy) < 2 ? 2.1 : 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Отрисовка банана (оружие и снаряд Бибизяны)
function drawBananaGraphic(ctx, x, y, scale = 1, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#fde047';
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-8, -9);
  ctx.quadraticCurveTo(9, -5, 9, 9);
  ctx.quadraticCurveTo(2, 11, -3, 7);
  ctx.quadraticCurveTo(2, -1, -8, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Коричневый хвостик банана
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(-8, -9, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Отрисовка обезьяньих ушек и мордочки Бибизяны
function drawMonkeyDetails(ctx, x, y, radius, aimAngle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(aimAngle);

  // Круглые обезьяньи ушки по бокам
  for (const side of [-1, 1]) {
    const ey = side * (radius * 0.92);
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#1c1a17';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-radius * 0.1, ey, radius * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(-radius * 0.1, ey, radius * 0.17, 0, Math.PI * 2);
    ctx.fill();
  }

  // Светлая мордочка и глазки спереди
  ctx.fillStyle = '#fde68a';
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(radius * 0.32, 0, radius * 0.42, radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1c1a17';
  ctx.beginPath();
  ctx.arc(radius * 0.25, -radius * 0.24, 2, 0, Math.PI * 2);
  ctx.arc(radius * 0.25, radius * 0.24, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Отрисовка щупалец и электро-ореола Медузы на корпусе
function drawMedusaDetails(ctx, x, y, radius, aimAngle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(aimAngle);

  // Волнистые щупальца медузы позади купола
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  for (const dy of [-radius * 0.52, -radius * 0.18, radius * 0.18, radius * 0.52]) {
    ctx.beginPath();
    ctx.moveTo(-radius * 0.75, dy);
    ctx.quadraticCurveTo(-radius * 1.25, dy + 3.5, -radius * 1.65, dy - 2);
    ctx.stroke();
  }

  // Светящиеся пятнышки на куполе медузы
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.arc(radius * 0.22, -radius * 0.3, radius * 0.22, 0, Math.PI * 2);
  ctx.arc(-radius * 0.15, radius * 0.28, radius * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Отрисовка миниатюрной шахматной фигурки Пешки (для оружия и снарядов «Шах и Мат»)
function drawChessPawn(ctx, x, y, scale = 1, fillColor = '#ffffff') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 1.8;
  ctx.lineJoin = 'round';

  // Основание и корпус пешки
  ctx.beginPath();
  ctx.moveTo(-5, 6);
  ctx.lineTo(5, 6);
  ctx.lineTo(3.5, 3);
  ctx.quadraticCurveTo(2, 0, 1.8, -2);
  ctx.lineTo(-1.8, -2);
  ctx.quadraticCurveTo(-2, 0, -3.5, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Круглая головка пешки
  ctx.beginPath();
  ctx.arc(0, -4.5, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Отрисовка маленьких белых когтей и ушек Оборотня прямо на его коричневом теле
function drawWerewolfDetails(ctx, x, y, radius, aimAngle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(aimAngle);

  // Маленькие белые когти спереди (с двух лап)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 1.6;
  for (const side of [-1, 1]) {
    const baseY = side * (radius * 0.48);
    for (const c of [-2.8, 0, 2.8]) {
      ctx.beginPath();
      ctx.moveTo(radius * 0.72, baseY + c - 1.3);
      ctx.lineTo(radius * 0.72 + 8.5, baseY + c);
      ctx.lineTo(radius * 0.72, baseY + c + 1.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // Жёлтые волчьи глаза
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(radius * 0.25, -radius * 0.3, 2.5, 0, Math.PI * 2);
  ctx.arc(radius * 0.25, radius * 0.3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Универсальная отрисовка миниатюры бойца (для карточек внизу, слотов команды и превью в инспекторе)
function renderFighterThumbnail(canvas, unitOrClass, team = 'player', showDualIcons = false) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const shape = unitOrClass.shape || 'circle';
  const classId = unitOrClass.classId || unitOrClass.id || 'swordsman';
  const abilityId = unitOrClass.abilityId || unitOrClass.id || 'swordsman';
  const color = unitOrClass.customColor || getUnitTeamColor(team, classId);

  const cx = showDualIcons ? w * 0.34 : w * 0.38;
  const cy = h * 0.54;
  const r = Math.min(w, h) * 0.27;

  // Специальная отрисовка для Червя (голова + сегменты хвоста гусеницы)
  if (classId === 'worm' || abilityId === 'worm') {
    for (let s = 3; s >= 1; s--) {
      drawFighterBody(ctx, 'circle', cx - s * 8 + 12, cy + (s % 2 === 0 ? 3 : -2), r * (0.82 - s * 0.1), color, '#1c1a17', 2);
    }
    drawFighterBody(ctx, 'circle', cx + 14, cy, r * 0.88, color, '#1c1a17', 2.3);
    return;
  }

  // Специальная отрисовка для Стрелка с двумя пистолетами по бокам
  if (abilityId === 'gunslinger' && !showDualIcons) {
    drawFighterBody(ctx, shape, w * 0.45, cy - 2, r * 0.88, color, '#1c1a17', 2.3);
    drawWeaponGraphic(ctx, 'gunslinger', w * 0.25, cy + r * 0.55, 0.65, Math.PI * 0.72, team);
    drawWeaponGraphic(ctx, 'gunslinger', w * 0.66, cy + r * 0.55, 0.65, Math.PI * 0.28, team);
    return;
  }

  if (classId === 'pavuk' || abilityId === 'pavuk') {
    drawSpiderLegs(ctx, cx, cy, r, 0);
  }
  if (classId === 'medusa' || abilityId === 'medusa') {
    drawMedusaDetails(ctx, cx, cy, r, 0);
  }

  // Специальная раскраска в чёрно-белую шахматную клетку для «Шах и Мат»
  if (classId === 'checkmate' || abilityId === 'checkmate') {
    drawChessboardBody(ctx, shape, cx, cy, r, '#1c1a17', 2.4, false);
  } else {
    drawFighterBody(ctx, shape, cx, cy, r, color, '#1c1a17', 2.4);
  }

  if (classId === 'sky_guardian' || abilityId === 'sky_guardian') {
    drawSkyGuardianDetails(ctx, cx, cy, r, 0);
  }
  if (classId === 'galactic_lightning' || abilityId === 'galactic_lightning') {
    drawGalacticLightningDetails(ctx, cx, cy, r, 0);
  }
  if (classId === 'skeleton_king' || abilityId === 'skeleton_king') {
    drawSkeletonKingDetails(ctx, cx, cy, r, 0);
  }
  if (classId === 'vampire' || abilityId === 'vampire') {
    drawVampireFangs(ctx, cx, cy, r, 0);
  }
  if (classId === 'werewolf' || abilityId === 'werewolf') {
    drawWerewolfDetails(ctx, cx, cy, r, 0);
  }
  if (classId === 'bibizyana' || abilityId === 'bibizyana') {
    drawMonkeyDetails(ctx, cx, cy, r, 0);
  }

  const wx = cx + r * 1.35;
  const wy = cy + 1;
  let angle = -Math.PI / 4;
  if (['archer', 'shield', 'soldier', 'claws', 'laser_bot', 'plasma_rex', 'boxer', 'hunter', 'zombie', 'werewolf', 'death', 'fairy', 'musician', 'sky_guardian', 'galactic_lightning', 'skeleton_king'].includes(abilityId)) angle = 0;
  if (abilityId === 'spearman') angle = -Math.PI / 5;

  drawWeaponGraphic(ctx, abilityId, wx, wy, 0.85, angle, team);

  if (showDualIcons && abilityId === 'swordsman') {
    drawWeaponGraphic(ctx, abilityId, wx + 22, wy + 2, 0.75, -Math.PI / 4, team);
  }
}

// ==================== СИСТЕМА ЗНАЧКОВ (КОНТЕЙНЕР СО ЗНАЧКАМИ ЗА 70 МОНЕТ: 5 РЕДКИХ, 3 ЭПИЧЕСКИХ, 1 ЛЕГЕНДАРНЫЙ) ====================
const BADGE_RARITIES = [
  {
    id: 'rare',
    name: 'Редкий',
    tierName: 'Редкая',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#15803d',
    tierChance: 96.5, // 96.5% суммарно (по 19.3% на каждый из 5 редких значков)
    perItemChance: 19.3
  },
  {
    id: 'epic',
    name: 'Эпический',
    tierName: 'Эпическая',
    color: '#9333ea',
    bg: '#f3e8ff',
    border: '#7e22ce',
    tierChance: 3.0,  // Очень малый шанс: 3.0% суммарно (по 1.0% на каждый из 3 эпических значков)
    perItemChance: 1.0
  },
  {
    id: 'legendary',
    name: 'Легендарный',
    tierName: 'Легендарная',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#b45309',
    tierChance: 0.5,  // Очень-преочень малый шанс: 0.5% на легендарный значок!
    perItemChance: 0.5
  }
];

const FIGHTER_BADGES = [
  // 5 РЕДКИХ ЗНАЧКОВ
  {
    id: 'badge_hp_20',
    num: 1,
    name: 'Значок Здоровья',
    rarity: 'rare',
    emoji: '❤️',
    shortLabel: '+20 ❤️ HP',
    desc: 'Даёт +20 к здоровью, когда применяешь его к бойцу.',
    bonusHp: 20,
    bonusSpeed: 0,
    bonusDamage: 0
  },
  {
    id: 'badge_speed_1',
    num: 2,
    name: 'Значок Скорости',
    rarity: 'rare',
    emoji: '⚡',
    shortLabel: '+1 ⚡ Скорость',
    desc: 'Даёт +1 к скорости передвижения бойца.',
    bonusHp: 0,
    bonusSpeed: 1,
    bonusDamage: 0
  },
  {
    id: 'badge_dmg_6',
    num: 3,
    name: 'Значок Силы',
    rarity: 'rare',
    emoji: '⚔️',
    shortLabel: '+6 ⚔️ Урон',
    desc: 'Даёт +6 к урону, когда применяешь его к бойцу.',
    bonusHp: 0,
    bonusSpeed: 0,
    bonusDamage: 6
  },
  {
    id: 'badge_regen_10',
    num: 4,
    name: 'Значок Регенерации',
    rarity: 'rare',
    emoji: '💚',
    shortLabel: '+10 HP / 10 с',
    desc: 'Способность: каждые 10 секунд восстанавливает 10 единиц здоровья в бою.',
    bonusHp: 0,
    bonusSpeed: 0,
    bonusDamage: 0
  },
  {
    id: 'badge_rage_dmg_3',
    num: 5,
    name: 'Значок Растущей Силы',
    rarity: 'rare',
    emoji: '🔥',
    shortLabel: '+3 ⚔️ / 10 с (в бою)',
    desc: 'Способность: каждые 10 секунд даёт +3 к урону до конца битвы (после битвы вся полученная сила испаряется до следующего боя).',
    bonusHp: 0,
    bonusSpeed: 0,
    bonusDamage: 0
  },

  // 3 ЭПИЧЕСКИХ ЗНАЧКА
  {
    id: 'badge_start_hp_35',
    num: 6,
    name: 'Значок Крепости',
    rarity: 'epic',
    emoji: '🛡️',
    shortLabel: '+35 ❤️ в начале боя',
    desc: 'В начале матча даёт бойцу +35 к здоровью.',
    bonusHp: 0,
    bonusSpeed: 0,
    bonusDamage: 0,
    battleStartHpBonus: 35
  },
  {
    id: 'badge_rebirth',
    num: 7,
    name: 'Значок Возрождения',
    rarity: 'epic',
    emoji: '🪽',
    shortLabel: 'Возрождение (÷2.5)',
    desc: 'Способность: когда боец с этим значком умирает, появляется точно такой же боец, но слабее в 2.5 раза и чуть меньше.',
    bonusHp: 0,
    bonusSpeed: 0,
    bonusDamage: 0
  },
  {
    id: 'badge_hp_mult_1_5',
    num: 8,
    name: 'Значок Гиганта ×1.5',
    rarity: 'epic',
    emoji: '🧬',
    shortLabel: '×1.5 ❤️ HP (до Эпик)',
    desc: 'Способность (только для бойцов с редкостью ниже Мифической): умножает здоровье бойца на 1.5 пока не кончится бой.',
    bonusHp: 0,
    bonusSpeed: 0,
    bonusDamage: 0,
    battleHpMultiplier: 1.5,
    maxFighterRarityOrder: 3 // 1=Обычная, 2=Редкая, 3=Эпическая (ниже Мифической=4)
  },

  // 1 ЛЕГЕНДАРНЫЙ ЗНАЧОК
  {
    id: 'badge_hp_mult_2',
    num: 9,
    name: 'Значок Бессмертия ×2',
    rarity: 'legendary',
    emoji: '👑',
    shortLabel: '×2 ❤️ HP на весь бой',
    desc: 'Способность: на весь бой даёт бойцу умноженное в 2 раза его здоровье (×2 HP).',
    bonusHp: 0,
    bonusSpeed: 0,
    bonusDamage: 0,
    battleHpMultiplier: 2.0
  }
];

(function assignBadgeRarityMeta() {
  for (const b of FIGHTER_BADGES) {
    const tier = BADGE_RARITIES.find(t => t.id === b.rarity) || BADGE_RARITIES[0];
    b.rarityName = tier.name;
    b.rarityTierName = tier.tierName;
    b.rarityColor = tier.color;
    b.rarityBg = tier.bg;
    b.rarityBorder = tier.border;
    b.dropChance = tier.perItemChance;
  }
})();

function getBadgeById(badgeId) {
  if (!badgeId) return null;
  return FIGHTER_BADGES.find(b => b.id === badgeId) || null;
}

function canApplyBadgeToFighter(badgeId, fighterClassId) {
  const badge = getBadgeById(badgeId);
  if (!badge) return { allowed: false, reason: 'Значок не найден' };
  const cls = getFighterClass(fighterClassId);
  if (badge.maxFighterRarityOrder && (cls.rarityOrder || 1) > badge.maxFighterRarityOrder) {
    return {
      allowed: false,
      reason: 'Этот значок можно применять только к бойцам с редкостью ниже Мифической (Обычная, Редкая, Эпическая)!'
    };
  }
  return { allowed: true, reason: '' };
}

function renderBadgeIcon(canvas, badgeOrId) {
  if (!canvas) return;
  const badge = typeof badgeOrId === 'string' ? getBadgeById(badgeOrId) : badgeOrId;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (!badge) return;

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.38;

  ctx.save();
  // Ленточки медали/значка снизу
  ctx.fillStyle = badge.rarityColor || '#16a34a';
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.55, cy + r * 0.45);
  ctx.lineTo(cx - r * 0.8, cy + r * 1.15);
  ctx.lineTo(cx - r * 0.35, cy + r * 0.95);
  ctx.lineTo(cx - r * 0.15, cy + r * 1.2);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + r * 0.55, cy + r * 0.45);
  ctx.lineTo(cx + r * 0.8, cy + r * 1.15);
  ctx.lineTo(cx + r * 0.35, cy + r * 0.95);
  ctx.lineTo(cx + r * 0.15, cy + r * 1.2);
  ctx.lineTo(cx + r * 0.1, cy + r * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Основа значка (восьмиугольный/зубчатый щит или круглая медаль в зависимости от редкости)
  const spikes = badge.rarity === 'legendary' ? 12 : (badge.rarity === 'epic' ? 8 : 6);
  ctx.fillStyle = badge.rarityBg || '#dcfce7';
  ctx.strokeStyle = '#1c1a17';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r * 1.08 : r * 0.88;
    const ang = (i * Math.PI) / spikes - Math.PI / 2;
    const px = cx + Math.cos(ang) * rad;
    const py = cy - 2 + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Внутренний ободок цвета редкости
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = badge.rarityColor || '#16a34a';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, cy - 2, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Символ внутри значка
  ctx.font = `900 ${Math.round(r * 0.92)}px "Nunito", "Segoe UI Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1c1a17';
  ctx.fillText(badge.emoji || '🏅', cx, cy - 1);
  ctx.restore();
}


