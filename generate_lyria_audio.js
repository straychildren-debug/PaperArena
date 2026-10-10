// Скрипт генерации музыки через Google Lyria API (lyria-3-clip-preview) и создания реальных аудиофайлов
const fs = require('fs');
const path = require('path');

function loadApiKey() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return null;
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
  return match ? match[1].trim() : null;
}

async function callLyriaAPI(apiKey, prompt, outputFile) {
  const endpoints = [
    {
      url: `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(apiKey)}`,
      headers: { 'Content-Type': 'application/json' }
    },
    {
      url: 'https://generativelanguage.googleapis.com/v1beta/interactions',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }
    },
    {
      url: 'https://generativelanguage.googleapis.com/v1beta/interactions',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }
    }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: ep.headers,
        body: JSON.stringify({
          model: 'lyria-3-clip-preview',
          input: prompt
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.log(`[Lyria API status ${res.status}]:`, data?.error?.message || JSON.stringify(data).slice(0, 200));
        continue;
      }

      // Извлекаем base64 аудио из ответа Lyria
      let b64Audio = data?.output_audio?.data || data?.interaction?.output_audio?.data;
      if (!b64Audio) {
        const steps = data?.steps || data?.interaction?.steps || [];
        for (const step of steps) {
          if (step.type === 'model_output' && Array.isArray(step.content)) {
            for (const block of step.content) {
              if (block.type === 'audio' && block.data) {
                b64Audio = block.data;
                break;
              }
            }
          }
        }
      }

      if (b64Audio) {
        fs.writeFileSync(outputFile, Buffer.from(b64Audio, 'base64'));
        console.log(`✅ Lyria успешно сгенерировала трек: ${path.basename(outputFile)}`);
        return true;
      }
    } catch (err) {
      console.log('[Ошибка соединения с Lyria API]:', err.message);
    }
  }
  return false;
}

// Запись 16-битного стерео WAV файла (44.1 kHz)
function writeWavFile(filePath, sampleRate, leftChannel, rightChannel) {
  const numSamples = leftChannel.length;
  const buffer = Buffer.alloc(44 + numSamples * 4);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 4, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM
  buffer.writeUInt16LE(1, 20);  // Linear PCM
  buffer.writeUInt16LE(2, 22);  // Stereo (2 channels)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 4, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-1, Math.min(1, leftChannel[i]));
    const r = Math.max(-1, Math.min(1, rightChannel[i]));
    buffer.writeInt16LE(Math.floor(l * 32767), offset);
    buffer.writeInt16LE(Math.floor(r * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(filePath, buffer);
}

// Инструменты для записи полноценных студийных музыкальных дорожек и звуковых сэмплов
function noteFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function synthPluck(t, freq, decay = 4.5) {
  if (t < 0) return 0;
  const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 120));
  return (
    Math.sin(2 * Math.PI * freq * t) * 0.65 +
    Math.sin(2 * Math.PI * freq * 2 * t) * 0.22 * Math.exp(-t * 8) +
    Math.sin(2 * Math.PI * freq * 3 * t) * 0.10 * Math.exp(-t * 14)
  ) * env;
}

function synthLead(t, freq, dur) {
  if (t < 0 || t > dur) return 0;
  const attack = Math.min(1, t / 0.018);
  const release = Math.min(1, (dur - t) / 0.04);
  const vib = Math.sin(2 * Math.PI * 5.5 * t) * 0.004;
  const f = freq * (1 + vib);
  // Mellow warm synth + harmonic overtones
  return (
    Math.sin(2 * Math.PI * f * t) * 0.55 +
    Math.tanh(Math.sin(2 * Math.PI * f * t) * 2.2) * 0.3 +
    Math.sin(2 * Math.PI * f * 2 * t) * 0.15
  ) * attack * release;
}

