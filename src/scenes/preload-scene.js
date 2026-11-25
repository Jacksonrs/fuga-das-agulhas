import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { AUDIO_ASSETS, IMAGE_ASSETS, TEXTURE_ATLAS_ASSETS } from '../common/assets.js';
import { COLORS, createGeneratedTextures, CSS, FONT } from '../common/ui.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  preload() {
    // barra de carregamento arredondada
    const { width, height } = this.scale;
    const barWidth = 520;
    const barHeight = 22;
    const x = width / 2 - barWidth / 2;
    const y = height / 2;

    this.add
      .text(width / 2, y - 60, 'carregando...', { fontFamily: FONT, fontSize: '28px', color: CSS.MUTED })
      .setOrigin(0.5);

    const track = this.add.graphics();
    track.fillStyle(0xffffff, 0.12);
    track.fillRoundedRect(x, y - barHeight / 2, barWidth, barHeight, barHeight / 2);

    const bar = this.add.graphics();
    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(COLORS.GOLD, 1);
      bar.fillRoundedRect(x, y - barHeight / 2, Math.max(barHeight, barWidth * value), barHeight, barHeight / 2);
    });

    IMAGE_ASSETS.forEach((asset) => {
      this.load.image(asset.assetKey, asset.path);
    });

    AUDIO_ASSETS.forEach((asset) => {
      this.load.audio(asset.assetKey, asset.path);
    });

    TEXTURE_ATLAS_ASSETS.forEach((asset) => {
      this.load.atlas(asset.assetKey, asset.textureURL, asset.atlasURL);
    });
  }

  create() {
    createGeneratedTextures(this);

    // espera a fonte do Google carregar (no máximo 2,5 s; sem internet usa a reserva)
    const fontReady = document.fonts
      ? Promise.all([document.fonts.load('600 40px "Fredoka"'), document.fonts.load('700 40px "Fredoka"')])
      : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 2500));
    Promise.race([fontReady, timeout])
      .catch(() => {})
      .then(() => this.scene.start(SCENE_KEYS.MENU_SCENE));
  }
}
