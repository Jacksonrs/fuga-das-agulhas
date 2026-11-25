import Phaser from '../lib/phaser.js';
import { ASSET_KEYS } from './assets.js';
import { GAME_CONFIG } from './config.js';

/**
 * Retorna a música do jogo, criando e tocando se ainda não existir.
 * O gerenciador de som é global, então a música continua entre as cenas.
 * @param {Phaser.Scene} scene
 */
export function getMusic(scene) {
  let music = scene.sound.get(ASSET_KEYS.MUSIC);
  if (!music) {
    music = scene.sound.add(ASSET_KEYS.MUSIC, { loop: true, volume: 0.5 });
  }
  if (!music.isPlaying) {
    music.play();
  }
  return music;
}

/**
 * Muda o volume da música, mantendo entre 0 e 1.
 * @param {Phaser.Sound.BaseSound} music
 * @param {number} delta
 * @returns {number} novo volume
 */
export function changeVolume(music, delta) {
  const volume = Math.round(Phaser.Math.Clamp(music.volume + delta, 0, 1) * 10) / 10;
  music.setVolume(volume);
  return volume;
}

export function loadBestScore() {
  try {
    return Number(localStorage.getItem(GAME_CONFIG.BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score) {
  try {
    localStorage.setItem(GAME_CONFIG.BEST_SCORE_KEY, String(score));
  } catch {
    // sem armazenamento disponível: ignora
  }
}