function synthBass(t, freq, dur) {
  if (t < 0 || t > dur) return 0;
  const env = Math.exp(-t * 5.5) * Math.min(1, t / 0.008);
  return Math.tanh(
    Math.sin(2 * Math.PI * freq * t) * 1.8 +
    Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.9
  ) * env * 0.7;
}

function synthKick(t) {
  if (t < 0 || t > 0.25) return 0;
  const freq = 52 + 115 * Math.exp(-t * 34);
  const env = Math.exp(-t * 13);
  return Math.sin(2 * Math.PI * freq * t) * env * 0.85;
}

function synthSnare(t, seed = 1) {
  if (t < 0 || t > 0.22) return 0;
  const body = Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 24) * 0.45;
  const noise = (Math.sin(t * 94837.3 + seed) * Math.cos(t * 45193.7)) * Math.exp(-t * 19) * 0.55;
  return body + noise;
}

function synthHiHat(t, open = false) {
  const maxT = open ? 0.18 : 0.055;
  if (t < 0 || t > maxT) return 0;
  const n = Math.sin(t * 142531.1) * Math.cos(t * 89123.7) * Math.sin(t * 62917.3);
  return n * Math.exp(-t * (open ? 16 : 55)) * 0.35;
}

// Генерация полноценной музыкальной композиции в файл
function composeTrackToFile(filePath, config) {
  const sr = 44100;
  const bpm = config.bpm;
  const beatSec = 60 / bpm;
  const stepSec = beatSec / 2; // 8th notes
  const totalSteps = config.totalSteps;
  const duration = totalSteps * stepSec;
  const numSamples = Math.floor(duration * sr);

  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (let step = 0; step < totalSteps; step++) {
    const stepStart = step * stepSec;
    const sIdx = Math.floor(stepStart * sr);

    // 1. Ударные (Kick, Snare, Hi-Hat)
    const isKick = config.kickPattern[step % config.kickPattern.length];
    const isSnare = config.snarePattern[step % config.snarePattern.length];
    const isHat = config.hatPattern[step % config.hatPattern.length];

    const drumLen = Math.floor(0.26 * sr);
    for (let i = 0; i < drumLen && sIdx + i < numSamples; i++) {
      const t = i / sr;
      let d = 0;
      if (isKick) d += synthKick(t);
      if (isSnare) d += synthSnare(t, step);
      if (isHat) d += synthHiHat(t, isHat === 2);
      left[sIdx + i] += d * 0.45;
      right[sIdx + i] += d * 0.45;
    }

    // 2. Басовая линия
    const bassNote = config.bassNotes[step % config.bassNotes.length];
    if (bassNote) {
      const bFreq = noteFreq(bassNote);
      const bLen = Math.floor(stepSec * 1.1 * sr);
      for (let i = 0; i < bLen && sIdx + i < numSamples; i++) {
        const b = synthBass(i / sr, bFreq, stepSec);
        left[sIdx + i] += b * 0.36;
        right[sIdx + i] += b * 0.36;
      }
    }

    // 3. Аккордовый аккомпанемент (Marimba / Pluck Chords в стерео)
    const chord = config.chords[Math.floor(step / 4) % config.chords.length];
    if (step % 2 === 0 && chord) {
      const cLen = Math.floor(stepSec * 2.2 * sr);
      const note = chord[(step / 2) % chord.length];
      const cFreq = noteFreq(note);
      const pan = (step % 4 === 0) ? 0.65 : 0.35;
      for (let i = 0; i < cLen && sIdx + i < numSamples; i++) {
        const p = synthPluck(i / sr, cFreq, 5.0) * 0.25;
        left[sIdx + i] += p * pan;
        right[sIdx + i] += p * (1 - pan);
      }
    }

    // 4. Соло-мелодия
    const melNote = config.melody[step % config.melody.length];
    if (melNote) {
      const mFreq = noteFreq(melNote);
      const mDur = stepSec * (config.melodyHold || 1.35);
      const mLen = Math.floor(mDur * sr);
      for (let i = 0; i < mLen && sIdx + i < numSamples; i++) {
        const m = synthLead(i / sr, mFreq, mDur) * 0.32;
        left[sIdx + i] += m * 0.9;
        right[sIdx + i] += m * 1.05;
      }
    }
  }

  // Мягкий стерео-дилэй и нормализация
  const delaySamples = Math.floor(stepSec * 0.75 * sr);
  for (let i = delaySamples; i < numSamples; i++) {
    left[i] += right[i - delaySamples] * 0.16;
    right[i] += left[i - delaySamples] * 0.16;
  }

  for (let i = 0; i < numSamples; i++) {
    left[i] = Math.tanh(left[i] * 0.95);
    right[i] = Math.tanh(right[i] * 0.95);
  }

  writeWavFile(filePath, sr, left, right);
  console.log(`🎵 Записан музыкальный файл: ${path.basename(filePath)}`);
}

