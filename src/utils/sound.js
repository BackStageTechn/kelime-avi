import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let soundObjects = {};
let isInitialized = false;
let soundEnabled = true;

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

// Base64 encoded minimal WAV ses dosyaları
// Her ses kısa bir synthesized tone

function createWavBuffer(frequency, duration, volume = 0.5, type = 'sine') {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // WAV Header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Audio data
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, (numSamples - i) / (sampleRate * 0.05)) * Math.min(1, i / (sampleRate * 0.005));
    let sample;

    if (type === 'sine') {
      sample = Math.sin(2 * Math.PI * frequency * t);
    } else if (type === 'square') {
      sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
    } else if (type === 'triangle') {
      const period = 1 / frequency;
      const phase = (t % period) / period;
      sample = 4 * Math.abs(phase - 0.5) - 1;
    }

    const value = Math.floor(sample * volume * envelope * 32767);
    view.setInt16(headerSize + i * 2, value, true);
  }

  return buffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Use btoa for base64 encoding
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  // Fallback for React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  while (i < binary.length) {
    const a = binary.charCodeAt(i++) || 0;
    const b = binary.charCodeAt(i++) || 0;
    const c = binary.charCodeAt(i++) || 0;
    const triplet = (a << 16) | (b << 8) | c;
    result += chars[(triplet >> 18) & 63];
    result += chars[(triplet >> 12) & 63];
    result += i - 2 <= binary.length ? chars[(triplet >> 6) & 63] : '=';
    result += i - 1 <= binary.length ? chars[triplet & 63] : '=';
  }
  return result;
}

async function createSound(frequency, duration, volume = 0.4, type = 'sine') {
  try {
    const wavBuffer = createWavBuffer(frequency, duration, volume, type);
    const base64 = arrayBufferToBase64(wavBuffer);
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${base64}` },
      { shouldPlay: false }
    );
    return sound;
  } catch (e) {
    console.log('Ses oluşturma hatası:', e);
    return null;
  }
}

export async function initSounds() {
  if (isInitialized) return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Seçim sesi - kısa tık (yüksek frekans, kısa)
    soundObjects.select = await createSound(800, 0.05, 0.3, 'sine');

    // Kelime bulundu sesi - yukarı doğru melodi
    soundObjects.wordFound = await createSound(880, 0.15, 0.4, 'sine');

    // Yanlış seçim sesi - düşük ton
    soundObjects.wrong = await createSound(200, 0.2, 0.3, 'sine');

    // Seviye tamamlandı sesi - uzun mutlu ton
    soundObjects.levelComplete = await createSound(1047, 0.4, 0.5, 'sine');

    // Buton tıklama sesi
    soundObjects.tap = await createSound(600, 0.04, 0.2, 'sine');

    isInitialized = true;
  } catch (e) {
    console.log('Ses başlatma hatası:', e);
  }
}

export async function playSound(soundName) {
  if (!soundEnabled) return;
  try {
    const sound = soundObjects[soundName];
    if (!sound) return;

    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (e) {
    // Sessizce devam et
  }
}

export async function playWordFoundSound() {
  if (!soundEnabled) return;
  try {
    if (soundObjects.wordFound) {
      await soundObjects.wordFound.setPositionAsync(0);
      await soundObjects.wordFound.playAsync();
    }
  } catch (e) {}
}

export async function playLevelCompleteSound() {
  if (!soundEnabled) return;
  try {
    if (soundObjects.levelComplete) {
      await soundObjects.levelComplete.setPositionAsync(0);
      await soundObjects.levelComplete.playAsync();
    }
  } catch (e) {}
}

export function cleanupSounds() {
  Object.values(soundObjects).forEach(async (sound) => {
    try {
      if (sound) await sound.unloadAsync();
    } catch (e) {}
  });
  soundObjects = {};
  isInitialized = false;
}
