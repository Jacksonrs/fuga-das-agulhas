import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS, BUTTON_FRAMES } from '../common/assets.js';
import {
  COLORS,
  createBackground,
  createFloatingDecor,
  createPillButton,
  CSS,
  drawPanel,
  fadeIn,
  FONT,
  goToScene,
  TEX,
  textStyle,
} from '../common/ui.js';

export class GameOverScene extends Phaser.Scene {
  result;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_OVER_SCENE,
    });
  }

  /**
   * Recebe os dados enviados pela cena do jogo.
   * @param {{score: number, best: number, isNewRecord: boolean, level: number, seconds: number}} data
   */
  init(data) {
    this.result = data;
  }

  create() {
    const { width } = this.scale;
    const { score, best, isNewRecord, level, seconds } = this.result;
    fadeIn(this);

    createBackground(this, { dim: 0.5 });
    createFloatingDecor(this, 8);

    // título com letras que tremem ao entrar
    const title = this.add
      .text(width / 2, 92, 'FIM DE JOGO', textStyle(92, CSS.CORAL, { fontStyle: '700', strokeThickness: 12 }))
      .setOrigin(0.5)
      .setScale(2.2)
      .setAlpha(0);
    this.tweens.add({ targets: title, scale: 1, alpha: 1, duration: 450, ease: 'Back.easeOut' });
    this.time.delayedCall(450, () => this.cameras.main.shake(180, 0.006));

    // cartão com o resultado
    const card = this.add.container(width / 2, 380);
    card.add(drawPanel(this, 0, 0, 560, 340, 32, 0.75));

    card.add(this.add.text(0, -130, 'PONTOS', { fontFamily: FONT, fontSize: '22px', fontStyle: '600', color: CSS.MUTED }).setOrigin(0.5));
    const scoreText = this.add.text(0, -78, '0', textStyle(80, CSS.GOLD, { fontStyle: '700', strokeThickness: 10 })).setOrigin(0.5);
    card.add(scoreText);

    const stats = [
      ['Nível', String(level)],
      ['Tempo', `${seconds} s`],
      ['Recorde', String(best)],
    ];
    const colW = 170;
    stats.forEach(([label, value], i) => {
      const cx = (i - 1) * colW;
      card.add(this.add.text(cx, 20, value, textStyle(40, CSS.CREAM, { fontStyle: '700' })).setOrigin(0.5));
      card.add(this.add.text(cx, 64, label, { fontFamily: FONT, fontSize: '20px', color: CSS.MUTED }).setOrigin(0.5));
    });

    const hint = this.add
      .text(0, 130, 'ESPAÇO: jogar de novo   •   M: menu', { fontFamily: FONT, fontSize: '20px', color: CSS.MUTED })
      .setOrigin(0.5);
    card.add(hint);

    card.setAlpha(0);
    card.y += 120;
    this.tweens.add({ targets: card, y: 380, alpha: 1, delay: 250, duration: 650, ease: 'Back.easeOut' });

    // os pontos "sobem" contando
    this.tweens.addCounter({
      from: 0,
      to: score,
      delay: 600,
      duration: Math.min(1500, 400 + score * 2),
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => scoreText.setText(String(Math.floor(tween.getValue()))),
      onComplete: () => {
        scoreText.setText(String(score));
        this.tweens.add({ targets: scoreText, scale: { from: 1.3, to: 1 }, duration: 300, ease: 'Back.easeOut' });
        if (isNewRecord) this.celebrate(card);
      },
    });

    // botões
    const again = createPillButton(this, width / 2 - 170, 626, 'JOGAR DE NOVO', () => this.restart(), {
      width: 310,
      height: 72,
      fontSize: 30,
      color: COLORS.GOLD,
    });
    const menu = createPillButton(this, width / 2 + 170, 626, 'MENU', () => this.toMenu(), {
      width: 250,
      height: 72,
      fontSize: 30,
      color: COLORS.CREAM,
    });
    [again, menu].forEach((btn, i) => {
      btn.setScale(0);
      this.tweens.add({ targets: btn, scale: 1, delay: 800 + i * 120, duration: 400, ease: 'Back.easeOut' });
    });

    // pequena espera para o jogador não reiniciar sem querer
    this.time.delayedCall(600, () => {
      this.input.keyboard?.once('keydown-SPACE', () => this.restart());
      this.input.keyboard?.once('keydown-ENTER', () => this.restart());
      this.input.keyboard?.once('keydown-M', () => this.toMenu());
    });
  }

  /** Selo de novo recorde + chuva de confete. */
  celebrate(card) {
    const { width } = this.scale;

    const badge = this.add.container(width / 2 + 210, card.y - 160).setAngle(12).setScale(0);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.GOLD, 1);
    bg.fillRoundedRect(-120, -30, 240, 60, 30);
    bg.lineStyle(3, COLORS.PANEL, 1);
    bg.strokeRoundedRect(-120, -30, 240, 60, 30);
    badge.add([bg, this.add.text(0, 0, 'NOVO RECORDE!', { fontFamily: FONT, fontSize: '26px', fontStyle: '700', color: CSS.DARK }).setOrigin(0.5)]);
    this.tweens.add({ targets: badge, scale: 1, duration: 450, ease: 'Back.easeOut' });
    this.tweens.add({ targets: badge, angle: 6, scale: 1.08, delay: 450, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // confete de pontinhos coloridos
    this.add.particles(0, 0, TEX.DOT, {
      x: { min: 0, max: width },
      y: -20,
      lifespan: 3500,
      speedY: { min: 150, max: 320 },
      speedX: { min: -80, max: 80 },
      scale: { min: 0.4, max: 0.9 },
      rotate: { min: 0, max: 360 },
      tint: [COLORS.GOLD, COLORS.CORAL, COLORS.MINT, COLORS.PINK, 0xffffff],
      quantity: 3,
      frequency: 40,
      duration: 1800,
    });

    // e alguns botões de verdade caindo junto
    this.add.particles(0, 0, ASSET_KEYS.OBJECTS, {
      frame: BUTTON_FRAMES,
      x: { min: 0, max: width },
      y: -40,
      lifespan: 3500,
      speedY: { min: 180, max: 300 },
      scale: { min: 0.2, max: 0.35 },
      rotate: { start: 0, end: 360 },
      frequency: 120,
      duration: 1500,
    });

    this.cameras.main.flash(300, 255, 209, 102, false);
  }

  restart() {
    goToScene(this, SCENE_KEYS.GAME_SCENE);
  }

  toMenu() {
    goToScene(this, SCENE_KEYS.MENU_SCENE);
  }
}
