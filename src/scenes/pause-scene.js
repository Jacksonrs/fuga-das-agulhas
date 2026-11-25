import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { COLORS, createPillButton, CSS, drawPanel, FONT, textStyle } from '../common/ui.js';

/**
 * Cena que fica por cima do jogo enquanto ele está pausado.
 * Como o jogo inteiro é pausado (temporizadores, animações e partículas),
 * nada se mexe por baixo.
 */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PAUSE_SCENE,
    });
  }

  create() {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.PANEL, 0).setInteractive();
    this.tweens.add({ targets: overlay, fillAlpha: 0.65, duration: 200 });

    const card = this.add.container(width / 2, height / 2);
    card.add(drawPanel(this, 0, 0, 480, 380, 32, 0.85));
    card.add(this.add.text(0, -120, 'PAUSADO', textStyle(64, CSS.GOLD, { fontStyle: '700' })).setOrigin(0.5));
    card.add(createPillButton(this, 0, 0, 'CONTINUAR', () => this.resumeGame(), { width: 320, height: 72, color: COLORS.MINT }));
    card.add(createPillButton(this, 0, 100, 'MENU', () => this.goToMenu(), { width: 320, height: 72, color: COLORS.CREAM }));
    card.add(this.add.text(0, 160, 'P ou ESC para continuar', { fontFamily: FONT, fontSize: '20px', color: CSS.MUTED }).setOrigin(0.5));

    card.setScale(0.7).setAlpha(0);
    this.tweens.add({ targets: card, scale: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });

    this.input.keyboard?.on('keydown-P', () => this.resumeGame());
    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
    this.input.keyboard?.on('keydown-M', () => this.goToMenu());
  }

  resumeGame() {
    this.scene.resume(SCENE_KEYS.GAME_SCENE);
    this.scene.stop();
  }

  goToMenu() {
    this.sound.get(ASSET_KEYS.MUSIC)?.resume();
    this.scene.stop(SCENE_KEYS.GAME_SCENE);
    this.scene.start(SCENE_KEYS.MENU_SCENE);
  }
}
