import Phaser from './lib/phaser.js';
import { SCENE_KEYS } from './common/scene-keys.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { MenuScene } from './scenes/menu-scene.js';
import { GameScene } from './scenes/game-scene.js';
import { GameOverScene } from './scenes/game-over-scene.js';
import { PauseScene } from './scenes/pause-scene.js';

/** @type {Phaser.Types.Core.GameConfig} */
const gameConfig = {
  type: Phaser.AUTO,
  pixelArt: false,
  title: 'Fuga das Agulhas',
  scale: {
    parent: 'game-container',
    width: 1280,
    height: 720,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
  },
  backgroundColor: '#0d2b2e',
  // em telas de toque, evita que o navegador role a página enquanto o jogador arrasta
  input: { activePointers: 2 },
};

const game = new Phaser.Game(gameConfig);

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.MENU_SCENE, MenuScene);
game.scene.add(SCENE_KEYS.GAME_SCENE, GameScene);
game.scene.add(SCENE_KEYS.GAME_OVER_SCENE, GameOverScene);
game.scene.add(SCENE_KEYS.PAUSE_SCENE, PauseScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
