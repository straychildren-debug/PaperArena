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
    damage: 10,
    cardSub: 'лечение',
    desc: '➕ Исцеляет раненых союзников (3 с)'
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
  }
];

function getFighterClass(id) {
  return FIGHTER_CLASSES.find(c => c.id === id) || FIGHTER_CLASSES[0];
}

// Цвет заливки фигуры в зависимости от команды и класса
function getUnitTeamColor(team, classId) {
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
  }

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

  // Специальная раскраска в чёрно-белую шахматную клетку для «Шах и Мат»
  if (classId === 'checkmate' || abilityId === 'checkmate') {
    drawChessboardBody(ctx, shape, cx, cy, r, '#1c1a17', 2.4, false);
  } else {
    drawFighterBody(ctx, shape, cx, cy, r, color, '#1c1a17', 2.4);
  }

  if (classId === 'vampire' || abilityId === 'vampire') {
    drawVampireFangs(ctx, cx, cy, r, 0);
  }
  if (classId === 'werewolf' || abilityId === 'werewolf') {
    drawWerewolfDetails(ctx, cx, cy, r, 0);
  }

  const wx = cx + r * 1.35;
  const wy = cy + 1;
  let angle = -Math.PI / 4;
  if (['archer', 'shield', 'soldier', 'claws', 'laser_bot', 'plasma_rex', 'boxer', 'hunter', 'zombie', 'werewolf', 'death', 'fairy'].includes(abilityId)) angle = 0;
  if (abilityId === 'spearman') angle = -Math.PI / 5;

  drawWeaponGraphic(ctx, abilityId, wx, wy, 0.85, angle, team);

  if (showDualIcons && abilityId === 'swordsman') {
    drawWeaponGraphic(ctx, abilityId, wx + 22, wy + 2, 0.75, -Math.PI / 4, team);
  }
}
