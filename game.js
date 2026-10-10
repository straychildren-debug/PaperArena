// Основной игровой движок Battle Royal Paper: физика Bouncing Arena, 37 способностей, финальное ускорение и UI

const CircledNumbers = [
  '①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯',
  '⑰','⑱','⑲','⑳','㉑','㉒','㉓','㉔','㉕','㉖','㉗','㉘','㉙','㉚','㉛',
  '㉜','㉝','㉞','㉟','㊱','㊲'
];

class BattleRoyalPaperGame {
  constructor() {
    this.canvas = document.getElementById('arenaCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.level = 5;
    this.maxUnlockedLevel = 10;
    this.completedLevels = new Set([1, 2, 3, 4]);

    this.state = 'prep'; // 'prep' | 'battle' | 'paused' | 'ended'
    this.simSpeed = 1;
    this.playerReady = true;
    this.botReady = true;

    this.selectedRosterClass = 'swordsman';
    this.doubleClickTargetTeam = 'player';

    // Ростеры команд
    this.playerBlueprints = [];
    this.botBlueprints = [];

    this.selectedPlayerUnitId = null;
    this.selectedBotUnitId = null;

    // Активные сущности на арене во время боя
    this.units = [];
    this.projectiles = [];
    this.zones = [];
    this.turrets = [];
    this.lightnings = [];
    this.particles = [];
    this.floatingTexts = [];

    // Правило «Когда остаётся мало бойцов — они увеличиваются и ускоряются»
    this.initialCombatantCount = 0;
    this.battleElapsedTime = 0;
    this.endgameStage = 0; // 0 = обычно, 1 = мало бойцов (рост и скорость), 2 = дуэль (максимальный рост и скорость)

    // Перетаскивание мышкой или пальцем на ринге
    this.draggingUnit = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.mobileActiveTab = 'player'; // 'player' | 'bot' | 'roster'

    this.uidCounter = 1;
    this.lastFrameTime = performance.now();

    this.initRosterUI();
    this.initEventListeners();
    this.setMobileTab('player');
    this.resizeCanvas();
    this.loadReferenceDefaultTeams();
    this.renderLevelBar();
    this.refreshAllUI();
    window.sfx.playMusic('prep');

    requestAnimationFrame((t) => this.loop(t));
  }

  nextUid() {
    return 'u_' + (this.uidCounter++);
  }

  resizeCanvas() {
    const frame = document.getElementById('arenaFrame');
    if (!frame) return;
    const displayWidth = frame.clientWidth;
    const displayHeight = frame.clientHeight;
    if (displayWidth < 40 || displayHeight < 40) return;

    // На узких мобильных экранах сохраняем пропорциональное логическое разрешение арены (минимум 580px в ширину),
    // чтобы бойцы не сплющивались, круги оставались идеально круглыми, а на ринге было просторно
    const scale = Math.max(1, 580 / displayWidth, 300 / displayHeight);
    const w = Math.round(displayWidth * scale);
    const h = Math.round(displayHeight * scale);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      const oldW = this.canvas.width || 760;
      const oldH = this.canvas.height || 450;
      this.canvas.width = w;
      this.canvas.height = h;

      const sx = w / oldW;
      const sy = h / oldH;
      for (const bp of [...this.playerBlueprints, ...this.botBlueprints]) {
        bp.x = Math.max(45, Math.min(w - 45, bp.x * sx));
        bp.y = Math.max(45, Math.min(h - 45, bp.y * sy));
      }
      if (this.state === 'prep') {
        this.syncUnitsFromBlueprints();
      }
    }
  }

  loadReferenceDefaultTeams() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.playerBlueprints = [
      this.createBlueprint('swordsman', 'player', w * 0.23, h * 0.19, { hp: 100, speed: 3, damage: 10 }),
      this.createBlueprint('archer',    'player', w * 0.14, h * 0.40, { hp: 85,  speed: 3, damage: 12 }),
      this.createBlueprint('shield',    'player', w * 0.25, h * 0.60, { hp: 140, speed: 2.5, damage: 5 }),
      this.createBlueprint('gunslinger','player', w * 0.19, h * 0.82, { hp: 90,  speed: 3, damage: 15 })
    ];

    this.botBlueprints = [
      this.createBlueprint('pyro',      'bot', w * 0.72, h * 0.18, { hp: 100, speed: 3, damage: 10 }),
      this.createBlueprint('spearman',  'bot', w * 0.81, h * 0.41, { hp: 115, speed: 3.2, damage: 12 }),
      this.createBlueprint('thunder',   'bot', w * 0.75, h * 0.62, { hp: 100, speed: 3.5, damage: 11 }),
      this.createBlueprint('engineer',  'bot', w * 0.76, h * 0.83, { hp: 110, speed: 2.6, damage: 8 })
    ];

