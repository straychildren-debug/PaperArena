// Аудио-движок игры Battle Royal Paper: воспроизведение сгенерированной музыки (Lyria MP3 / студийные WAV) и сэмплированных звуковых эффектов

class SoundFX {
  constructor() {
    this.enabled = true;
    this.musicEnabled = true;
    this.currentMusicMode = null; // 'prep' | 'battle' | 'endgame'
    this.musicAudio = null;
    this.musicTracks = {};
    this.sfxPool = {};
    this.loaded = false;
    this.unlocked = false;
  }

  preloadAudioFiles() {
    if (this.loaded) return;
    this.loaded = true;

    const sfxNames = [
      'click',
      'bounce',
      'parry',
      'hit',
      'shield_bash',
      'shoot_arrow',
      'pistol_shot',
      'magic_fire',
      'magic_ice',
      'lightning',
      'heal',
      'ko',
      'victory',
      'defeat'
    ];

    for (const name of sfxNames) {
      // Создаём пул из 4 аудио-элементов на каждый эффект для полифонии без обрывов
      this.sfxPool[name] = {
        idx: 0,
        players: Array.from({ length: 4 }, () => {
          const a = new Audio();
          a.preload = 'none';
          a.src = `assets/audio/${name}.wav`;
          return a;
        })
      };
    }

    // Музыкальные дорожки из сгенерированных файлов в assets/audio/
    const modes = ['prep', 'battle', 'endgame'];
    for (const mode of modes) {
      const audio = new Audio();
      audio.preload = 'none';
      audio.src = `assets/audio/${mode}_music.wav`;
      audio.loop = true;
      audio.volume = mode === 'prep' ? 0.34 : (mode === 'endgame' ? 0.50 : 0.42);
      this.musicTracks[mode] = audio;
    }
  }

  init() {
    this.unlocked = true;
    this.preloadAudioFiles();
    if (this.enabled && this.currentMusicMode) {
      const track = this.musicTracks[this.currentMusicMode];
      if (track && track.paused) {
        track.play().catch(() => {});
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMusic();
    } else if (this.currentMusicMode) {
      this.playMusic(this.currentMusicMode);
    }
    return this.enabled;
  }

  playMusic(mode) {
    const prevMode = this.currentMusicMode;
    this.currentMusicMode = mode;

    if (!this.enabled || !this.unlocked) return;
    this.preloadAudioFiles();

    if (prevMode && prevMode !== mode && this.musicTracks[prevMode]) {
      this.musicTracks[prevMode].pause();
      this.musicTracks[prevMode].currentTime = 0;
    }

    const nextTrack = this.musicTracks[mode];
    if (nextTrack && nextTrack.paused) {
      nextTrack.play().catch(() => {
        // Браузер запустит музыку при первом клике игрока
      });
    }
  }

  stopMusic() {
    for (const key of Object.keys(this.musicTracks)) {
      const tr = this.musicTracks[key];
      if (tr && !tr.paused) {
        tr.pause();
      }
    }
  }

  playSample(name, volume = 0.55, playbackRate = 1.0) {
    if (!this.enabled || !this.unlocked) return;
    this.preloadAudioFiles();

    const pool = this.sfxPool[name];
    if (!pool) return;

    const player = pool.players[pool.idx];
    pool.idx = (pool.idx + 1) % pool.players.length;

    try {
      player.currentTime = 0;
      player.volume = Math.max(0, Math.min(1, volume));
      player.playbackRate = playbackRate;
      player.play().catch(() => {});
    } catch (e) {}
  }

  click() {
    this.init();
    this.playSample('click', 0.45, 1.0);
  }

  bounce() {
    this.playSample('bounce', 0.28, 0.92 + Math.random() * 0.16);
  }

  parry() {
    this.playSample('parry', 0.65, 0.95 + Math.random() * 0.12);
  }

  hit() {
    this.playSample('hit', 0.55, 0.92 + Math.random() * 0.16);
  }

  shieldBash() {
    this.playSample('shield_bash', 0.68, 0.95 + Math.random() * 0.1);
  }

  shootArrow() {
    this.playSample('shoot_arrow', 0.45, 0.95 + Math.random() * 0.12);
  }

  pistolShot() {
    this.playSample('pistol_shot', 0.68, 1.0);
  }

  magicFire() {
    this.playSample('magic_fire', 0.58, 0.95 + Math.random() * 0.1);
  }

  magicIce() {
    this.playSample('magic_ice', 0.58, 0.96 + Math.random() * 0.1);
  }

  lightning() {
    this.playSample('lightning', 0.62, 0.95 + Math.random() * 0.12);
  }

  heal() {
    this.playSample('heal', 0.58, 1.0);
  }

  ko() {
    this.playSample('ko', 0.72, 0.95 + Math.random() * 0.1);
  }

  startBattle() {
    this.init();
    this.playSample('heal', 0.65, 1.15);
    this.playMusic('battle');
  }

  victory() {
    this.playMusic('prep');
    this.playSample('victory', 0.75, 1.0);
  }

  defeat() {
    this.playMusic('prep');
    this.playSample('defeat', 0.72, 1.0);
  }
}

window.sfx = new SoundFX();

// Разблокировка аудио на мобильных устройствах (iOS Safari / Android Chrome) при первом касании экрана
const unlockMobileAudio = () => {
  if (window.sfx) window.sfx.init();
  window.removeEventListener('touchstart', unlockMobileAudio, true);
  window.removeEventListener('pointerdown', unlockMobileAudio, true);
  window.removeEventListener('click', unlockMobileAudio, true);
};
window.addEventListener('touchstart', unlockMobileAudio, { capture: true, passive: true });
window.addEventListener('pointerdown', unlockMobileAudio, { capture: true, passive: true });
window.addEventListener('click', unlockMobileAudio, { capture: true, passive: true });