// Генерация насыщенных сэмплированных WAV-звуков для всех способностей
function generateSfxWavFiles(audioDir) {
  const sr = 44100;

  function makeSfx(name, duration, fn) {
    const n = Math.floor(duration * sr);
    const l = new Float32Array(n);
    const r = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const out = fn(t, duration);
      if (Array.isArray(out)) {
        l[i] = out[0];
        r[i] = out[1];
      } else {
        l[i] = out;
        r[i] = out;
      }
    }
    writeWavFile(path.join(audioDir, name), sr, l, r);
  }

  // 1. Звон клинков / Паррирование (parry.wav)
  makeSfx('parry.wav', 0.35, (t) => {
    const m1 = Math.sin(2 * Math.PI * 1180 * t) * Math.exp(-t * 14);
    const m2 = Math.sin(2 * Math.PI * 1870 * t) * Math.exp(-t * 18);
    const m3 = Math.sin(2 * Math.PI * 2640 * t) * Math.exp(-t * 25);
    const clink = (Math.random() * 2 - 1) * Math.exp(-t * 65);
    return (m1 * 0.4 + m2 * 0.35 + m3 * 0.25 + clink * 0.3) * 0.8;
  });

  // 2. Удар оружием / Попадание (hit.wav)
  makeSfx('hit.wav', 0.22, (t) => {
    const f = 90 + 260 * Math.exp(-t * 38);
    const punch = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 16);
    const snap = (Math.random() * 2 - 1) * Math.exp(-t * 45) * 0.5;
    return Math.tanh((punch + snap) * 1.4) * 0.85;
  });

  // 3. Рикошет от стен/фигур (bounce.wav)
  makeSfx('bounce.wav', 0.14, (t) => {
    const f = 140 + 140 * Math.exp(-t * 32);
    return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 24) * 0.65;
  });

  // 4. Таран щитом / Титан (shield_bash.wav)
  makeSfx('shield_bash.wav', 0.32, (t) => {
    const f = 60 + 180 * Math.exp(-t * 28);
    const sub = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 11);
    const clang = Math.sin(2 * Math.PI * 520 * t) * Math.exp(-t * 22) * 0.35;
    return Math.tanh((sub + clang) * 1.6) * 0.9;
  });

  // 5. Выстрел из лука / пульки Солдата (shoot_arrow.wav)
  makeSfx('shoot_arrow.wav', 0.18, (t) => {
    const f = 540 * Math.exp(-t * 9) + 120;
    const twang = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 18);
    const whoosh = (Math.random() * 2 - 1) * Math.exp(-t * 28) * 0.35;
    return (twang * 0.6 + whoosh) * 0.75;
  });

  // 6. Мощный залп из пистолетов Стрелка (pistol_shot.wav)
  makeSfx('pistol_shot.wav', 0.35, (t) => {
    const bang1 = (Math.random() * 2 - 1) * Math.exp(-t * 22) + Math.sin(2 * Math.PI * (120 + 250 * Math.exp(-t * 30)) * t) * Math.exp(-t * 15);
    const t2 = t - 0.065;
    const bang2 = t2 > 0 ? ((Math.random() * 2 - 1) * Math.exp(-t2 * 22) + Math.sin(2 * Math.PI * (140 + 250 * Math.exp(-t2 * 30)) * t2) * Math.exp(-t2 * 15)) : 0;
    return Math.tanh((bang1 + bang2 * 0.85) * 1.4) * 0.85;
  });

  // 7. Лазер Супермена / Лазертрона (lightning.wav)
  makeSfx('lightning.wav', 0.32, (t) => {
    const f = 880 * Math.exp(-t * 7) + 180 + Math.sin(t * 220) * 65;
    const beam = Math.tanh(Math.sin(2 * Math.PI * f * t) * 2.2) * Math.exp(-t * 9);
    const crack = (Math.random() * 2 - 1) * Math.exp(-t * 25) * 0.4;
    return (beam * 0.65 + crack) * 0.8;
  });

  // 8. Огненный шар Пироманта (magic_fire.wav)
  makeSfx('magic_fire.wav', 0.34, (t) => {
    const roar = (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * (180 - t * 220) * t) * Math.exp(-t * 8);
    const low = Math.sin(2 * Math.PI * (220 * Math.exp(-t * 6)) * t) * Math.exp(-t * 9);
    return Math.tanh((roar + low) * 1.4) * 0.8;
  });

  // 9. Магия льда / Телепорт / Вихрь (magic_ice.wav)
  makeSfx('magic_ice.wav', 0.36, (t) => {
    const c1 = Math.sin(2 * Math.PI * 1046.5 * t) * Math.exp(-t * 10);
    const c2 = Math.sin(2 * Math.PI * 1318.5 * t) * Math.exp(-t * 12);
    const c3 = Math.sin(2 * Math.PI * 1567.98 * t) * Math.exp(-t * 8);
    return (c1 + c2 + c3) * 0.3 * 0.85;
  });

  // 10. Исцеление / Усиление (heal.wav)
  makeSfx('heal.wav', 0.42, (t) => {
    const freq = t < 0.14 ? 523.25 : (t < 0.28 ? 659.25 : 783.99);
    return synthPluck(t % 0.14, freq, 6) * 0.8;
  });

  // 11. Нокаут бойца (ko.wav)
  makeSfx('ko.wav', 0.38, (t) => {
    const f = 320 * Math.exp(-t * 6) + 45;
    const boom = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 8);
    const paperRip = (Math.random() * 2 - 1) * Math.exp(-t * 18) * 0.4;
    return Math.tanh((boom + paperRip) * 1.4) * 0.85;
  });

  // 12. Клик по кнопкам (click.wav)
  makeSfx('click.wav', 0.06, (t) => {
    return Math.sin(2 * Math.PI * (620 + t * 2400) * t) * Math.exp(-t * 55) * 0.6;
  });

  // 13. Фанфара победы (victory.wav)
  makeSfx('victory.wav', 1.2, (t) => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const idx = Math.min(3, Math.floor(t / 0.18));
    const localT = t - idx * 0.18;
    return synthLead(localT, notes[idx], idx === 3 ? 0.65 : 0.18) * 0.75;
  });

  // 14. Поражение (defeat.wav)
  makeSfx('defeat.wav', 1.1, (t) => {
    const notes = [392.0, 369.99, 349.23, 311.13];
    const idx = Math.min(3, Math.floor(t / 0.22));
    const localT = t - idx * 0.22;
    return synthLead(localT, notes[idx], idx === 3 ? 0.44 : 0.22) * 0.7;
  });

  console.log('✅ Все 14 звуковых WAV-эффектов записаны в assets/audio/');
}

