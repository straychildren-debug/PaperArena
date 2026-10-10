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
    cardSub: '0.5 с пульки',
    desc: '🪖 Пистолет: каждые 0.5 с стреляет белыми пульками в цель'
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
  }
];

// ==================== СИСТЕМА РЕДКОСТИ, КОНТЕЙНЕРА БОЙЦОВ И БОКСА БОЙЦОВ ====================
// Шансы эпических, мифических и легендарных уменьшены в 2 раза (8%, 4%, 1.5%), а обычных и редких увеличены (53.5%, 33%)!
const FIGHTER_RARITIES = [
  {
    id: 'common',
    order: 1,
    name: 'Обычная',
    badge: 'Обычный',
    color: '#64748b',
    bg: '#f1f5f9',
    border: '#475569',
    tierChance: 53.5,
    boxTierChance: 58, // В Боксе бойцов (где только обычные, редкие и эпические)
    fighters: [
      'swordsman', 'archer', 'shield', 'spearman', 'soldier',
      'healer', 'alchemist', 'boomerang', 'worm', 'werewolf',
      'lumberjack', 'slinger', 'blacksmith',
      // 5 новых очень слабых обычных бойцов без способностей из «Бокса бойцов»:
      'paper_recruit', 'cardboard_pug', 'wooden_dummy', 'origami_frog', 'tin_peasant'
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
    tierChance: 33,
    boxTierChance: 30,
    fighters: [
      'gunslinger', 'pyro', 'cryo', 'thunder', 'berserker',
      'engineer', 'summoner', 'graviton', 'hunter', 'boxer',
      'musketeer', 'beekeeper', 'ice_golem',
      // 5 новых редких бойцов из «Бокса бойцов»:
      'crossbow_scout', 'fencer_fox', 'snow_thrower', 'torch_bearer', 'anchor_sailor'
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
    tierChance: 8,
    boxTierChance: 12,
    fighters: [
      'assassin', 'vampire', 'claws', 'giant', 'laser_bot',
      'teleporter', 'ninja', 'zombie', 'bibizyana',
      'samurai', 'cactus', 'magician_hat',
      // 6 новых эпических бойцов из «Бокса бойцов»:
      'wind_ronin', 'tesla_bot', 'witch_brew', 'magma_guard', 'crystal_sniper', 'shadow_scythe'
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
    fighters: [
      'plasma_rex', 'robo_mech', 'bomber', 'fairy', 'card_master',
      'medusa', 'pavuk',
      'anubis', 'poseidon', 'meteor_knight'
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
    fighters: [
      'superman', 'checkmate', 'death', 'doubler', 'musician',
      'dragon', 'chronos', 'zeus', 'sky_guardian'
    ]
  }
];

// Проставляем каждому бойцу его редкость, цвет редкости, шанс выпадения в Контейнере (55 бойцов) или Боксе бойцов (16 новых бойцов)
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
    fc.rarityBadge = fc.id === 'sky_guardian' ? 'Небесный (3 места)' : foundTier.badge;
    fc.rarityColor = fc.id === 'sky_guardian' ? '#0284c7' : foundTier.color;
    fc.rarityBg = foundTier.bg;
    fc.rarityBorder = fc.id === 'sky_guardian' ? '#0284c7' : foundTier.border;
    fc.tierChance = foundTier.tierChance;
    fc.boxTierChance = foundTier.boxTierChance || 0;

    // В «Контейнере бойцов» находятся 55 основных бойцов (кроме Мечника, Стражника небес и 16 бойцов из Бокса бойцов)
    fc.inFighterBox = Boolean(fc.inFighterBox);
    fc.inCrate = !fc.inFighterBox && fc.id !== 'swordsman' && fc.id !== 'sky_guardian';

    const crateCountInTier = foundTier.fighters.filter(id => {
      const fObj = FIGHTER_CLASSES.find(x => x.id === id);
      return id !== 'swordsman' && id !== 'sky_guardian' && !(fObj && fObj.inFighterBox);
    }).length || 1;

    const boxCountInTier = foundTier.fighters.filter(id => {
      const fObj = FIGHTER_CLASSES.find(x => x.id === id);
      return Boolean(fObj && fObj.inFighterBox);
    }).length || 1;

    fc.dropChance = fc.inCrate
      ? Number((foundTier.tierChance / crateCountInTier).toFixed(2))
      : (fc.inFighterBox ? Number(((foundTier.boxTierChance || 0) / boxCountInTier).toFixed(2)) : 0);
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
  if (['archer', 'shield', 'soldier', 'claws', 'laser_bot', 'plasma_rex', 'boxer', 'hunter', 'zombie', 'werewolf', 'death', 'fairy', 'musician', 'sky_guardian'].includes(abilityId)) angle = 0;
  if (abilityId === 'spearman') angle = -Math.PI / 5;

  drawWeaponGraphic(ctx, abilityId, wx, wy, 0.85, angle, team);

  if (showDualIcons && abilityId === 'swordsman') {
    drawWeaponGraphic(ctx, abilityId, wx + 22, wy + 2, 0.75, -Math.PI / 4, team);
  }
}