    this.selectedPlayerUnitId = this.playerBlueprints[0].id;
    this.selectedBotUnitId = this.botBlueprints[0].id;
    this.syncUnitsFromBlueprints();
  }

  createBlueprint(classId, team, x, y, customStats = null) {
    const cls = getFighterClass(classId);
    const w = this.canvas.width || 760;
    const h = this.canvas.height || 450;

    if (x == null || y == null) {
      const minX = team === 'player' ? 60 : w * 0.56;
      const maxX = team === 'player' ? w * 0.44 : w - 60;
      x = minX + Math.random() * (maxX - minX);
      y = 65 + Math.random() * (h - 130);
    }

    return {
      id: this.nextUid(),
      team,
      classId: cls.id,
      abilityId: cls.id,
      name: cls.name,
      shape: cls.shape,
      hp: customStats?.hp ?? cls.hp,
      speed: customStats?.speed ?? cls.speed,
      damage: customStats?.damage ?? cls.damage,
      x,
      y
    };
  }

  generateBotTeamForLevel(lvl) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    const statMult = 1 + (lvl - 1) * 0.12;
    const count = Math.min(8, Math.max(2, Math.floor(1 + lvl * 0.65)));

    const botPool = FIGHTER_CLASSES.map(c => c.id);
    const newBots = [];

    if (lvl === 5 && this.botBlueprints.length === 0) {
      const preset = ['pyro', 'spearman', 'thunder', 'engineer'];
      preset.forEach((cid, idx) => {
        const cls = getFighterClass(cid);
        const py = h * (0.18 + idx * 0.21);
        const px = w * (idx % 2 === 0 ? 0.73 : 0.81);
        newBots.push(
          this.createBlueprint(cid, 'bot', px, py, {
            hp: Math.round((cls.hp * statMult) / 5) * 5,
            speed: Number((cls.speed + (lvl - 1) * 0.1).toFixed(1)),
            damage: Math.round(cls.damage * statMult)
          })
        );
      });
    } else {
      for (let i = 0; i < count; i++) {
        const cid = botPool[(lvl * 4 + i * 5 + Math.floor(Math.random() * 3)) % botPool.length];
        const cls = getFighterClass(cid);
        const row = i % 4;
        const col = Math.floor(i / 4);
        const px = w * (0.64 + col * 0.16 + (Math.random() * 0.05 - 0.025));
        const py = h * (0.18 + row * 0.21);
        const isBoss = (lvl % 5 === 0 && i === 0);

        const bp = this.createBlueprint(cid, 'bot', px, py, {
          hp: Math.round((cls.hp * statMult * (isBoss ? 1.45 : 1)) / 5) * 5,
          speed: Number(Math.min(8, cls.speed + (lvl - 1) * 0.12).toFixed(1)),
          damage: Math.round(cls.damage * statMult * (isBoss ? 1.25 : 1))
        });

        if (lvl >= 3 && Math.random() < 0.25) {
          const randAb = FIGHTER_CLASSES[Math.floor(Math.random() * FIGHTER_CLASSES.length)];
          bp.abilityId = randAb.id;
        }
        newBots.push(bp);
      }
    }

    this.botBlueprints = newBots;
    this.selectedBotUnitId = this.botBlueprints[0]?.id || null;
    if (this.state !== 'prep') {
      this.stopBattleToPrep();
    } else {
      this.syncUnitsFromBlueprints();
    }
    this.refreshAllUI();
  }

  syncUnitsFromBlueprints() {
    this.units = [];
    this.projectiles = [];
    this.zones = [];
    this.turrets = [];
    this.lightnings = [];
    this.particles = [];
    this.floatingTexts = [];
    this.endgameStage = 0;
    this.battleElapsedTime = 0;

    const allBps = [...this.playerBlueprints, ...this.botBlueprints];
    for (const bp of allBps) {
      this.units.push(this.instantiateUnit(bp));
    }
    this.initialCombatantCount = this.units.length;
  }

  instantiateUnit(bp, isMinion = false) {
    const angle = bp.team === 'player'
      ? (Math.random() * 0.9 - 0.45)
      : (Math.PI + (Math.random() * 0.9 - 0.45));

    const speedPx = (bp.speed || 3) * 44;
    const baseRadius = isMinion ? 11 : 21;
    const abilityId = bp.abilityId || bp.classId;

    // Для Червя (гусеницы) создаём цепочку из 7 сегментов хвоста!
    const segments = [];
    if (bp.classId === 'worm' || abilityId === 'worm') {
      const dir = bp.team === 'player' ? -1 : 1;
      for (let s = 1; s <= 7; s++) {
        segments.push({
          x: bp.x + dir * s * 12,
          y: bp.y + Math.sin(s * 0.8) * 4,
          r: Math.max(8, baseRadius * (0.86 - s * 0.06))
        });
      }
    }

    let initialCd = 0.6 + Math.random() * 0.5;
    if (abilityId === 'soldier') initialCd = 0.35;      // Стреляет каждые 0.5 с
    if (abilityId === 'ninja') initialCd = 2.0;         // Первый бросок сюрикенов пораньше, далее каждые 5 с
    if (abilityId === 'hunter') initialCd = 1.8;        // Первый выстрел дробовика пораньше, далее каждые 4 с
    if (abilityId === 'bomber') initialCd = 0.85;       // Сначала бомба уже в руках, после броска ждёт ровно 8 секунд!
    if (abilityId === 'checkmate') initialCd = 1.6;     // Каждые 4 секунды пускает 4 пешки (крестом или наискосок)
    if (abilityId === 'fairy') initialCd = 1.5;         // Каждые 3.5 секунды кастует заклинание из 7 возможных
    if (abilityId === 'card_master') initialCd = 1.2;   // Каждые 2.5 секунды кидает 3 карты по 30 урона

    return {
      id: bp.id || this.nextUid(),
      blueprintId: bp.id,
      team: bp.team,
      classId: bp.classId,
      abilityId,
      name: bp.name,
      shape: bp.shape,
      maxHp: bp.hp,
      hp: bp.hp,
      baseSpeed: bp.speed,
      damage: bp.damage,
      x: bp.x,
      y: bp.y,
      vx: Math.cos(angle) * speedPx,
      vy: Math.sin(angle) * speedPx,
      baseRadius,
      radius: baseRadius,
      isMinion,
      segments,
      // Боевые параметры
      weaponAngle: bp.team === 'player' ? -0.4 : Math.PI + 0.4,
      orbitDir: bp.team === 'player' ? 1 : -1,
      aimAngle: bp.team === 'player' ? 0 : Math.PI,
      cooldown: initialCd,
      // Специальные таймеры Супермена, Титана, Ниндзя, Боксёра, Оборотня, Смерти и Шах-и-Мата
      superLaserTimer: 2.5,   // первый залп лазеров пораньше, затем каждые 10 секунд
      superBoostCooldown: 5.0,// каждые 5 секунд ускоряется на 2 секунды с ×2 уроном
      superFlightTimer: 0,    // длительность полёта 2 секунды
      giantTimer: 0,          // длительность увеличения на 2 секунды (Титан / Кибер-Коготь)
      katanaSwingTimer: 0,    // анимация взмаха катаны Ниндзя из стороны в сторону при атаке
      scytheSwingTimer: 0,    // анимация взмаха косы Смерти при столкновении
      dizzyTimer: 0,          // мультипликационный нимб контузии от апперкота Боксёра (2.5 с)
      werewolfTimer: 40.0,    // Оборотень каждые 40 секунд меняет команду через дым (если не 1 на 1)
      smokeTimer: 0,          // анимация дымовой завесы при смене команды Оборотня
      chessDiagToggle: false, // чередование/выбор выстрела по прямой или наискосок у Шах и Мат
      thrustTimer: 0,
      hitImmunityMap: {},
      // Статус-эффекты
      burnTimer: 0,
      burnDps: 0,
      burnTick: 0,
      slowTimer: 0,
      stunTimer: 0,
      vulnTimer: 0,
      flashTimer: 0,
      scaleX: 1,
      scaleY: 1
    };
  }

  // ==================== ИНИЦИАЛИЗАЦИЯ UI И СОБЫТИЙ ====================
  initRosterUI() {
    const grid = document.getElementById('rosterGrid');
    grid.innerHTML = '';

    FIGHTER_CLASSES.forEach((cls, idx) => {
      const card = document.createElement('div');
      card.className = 'fighter-card' + (cls.id === this.selectedRosterClass ? ' selected-class' : '');
      card.dataset.classId = cls.id;

      card.innerHTML = `
        <div class="fc-top">
          <span class="fc-num">${CircledNumbers[idx] || (idx + 1)}</span>
          <span class="fc-name">${cls.name}</span>
        </div>
        <div class="fc-body">
          <canvas class="fc-canvas" width="90" height="44"></canvas>
          <span class="fc-sub">${cls.cardSub}</span>
        </div>
        <div class="fc-quick-add">
          <button class="fc-qbtn qp" data-add-team="player" title="Добавить в Вашу команду">+Игрок</button>
          <button class="fc-qbtn qb" data-add-team="bot" title="Добавить Ботам">+Бот</button>
        </div>
      `;

      const cnv = card.querySelector('canvas');
      const previewTeam = ['#ef5b50'].includes(cls.baseColor) ? 'bot' : 'player';
      renderFighterThumbnail(cnv, cls, previewTeam, false);

      card.addEventListener('click', (e) => {
        const quickTeam = e.target.getAttribute('data-add-team');
        if (quickTeam) {
          e.stopPropagation();
          this.selectRosterClass(cls.id);
          this.addUnitToTeam(quickTeam, cls.id);
          return;
        }
        const isMobileOrTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 960);
        // На мобильных и планшетах повторное нажатие по уже выбранному бойцу сразу добавляет его в выбранную команду
        if (isMobileOrTouch && this.selectedRosterClass === cls.id) {
          this.addUnitToTeam(this.doubleClickTargetTeam, cls.id);
          return;
        }
        window.sfx.click();
        this.selectRosterClass(cls.id);
      });

      card.addEventListener('dblclick', () => {
        this.selectRosterClass(cls.id);
        this.addUnitToTeam(this.doubleClickTargetTeam, cls.id);
      });

      grid.appendChild(card);
    });
  }

  selectRosterClass(classId) {
    this.selectedRosterClass = classId;
    document.querySelectorAll('.fighter-card').forEach(el => {
      el.classList.toggle('selected-class', el.dataset.classId === classId);
    });
  }

  setMobileTab(tabName) {
    this.mobileActiveTab = tabName;
    document.body.dataset.mobileTab = tabName;
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      btn.classList.toggle('active-mobile-tab', btn.dataset.mobileTab === tabName);
    });
    // Пересчитываем размер холста, если при переключении вкладок изменилась высота
    requestAnimationFrame(() => this.resizeCanvas());
  }

  initEventListeners() {
    const scheduleResize = () => {
      if (this.resizePending) return;
      this.resizePending = true;
      requestAnimationFrame(() => {
        this.resizePending = false;
        this.resizeCanvas();
      });
    };
    window.addEventListener('resize', scheduleResize);
    window.addEventListener('pageshow', scheduleResize);
    window.addEventListener('load', scheduleResize);
    document.addEventListener('fullscreenchange', scheduleResize);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) scheduleResize();
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleResize);
    }
    if (typeof ResizeObserver === 'function') {
      this.arenaResizeObserver = new ResizeObserver(scheduleResize);
      this.arenaResizeObserver.observe(document.getElementById('arenaFrame'));
    }
    window.addEventListener('orientationchange', () => {
      scheduleResize();
      setTimeout(scheduleResize, 120);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.refreshAllUI();
        scheduleResize();
      });
    }

    // Мобильные вкладки (Ваша команда / Боты / Все бойцы)
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.sfx.click();
        this.setMobileTab(btn.dataset.mobileTab);
      });
    });

    document.getElementById('targetPlayerBtn').addEventListener('click', () => {
      window.sfx.click();
      this.doubleClickTargetTeam = 'player';
      document.getElementById('targetPlayerBtn').classList.add('active-target');
      document.getElementById('targetBotBtn').classList.remove('active-target');
    });
    document.getElementById('targetBotBtn').addEventListener('click', () => {
      window.sfx.click();
      this.doubleClickTargetTeam = 'bot';
      document.getElementById('targetBotBtn').classList.add('active-target');
      document.getElementById('targetPlayerBtn').classList.remove('active-target');
    });

    document.getElementById('playerReadyBtn').addEventListener('click', () => {
      window.sfx.click();
      this.playerReady = !this.playerReady;
      this.updateReadyUI();
    });
    document.getElementById('botReadyBtn').addEventListener('click', () => {
      window.sfx.click();
      this.botReady = !this.botReady;
      this.updateReadyUI();
    });

    document.getElementById('startBtn').addEventListener('click', () => {
      this.handleStartButton();
    });

    document.getElementById('resetArenaBtn').addEventListener('click', () => {
      window.sfx.click();
      this.stopBattleToPrep();
    });

    document.getElementById('speedToggleBtn').addEventListener('click', (e) => {
      window.sfx.click();
      this.simSpeed = this.simSpeed === 1 ? 2 : 1;
      e.currentTarget.textContent = this.simSpeed + 'x';
    });

    document.getElementById('soundToggleBtn').addEventListener('click', (e) => {
      const on = window.sfx.toggle();
      e.currentTarget.textContent = on ? '🔊' : '🔇';
      if (on) window.sfx.click();
    });

    document.getElementById('prevLevelBtn').addEventListener('click', () => {
      if (this.level > 1) {
        window.sfx.click();
        this.setLevel(this.level - 1);
      }
    });
    document.getElementById('nextLevelBtn').addEventListener('click', () => {
      window.sfx.click();
      this.setLevel(this.level + 1);
    });
    document.getElementById('bossSkull').addEventListener('click', () => {
      window.sfx.click();
      this.setLevel(10);
    });
    document.getElementById('botScalingCard').addEventListener('click', () => {
      window.sfx.click();
      this.generateBotTeamForLevel(this.level);
    });

    document.getElementById('addPlayerUnitBtn').addEventListener('click', () => {
      this.addUnitToTeam('player', this.selectedRosterClass);
    });
    document.getElementById('dupPlayerUnitBtn').addEventListener('click', () => {
      this.duplicateSelectedUnit('player');
    });
    document.getElementById('dupPlayerInspectorBtn').addEventListener('click', () => {
      this.duplicateSelectedUnit('player');
    });
    document.getElementById('delPlayerUnitBtn').addEventListener('click', () => {
      this.deleteSelectedUnit('player');
    });
    document.getElementById('randomPlayerAbilityBtn').addEventListener('click', () => {
      this.randomizeUnitAbility('player');
    });

    document.getElementById('addBotUnitBtn').addEventListener('click', () => {
      this.addUnitToTeam('bot', this.selectedRosterClass);
    });
    document.getElementById('dupBotUnitBtn').addEventListener('click', () => {
      this.duplicateSelectedUnit('bot');
    });
    document.getElementById('dupBotInspectorBtn').addEventListener('click', () => {
      this.duplicateSelectedUnit('bot');
    });
    document.getElementById('delBotUnitBtn').addEventListener('click', () => {
      this.deleteSelectedUnit('bot');
    });
    document.getElementById('randomBotAbilityBtn').addEventListener('click', () => {
      this.randomizeUnitAbility('bot');
    });

    // Кнопки изменения статов (+ / −) с поддержкой зажатия (автоповтор на мобилках и ПК)
    document.querySelectorAll('.stat-btn').forEach(btn => {
      let holdTimeout = null;
      let holdInterval = null;
      let suppressNextClick = false;

      const clearHold = () => {
        if (holdTimeout) { clearTimeout(holdTimeout); holdTimeout = null; }
        if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
      };

      btn.addEventListener('pointerdown', (e) => {
        if (e.button && e.button !== 0) return;
        clearHold();
        const team = btn.dataset.team;
        const stat = btn.dataset.stat;
        const dir = parseInt(btn.dataset.dir, 10);
        holdTimeout = setTimeout(() => {
          suppressNextClick = true;
          let ticks = 0;
          holdInterval = setInterval(() => {
            ticks++;
            const stepMult = ticks > 8 ? 5 : (ticks > 3 ? 2 : 1);
            this.modifyUnitStat(team, stat, dir * stepMult);
          }, 95);
        }, 320);
      });

      btn.addEventListener('pointerup', clearHold);
      btn.addEventListener('pointerleave', clearHold);
      btn.addEventListener('pointercancel', clearHold);

      btn.addEventListener('click', (e) => {
        if (suppressNextClick) {
          suppressNextClick = false;
          return;
        }
        const team = btn.dataset.team;
        const stat = btn.dataset.stat;
        const dir = parseInt(btn.dataset.dir, 10);
        const mult = e.shiftKey ? 5 : 1;
        this.modifyUnitStat(team, stat, dir * mult);
      });
    });

    document.getElementById('replayLevelBtn').addEventListener('click', () => {
      window.sfx.click();
      this.stopBattleToPrep();
    });
    document.getElementById('nextStageBtn').addEventListener('click', () => {
      window.sfx.click();
      this.setLevel(this.level + 1);
    });

    // Управление мышью на ринге
    this.canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
    window.addEventListener('mouseup', () => this.onCanvasMouseUp());

    // Управление касанием (Touch) на ринге для телефонов и планшетов
    this.canvas.addEventListener('touchstart', (e) => this.onCanvasTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.onCanvasTouchMove(e), { passive: false });
    window.addEventListener('touchend', () => this.onCanvasTouchEnd());
    window.addEventListener('touchcancel', () => this.onCanvasTouchEnd());
  }

  // ==================== ЛОГИКА КОМАНД И СТАТОВ ====================
  setLevel(lvl) {
    this.level = Math.max(1, lvl);
    this.stopBattleToPrep();
    this.generateBotTeamForLevel(this.level);
    this.renderLevelBar();
    this.refreshAllUI();
  }

  renderLevelBar() {
    document.getElementById('levelNum').textContent = this.level;
    const container = document.getElementById('levelNodes');
    container.innerHTML = '';

    const totalNodes = 9;
    for (let i = 1; i <= totalNodes; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'lvl-node-wrap';

      const node = document.createElement('div');
      node.className = 'lvl-node';
      if (this.completedLevels.has(i) || i < this.level) node.classList.add('completed');
      if (i === this.level) node.classList.add('current');
      node.title = `Перейти на Уровень ${i}`;
      node.addEventListener('click', () => {
        window.sfx.click();
        this.setLevel(i);
      });

      const conn = document.createElement('div');
      conn.className = 'lvl-connector';

      wrap.appendChild(node);
      wrap.appendChild(conn);
      container.appendChild(wrap);
    }

    const bonusPct = Math.round((this.level - 1) * 12);
    document.getElementById('scalingSubtext').textContent =
      `🎲 Боты +${bonusPct}% • Реролл`;
  }

  addUnitToTeam(team, classId) {
    if (this.state !== 'prep') this.stopBattleToPrep();
    window.sfx.click();

    const bp = this.createBlueprint(classId, team);
    if (team === 'player') {
      this.playerBlueprints.push(bp);
      this.selectedPlayerUnitId = bp.id;
    } else {
      this.botBlueprints.push(bp);
      this.selectedBotUnitId = bp.id;
    }

    this.syncUnitsFromBlueprints();
    this.refreshAllUI();
  }

  duplicateSelectedUnit(team) {
    if (this.state !== 'prep') this.stopBattleToPrep();
    const list = team === 'player' ? this.playerBlueprints : this.botBlueprints;
    const selId = team === 'player' ? this.selectedPlayerUnitId : this.selectedBotUnitId;
    const orig = list.find(u => u.id === selId) || list[list.length - 1];
    if (!orig) return;

    window.sfx.click();
    const w = this.canvas.width;
    const h = this.canvas.height;
    const clone = {
      ...orig,
      id: this.nextUid(),
      x: Math.max(45, Math.min(w - 45, orig.x + (Math.random() * 54 - 27))),
      y: Math.max(45, Math.min(h - 45, orig.y + (Math.random() * 54 - 27)))
    };

    list.push(clone);
    if (team === 'player') this.selectedPlayerUnitId = clone.id;
    else this.selectedBotUnitId = clone.id;

    this.syncUnitsFromBlueprints();
    this.refreshAllUI();
  }

  deleteSelectedUnit(team) {
    if (this.state !== 'prep') this.stopBattleToPrep();
    const list = team === 'player' ? this.playerBlueprints : this.botBlueprints;
    if (list.length <= 1) return;
    const selId = team === 'player' ? this.selectedPlayerUnitId : this.selectedBotUnitId;
    const idx = list.findIndex(u => u.id === selId);
    if (idx !== -1) {
      window.sfx.click();
      list.splice(idx, 1);
      const nextUnit = list[Math.max(0, idx - 1)];
      if (team === 'player') this.selectedPlayerUnitId = nextUnit?.id || null;
      else this.selectedBotUnitId = nextUnit?.id || null;
      this.syncUnitsFromBlueprints();
      this.refreshAllUI();
    }
  }

  randomizeUnitAbility(team) {
    if (this.state !== 'prep') this.stopBattleToPrep();
    const list = team === 'player' ? this.playerBlueprints : this.botBlueprints;
    const selId = team === 'player' ? this.selectedPlayerUnitId : this.selectedBotUnitId;
    const unit = list.find(u => u.id === selId);
    if (!unit) return;

    window.sfx.click();
    const pool = FIGHTER_CLASSES.filter(c => c.id !== unit.abilityId);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    unit.abilityId = chosen.id;

    this.syncUnitsFromBlueprints();
    this.refreshAllUI();
  }

  modifyUnitStat(team, stat, deltaUnits) {
    const list = team === 'player' ? this.playerBlueprints : this.botBlueprints;
    const selId = team === 'player' ? this.selectedPlayerUnitId : this.selectedBotUnitId;
    const bp = list.find(u => u.id === selId);
    if (!bp) return;

    window.sfx.click();
    if (stat === 'hp') {
      bp.hp = Math.max(10, Math.min(2000, bp.hp + deltaUnits * 10));
    } else if (stat === 'speed') {
      bp.speed = Number(Math.max(0.5, Math.min(14, bp.speed + deltaUnits * 0.5)).toFixed(1));
    } else if (stat === 'damage') {
      bp.damage = Math.max(1, Math.min(500, bp.damage + deltaUnits * 2));
    }

    const live = this.units.find(u => u.blueprintId === bp.id);
    if (live) {
      if (stat === 'hp') {
        const diff = bp.hp - live.maxHp;
        live.maxHp = bp.hp;
        live.hp = Math.max(1, live.hp + diff);
      } else if (stat === 'speed') {
        live.baseSpeed = bp.speed;
        const curAng = Math.atan2(live.vy, live.vx);
        const spd = bp.speed * 44;
        live.vx = Math.cos(curAng) * spd;
        live.vy = Math.sin(curAng) * spd;
      } else if (stat === 'damage') {
        live.damage = bp.damage;
      }
    }

    this.refreshAllUI();
  }

  refreshAllUI() {
    this.updateReadyUI();
    const mobPlayerCount = document.getElementById('mobPlayerCount');
    const mobBotCount = document.getElementById('mobBotCount');
    if (mobPlayerCount) mobPlayerCount.textContent = this.playerBlueprints.length;
    if (mobBotCount) mobBotCount.textContent = this.botBlueprints.length;

    this.renderTeamSlots('player', this.playerBlueprints, this.selectedPlayerUnitId, 'playerTeamSlots');
    this.renderTeamSlots('bot', this.botBlueprints, this.selectedBotUnitId, 'botTeamSlots');
    this.renderInspector('player', this.playerBlueprints, this.selectedPlayerUnitId);
    this.renderInspector('bot', this.botBlueprints, this.selectedBotUnitId);
  }

  updateReadyUI() {
    const pBtn = document.getElementById('playerReadyBtn');
    const bBtn = document.getElementById('botReadyBtn');
    pBtn.classList.toggle('is-ready', this.playerReady);
    bBtn.classList.toggle('is-ready', this.botReady);

    const sBtn = document.getElementById('startBtn');
    const sText = document.getElementById('startBtnText');
    const resetBtn = document.getElementById('resetArenaBtn');

    if (this.state === 'prep') {
      sBtn.classList.remove('is-fighting');
      sBtn.classList.toggle('not-ready', !(this.playerReady && this.botReady));
      sText.textContent = 'СТАРТ';
      resetBtn.classList.add('hidden');
      document.getElementById('arenaHint').classList.remove('hidden');
    } else if (this.state === 'battle') {
      sBtn.classList.add('is-fighting');
      sBtn.classList.remove('not-ready');
      sText.textContent = 'ПАУЗА';
      resetBtn.classList.remove('hidden');
      document.getElementById('arenaHint').classList.add('hidden');
    } else if (this.state === 'paused') {
      sBtn.classList.remove('is-fighting');
      sText.textContent = 'ПРОДОЛЖИТЬ';
      resetBtn.classList.remove('hidden');
    }
  }

  renderTeamSlots(team, blueprints, selectedId, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    blueprints.forEach((bp, idx) => {
      const slot = document.createElement('div');
      slot.className = 'slot-card' + (bp.id === selectedId ? ' selected' : '');
      slot.title = `${bp.name} (Здоровье: ${bp.hp}, Скорость: ${bp.speed}, Урон: ${bp.damage})`;

      const badge = document.createElement('span');
      badge.className = 'slot-count-badge';
      badge.textContent = `#${idx + 1}`;

      const cnv = document.createElement('canvas');
      cnv.width = 58;
      cnv.height = 50;
      renderFighterThumbnail(cnv, bp, team, false);

      slot.appendChild(badge);
      slot.appendChild(cnv);

      slot.addEventListener('click', () => {
        window.sfx.click();
        if (team === 'player') this.selectedPlayerUnitId = bp.id;
        else this.selectedBotUnitId = bp.id;
        this.refreshAllUI();
      });

      container.appendChild(slot);
    });
  }

  renderInspector(team, blueprints, selectedId) {
    const bp = blueprints.find(u => u.id === selectedId) || blueprints[0];
    if (!bp) return;

    const prefix = team === 'player' ? 'player' : 'bot';
    const abilityCls = getFighterClass(bp.abilityId);

    const nameEl = document.getElementById(`${prefix}UnitName`);
    if (bp.abilityId !== bp.classId) {
      nameEl.textContent = `${bp.name} (${abilityCls.name})`;
    } else {
      nameEl.textContent = bp.name.toUpperCase();
    }

    document.getElementById(`${prefix}UnitAbilityDesc`).textContent = abilityCls.desc;
    document.getElementById(`${prefix}StatHp`).textContent = bp.hp;
    document.getElementById(`${prefix}StatSpeed`).textContent = bp.speed;
    document.getElementById(`${prefix}StatDamage`).textContent = bp.damage;
    document.getElementById(`${prefix}DmgLabel`).textContent =
      bp.abilityId === 'healer' ? 'Лечение' : 'Урон';

    const previewCnv = document.getElementById(`${prefix}PreviewCanvas`);
    renderFighterThumbnail(previewCnv, bp, team, true);
  }

  // ==================== ЗАПУСК, ПАУЗА И ЗАВЕРШЕНИЕ БОЯ ====================
  handleStartButton() {
    if (this.state === 'prep') {
      this.playerReady = true;
      this.botReady = true;
      this.startBattle();
    } else if (this.state === 'battle') {
      window.sfx.click();
      this.state = 'paused';
      this.updateReadyUI();
    } else if (this.state === 'paused') {
      window.sfx.click();
      this.state = 'battle';
      this.updateReadyUI();
    } else if (this.state === 'ended') {
      this.stopBattleToPrep();
    }
  }

  startBattle() {
    this.syncUnitsFromBlueprints();
    if (this.units.length === 0) return;

    window.sfx.startBattle();
    this.state = 'battle';
    this.battleElapsedTime = 0;
    this.endgameStage = 0;
    document.getElementById('battleResultOverlay').classList.add('hidden');
    this.updateReadyUI();
  }

  stopBattleToPrep() {
    this.state = 'prep';
    window.sfx.playMusic('prep');
    document.getElementById('battleResultOverlay').classList.add('hidden');
    this.syncUnitsFromBlueprints();
    this.refreshAllUI();
  }

  finishBattle(winnerTeam) {
    this.state = 'ended';
    const overlay = document.getElementById('battleResultOverlay');
    const icon = document.getElementById('overlayIcon');
    const title = document.getElementById('overlayTitle');
    const sub = document.getElementById('overlaySubtitle');
    const nextBtn = document.getElementById('nextStageBtn');

    overlay.classList.remove('hidden');

    if (winnerTeam === 'player') {
      window.sfx.victory();
      this.completedLevels.add(this.level);
      this.renderLevelBar();
      icon.textContent = '🏆';
      title.textContent = `УРОВЕНЬ ${this.level} ПРОЙДЕН!`;
      sub.textContent = 'Ваши бумажные бойцы одержали чистую победу на ринге!';
      nextBtn.classList.remove('hidden');
    } else {
      window.sfx.defeat();
      icon.textContent = '💀';
      title.textContent = 'ПОБЕДА БОТОВ!';
      sub.textContent = 'Добавьте больше бойцов, поменяйте способности или увеличьте статы!';
      nextBtn.classList.add('hidden');
    }
  }

  // ==================== ПЕРЕТАСКИВАНИЕ БОЙЦОВ НА РИНГЕ (МЫШЬ + TOUCH) ====================
  getCanvasMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const pt = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return {
      x: (pt.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (pt.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  findUnitAtPos(pos, extraHitPad = 10) {
    let bestUnit = null;
    let bestDist = Infinity;
    for (let i = this.units.length - 1; i >= 0; i--) {
      const u = this.units[i];
      if (u.isMinion) continue;
      const dist = Math.hypot(pos.x - u.x, pos.y - u.y);
      if (dist <= u.radius + extraHitPad && dist < bestDist) {
        bestDist = dist;
        bestUnit = u;
      }
    }
    return bestUnit;
  }

  selectAndStartDragUnit(u, pos) {
    window.sfx.click();
    if (u.team === 'player') {
      this.selectedPlayerUnitId = u.blueprintId;
      if (this.mobileActiveTab !== 'roster') this.setMobileTab('player');
    } else {
      this.selectedBotUnitId = u.blueprintId;
      if (this.mobileActiveTab !== 'roster') this.setMobileTab('bot');
    }
    this.refreshAllUI();

    if (this.state === 'prep') {
      this.draggingUnit = u;
      this.dragOffsetX = pos.x - u.x;
      this.dragOffsetY = pos.y - u.y;
    }
  }

  onCanvasMouseDown(e) {
    const pos = this.getCanvasMousePos(e);
    const u = this.findUnitAtPos(pos, 10);
    if (u) {
      this.selectAndStartDragUnit(u, pos);
    }
  }

  onCanvasMouseMove(e) {
    if (!this.draggingUnit || this.state !== 'prep') return;
    const pos = this.getCanvasMousePos(e);
    this.moveDraggedUnitTo(pos);
  }

  onCanvasMouseUp() {
    this.draggingUnit = null;
  }

  onCanvasTouchStart(e) {
    if (!e.touches || e.touches.length === 0) return;
    const pos = this.getCanvasMousePos(e);
    // Увеличенный радиус захвата для пальца на мобильном экране (+22px)
    const u = this.findUnitAtPos(pos, 22);
    if (u) {
      if (e.cancelable) e.preventDefault();
      this.selectAndStartDragUnit(u, pos);
    }
  }

  onCanvasTouchMove(e) {
    if (!this.draggingUnit || this.state !== 'prep') return;
    if (e.cancelable) e.preventDefault();
    const pos = this.getCanvasMousePos(e);
    this.moveDraggedUnitTo(pos);
  }

  onCanvasTouchEnd() {
    this.draggingUnit = null;
  }

  moveDraggedUnitTo(pos) {
    if (!this.draggingUnit) return;
    const pad = this.draggingUnit.radius + 14;
    const nx = Math.max(pad, Math.min(this.canvas.width - pad, pos.x - this.dragOffsetX));
    const ny = Math.max(pad, Math.min(this.canvas.height - pad, pos.y - this.dragOffsetY));

    const dx = nx - this.draggingUnit.x;
    const dy = ny - this.draggingUnit.y;
    this.draggingUnit.x = nx;
    this.draggingUnit.y = ny;

    // Если двигаем Червя — двигаем и его сегменты хвоста
    if (this.draggingUnit.segments && this.draggingUnit.segments.length > 0) {
      for (const seg of this.draggingUnit.segments) {
        seg.x += dx;
        seg.y += dy;
      }
    }

    const list = this.draggingUnit.team === 'player' ? this.playerBlueprints : this.botBlueprints;
    const bp = list.find(b => b.id === this.draggingUnit.blueprintId);
    if (bp) {
      bp.x = nx;
      bp.y = ny;
    }
  }

  // ==================== ФИЗИКА BOUNCING ARENA И СПОСОБНОСТИ ====================
  loop(now) {
    const rawDt = Math.min(0.04, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (this.state === 'battle') {
      const dt = rawDt * this.simSpeed;
      this.updateBattle(dt);
    }

    this.renderArena(now / 1000);
    requestAnimationFrame((t) => this.loop(t));
  }

  // Проверка правила: «Когда остаётся мало бойцов — они увеличиваются и ускоряются»
  checkEndgameScaling(aliveMainsCount) {
    let targetStage = 0;

    if (this.initialCombatantCount > 3) {
      if (aliveMainsCount <= 2) targetStage = 2;
      else if (aliveMainsCount <= 3 || aliveMainsCount <= Math.ceil(this.initialCombatantCount * 0.4)) targetStage = 1;
    } else {
      // Если бой изначально с малым числом бойцов (например, 1х1 или 2х1), включаем усиление при выбывании кого-то или через 5 секунд боя!
      if (aliveMainsCount < this.initialCombatantCount || this.battleElapsedTime >= 5.0) {
        targetStage = aliveMainsCount <= 2 ? 2 : 1;
      }
    }

    if (targetStage > this.endgameStage) {
      this.endgameStage = targetStage;
      window.sfx.heal();
      window.sfx.playMusic('endgame');
      const cx = this.canvas.width / 2;
      const cy = 48;
      if (targetStage === 1) {
        this.addFloatingText(cx, cy, '🔥 МАЛО БОЙЦОВ! РОСТ И УСКОРЕНИЕ!', '#e11d48');
      } else {
        this.addFloatingText(cx, cy, '⚡ ФИНАЛЬНАЯ ДУЭЛЬ! ГИГАНТСКИЙ РАЗМЕР И СКОРОСТЬ!', '#dc2626');
      }
    }
  }

  updateBattle(dt) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const margin = 14;

    this.battleElapsedTime += dt;

    // 0. Проверяем правило «Мало бойцов -> увеличиваются и ускоряются»
    const aliveMains = this.units.filter(u => !u.isMinion && u.hp > 0);
    this.checkEndgameScaling(aliveMains.length);

    const endgameSizeMult = this.endgameStage === 2 ? 1.52 : (this.endgameStage === 1 ? 1.28 : 1.0);
    const endgameSpeedMult = this.endgameStage === 2 ? 1.62 : (this.endgameStage === 1 ? 1.35 : 1.0);

    // 1. Обновляем зоны
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i];
      z.life -= dt;
      z.tick -= dt;

      if (z.type === 'graviton') {
        for (const u of this.units) {
          if (u.team === z.team || u.hp <= 0) continue;
          const dx = z.x - u.x;
          const dy = z.y - u.y;
          const dist = Math.hypot(dx, dy);
          if (dist < z.radius * 1.45 && dist > 6) {
            u.vx += (dx / dist) * 260 * dt;
            u.vy += (dy / dist) * 260 * dt;
          }
        }
      }

      if (z.tick <= 0) {
        z.tick = 0.45;
        for (const u of this.units) {
          if (u.team === z.team || u.hp <= 0) continue;
          if (Math.hypot(u.x - z.x, u.y - z.y) <= z.radius + u.radius * 0.6) {
            if (z.type === 'acid') {
              u.vulnTimer = 2.0;
              this.applyDamage(u, z.damage * 0.45, null, '#55b83b');
            } else if (z.type === 'fire') {
              this.applyDamage(u, z.damage * 0.4, null, '#ff6b2b');
            } else if (z.type === 'graviton') {
              this.applyDamage(u, z.damage * 0.45, null, '#8f4ef2');
            }
          }
        }
      }

      if (z.life <= 0) {
        if (z.type === 'graviton') {
          for (const u of this.units) {
            if (u.team === z.team || u.hp <= 0) continue;
            const dx = u.x - z.x;
            const dy = u.y - z.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d <= z.radius * 1.4) {
              u.vx += (dx / d) * 180;
              u.vy += (dy / d) * 180;
            }
          }
        }
        this.zones.splice(i, 1);
      }
    }

    // 2. Обновляем турели Инженеров
    for (let i = this.turrets.length - 1; i >= 0; i--) {
      const t = this.turrets[i];
      t.life -= dt;
      t.cooldown -= dt;
      if (t.hp <= 0 || t.life <= 0) {
        this.spawnConfetti(t.x, t.y, '#ef5b50', 8);
        this.turrets.splice(i, 1);
        continue;
      }

      const target = this.findNearestEnemy(t.x, t.y, t.team);
      if (target) {
        const dist = Math.hypot(target.x - t.x, target.y - t.y);
        t.angle = Math.atan2(target.y - t.y, target.x - t.x);
        if (dist <= t.range && t.cooldown <= 0) {
          t.cooldown = 1.15;
          window.sfx.shootArrow();
          this.projectiles.push({
            type: 'turret_dart',
            team: t.team,
            x: t.x + Math.cos(t.angle) * 14,
            y: t.y + Math.sin(t.angle) * 14,
            vx: Math.cos(t.angle) * 320,
            vy: Math.sin(t.angle) * 320,
            radius: 4,
            damage: t.damage,
            piercing: false,
            hitSet: new Set()
          });
        }
      }
    }

    // 3. Движение и способности каждого бойца
    for (const u of this.units) {
      if (u.hp <= 0) continue;

      u.scaleX += (1 - u.scaleX) * Math.min(1, dt * 12);
      u.scaleY += (1 - u.scaleY) * Math.min(1, dt * 12);

      if (u.flashTimer > 0) u.flashTimer -= dt;
      if (u.slowTimer > 0) u.slowTimer -= dt;
      if (u.vulnTimer > 0) u.vulnTimer -= dt;
      if (u.thrustTimer > 0) u.thrustTimer -= dt;
      if (u.superFlightTimer > 0) u.superFlightTimer -= dt;
      if (u.giantTimer > 0) u.giantTimer -= dt;
      if (u.katanaSwingTimer > 0) u.katanaSwingTimer -= dt;
      if (u.scytheSwingTimer > 0) u.scytheSwingTimer -= dt;
      if (u.dizzyTimer > 0) u.dizzyTimer -= dt;
      if (u.smokeTimer > 0) u.smokeTimer -= dt;

      // ОБОРОТЕНЬ: каждые 40 секунд меняет команду через дым, НО если остался 1 на 1 — способность не действует!
      if ((u.classId === 'werewolf' || u.abilityId === 'werewolf') && !u.isMinion) {
        const myTeamMains = aliveMains.filter(m => m.team === u.team);
        const isOneOnOne = aliveMains.length <= 2;
        if (!isOneOnOne) {
          u.werewolfTimer -= dt;
          if (u.werewolfTimer <= 0) {
            u.werewolfTimer = 40.0;
            // Меняем команду, только если не 1 на 1 (и в нашей команде есть ещё хотя бы 1 боец, чтобы бой не завершился мгновенно)
            if (myTeamMains.length > 1) {
              u.team = u.team === 'player' ? 'bot' : 'player';
              u.smokeTimer = 1.4;
              window.sfx.magicFire();
              // Густое облако дыма при смене команды
              for (let s = 0; s < 22; s++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 20 + Math.random() * 75;
                this.particles.push({
                  x: u.x + (Math.random() * 16 - 8),
                  y: u.y + (Math.random() * 16 - 8),
                  vx: Math.cos(ang) * spd,
                  vy: Math.sin(ang) * spd,
                  size: 6 + Math.random() * 7,
                  color: s % 2 === 0 ? '#94a3b8' : '#cbd5e1',
                  life: 0.65 + Math.random() * 0.45
                });
              }
              this.addFloatingText(u.x, u.y - u.radius - 20, '💨 ОБОРОТЕНЬ СМЕНИЛ КОМАНДУ!', '#64748b');
            }
          }
        }
      }

      // Плавное изменение размера (с учётом правила «Мало бойцов» и способности «Увеличение на 2 секунды»)
      const giantMult = u.giantTimer > 0 ? 1.85 : 1.0;
      const targetRadius = u.baseRadius * (u.isMinion ? 1.0 : endgameSizeMult) * giantMult;
      u.radius += (targetRadius - u.radius) * Math.min(1, dt * 8);

      // Горение
      if (u.burnTimer > 0) {
        u.burnTimer -= dt;
        u.burnTick -= dt;
        if (u.burnTick <= 0) {
          u.burnTick = 0.5;
          this.applyDamage(u, u.burnDps * 0.5, null, '#ff6a1a');
          this.spawnConfetti(u.x, u.y - 6, '#ff8822', 2);
        }
      }

      for (const k of Object.keys(u.hitImmunityMap)) {
        u.hitImmunityMap[k] -= dt;
        if (u.hitImmunityMap[k] <= 0) delete u.hitImmunityMap[k];
      }

      if (u.stunTimer > 0) {
        u.stunTimer -= dt;
        continue;
      }

      // Пассивка Берсерка
      let rageMult = 1;
      if (u.abilityId === 'berserker') {
        const missingRatio = 1 - Math.max(0, u.hp / u.maxHp);
        rageMult = 1 + missingRatio * 1.15;
      }

      // Ускорение Супермена во время 2-секундного супер-полёта
      const superSpeedMult = u.superFlightTimer > 0 ? 2.15 : 1.0;
      const slowMult = u.slowTimer > 0 ? 0.5 : 1.0;
      const finalSpeedMult = slowMult * rageMult * superSpeedMult * (u.isMinion ? 1.0 : endgameSpeedMult);
      const targetSpeed = u.baseSpeed * 44 * finalSpeedMult;

      // ВАМПИР: не просто бьётся об стены, а целенаправленно двигается за своей целью!
      const enemy = this.findNearestEnemy(u.x, u.y, u.team);
      if ((u.classId === 'vampire' || u.abilityId === 'vampire') && enemy) {
        const desiredAng = Math.atan2(enemy.y - u.y, enemy.x - u.x);
        const curAng = Math.atan2(u.vy, u.vx);
        const angDiff = this.normalizeAngle(desiredAng - curAng);
        const newAng = curAng + angDiff * Math.min(1, dt * 5.5);
        u.vx = Math.cos(newAng) * targetSpeed;
        u.vy = Math.sin(newAng) * targetSpeed;
      } else if (u.superFlightTimer > 0 && enemy) {
        // Во время 2-секундного полёта Супермен тоже подруливает в сторону врагов
        const desiredAng = Math.atan2(enemy.y - u.y, enemy.x - u.x);
        const curAng = Math.atan2(u.vy, u.vx);
        const angDiff = this.normalizeAngle(desiredAng - curAng);
        const newAng = curAng + angDiff * Math.min(1, dt * 3.5);
        u.vx = Math.cos(newAng) * targetSpeed;
        u.vy = Math.sin(newAng) * targetSpeed;
      } else {
        const curSpd = Math.hypot(u.vx, u.vy) || 1;
        const blendedSpd = curSpd + (targetSpeed - curSpd) * Math.min(1, dt * 6);
        u.vx = (u.vx / curSpd) * blendedSpd;
        u.vy = (u.vy / curSpd) * blendedSpd;
      }

      u.x += u.vx * dt;
      u.y += u.vy * dt;

      // Рикошет от 4 стен ринга
      const minX = margin + u.radius;
      const maxX = w - margin - u.radius;
      const minY = margin + u.radius;
      const maxY = h - margin - u.radius;

      if (u.x < minX) {
        u.x = minX;
        u.vx = Math.abs(u.vx);
        u.scaleX = 0.78; u.scaleY = 1.22;
        window.sfx.bounce();
      } else if (u.x > maxX) {
        u.x = maxX;
        u.vx = -Math.abs(u.vx);
        u.scaleX = 0.78; u.scaleY = 1.22;
        window.sfx.bounce();
      }

      if (u.y < minY) {
        u.y = minY;
        u.vy = Math.abs(u.vy);
        u.scaleX = 1.22; u.scaleY = 0.78;
        window.sfx.bounce();
      } else if (u.y > maxY) {
        u.y = maxY;
        u.vy = -Math.abs(u.vy);
        u.scaleX = 1.22; u.scaleY = 0.78;
        window.sfx.bounce();
      }

      // Обновление сегментов хвоста Червя (гусеницы)
      if (u.segments && u.segments.length > 0) {
        let leadX = u.x;
        let leadY = u.y;
        const spacing = u.radius * 0.65;
        for (let s = 0; s < u.segments.length; s++) {
          const seg = u.segments[s];
          seg.r = Math.max(7, u.radius * (0.85 - (s + 1) * 0.065));
          const dx = seg.x - leadX;
          const dy = seg.y - leadY;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist > spacing) {
            seg.x = leadX + (dx / dist) * spacing;
            seg.y = leadY + (dy / dist) * spacing;
          }
          leadX = seg.x;
          leadY = seg.y;
        }
      }

      // Обновление оружия и активных способностей
      this.updateUnitAbility(u, dt * slowMult * rageMult, rageMult);
    }

    // 4. Столкновения корпусов бойцов + хвоста Червя
    for (let i = 0; i < this.units.length; i++) {
      const a = this.units[i];
      if (a.hp <= 0) continue;
      for (let j = i + 1; j < this.units.length; j++) {
        const b = this.units[j];
        if (b.hp <= 0) continue;
        this.resolveUnitCollision(a, b);
      }
      // Проверка касаний врагов об сегменты хвоста Червя
      if (a.segments && a.segments.length > 0) {
        for (const other of this.units) {
          if (other.team === a.team || other.hp <= 0) continue;
          if (a.hitImmunityMap['tail_' + other.id]) continue;
          for (const seg of a.segments) {
            if (Math.hypot(other.x - seg.x, other.y - seg.y) <= other.radius + seg.r) {
              a.hitImmunityMap['tail_' + other.id] = 0.45;
              window.sfx.hit();
              this.applyDamage(other, Math.round(a.damage * 0.85), a);
              break;
            }
          }
        }
      }
    }

    // 5. Проверка попаданий вращающегося и древкового оружия
    this.checkMeleeWeapons();

    // 6. Обновление снарядов
    this.updateProjectiles(dt);

    // 7. Эффекты молний, лазеров, частиц и всплывающего текста
    for (let i = this.lightnings.length - 1; i >= 0; i--) {
      this.lightnings[i].life -= dt;
      if (this.lightnings[i].life <= 0) this.lightnings.splice(i, 1);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 8. Удаление побеждённых бойцов и проверка победы
    this.units = this.units.filter(u => u.hp > 0);

    const alivePlayers = this.units.filter(u => u.team === 'player');
    const aliveBots = this.units.filter(u => u.team === 'bot');

    if (alivePlayers.length === 0 || aliveBots.length === 0) {
      const winner = alivePlayers.length > 0 ? 'player' : 'bot';
      this.finishBattle(winner);
    }
  }

  findNearestEnemy(x, y, myTeam) {
    let best = null;
    let bestDist = Infinity;
    for (const u of this.units) {
      if (u.team === myTeam || u.hp <= 0) continue;
      const d = Math.hypot(u.x - x, u.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = u;
      }
    }
    return best;
  }

  isTargetProtectedAtAngle(target, incomingAngleFromTarget) {
    if (target.isMinion) return false;
    let protectedAngle = null;
    let halfCone = 0;

    if (target.abilityId === 'shield') {
      protectedAngle = target.aimAngle;
      halfCone = Math.PI * 0.36;
    } else if (target.abilityId === 'swordsman' || target.abilityId === 'berserker') {
      protectedAngle = target.weaponAngle;
      halfCone = Math.PI * 0.22;
    } else if (target.abilityId === 'spearman') {
      protectedAngle = target.aimAngle;
      halfCone = Math.PI * 0.20;
    }

    if (protectedAngle === null) return false;
    const diff = Math.abs(this.normalizeAngle(incomingAngleFromTarget - protectedAngle));
    return diff <= halfCone;
  }

  normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  // Выстрел сквозным лазерным лучом через арену
  fireLaserBeam(u, targetAngle, dmgMultiplier = 1, beamColor = '#06b6d4') {
    const startX = u.x + Math.cos(targetAngle) * (u.radius + 4);
    const startY = u.y + Math.sin(targetAngle) * (u.radius + 4);
    const len = 950;
    const endX = startX + Math.cos(targetAngle) * len;
    const endY = startY + Math.sin(targetAngle) * len;

    this.lightnings.push({
      isStraightLaser: true,
      x1: startX,
      y1: startY,
      x2: endX,
      y2: endY,
      color: beamColor,
      width: 5.5,
      life: 0.32
    });

    const dx = endX - startX;
    const dy = endY - startY;
    const lineLenSq = dx * dx + dy * dy;

    for (const other of this.units) {
      if (other.team === u.team || other.hp <= 0) continue;
      const t = Math.max(0, Math.min(1, ((other.x - startX) * dx + (other.y - startY) * dy) / lineLenSq));
      const projX = startX + t * dx;
      const projY = startY + t * dy;
      if (Math.hypot(other.x - projX, other.y - projY) <= other.radius + 8) {
        const dmg = Math.round(u.damage * dmgMultiplier);
        this.applyDamage(other, dmg, u, beamColor);
      }
    }
  }

  updateUnitAbility(u, dt, rageMult = 1) {
    if (u.isMinion) return;

    const enemy = this.findNearestEnemy(u.x, u.y, u.team);
    if (enemy) {
      const targetAngle = Math.atan2(enemy.y - u.y, enemy.x - u.x);
      const diff = this.normalizeAngle(targetAngle - u.aimAngle);
      u.aimAngle += diff * Math.min(1, dt * 8.5);
    } else {
      u.aimAngle = Math.atan2(u.vy, u.vx);
    }

    // ==================== СУПЕРМЕН ====================
    // Каждые 5 секунд ускоряется на 2 секунды (с ×2 уроном) + каждые 10 секунд стреляет небольшими лазерами!
    if (u.abilityId === 'superman') {
      u.weaponAngle = u.aimAngle;
      u.superBoostCooldown -= dt;
      if (u.superBoostCooldown <= 0) {
        u.superBoostCooldown = 5.0; // Каждые 5 секунд!
        u.superFlightTimer = 2.0;   // Ускоряется и летает на 2 секунды с ×2 уроном!
        window.sfx.startBattle();
        this.addFloatingText(u.x, u.y - u.radius - 18, '🦸 ПОЛЁТ 2С (УРОН ×2)!', '#dc2626');
        this.spawnConfetti(u.x, u.y, '#facc15', 10);
      }

      u.superLaserTimer -= dt;
      if (u.superLaserTimer <= 0 && enemy) {
        u.superLaserTimer = 10.0; // Каждые 10 секунд стреляет небольшими лазерами!
        window.sfx.lightning();
        const mult = u.superFlightTimer > 0 ? 2.0 : 1.0;
        const baseAng = u.aimAngle;
        for (const spread of [-0.14, 0, 0.14]) {
          const ang = baseAng + spread;
          this.projectiles.push({
            type: 'small_laser',
            team: u.team,
            x: u.x + Math.cos(ang) * (u.radius + 8),
            y: u.y + Math.sin(ang) * (u.radius + 8),
            vx: Math.cos(ang) * 540,
            vy: Math.sin(ang) * 540,
            radius: 5,
            damage: Math.round(u.damage * mult),
            piercing: true,
            hitSet: new Set()
          });
        }
        this.addFloatingText(u.x, u.y - u.radius - 16, '👀 ЛАЗЕРЫ!', '#ef4444');
      }
      return;
    }

    // Вращение орбитального оружия (Мечник, Берсерк)
    if (u.abilityId === 'swordsman' || u.abilityId === 'berserker') {
      const spinSpeed = u.abilityId === 'berserker' ? 4.4 : 4.0;
      u.weaponAngle = this.normalizeAngle(u.weaponAngle + u.orbitDir * spinSpeed * dt);
      return;
    }

    // Копейщик
    if (u.abilityId === 'spearman') {
      const moveAng = Math.atan2(u.vy, u.vx);
      const diff = this.normalizeAngle(moveAng - u.aimAngle);
      u.aimAngle += diff * 0.35;
      u.weaponAngle = u.aimAngle;
      u.cooldown -= dt;
      if (u.cooldown <= 0) {
        u.cooldown = 1.6;
        u.thrustTimer = 0.32;
        u.vx *= 1.32;
        u.vy *= 1.32;
      }
      return;
    }

    // Контактные бойцы держат оружие по курсу к врагу
    if (['shield', 'vampire', 'worm', 'claws', 'robo_mech', 'boxer', 'zombie', 'werewolf', 'death', 'doubler'].includes(u.abilityId)) {
      u.weaponAngle = u.aimAngle;
      return;
    }

    // Бойцы со снарядами ориентируют оружие по курсу к цели
    if (['ninja', 'bomber', 'checkmate', 'fairy', 'card_master'].includes(u.abilityId)) {
      u.weaponAngle = u.aimAngle;
    }

    // Перезарядка активных способностей
    u.cooldown -= dt;
    if (u.cooldown > 0) return;

    switch (u.abilityId) {
      case 'bomber': {
        // ПОДРЫВНИК: кидает бомбу во врагов (взрыв -60 HP всем в радиусе взрыва), новая бомба появляется ровно через 8 секунд!
        if (!enemy) break;
        u.cooldown = 8.0; // Ровно 8 секунд до появления новой гранаты!
        window.sfx.shootArrow();
        const ang = u.aimAngle;
        this.projectiles.push({
          type: 'bomb_grenade',
          team: u.team,
          owner: u,
          x: u.x + Math.cos(ang) * (u.radius + 10),
          y: u.y + Math.sin(ang) * (u.radius + 10),
          vx: Math.cos(ang) * 280,
          vy: Math.sin(ang) * 280,
          targetX: enemy.x,
          targetY: enemy.y,
          spin: 0,
          blastRadius: 92,
          radius: 9,
          damage: u.damage, // 60 единиц здоровья всем в радиусе взрыва!
          piercing: false,
          hitSet: new Set()
        });
        this.addFloatingText(u.x, u.y - u.radius - 16, '💣 БРОСОК БОМБЫ (-60)!', '#dc2626');
        break;
      }

      case 'checkmate': {
        // ШАХ И МАТ: каждые 4 секунды стреляет 4 снарядами-пешками (по 60 урона) либо ПО ПРЯМОЙ (+), либо НАИСКОСОК (×)!
        u.cooldown = 4.0;
        window.sfx.pistolShot();
        const isDiagonal = Math.random() < 0.5;
        const baseOffset = isDiagonal ? Math.PI / 4 : 0;
        for (let dirIdx = 0; dirIdx < 4; dirIdx++) {
          const ang = baseOffset + (dirIdx * Math.PI) / 2;
          this.projectiles.push({
            type: 'chess_pawn',
            team: u.team,
            owner: u,
            x: u.x + Math.cos(ang) * (u.radius + 8),
            y: u.y + Math.sin(ang) * (u.radius + 8),
            vx: Math.cos(ang) * 350,
            vy: Math.sin(ang) * 350,
            radius: 4.0, // Размером как пули у солдата, в виде пешки
            damage: u.damage, // 60 единиц здоровья каждый снаряд
            piercing: false,
            hitSet: new Set()
          });
        }
        this.addFloatingText(
          u.x,
          u.y - u.radius - 16,
          isDiagonal ? '♟️ ШАХ И МАТ (НАИСКОСОК)!' : '♟️ ШАХ И МАТ (ПО ПРЯМОЙ)!',
          '#1e293b'
        );
        break;
      }

      case 'fairy': {
        // ФЕЯ: каждые 3.5 секунды из волшебной палочки вылетает случайная способность из 7 с уроном её владельца!
        if (!enemy) break;
        u.cooldown = 3.5;
        const spellPool = ['ninja', 'superman', 'boomerang', 'thunder', 'alchemist', 'cryo', 'pyro'];
        const chosenSpell = spellPool[Math.floor(Math.random() * spellPool.length)];
        const ownerStats = getFighterClass(chosenSpell);
        const ownerDmg = ownerStats ? ownerStats.damage : u.damage;
        const baseAng = u.aimAngle;

        this.spawnConfetti(u.x + Math.cos(baseAng) * u.radius, u.y + Math.sin(baseAng) * u.radius, '#fde047', 6);

        if (chosenSpell === 'ninja') {
          window.sfx.shootArrow();
          for (const spread of [-0.18, 0, 0.18]) {
            const ang = baseAng + spread;
            this.projectiles.push({
              type: 'shuriken',
              team: u.team,
              owner: u,
              x: u.x + Math.cos(ang) * (u.radius + 9),
              y: u.y + Math.sin(ang) * (u.radius + 9),
              vx: Math.cos(ang) * 410,
              vy: Math.sin(ang) * 410,
              spin: 0,
              knockback: 340,
              radius: 7,
              damage: ownerDmg,
              piercing: false,
              hitSet: new Set()
            });
          }
          this.addFloatingText(u.x, u.y - u.radius - 16, '🧚✨ СЮРИКЕНЫ НИНДЗЯ!', '#db2777');
        } else if (chosenSpell === 'superman') {
          window.sfx.lightning();
          for (const spread of [-0.14, 0, 0.14]) {
            const ang = baseAng + spread;
            this.projectiles.push({
              type: 'small_laser',
              team: u.team,
              owner: u,
              x: u.x + Math.cos(ang) * (u.radius + 8),
              y: u.y + Math.sin(ang) * (u.radius + 8),
              vx: Math.cos(ang) * 540,
              vy: Math.sin(ang) * 540,
              radius: 5,
              damage: ownerDmg,
              piercing: true,
              hitSet: new Set()
            });
          }
          this.addFloatingText(u.x, u.y - u.radius - 16, '🧚✨ ЛАЗЕРЫ СУПЕРМЕНА!', '#ef4444');
        } else if (chosenSpell === 'boomerang') {
          window.sfx.shootArrow();
          this.projectiles.push({
            type: 'boomerang',
            owner: u,
            team: u.team,
            x: u.x + Math.cos(baseAng) * (u.radius + 10),
            y: u.y + Math.sin(baseAng) * (u.radius + 10),
            vx: Math.cos(baseAng) * 360,
            vy: Math.sin(baseAng) * 360,
            spin: 0,
            returning: false,
            flightTime: 0,
            radius: 10,
            damage: ownerDmg,
            piercing: true,
            hitSet: new Set()
          });
          this.addFloatingText(u.x, u.y - u.radius - 16, '🧚✨ БУМЕРАНГ!', '#0284c7');
        } else if (chosenSpell === 'thunder') {
          window.sfx.lightning();
          const hitTargets = [];
          let curSource = u;
          let curDmg = ownerDmg;
          for (let hop = 0; hop < 3; hop++) {
            let best = null;
            let bestD = hop === 0 ? 360 : 190;
            for (const cand of this.units) {
              if (cand.team === u.team || cand.hp <= 0 || hitTargets.includes(cand)) continue;
              const d = Math.hypot(cand.x - curSource.x, cand.y - curSource.y);
              if (d < bestD) {
                bestD = d;
                best = cand;
              }
            }
            if (!best) break;
            hitTargets.push(best);
            this.lightnings.push({
              x1: curSource.x,
              y1: curSource.y,
              x2: best.x,
              y2: best.y,
              life: 0.28
            });
            best.stunTimer = 0.28;
            this.applyDamage(best, Math.round(curDmg), u, '#ff4d2e');
            curSource = best;
            curDmg *= 0.72;
          }
          this.addFloatingText(u.x, u.y - u.radius - 16, '🧚✨ МОЛНИЯ ГРОМОВЕРЖЦА!', '#ea580c');
        } else if (chosenSpell === 'alchemist') {
          window.sfx.shootArrow();
          this.projectiles.push({
            type: 'acid_flask',
            team: u.team,
            owner: u,
            x: u.x + Math.cos(baseAng) * (u.radius + 8),
            y: u.y + Math.sin(baseAng) * (u.radius + 8),
            vx: Math.cos(baseAng) * 260,
            vy: Math.sin(baseAng) * 260,
            targetX: enemy.x,
            targetY: enemy.y,
            radius: 7,
            damage: ownerDmg,
            piercing: false,
            hitSet: new Set()
          });
          this.addFloatingText(u.x, u.y - u.radius - 16, '🧚✨ ЗЕЛЬЕ АЛХИМИКА!', '#16a34a');
        } else if (chosenSpell === 'cryo') {
          window.sfx.magicIce();
          const frostRadius = 115;
          this.spawnConfetti(u.x, u.y, '#73bcf7', 12);
          for (const other of this.units) {
            if (other.team === u.team || other.hp <= 0) continue;
            if (Math.hypot(other.x - u.x, other.y - u.y) <= frostRadius) {
              other.slowTimer = 2.8;
              this.applyDamage(other, ownerDmg, u, '#3898ec');
            }
          }
          this.projectiles.push({
            type: 'ice_shard',
            team: u.team,
            owner: u,
            x: u.x + Math.cos(baseAng) * (u.radius + 8),
            y: u.y + Math.sin(baseAng) * (u.radius + 8),
            vx: Math.cos(baseAng) * 340,
            vy: Math.sin(baseAng) * 340,
            radius: 6,
            damage: ownerDmg,
            piercing: false,
            hitSet: new Set()
          });
          this.addFloatingText(u.x, u.y - u.radius - 16, '🧚✨ ХОЛОД КРИОМАНТА!', '#2563eb');
        } else if (chosenSpell === 'pyro') {
          window.sfx.magicFire();
          this.projectiles.push({
            type: 'fireball',
            team: u.team,
            owner: u,
            x: u.x + Math.cos(baseAng) * (u.radius + 10),
            y: u.y + Math.sin(baseAng) * (u.radius + 10),
            vx: Math.cos(baseAng) * 300,
            vy: Math.sin(baseAng) * 300,
            radius: 8,
            damage: ownerDmg,
            piercing: false,
            hitSet: new Set()
          });
          this.addFloatingText(u.x, u.y - u.radius - 16, '🧚✨ ОГОНЬ ПИРОМАНТА!', '#ea580c');
        }
        break;
      }

      case 'card_master': {
        // КАРТОЧНИК: каждые 2.5 секунды кидает 3 карты веером, каждая карта наносит 30 ед. здоровья!
        if (!enemy) break;
        u.cooldown = 2.5;
        window.sfx.shootArrow();
        const baseAng = u.aimAngle;
        const spreads = [-0.20, 0, 0.20];
        for (let cIdx = 0; cIdx < 3; cIdx++) {
          const ang = baseAng + spreads[cIdx];
          this.projectiles.push({
            type: 'playing_card',
            team: u.team,
            owner: u,
            suitColor: cIdx % 2 === 0 ? '#dc2626' : '#1c1a17',
            x: u.x + Math.cos(ang) * (u.radius + 10),
            y: u.y + Math.sin(ang) * (u.radius + 10),
            vx: Math.cos(ang) * 420,
            vy: Math.sin(ang) * 420,
            spin: ang,
            radius: 6.5,
            damage: u.damage, // 30 единиц здоровья каждая карта!
            piercing: false,
            hitSet: new Set()
          });
        }
        this.addFloatingText(u.x, u.y - u.radius - 16, '🃏 3 КАРТЫ (ПО 30)!', '#991b1b');
        break;
      }

      case 'ninja': {
        // НИНДЗЯ: каждые 5 секунд кидает сюрикены, которые сильно отталкивают соперников в противоположную сторону!
        if (!enemy) break;
        u.cooldown = 5.0;
        window.sfx.shootArrow();
        const baseAng = u.aimAngle;
        for (const spread of [-0.18, 0, 0.18]) {
          const ang = baseAng + spread;
          this.projectiles.push({
            type: 'shuriken',
            team: u.team,
            owner: u,
            x: u.x + Math.cos(ang) * (u.radius + 9),
            y: u.y + Math.sin(ang) * (u.radius + 9),
            vx: Math.cos(ang) * 410,
            vy: Math.sin(ang) * 410,
            spin: 0,
            knockback: 340,
            radius: 7,
            damage: Math.max(8, Math.round(u.damage * 0.75)),
            piercing: false,
            hitSet: new Set()
          });
        }
        this.addFloatingText(u.x, u.y - u.radius - 16, '🥷 СЮРИКЕНЫ!', '#334155');
        break;
      }

      case 'hunter': {
        // ОХОТНИК С ДРОБОВИКОМ: стреляет раз в 4 секунды веером из 5 патронов в разные стороны (каждый по 10 урона, скорость в 2 раза медленнее пули Солдата = 230)!
        if (!enemy) break;
        u.cooldown = 4.0;
        window.sfx.pistolShot();
        const baseAng = u.aimAngle;
        const pelletSpeed = 230; // Ровно в 2 раза медленнее пуль Солдата (460 / 2 = 230)
        for (const spread of [-0.34, -0.17, 0, 0.17, 0.34]) {
          const ang = baseAng + spread;
          this.projectiles.push({
            type: 'shotgun_pellet',
            team: u.team,
            owner: u,
            x: u.x + Math.cos(ang) * (u.radius + 10),
            y: u.y + Math.sin(ang) * (u.radius + 10),
            vx: Math.cos(ang) * pelletSpeed,
            vy: Math.sin(ang) * pelletSpeed,
            radius: 4.5,
            damage: u.damage, // 10 единиц здоровья каждая (или масштабированный урон)
            piercing: false,
            hitSet: new Set()
          });
        }
        this.addFloatingText(u.x, u.y - u.radius - 16, '🔫 ДРОБОВИК (5 ПАТРОНОВ)!', '#78350f');
        break;
      }

      case 'soldier': {
        // СОЛДАТ: каждые 0.5 секунды стреляет в цель мелкими белыми пульками!
        if (!enemy) break;
        u.cooldown = 0.5;
        window.sfx.shootArrow();
        const ang = u.aimAngle + (Math.random() * 0.08 - 0.04);
        this.projectiles.push({
          type: 'white_pellet',
          team: u.team,
          x: u.x + Math.cos(ang) * (u.radius + 9),
          y: u.y + Math.sin(ang) * (u.radius + 9),
          vx: Math.cos(ang) * 460,
          vy: Math.sin(ang) * 460,
          radius: 3.5,
          damage: u.damage,
          piercing: false,
          hitSet: new Set()
        });
        break;
      }

      case 'giant': {
        // ТИТАН: увеличение на 2 секунды каждые 5 секунд!
        u.cooldown = 5.0;
        u.giantTimer = 2.0;
        window.sfx.shieldBash();
        this.addFloatingText(u.x, u.y - u.radius - 18, '🗿 ГИГАНТ НА 2С!', '#d97706');
        this.spawnConfetti(u.x, u.y, '#fbbf24', 10);
        break;
      }

      case 'laser_bot': {
        // ЛАЗЕРТРОН: стреляет сквозным лазерным лучом
        if (!enemy) break;
        u.cooldown = 3.4;
        window.sfx.lightning();
        this.fireLaserBeam(u, u.aimAngle, 1.15, '#06b6d4');
        this.addFloatingText(u.x, u.y - u.radius - 16, '⚡ ЛАЗЕР!', '#0891b2');
        break;
      }

      case 'teleporter': {
        // ТЕЛЕПОРТЕР: каждые 3 секунды телепортируется к цели с энергетическим взрывом
        if (!enemy) break;
        u.cooldown = 3.0;
        window.sfx.magicIce();
        this.spawnConfetti(u.x, u.y, '#a78bfa', 10);
        const randAng = Math.random() * Math.PI * 2;
        const dist = enemy.radius + u.radius + 14;
        const nx = Math.max(35, Math.min(this.canvas.width - 35, enemy.x + Math.cos(randAng) * dist));
        const ny = Math.max(35, Math.min(this.canvas.height - 35, enemy.y + Math.sin(randAng) * dist));

        this.lightnings.push({
          x1: u.x,
          y1: u.y,
          x2: nx,
          y2: ny,
          color: '#8b5cf6',
          life: 0.25
        });

        u.x = nx;
        u.y = ny;
        this.spawnConfetti(u.x, u.y, '#8b5cf6', 12);
        this.applyDamage(enemy, u.damage, u, '#7c3aed');
        this.addFloatingText(u.x, u.y - u.radius - 16, '✨ ТЕЛЕПОРТ!', '#7c3aed');
        break;
      }

      case 'plasma_rex': {
        // КИБЕР-КОГОТЬ: комбо — телепорт к цели + увеличение на 2 секунды + лазерный импульс!
        if (!enemy) break;
        u.cooldown = 4.5;
        u.giantTimer = 2.0; // увеличивается на 2 секунды!
        window.sfx.lightning();
        const backAng = (enemy.aimAngle || 0) + Math.PI;
        const nx = Math.max(35, Math.min(this.canvas.width - 35, enemy.x + Math.cos(backAng) * (enemy.radius + u.radius + 18)));
        const ny = Math.max(35, Math.min(this.canvas.height - 35, enemy.y + Math.sin(backAng) * (enemy.radius + u.radius + 18)));
        u.x = nx;
        u.y = ny;
        u.aimAngle = Math.atan2(enemy.y - u.y, enemy.x - u.x);
        this.fireLaserBeam(u, u.aimAngle, 1.0, '#ec4899');
        this.addFloatingText(u.x, u.y - u.radius - 18, '🔮 БЛИНК + РОСТ 2С!', '#db2777');
        break;
      }

      case 'archer': {
        if (!enemy) break;
        u.cooldown = 2.4;
        window.sfx.shootArrow();
        const ang = u.aimAngle;
        this.projectiles.push({
          type: 'arrow',
          team: u.team,
          x: u.x + Math.cos(ang) * (u.radius + 10),
          y: u.y + Math.sin(ang) * (u.radius + 10),
          vx: Math.cos(ang) * 390,
          vy: Math.sin(ang) * 390,
          radius: 5,
          damage: u.damage,
          piercing: false,
          hitSet: new Set()
        });
        break;
      }

      case 'gunslinger': {
        if (!enemy) break;
        u.cooldown = 5.0;
        window.sfx.pistolShot();
        const baseAng = u.aimAngle;
        for (const offset of [-7, 7]) {
          const perpX = -Math.sin(baseAng) * offset;
          const perpY = Math.cos(baseAng) * offset;
          this.projectiles.push({
            type: 'piercing_bullet',
            team: u.team,
            x: u.x + Math.cos(baseAng) * (u.radius + 8) + perpX,
            y: u.y + Math.sin(baseAng) * (u.radius + 8) + perpY,
            vx: Math.cos(baseAng) * 620,
            vy: Math.sin(baseAng) * 620,
            radius: 5,
            damage: u.damage,
            piercing: true,
            hitSet: new Set()
          });
        }
        break;
      }

      case 'pyro': {
        if (!enemy) break;
        u.cooldown = 3.0;
        window.sfx.magicFire();
        const ang = u.aimAngle;
        this.projectiles.push({
          type: 'fireball',
          team: u.team,
          x: u.x + Math.cos(ang) * (u.radius + 10),
          y: u.y + Math.sin(ang) * (u.radius + 10),
          vx: Math.cos(ang) * 300,
          vy: Math.sin(ang) * 300,
          radius: 8,
          damage: u.damage,
          piercing: false,
          hitSet: new Set()
        });
        break;
      }

      case 'cryo': {
        u.cooldown = 3.4;
        window.sfx.magicIce();
        const frostRadius = 115;
        this.spawnConfetti(u.x, u.y, '#73bcf7', 14);
        for (const other of this.units) {
          if (other.team === u.team || other.hp <= 0) continue;
          if (Math.hypot(other.x - u.x, other.y - u.y) <= frostRadius) {
            other.slowTimer = 2.8;
            this.applyDamage(other, u.damage, u, '#3898ec');
            this.addFloatingText(other.x, other.y - 18, '❄️ -50%', '#2b7de0');
          }
        }
        if (enemy) {
          const ang = u.aimAngle;
          this.projectiles.push({
            type: 'ice_shard',
            team: u.team,
            x: u.x + Math.cos(ang) * (u.radius + 8),
            y: u.y + Math.sin(ang) * (u.radius + 8),
            vx: Math.cos(ang) * 340,
            vy: Math.sin(ang) * 340,
            radius: 6,
            damage: u.damage,
            piercing: false,
            hitSet: new Set()
          });
        }
        break;
      }

      case 'thunder': {
        if (!enemy) break;
        u.cooldown = 3.8;
        window.sfx.lightning();
        const hitTargets = [];
        let curSource = u;
        let curDmg = u.damage;

        for (let hop = 0; hop < 3; hop++) {
          let best = null;
          let bestD = hop === 0 ? 360 : 190;
          for (const cand of this.units) {
            if (cand.team === u.team || cand.hp <= 0 || hitTargets.includes(cand)) continue;
            const d = Math.hypot(cand.x - curSource.x, cand.y - curSource.y);
            if (d < bestD) {
              bestD = d;
              best = cand;
            }
          }
          if (!best) break;
          hitTargets.push(best);
          this.lightnings.push({
            x1: curSource.x,
            y1: curSource.y,
            x2: best.x,
            y2: best.y,
            life: 0.28
          });
          best.stunTimer = 0.28;
          this.applyDamage(best, Math.round(curDmg), u, '#ff4d2e');
          curSource = best;
          curDmg *= 0.72;
        }
        break;
      }

      case 'alchemist': {
        if (!enemy) break;
        u.cooldown = 3.5;
        window.sfx.shootArrow();
        const ang = u.aimAngle;
        this.projectiles.push({
          type: 'acid_flask',
          team: u.team,
          x: u.x + Math.cos(ang) * (u.radius + 8),
          y: u.y + Math.sin(ang) * (u.radius + 8),
          vx: Math.cos(ang) * 260,
          vy: Math.sin(ang) * 260,
          targetX: enemy.x,
          targetY: enemy.y,
          radius: 7,
          damage: u.damage,
          piercing: false,
          hitSet: new Set()
        });
        break;
      }

      case 'boomerang': {
        if (!enemy) break;
        u.cooldown = 3.0;
        window.sfx.shootArrow();
        const ang = u.aimAngle;
        this.projectiles.push({
          type: 'boomerang',
          owner: u,
          team: u.team,
          x: u.x + Math.cos(ang) * (u.radius + 10),
          y: u.y + Math.sin(ang) * (u.radius + 10),
          vx: Math.cos(ang) * 360,
          vy: Math.sin(ang) * 360,
          spin: 0,
          returning: false,
          flightTime: 0,
          radius: 10,
          damage: u.damage,
          piercing: true,
          hitSet: new Set()
        });
        break;
      }

      case 'summoner': {
        u.cooldown = 5.8;
        window.sfx.heal();
        const activeMinions = this.units.filter(m => m.isMinion && m.ownerId === u.id).length;
        if (activeMinions < 4) {
          for (const side of [-1, 1]) {
            const ang = u.aimAngle + side * 0.7;
            const minionBp = {
              id: this.nextUid(),
              team: u.team,
              classId: 'summoner',
              abilityId: 'summoner',
              name: 'Сфера',
              shape: 'circle',
              hp: 25,
              speed: 4.6,
              damage: Math.max(4, Math.round(u.damage * 0.85)),
              x: Math.max(30, Math.min(this.canvas.width - 30, u.x + Math.cos(ang) * 28)),
              y: Math.max(30, Math.min(this.canvas.height - 30, u.y + Math.sin(ang) * 28))
            };
            const minion = this.instantiateUnit(minionBp, true);
            minion.ownerId = u.id;
            this.units.push(minion);
          }
          this.addFloatingText(u.x, u.y - 22, '+2 СФЕРЫ', '#9e68e6');
        }
        break;
      }

      case 'healer': {
        u.cooldown = 2.8;
        let wounded = null;
        let lowestRatio = 1.0;
        for (const ally of this.units) {
          if (ally.team !== u.team || ally.hp <= 0 || ally.isMinion) continue;
          const r = ally.hp / ally.maxHp;
          if (r < lowestRatio) {
            lowestRatio = r;
            wounded = ally;
          }
        }
        if (!wounded) wounded = u;
        const healAmt = Math.round(u.damage * 1.2);
        wounded.hp = Math.min(wounded.maxHp, wounded.hp + healAmt);
        window.sfx.heal();
        this.addFloatingText(wounded.x, wounded.y - 20, `+${healAmt} HP`, '#3ca628');
        this.spawnConfetti(wounded.x, wounded.y, '#86d96a', 7);
        this.lightnings.push({
          x1: u.x,
          y1: u.y,
          x2: wounded.x,
          y2: wounded.y,
          color: '#6ad94b',
          life: 0.25
        });
        break;
      }

      case 'engineer': {
        u.cooldown = 6.2;
        const myTurrets = this.turrets.filter(t => t.ownerId === u.id);
        if (myTurrets.length >= 2) {
          myTurrets[0].life = 0;
        }
        window.sfx.click();
        this.turrets.push({
          ownerId: u.id,
          team: u.team,
          x: Math.max(40, Math.min(this.canvas.width - 40, u.x + Math.cos(u.aimAngle) * 26)),
          y: Math.max(40, Math.min(this.canvas.height - 40, u.y + Math.sin(u.aimAngle) * 26)),
          hp: 40,
          maxHp: 40,
          damage: u.damage,
          range: 165,
          angle: u.aimAngle,
          cooldown: 0.5,
          life: 16
        });
        this.addFloatingText(u.x, u.y - 22, '⚙️ ТУРЕЛЬ', '#d9483b');
        break;
      }

      case 'assassin': {
        if (!enemy) break;
        u.cooldown = 4.0;
        const backAngle = (enemy.aimAngle || 0) + Math.PI;
        const destX = Math.max(30, Math.min(this.canvas.width - 30, enemy.x + Math.cos(backAngle) * (enemy.radius + u.radius + 4)));
        const destY = Math.max(30, Math.min(this.canvas.height - 30, enemy.y + Math.sin(backAngle) * (enemy.radius + u.radius + 4)));

        this.lightnings.push({
          x1: u.x,
          y1: u.y,
          x2: destX,
          y2: destY,
          color: '#9e68e6',
          life: 0.22
        });

        u.x = destX;
        u.y = destY;
        const critDmg = Math.round(u.damage * 2.0);
        window.sfx.hit();
        this.applyDamage(enemy, critDmg, u, '#8e44ec');
        this.addFloatingText(enemy.x, enemy.y - 26, `КРИТ -${critDmg}!`, '#7c2ae8');
        break;
      }

      case 'graviton': {
        if (!enemy) break;
        u.cooldown = 5.0;
        window.sfx.magicIce();
        this.zones.push({
          type: 'graviton',
          team: u.team,
          x: enemy.x,
          y: enemy.y,
          radius: 75,
          damage: u.damage,
          life: 2.3,
          tick: 0.2
        });
        this.addFloatingText(enemy.x, enemy.y - 22, '🌀 ВИХРЬ', '#7d3ce8');
        break;
      }
    }
  }

  resolveUnitCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = a.radius + b.radius;

    if (dist === 0 || dist >= minDist) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;

    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;

    const kx = a.vx - b.vx;
    const ky = a.vy - b.vy;
    const p = 2 * (nx * kx + ny * ky) / 2;

    if (p > 0) {
      a.vx -= p * nx;
      a.vy -= p * ny;
      b.vx += p * nx;
      b.vy += p * ny;
    }

    a.scaleX = 0.85; a.scaleY = 1.15;
    b.scaleX = 0.85; b.scaleY = 1.15;
    window.sfx.bounce();

    if (a.team !== b.team) {
      this.handleContactDamage(a, b);
      this.handleContactDamage(b, a);
    }
  }

  handleContactDamage(attacker, target) {
    if (attacker.hitImmunityMap[target.id]) return;

    // 1. Щитоносец: урон щитом только по ГОЛОЙ СТОРОНЕ соперника!
    if (attacker.abilityId === 'shield' && !attacker.isMinion) {
      const angleToTarget = Math.atan2(target.y - attacker.y, target.x - attacker.x);
      const shieldDiff = Math.abs(this.normalizeAngle(angleToTarget - attacker.aimAngle));

      if (shieldDiff <= Math.PI * 0.45) {
        attacker.hitImmunityMap[target.id] = 0.45;
        const angleFromTargetToAttacker = Math.atan2(attacker.y - target.y, attacker.x - target.x);
        const targetProtected = this.isTargetProtectedAtAngle(target, angleFromTargetToAttacker);

        if (targetProtected) {
          window.sfx.parry();
          this.addFloatingText(target.x, target.y - 18, 'БЛОК!', '#5c6470');
          this.spawnConfetti((attacker.x + target.x) / 2, (attacker.y + target.y) / 2, '#ffffff', 6);
        } else {
          window.sfx.shieldBash();
          this.applyDamage(target, attacker.damage, attacker);
          this.addFloatingText(target.x, target.y - 22, `ЩИТ -${attacker.damage}`, '#2979db');
          target.vx += Math.cos(angleToTarget) * 160;
          target.vy += Math.sin(angleToTarget) * 160;
        }
      }
      return;
    }

    // 2. Росомаха (claws) и Кибер-Коготь (plasma_rex): КОГТИ наносят ДВОЙНОЙ УРОН (×2) при столкновении!
    if (attacker.abilityId === 'claws' || attacker.abilityId === 'plasma_rex') {
      attacker.hitImmunityMap[target.id] = 0.45;
      const clawDmg = Math.round(attacker.damage * 2.0);
      window.sfx.hit();
      this.applyDamage(target, clawDmg, attacker, '#d97706');
      this.addFloatingText(target.x, target.y - 24, `🐾 КОГТИ ×2 (-${clawDmg})`, '#b45309');
      return;
    }

    // 3. Супермен: во время 2-секундного ускорения удваивается урон (×2)!
    if (attacker.abilityId === 'superman') {
      attacker.hitImmunityMap[target.id] = 0.42;
      const mult = attacker.superFlightTimer > 0 ? 2.0 : 1.0;
      const dmg = Math.round(attacker.damage * mult);
      window.sfx.shieldBash();
      this.applyDamage(target, dmg, attacker, '#dc2626');
      if (mult > 1) {
        this.addFloatingText(target.x, target.y - 24, `🦸 УДАР ×2 (-${dmg})`, '#dc2626');
      }
      return;
    }

    // 4. Вампир: кусает 2 белыми клыками и вампирит здоровье!
    if (attacker.abilityId === 'vampire' || attacker.classId === 'vampire') {
      attacker.hitImmunityMap[target.id] = 0.45;
      window.sfx.hit();
      this.applyDamage(target, attacker.damage, attacker, '#991b1b');
      const leech = Math.max(2, Math.round(attacker.damage * 0.5));
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + leech);
      this.addFloatingText(attacker.x, attacker.y - attacker.radius - 14, `🧛 +${leech} HP`, '#16a34a');
      return;
    }

    // 5. Титан (увеличение на 2 секунды): в гигантской форме наносит двойной урон и сильно отталкивает
    if (attacker.abilityId === 'giant') {
      attacker.hitImmunityMap[target.id] = 0.45;
      const mult = attacker.giantTimer > 0 ? 2.0 : 1.0;
      const dmg = Math.round(attacker.damage * mult);
      window.sfx.shieldBash();
      this.applyDamage(target, dmg, attacker);
      const pushAng = Math.atan2(target.y - attacker.y, target.x - attacker.x);
      target.vx += Math.cos(pushAng) * (attacker.giantTimer > 0 ? 210 : 90);
      target.vy += Math.sin(pushAng) * (attacker.giantTimer > 0 ? 210 : 90);
      return;
    }

    // 6. НИНДЗЯ: при столкновении наносит 15 ед. урона и включает анимацию удара катаной из стороны в сторону!
    if (attacker.abilityId === 'ninja' || attacker.classId === 'ninja') {
      attacker.hitImmunityMap[target.id] = 0.45;
      attacker.katanaSwingTimer = 0.45;
      window.sfx.hit();
      this.applyDamage(target, attacker.damage, attacker, '#1e293b');
      this.addFloatingText(target.x, target.y - 22, `🥷 КАТАНА -${attacker.damage}`, '#334155');
      return;
    }

    // 7. БОКСЁР: после атаки 10% шанс сделать апперкот и застопить соперника на 2.5 секунды с мультяшным нимбом контузии!
    if (attacker.abilityId === 'boxer' || attacker.classId === 'boxer') {
      attacker.hitImmunityMap[target.id] = 0.42;
      window.sfx.shieldBash();
      this.applyDamage(target, attacker.damage, attacker, '#dc2626');
      if (target.hp > 0 && Math.random() < 0.10) {
        target.stunTimer = 2.5;
        target.dizzyTimer = 2.5;
        target.vx = 0;
        target.vy = 0;
        this.addFloatingText(target.x, target.y - target.radius - 22, '🥊 АППЕРКОТ! СТАН 2.5С!', '#e11d48');
        this.spawnConfetti(target.x, target.y - target.radius, '#facc15', 10);
      }
      return;
    }

    // 8. СМЕРТЬ: коса при столкновении наносит 30 единиц урона!
    if (attacker.abilityId === 'death' || attacker.classId === 'death') {
      attacker.hitImmunityMap[target.id] = 0.45;
      attacker.scytheSwingTimer = 0.45;
      window.sfx.hit();
      this.applyDamage(target, attacker.damage, attacker, '#0f172a');
      this.addFloatingText(target.x, target.y - 22, `💀 КОСА -${attacker.damage}`, '#1e293b');
      return;
    }

    // 9. УМНОЖИТЕЛЬ: сначала наносит 1 урон, затем 2, 4, 8, 16, 32... (после каждой атаки урон ×2)!
    if (attacker.abilityId === 'doubler' || attacker.classId === 'doubler') {
      attacker.hitImmunityMap[target.id] = 0.42;
      const curDmg = attacker.damage;
      window.sfx.hit();
      this.applyDamage(target, curDmg, attacker, '#d97706');
      attacker.damage = Math.min(1048576, attacker.damage * 2);
      this.addFloatingText(target.x, target.y - 24, `📈 -${curDmg} (СЛЕД. ${attacker.damage}!)`, '#b45309');
      return;
    }

    // 10. Робо-Мех, Зомби, Оборотень, Червь, Сферы Призывателя, Ассасин в ближнем бою
    if (
      attacker.isMinion ||
      ['assassin', 'worm', 'robo_mech', 'zombie', 'werewolf'].includes(attacker.abilityId) ||
      ['robo_mech', 'zombie', 'werewolf'].includes(attacker.classId)
    ) {
      attacker.hitImmunityMap[target.id] = 0.42;
      window.sfx.hit();
      this.applyDamage(target, attacker.damage, attacker);
    }
  }

  triggerBombExplosion(p) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const bx = Math.max(35, Math.min(w - 35, p.x));
    const by = Math.max(35, Math.min(h - 35, p.y));
    const blastR = p.blastRadius || 92;

    window.sfx.magicFire();
    window.sfx.shieldBash();

    this.zones.push({
      type: 'bomb_blast',
      team: p.team,
      x: bx,
      y: by,
      radius: blastR,
      damage: 0,
      life: 0.38,
      tick: 99
    });

    this.spawnConfetti(bx, by, '#ef4444', 14);
    this.spawnConfetti(bx, by, '#facc15', 10);
    this.addFloatingText(bx, by - 24, `💥 ВЗРЫВ -${p.damage}!`, '#dc2626');

    for (const u of this.units) {
      if (u.hp <= 0) continue;
      // Взрыв наносит -60 HP всем соперникам (и всем в радиусе взрыва, кроме самого владельца бомбы)
      if (p.owner && u.id === p.owner.id) continue;
      if (u.team === p.team) continue;
      const dist = Math.hypot(u.x - bx, u.y - by);
      if (dist <= blastR + u.radius) {
        this.applyDamage(u, p.damage, p.owner || null, '#dc2626');
        const pushAng = Math.atan2(u.y - by, u.x - bx);
        u.vx += Math.cos(pushAng) * 240;
        u.vy += Math.sin(pushAng) * 240;
      }
    }
  }

  checkMeleeWeapons() {
    for (const u of this.units) {
      if (u.hp <= 0 || u.isMinion) continue;
      if (!['swordsman', 'berserker', 'spearman'].includes(u.abilityId)) continue;

      const reach = u.abilityId === 'spearman'
        ? u.radius + (u.thrustTimer > 0 ? 34 : 24)
        : u.radius + 22;

      const wx = u.x + Math.cos(u.weaponAngle) * reach;
      const wy = u.y + Math.sin(u.weaponAngle) * reach;

      for (const other of this.units) {
        if (other.team === u.team || other.hp <= 0) continue;
        if (u.hitImmunityMap[other.id]) continue;

        if (['swordsman', 'berserker', 'spearman'].includes(other.abilityId)) {
          const oReach = other.radius + 22;
          const owx = other.x + Math.cos(other.weaponAngle) * oReach;
          const owy = other.y + Math.sin(other.weaponAngle) * oReach;
          if (Math.hypot(wx - owx, wy - owy) <= 16) {
            u.orbitDir *= -1;
            other.orbitDir *= -1;
            u.hitImmunityMap[other.id] = 0.3;
            other.hitImmunityMap[u.id] = 0.3;
            window.sfx.parry();
            this.spawnConfetti((wx + owx) / 2, (wy + owy) / 2, '#ffd166', 7);
            continue;
          }
        }

        const distToBody = Math.hypot(wx - other.x, wy - other.y);
        if (distToBody <= other.radius + 9) {
          u.hitImmunityMap[other.id] = 0.38;
          const angleFromTarget = Math.atan2(u.y - other.y, u.x - other.x);

          if (other.abilityId === 'shield' && this.isTargetProtectedAtAngle(other, angleFromTarget)) {
            u.orbitDir *= -1;
            window.sfx.parry();
            this.addFloatingText(other.x, other.y - 18, 'БЛОК ЩИТОМ!', '#3b82f6');
            this.spawnConfetti(wx, wy, '#ffffff', 6);
            continue;
          }

          let dmg = u.damage;
          if (u.abilityId === 'spearman') {
            const spdRatio = Math.hypot(u.vx, u.vy) / 130;
            dmg = Math.round(u.damage * Math.max(1, Math.min(1.5, spdRatio)));
          } else if (u.abilityId === 'berserker') {
            const missing = 1 - Math.max(0, u.hp / u.maxHp);
            dmg = Math.round(u.damage * (1 + missing * 0.6));
          }

          window.sfx.hit();
          this.applyDamage(other, dmg, u);

          const pushAng = Math.atan2(other.y - u.y, other.x - u.x);
          other.vx += Math.cos(pushAng) * 75;
          other.vy += Math.sin(pushAng) * 75;
        }
      }
    }
  }

  updateProjectiles(dt) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      if (p.type === 'shuriken') {
        p.spin = (p.spin || 0) + dt * 22;
      } else if (p.type === 'bomb_grenade') {
        p.spin = (p.spin || 0) + dt * 10;
      }

      if (p.type === 'boomerang') {
        p.flightTime += dt;
        p.spin += dt * 16;
        if (!p.returning && p.flightTime >= 0.65) {
          p.returning = true;
          p.hitSet.clear();
        }
        if (p.returning && p.owner && p.owner.hp > 0) {
          const dx = p.owner.x - p.x;
          const dy = p.owner.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          p.vx += (dx / d) * 950 * dt;
          p.vy += (dy / d) * 950 * dt;
          if (d <= p.owner.radius + 12 && p.flightTime > 0.9) {
            this.projectiles.splice(i, 1);
            continue;
          }
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.type === 'bomb_grenade') {
        if (Math.hypot(p.x - p.targetX, p.y - p.targetY) <= 18 ||
            p.x < 20 || p.x > w - 20 || p.y < 20 || p.y > h - 20) {
          this.triggerBombExplosion(p);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.type === 'acid_flask') {
        if (Math.hypot(p.x - p.targetX, p.y - p.targetY) <= 18 ||
            p.x < 20 || p.x > w - 20 || p.y < 20 || p.y > h - 20) {
          this.zones.push({
            type: 'acid',
            team: p.team,
            x: Math.max(40, Math.min(w - 40, p.x)),
            y: Math.max(40, Math.min(h - 40, p.y)),
            radius: 58,
            damage: p.damage,
            life: 4.5,
            tick: 0.1
          });
          this.spawnConfetti(p.x, p.y, '#7ce058', 10);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
        this.projectiles.splice(i, 1);
        continue;
      }

      let destroyed = false;
      for (const u of this.units) {
        if (u.team === p.team || u.hp <= 0 || p.hitSet.has(u.id)) continue;
        if (Math.hypot(p.x - u.x, p.y - u.y) <= u.radius + p.radius) {
          p.hitSet.add(u.id);

          if (p.type === 'bomb_grenade') {
            this.triggerBombExplosion(p);
            destroyed = true;
            break;
          }

          const angleFromTarget = Math.atan2(p.y - u.y, p.x - u.x);
          if (!p.piercing && this.isTargetProtectedAtAngle(u, angleFromTarget)) {
            window.sfx.parry();
            this.addFloatingText(u.x, u.y - 18, 'БЛОК!', '#4b5563');
            this.spawnConfetti(p.x, p.y, '#ffffff', 5);
            destroyed = true;
            break;
          }

          window.sfx.hit();
          this.applyDamage(u, p.damage, p.owner || null);

          if (p.type === 'shuriken') {
            // Сюрикен Ниндзя отталкивает соперника в противоположную сторону!
            const pushAng = Math.atan2(p.vy, p.vx);
            const kb = p.knockback || 340;
            u.vx = Math.cos(pushAng) * kb;
            u.vy = Math.sin(pushAng) * kb;
            this.addFloatingText(u.x, u.y - 20, '💨 ОТБРОС!', '#334155');
          } else if (p.type === 'fireball') {
            u.burnTimer = 3.0;
            u.burnDps = Math.max(3, Math.round(p.damage * 0.45));
            u.burnTick = 0.4;
            this.zones.push({
              type: 'fire',
              team: p.team,
              x: u.x,
              y: u.y,
              radius: 42,
              damage: p.damage,
              life: 3.0,
              tick: 0.3
            });
          } else if (p.type === 'ice_shard') {
            u.slowTimer = 2.6;
          }

          if (!p.piercing) {
            destroyed = true;
            break;
          }
        }
      }

      if (!destroyed) {
        for (const t of this.turrets) {
          if (t.team === p.team || t.hp <= 0) continue;
          if (Math.hypot(p.x - t.x, p.y - t.y) <= 14 + p.radius) {
            if (p.type === 'bomb_grenade') {
              this.triggerBombExplosion(p);
              destroyed = true;
              break;
            }
            t.hp -= p.damage;
            this.spawnConfetti(t.x, t.y, '#ef5b50', 4);
            if (!p.piercing) {
              destroyed = true;
              break;
            }
          }
        }
      }

      if (destroyed) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  applyDamage(target, rawAmount, attacker = null, textColor = null) {
    // РОБО-МЕХ: на каждую атаку есть шанс 20%, что атака полностью не засчитается и ХП не снимут!
    if (target.classId === 'robo_mech' || target.abilityId === 'robo_mech') {
      if (Math.random() < 0.20) {
        window.sfx.parry();
        this.addFloatingText(target.x, target.y - target.radius - 14, '🤖 БРОНЯ: 0 УРОНА!', '#0284c7');
        this.spawnConfetti(target.x, target.y, '#94a3b8', 5);
        return;
      }
    }

    let dmg = rawAmount;
    if (target.vulnTimer > 0) {
      dmg = Math.round(dmg * 1.25);
    }
    dmg = Math.max(1, Math.round(dmg));
    target.hp = Math.max(0, target.hp - dmg);
    target.flashTimer = 0.12;

    const col = textColor || (target.team === 'player' ? '#d93829' : '#1c1a17');
    this.addFloatingText(target.x + (Math.random() * 14 - 7), target.y - target.radius - 8, `-${dmg}`, col);
    this.spawnConfetti(target.x, target.y, getUnitTeamColor(target.team, target.classId), 5);

    if (target.hp <= 0) {
      // СМЕРТЬ: когда умирает один (любой) боец на поле боя, Смерть получает +30 HP себе!
      for (const reaper of this.units) {
        if (reaper.id !== target.id && reaper.hp > 0 && (reaper.classId === 'death' || reaper.abilityId === 'death')) {
          reaper.hp += 30;
          if (reaper.hp > reaper.maxHp) reaper.maxHp = reaper.hp;
          window.sfx.heal();
          this.addFloatingText(reaper.x, reaper.y - reaper.radius - 18, '💀 +30 HP (ЖАТВА)!', '#9333ea');
          this.spawnConfetti(reaper.x, reaper.y, '#c084fc', 8);
          this.lightnings.push({
            x1: target.x,
            y1: target.y,
            x2: reaper.x,
            y2: reaper.y,
            color: '#9333ea',
            life: 0.28
          });
        }
      }

      // ЗОМБИ: когда Зомби кого-то убивает, убитый превращается точно в такого же Зомби с полной шкалой здоровья!
      if (attacker && (attacker.classId === 'zombie' || attacker.abilityId === 'zombie')) {
        window.sfx.heal();
        target.team = attacker.team;
        target.classId = attacker.classId;
        target.abilityId = attacker.abilityId;
        target.name = attacker.name;
        target.shape = attacker.shape;
        target.maxHp = attacker.maxHp;
        target.hp = attacker.maxHp;
        target.baseSpeed = attacker.baseSpeed;
        target.damage = attacker.damage;
        target.baseRadius = attacker.baseRadius;
        target.radius = attacker.radius;
        target.isMinion = false;
        target.segments = [];
        target.burnTimer = 0;
        target.slowTimer = 0;
        target.stunTimer = 0;
        target.dizzyTimer = 0;
        target.vulnTimer = 0;
        target.hitImmunityMap = {};
        this.spawnConfetti(target.x, target.y, '#65a30d', 16);
        this.addFloatingText(target.x, target.y - target.radius - 18, '🧟 ЗАРАЖЕНИЕ! НОВЫЙ ЗОМБИ!', '#4d7c0f');
        return;
      }

      window.sfx.ko();
      this.spawnConfetti(target.x, target.y, getUnitTeamColor(target.team, target.classId), 18);
    }
  }

  spawnConfetti(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 35 + Math.random() * 95;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: 3 + Math.random() * 3.5,
        color,
        life: 0.25 + Math.random() * 0.25
      });
    }
  }

  addFloatingText(x, y, text, color = '#1c1a17') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 0.85
    });
  }

  // ==================== ОТРИСОВКА РИНГА ====================
  renderArena(timeSec) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Центральная разделительная пунктирная линия
    ctx.save();
    ctx.strokeStyle = 'rgba(28, 26, 23, 0.24)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([8, 7]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 12);
    ctx.lineTo(w / 2, h - 12);
    ctx.stroke();
    ctx.restore();

    // 1.5. Индикатор правила «Мало бойцов -> Увеличение и ускорение» сверху ринга
    if (this.state === 'battle' && this.endgameStage > 0) {
      ctx.save();
      const label = this.endgameStage === 2
        ? '⚡ ФИНАЛЬНАЯ ДУЭЛЬ: БОЙЦЫ УВЕЛИЧЕНЫ И УСКОРЕНЫ (МАКС)!'
        : '🔥 МАЛО БОЙЦОВ: РАЗМЕР И СКОРОСТЬ УВЕЛИЧЕНЫ!';
      ctx.font = '900 13px "Nunito", sans-serif';
      const tw = ctx.measureText(label).width + 24;
      ctx.fillStyle = '#fef2f2';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      roundRectPath(ctx, w / 2 - tw / 2, 8, tw, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b91c1c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, w / 2, 20);
      ctx.restore();
    }

    // 2. Отрисовка активных зон
    for (const z of this.zones) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
      if (z.type === 'bomb_blast') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.36)';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3.5;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.fill();
        ctx.restore();
        continue;
      } else if (z.type === 'acid') {
        ctx.fillStyle = 'rgba(124, 224, 88, 0.28)';
        ctx.strokeStyle = '#4ca82b';
      } else if (z.type === 'fire') {
        ctx.fillStyle = 'rgba(255, 118, 43, 0.26)';
        ctx.strokeStyle = '#e04819';
      } else {
        ctx.fillStyle = 'rgba(158, 104, 230, 0.26)';
        ctx.strokeStyle = '#6c35bd';
      }
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Тактические пунктирные схемы в фазе подготовки
    if (this.state === 'prep') {
      for (const u of this.units) {
        this.drawPrepTacticalOverlay(ctx, u, timeSec);
      }
    }

    // 4. Турели Инженера
    for (const t of this.turrets) {
      ctx.save();
      ctx.strokeStyle = t.team === 'bot' ? 'rgba(239, 91, 80, 0.45)' : 'rgba(70, 146, 232, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      drawWeaponGraphic(ctx, 'engineer', t.x - 6, t.y, 1.0, 0, t.team);
      this.drawHealthBar(ctx, t.x, t.y - 18, 28, 5, t.hp, t.maxHp);
      ctx.restore();
    }

    // 5. Отрисовка всех бойцов, их хвостов, клыков и оружия
    for (const u of this.units) {
      this.drawArenaUnit(ctx, u, timeSec);
    }

    // 6. Отрисовка летящих снарядов
    for (const p of this.projectiles) {
      this.drawProjectile(ctx, p);
    }

    // 7. Отрисовка цепных молний, лазерных лучей и лечения
    for (const l of this.lightnings) {
      if (l.isStraightLaser) {
        ctx.save();
        ctx.strokeStyle = l.color || '#06b6d4';
        ctx.lineWidth = l.width || 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        ctx.restore();
      } else {
        this.drawLightningArc(ctx, l.x1, l.y1, l.x2, l.y2, l.color || '#ef5b50');
      }
    }

    // 8. Конфетти и всплывающий урон
    for (const pt of this.particles) {
      ctx.save();
      ctx.fillStyle = pt.color;
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.font = '900 14px "Nunito", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#fcfaf4';
      ctx.lineWidth = 3.5;
      ctx.textAlign = 'center';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  drawPrepTacticalOverlay(ctx, u, timeSec) {
    ctx.save();
    const isPlayer = u.team === 'player';
    const dashColor = isPlayer ? '#4692e8' : '#ef5b50';
    ctx.strokeStyle = dashColor;
    ctx.fillStyle = dashColor;
    ctx.lineWidth = 1.8;

    switch (u.abilityId) {
      case 'swordsman':
      case 'berserker': {
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.ellipse(u.x, u.y, 48, 30, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        this.drawSmallArrowHead(ctx, u.x - 16, u.y - 29, 0.15, dashColor);
        this.drawSmallArrowHead(ctx, u.x + 16, u.y + 29, Math.PI + 0.15, dashColor);
        break;
      }

      case 'archer':
      case 'soldier':
      case 'ninja':
      case 'bomber':
      case 'fairy':
      case 'laser_bot': {
        const dir = isPlayer ? 1 : -1;
        const startX = u.x + dir * 28;
        const endX = u.x + dir * 96;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(startX, u.y);
        ctx.lineTo(endX, u.y);
        ctx.stroke();
        ctx.setLineDash([]);
        this.drawSmallArrowHead(ctx, endX, u.y, dir === 1 ? 0 : Math.PI, dashColor);
        break;
      }

      case 'checkmate': {
        // 4 направления выстрела пешками (крестом / наискосок)
        ctx.setLineDash([4, 4]);
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(u.x + Math.cos(ang) * 26, u.y + Math.sin(ang) * 26);
          ctx.lineTo(u.x + Math.cos(ang) * 64, u.y + Math.sin(ang) * 64);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        break;
      }

      case 'card_master': {
        // 3 веерные линии полёта карт
        const baseAng = isPlayer ? 0 : Math.PI;
        ctx.setLineDash([4, 4]);
        for (const sp of [-0.20, 0, 0.20]) {
          const ang = baseAng + sp;
          ctx.beginPath();
          ctx.moveTo(u.x + Math.cos(ang) * 24, u.y + Math.sin(ang) * 24);
          ctx.lineTo(u.x + Math.cos(ang) * 76, u.y + Math.sin(ang) * 76);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        break;
      }

      case 'hunter': {
        // 5 веерных линий дробовика Охотника
        const baseAng = isPlayer ? 0 : Math.PI;
        ctx.setLineDash([4, 4]);
        for (const sp of [-0.34, -0.17, 0, 0.17, 0.34]) {
          const ang = baseAng + sp;
          ctx.beginPath();
          ctx.moveTo(u.x + Math.cos(ang) * 24, u.y + Math.sin(ang) * 24);
          ctx.lineTo(u.x + Math.cos(ang) * 76, u.y + Math.sin(ang) * 76);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        break;
      }

      case 'shield':
      case 'robo_mech': {
        const baseAng = isPlayer ? 0 : Math.PI;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(u.x + (isPlayer ? 8 : -8), u.y, 26, baseAng - 0.65, baseAng + 0.65);
        ctx.stroke();
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(u.x + (isPlayer ? 12 : -12), u.y, 33, baseAng - 0.72, baseAng + 0.72);
        ctx.stroke();
        break;
      }

      case 'gunslinger':
      case 'superman': {
        const dir = isPlayer ? 1 : -1;
        ctx.strokeStyle = u.abilityId === 'superman' ? '#ef4444' : '#1c1a17';
        ctx.setLineDash([5, 5]);
        for (const dy of [-9, 7]) {
          ctx.beginPath();
          ctx.moveTo(u.x + dir * 22, u.y + dy * 0.4);
          ctx.lineTo(u.x + dir * 82, u.y + dy);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        this.drawSmallArrowHead(ctx, u.x + dir * 82, u.y - 9, dir === 1 ? -0.1 : Math.PI + 0.1, ctx.strokeStyle);
        this.drawSmallArrowHead(ctx, u.x + dir * 82, u.y + 7, dir === 1 ? 0.1 : Math.PI - 0.1, ctx.strokeStyle);
        break;
      }

      case 'spearman':
      case 'claws':
      case 'boxer':
      case 'zombie':
      case 'werewolf':
      case 'death':
      case 'doubler': {
        const baseAng = isPlayer ? 0 : Math.PI;
        ctx.fillStyle = isPlayer ? 'rgba(70, 146, 232, 0.14)' : 'rgba(239, 91, 80, 0.15)';
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(u.x + (isPlayer ? 24 : -24), u.y + 2);
        ctx.arc(u.x + (isPlayer ? 24 : -24), u.y + 2, 68, baseAng - 0.42, baseAng + 0.42);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'thunder': {
        const dir = isPlayer ? 1 : -1;
        ctx.strokeStyle = '#ef5b50';
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.moveTo(u.x + dir * 22, u.y + 2);
        ctx.lineTo(u.x + dir * 40, u.y - 8);
        ctx.lineTo(u.x + dir * 52, u.y + 5);
        ctx.lineTo(u.x + dir * 68, u.y - 6);
        ctx.lineTo(u.x + dir * 80, u.y + 4);
        ctx.lineTo(u.x + dir * 94, u.y - 3);
        ctx.stroke();
        break;
      }

      case 'engineer':
      case 'cryo':
      case 'graviton':
      case 'giant':
      case 'teleporter': {
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.ellipse(u.x + (u.abilityId === 'engineer' ? 8 : 0), u.y, 52, 36, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }

  drawSmallArrowHead(ctx, x, y, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-5, -4);
    ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawArenaUnit(ctx, u, timeSec) {
    ctx.save();

    let fillColor = getUnitTeamColor(u.team, u.classId);
    if (u.flashTimer > 0) fillColor = '#ffffff';
    else if (u.slowTimer > 0) fillColor = '#93c5fd';

    // Если это Червь (гусеница) — сначала рисуем сегменты его длинного хвоста!
    if (u.segments && u.segments.length > 0) {
      for (let s = u.segments.length - 1; s >= 0; s--) {
        const seg = u.segments[s];
        const segColor = s % 2 === 0 ? fillColor : '#86efac';
        drawFighterBody(ctx, 'circle', seg.x, seg.y, seg.r, segColor, '#1c1a17', 2.2, 0);
      }
    }

    // Крылышки Феи за спиной
    if (u.classId === 'fairy' || u.abilityId === 'fairy') {
      ctx.save();
      ctx.translate(u.x, u.y);
      const wingFlap = Math.sin(timeSec * 14) * 0.16;
      ctx.fillStyle = 'rgba(249, 168, 212, 0.65)';
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1.6;
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.rotate(side * (0.55 + wingFlap));
        ctx.beginPath();
        ctx.ellipse(-u.radius * 0.55, side * u.radius * 0.55, u.radius * 0.55, u.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    // Дымовая завеса Оборотня при смене команды (через дым каждые 40 с)
    if (u.smokeTimer > 0) {
      ctx.save();
      const alpha = Math.min(0.75, u.smokeTimer * 0.6);
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
      ctx.strokeStyle = `rgba(71, 85, 105, ${alpha})`;
      ctx.lineWidth = 2;
      for (let puff = 0; puff < 5; puff++) {
        const pang = timeSec * 3 + (puff * Math.PI * 2) / 5;
        const px = u.x + Math.cos(pang) * (u.radius * 0.65);
        const py = u.y + Math.sin(pang) * (u.radius * 0.65);
        ctx.beginPath();
        ctx.arc(px, py, u.radius * 0.72, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Плащ и аура Супермена во время 2-секундного супер-полёта
    if (u.abilityId === 'superman') {
      const moveAng = this.state === 'prep' ? (u.team === 'player' ? 0 : Math.PI) : Math.atan2(u.vy, u.vx);
      ctx.save();
      ctx.translate(u.x, u.y);
      ctx.rotate(moveAng + Math.PI);
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -u.radius * 0.6);
      ctx.lineTo(u.radius * (u.superFlightTimer > 0 ? 1.85 : 1.35), -u.radius * 0.95);
      ctx.lineTo(u.radius * (u.superFlightTimer > 0 ? 1.85 : 1.35), u.radius * 0.95);
      ctx.lineTo(0, u.radius * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (u.superFlightTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(u.x, u.y, u.radius + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Аура увеличения Титана / Кибер-Когтя
    if (u.giantTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(u.x, u.y, u.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Подсветка выбранного в инспекторе бойца
    const isSelected = (u.blueprintId === this.selectedPlayerUnitId || u.blueprintId === this.selectedBotUnitId);
    if (isSelected && !u.isMinion) {
      ctx.save();
      ctx.strokeStyle = u.team === 'player' ? 'rgba(70, 146, 232, 0.55)' : 'rgba(239, 91, 80, 0.55)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(u.x, u.y, u.radius + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Аура ярости Берсерка при ранении
    if (u.abilityId === 'berserker' && u.hp < u.maxHp * 0.85) {
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.beginPath();
      ctx.arc(u.x, u.y, u.radius + 7 + Math.sin(timeSec * 12) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Основное тело фигуры (для «Шах и Мат» — чёрно-белая раскраска шахматной доски!)
    ctx.save();
    ctx.translate(u.x, u.y);
    ctx.scale(u.scaleX, u.scaleY);
    if (u.classId === 'checkmate' || u.abilityId === 'checkmate') {
      drawChessboardBody(ctx, u.shape, 0, 0, u.radius, '#1c1a17', 2.6, u.flashTimer > 0);
    } else {
      drawFighterBody(ctx, u.shape, 0, 0, u.radius, fillColor, '#1c1a17', 2.6, 0);
    }
    ctx.restore();

    // Надпись текущего урона прямо на корпусе Умножителя (1 -> 2 -> 4 -> 8 -> 16...)
    if (u.classId === 'doubler' || u.abilityId === 'doubler') {
      ctx.save();
      ctx.font = '900 11px "Nunito", sans-serif';
      ctx.fillStyle = '#1c1a17';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const txt = `${u.damage}`;
      ctx.strokeText(txt, u.x, u.y + 1);
      ctx.fillText(txt, u.x, u.y + 1);
      ctx.restore();
    }

    // Клыки Вампира (2 маленьких белых клыка, направленных на цель)
    if (u.classId === 'vampire' || u.abilityId === 'vampire') {
      const fangAng = this.state === 'prep' ? (u.team === 'player' ? 0 : Math.PI) : u.aimAngle;
      drawVampireFangs(ctx, u.x, u.y, u.radius, fangAng);
    }

    // Маленькие белые когти и глазки Оборотня прямо на коричневом корпусе
    if (u.classId === 'werewolf' || u.abilityId === 'werewolf') {
      const clawAng = this.state === 'prep' ? (u.team === 'player' ? 0 : Math.PI) : u.aimAngle;
      drawWerewolfDetails(ctx, u.x, u.y, u.radius, clawAng);
    }

    // Усики и глазки Червя (гусеницы)
    if (u.classId === 'worm' || u.abilityId === 'worm') {
      const headAng = this.state === 'prep' ? (u.team === 'player' ? 0 : Math.PI) : Math.atan2(u.vy, u.vx);
      ctx.save();
      ctx.translate(u.x, u.y);
      ctx.rotate(headAng);
      ctx.fillStyle = '#1c1a17';
      ctx.beginPath();
      ctx.arc(u.radius * 0.35, -u.radius * 0.32, 2.6, 0, Math.PI * 2);
      ctx.arc(u.radius * 0.35, u.radius * 0.32, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Отрисовка оружия вокруг бойца
    if (!u.isMinion) {
      this.drawUnitWeaponOnArena(ctx, u, timeSec);
    }

    // Мультяшная анимация контузии (нимб со звёздочками, кружащий над головой 2.5 с после апперкота Боксёра)
    if (u.dizzyTimer > 0) {
      ctx.save();
      const haloY = u.y - u.radius - 23;
      const rx = u.radius * 0.92;
      const ry = 5.5;
      // Золотой нимб-эллипс
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(u.x, haloY, rx, ry, Math.sin(timeSec * 6) * 0.12, 0, Math.PI * 2);
      ctx.stroke();

      // 3 кружащие по нимбу мультяшные звёздочки
      for (let s = 0; s < 3; s++) {
        const sang = timeSec * 7.5 + (s * Math.PI * 2) / 3;
        const sx = u.x + Math.cos(sang) * rx;
        const sy = haloY + Math.sin(sang) * ry;
        ctx.fillStyle = s % 2 === 0 ? '#fde047' : '#fb923c';
        ctx.strokeStyle = '#1c1a17';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Полоска здоровья сверху
    const barW = u.isMinion ? 24 : Math.max(38, u.radius * 1.8);
    const barH = u.isMinion ? 5 : 7;
    this.drawHealthBar(ctx, u.x, u.y - u.radius - 13, barW, barH, u.hp, u.maxHp);

    ctx.restore();
  }

  drawUnitWeaponOnArena(ctx, u, timeSec = 0) {
    const isPlayer = u.team === 'player';

    if (u.abilityId === 'worm' || u.abilityId === 'vampire' || u.abilityId === 'werewolf') {
      // У Червя уже отрисован хвост, у Вампира — 2 белых клыка, а у Оборотня — маленькие белые когти прямо на теле
      return;
    }

    if (u.abilityId === 'bomber') {
      // ПОДРЫВНИК: держит бомбу в руках, а после броска ждёт ровно 8 секунд до появления новой!
      const ang = this.state === 'prep' ? (isPlayer ? 0 : Math.PI) : u.aimAngle;
      const dist = u.radius + 9;
      if (this.state === 'prep' || u.cooldown <= 1.0) {
        drawWeaponGraphic(ctx, 'bomber', u.x + Math.cos(ang) * dist, u.y + Math.sin(ang) * dist, 0.95, ang, u.team);
      } else {
        // Показываем маленький индикатор перезарядки 8 секунд до новой гранаты
        ctx.save();
        ctx.font = '800 10px "Nunito", sans-serif';
        ctx.fillStyle = '#dc2626';
        ctx.textAlign = 'center';
        ctx.fillText(`💣${Math.ceil(u.cooldown)}с`, u.x + Math.cos(ang) * (u.radius + 11), u.y + Math.sin(ang) * (u.radius + 11));
        ctx.restore();
      }
      return;
    }

    if (u.abilityId === 'death') {
      // Коса Смерти с анимацией взмаха при столкновении
      const baseAng = this.state === 'prep' ? (isPlayer ? 0 : Math.PI) : u.aimAngle;
      const swingOffset = u.scytheSwingTimer > 0
        ? Math.sin(u.scytheSwingTimer * 38) * 1.1
        : 0;
      const ang = baseAng + swingOffset;
      const dist = u.radius + 7;

      if (u.scytheSwingTimer > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.75)';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(u.x, u.y, u.radius + 19, baseAng - 0.95, baseAng + 0.95);
        ctx.stroke();
        ctx.restore();
      }

      drawWeaponGraphic(ctx, 'death', u.x + Math.cos(ang) * dist, u.y + Math.sin(ang) * dist, 1.0, ang, u.team);
      return;
    }

    if (u.abilityId === 'ninja') {
      // Катана Ниндзя: при столкновении (katanaSwingTimer > 0) ходит из стороны в сторону с дугой разреза!
      const baseAng = this.state === 'prep' ? (isPlayer ? 0 : Math.PI) : u.aimAngle;
      const swingOffset = u.katanaSwingTimer > 0
        ? Math.sin(u.katanaSwingTimer * 42) * 1.15
        : 0;
      const ang = baseAng + swingOffset;
      const dist = u.radius + 6;

      if (u.katanaSwingTimer > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.85)';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(u.x, u.y, u.radius + 18, baseAng - 0.95, baseAng + 0.95);
        ctx.stroke();
        ctx.restore();
      }

      drawWeaponGraphic(ctx, 'ninja', u.x + Math.cos(ang) * dist, u.y + Math.sin(ang) * dist, 0.95, ang, u.team);
      return;
    }

    if (u.abilityId === 'gunslinger') {
      const base = this.state === 'prep' ? 0 : u.aimAngle;
      drawWeaponGraphic(ctx, 'gunslinger', u.x - 16, u.y + 18, 0.82, base + Math.PI * 0.72, u.team);
      drawWeaponGraphic(ctx, 'gunslinger', u.x + 16, u.y + 18, 0.82, base + Math.PI * 0.22, u.team);
      return;
    }

    if (u.abilityId === 'swordsman' || u.abilityId === 'berserker') {
      const ang = this.state === 'prep' ? 0.55 : u.weaponAngle;
      const dist = u.radius + 6;
      const wx = u.x + Math.cos(ang) * dist;
      const wy = u.y + Math.sin(ang) * dist;
      drawWeaponGraphic(ctx, u.abilityId, wx, wy, 0.95, ang, u.team);
      return;
    }

    if (['archer', 'shield', 'soldier', 'claws', 'laser_bot', 'plasma_rex', 'boxer', 'hunter', 'robo_mech', 'zombie', 'fairy', 'card_master', 'checkmate', 'doubler'].includes(u.abilityId)) {
      const ang = this.state === 'prep' ? (isPlayer ? 0 : Math.PI) : u.aimAngle;
      const dist = u.radius + 7;
      drawWeaponGraphic(ctx, u.abilityId, u.x + Math.cos(ang) * dist, u.y + Math.sin(ang) * dist, 0.95, ang, u.team);
      return;
    }

    if (u.abilityId === 'spearman') {
      if (this.state === 'prep') {
        drawWeaponGraphic(ctx, 'spearman', u.x + 14, u.y - 5, 0.95, -0.25, u.team);
        ctx.save();
        ctx.strokeStyle = '#1c1a17';
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.moveTo(u.x - 16, u.y + 2);
        ctx.lineTo(u.x - 36, u.y + 4);
        ctx.stroke();
        this.drawSmallArrowHead(ctx, u.x - 36, u.y + 4, Math.PI, '#1c1a17');
        ctx.restore();
      } else {
        const extra = u.thrustTimer > 0 ? 11 : 0;
        const dist = u.radius + 4 + extra;
        drawWeaponGraphic(ctx, 'spearman', u.x + Math.cos(u.weaponAngle) * dist, u.y + Math.sin(u.weaponAngle) * dist, 0.95, u.weaponAngle, u.team);
      }
      return;
    }

    if (u.abilityId === 'pyro') {
      const sideX = isPlayer ? u.x + u.radius + 14 : u.x - u.radius - 14;
      drawWeaponGraphic(ctx, 'pyro', sideX, u.y + 2, 0.95, 0, u.team);
      return;
    }

    const sideX = u.x + u.radius + 14;
    drawWeaponGraphic(ctx, u.abilityId, sideX, u.y + 2, 0.9, -Math.PI / 4, u.team);
  }

  drawHealthBar(ctx, cx, cy, w, h, hp, maxHp) {
    const ratio = Math.max(0, Math.min(1, hp / maxHp));
    const x = cx - w / 2;
    const y = cy - h / 2;

    ctx.save();
    ctx.fillStyle = '#e5e0d5';
    ctx.strokeStyle = '#1c1a17';
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundRectPath(ctx, x, y, w, h, 2);
    ctx.fill();

    if (ratio > 0) {
      ctx.fillStyle = ratio > 0.35 ? '#7bd950' : '#f56545';
      ctx.beginPath();
      roundRectPath(ctx, x + 1, y + 1, Math.max(2, (w - 2) * ratio), h - 2, 1.5);
      ctx.fill();
    }

    ctx.stroke();
    ctx.restore();
  }

  drawProjectile(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    const ang = Math.atan2(p.vy, p.vx);

    if (p.type === 'bomb_grenade') {
      // Летящая бомба Подрывника с горящим фитилём
      drawWeaponGraphic(ctx, 'bomber', 0, 0, 0.92, p.spin || 0, p.team);
    } else if (p.type === 'chess_pawn') {
      // Снаряд-пешка бойца «Шах и Мат» (компактного размера как пуля солдата, в форме шахматной пешки)
      drawChessPawn(ctx, 0, 0, 0.78, p.team === 'player' ? '#ffffff' : '#cbd5e1');
    } else if (p.type === 'playing_card') {
      // Летящая игральная карта Карточника (30 урона)
      ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      roundRectPath(ctx, -5, -8.5, 10, 17, 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = p.suitColor || '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, -3.5);
      ctx.lineTo(3, 0);
      ctx.lineTo(0, 3.5);
      ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'shuriken') {
      // Вращающийся стальной 4-конечный сюрикен Ниндзя
      ctx.rotate(p.spin || 0);
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a1 = (i * Math.PI) / 2;
        const a2 = a1 + Math.PI / 4;
        ctx.lineTo(Math.cos(a1) * 9, Math.sin(a1) * 9);
        ctx.lineTo(Math.cos(a2) * 3.2, Math.sin(a2) * 3.2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1c1a17';
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'shotgun_pellet') {
      // Патроны дробовика Охотника (5 штук веером, по 10 урона)
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 4.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (p.type === 'white_pellet') {
      // Мелкие белые пульки Солдата (каждые 0.5 с)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (p.type === 'small_laser') {
      // Небольшие красные лазеры Супермена
      ctx.rotate(ang);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
    } else if (p.type === 'arrow' || p.type === 'turret_dart') {
      ctx.rotate(ang);
      ctx.strokeStyle = '#1c1a17';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();
      this.drawSmallArrowHead(ctx, 8, 0, 0, '#1c1a17');
    } else if (p.type === 'piercing_bullet') {
      ctx.rotate(ang);
      ctx.strokeStyle = 'rgba(28, 26, 23, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(-4, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffbe0b';
      ctx.strokeStyle = '#1c1a17';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (p.type === 'fireball') {
      drawWeaponGraphic(ctx, 'pyro', 0, 0, 0.72, 0, p.team);
    } else if (p.type === 'ice_shard') {
      drawWeaponGraphic(ctx, 'cryo', 0, 0, 0.68, 0, p.team);
    } else if (p.type === 'acid_flask') {
      drawWeaponGraphic(ctx, 'alchemist', 0, 0, 0.68, 0, p.team);
    } else if (p.type === 'boomerang') {
      drawWeaponGraphic(ctx, 'boomerang', 0, 0, 0.85, p.spin, p.team);
    }

    ctx.restore();
  }

  drawLightningArc(ctx, x1, y1, x2, y2, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const mx = x1 + (x2 - x1) * t + (Math.random() * 14 - 7);
      const my = y1 + (y2 - y1) * t + (Math.random() * 14 - 7);
      ctx.lineTo(mx, my);
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
}

function startPaperArena() {
  if (window.game) return;
  try {
    window.game = new BattleRoyalPaperGame();
  } catch (error) {
    console.error('Paper Arena startup failed:', error);
    const notice = document.createElement('div');
    notice.className = 'startup-error';
    notice.setAttribute('role', 'alert');
    notice.textContent = 'Не удалось запустить игру: ' + error.message;
    document.body.appendChild(notice);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPaperArena, { once: true });
} else {
  startPaperArena();
}