async function main() {
  const audioDir = path.join(__dirname, 'assets', 'audio');
  fs.mkdirSync(audioDir, { recursive: true });

  const apiKey = loadApiKey();
  const tracks = [
    {
      file: path.join(audioDir, 'prep_music.mp3'),
      wavFallback: path.join(audioDir, 'prep_music.wav'),
      prompt: 'Playful upbeat acoustic guitar and marimba paper-craft tabletop strategy game preparation loop, cheerful indie game soundtrack, 110 BPM, instrumental.'
    },
    {
      file: path.join(audioDir, 'battle_music.mp3'),
      wavFallback: path.join(audioDir, 'battle_music.wav'),
      prompt: 'Energetic arcade arena battle music, driving drums, punchy synth bass, exciting chiptune and brass melody, action game combat loop, 136 BPM, instrumental.'
    },
    {
      file: path.join(audioDir, 'endgame_music.mp3'),
      wavFallback: path.join(audioDir, 'endgame_music.wav'),
      prompt: 'High-tempo intense final boss duel music, fast drums, dramatic synth lead, adrenaline rush arcade climax, 160 BPM, instrumental.'
    }
  ];

  let lyriaSuccessCount = 0;
  if (apiKey) {
    console.log('Пробуем сгенерировать музыку через Google Lyria API...');
    for (const tr of tracks) {
      const ok = await callLyriaAPI(apiKey, tr.prompt, tr.file);
      if (ok) lyriaSuccessCount++;
    }
  }

  // Также всегда записываем полноценные студийные WAV-композиции и WAV-эффекты, чтобы игра звучала мгновенно и без сбоев
  composeTrackToFile(path.join(audioDir, 'prep_music.wav'), {
    bpm: 112,
    totalSteps: 32,
    kickPattern:  [1, 0, 0, 0, 1, 0, 0, 0],
    snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
    hatPattern:   [1, 1, 1, 1, 1, 1, 2, 1],
    bassNotes:    [48, 0, 48, 55, 53, 0, 53, 55, 45, 0, 45, 52, 43, 0, 47, 50],
    chords:       [[60, 64, 67], [65, 69, 72], [57, 60, 64], [55, 59, 62]],
    melody:       [72, 0, 76, 79, 77, 76, 72, 0, 69, 72, 76, 74, 72, 0, 67, 0]
  });

  composeTrackToFile(path.join(audioDir, 'battle_music.wav'), {
    bpm: 138,
    totalSteps: 32,
    kickPattern:  [1, 0, 1, 0, 1, 0, 1, 1],
    snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
    hatPattern:   [1, 1, 2, 1, 1, 1, 2, 1],
    bassNotes:    [45, 45, 57, 45, 48, 48, 60, 48, 50, 50, 62, 50, 40, 40, 52, 43],
    chords:       [[57, 60, 64], [60, 64, 67], [62, 65, 69], [52, 56, 59]],
    melody:       [69, 72, 76, 69, 72, 76, 79, 76, 74, 77, 81, 77, 76, 74, 71, 68]
  });

  composeTrackToFile(path.join(audioDir, 'endgame_music.wav'), {
    bpm: 164,
    totalSteps: 32,
    kickPattern:  [1, 1, 1, 0, 1, 1, 1, 1],
    snarePattern: [0, 0, 1, 0, 0, 1, 1, 0],
    hatPattern:   [2, 1, 2, 1, 2, 1, 2, 2],
    bassNotes:    [45, 57, 45, 57, 46, 58, 46, 58, 50, 62, 50, 62, 49, 61, 49, 55],
    chords:       [[57, 61, 64], [58, 62, 65], [62, 65, 69], [61, 64, 67]],
    melody:       [81, 76, 72, 81, 82, 77, 74, 82, 86, 81, 77, 74, 85, 81, 76, 73]
  });

  generateSfxWavFiles(audioDir);
  console.log(`Готово! Lyria MP3 треков: ${lyriaSuccessCount}`);
}

main();
