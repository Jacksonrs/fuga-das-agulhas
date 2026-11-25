import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { loadBestScore } from '../common/utils.js';
import {
  createBackground,
  createFloatingDecor,
  createPillButton,
  CSS,
  drawPanel,
  fadeIn,
  FONT,
  goToScene,
  textStyle,
} from '../common/ui.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.MENU_SCENE,
    });
  }

  create() {
    const { width } = this.scale;
    fadeIn(this);

    createBackground(this, { dim: 0.25 });
    createFloatingDecor(this, 14);

    this.createTitle();

    const subtitle = this.add
      .text(width / 2, 300, 'Desvie das agulhas e pegue os botões!', textStyle(30, CSS.MUTED))
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: subtitle, alpha: 1, delay: 900, duration: 500 });

    this.createControlsCard(width / 2, 410);

    const play = createPillButton(this, width / 2, 548, 'JOGAR', () => this.startGame(), { width: 300, height: 80, fontSize: 40 });
    play.setScale(0);
    this.tweens.add({ targets: play, scale: 1, delay: 1100, duration: 500, ease: 'Back.easeOut' });
    // "respira" para chamar atenção
    this.tweens.add({ targets: play, y: play.y - 6, delay: 1600, duration: 900, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });

    const best = loadBestScore();
    const bestText = this.add
      .text(width / 2, 650, best > 0 ? `★  Recorde: ${best}  ★` : 'Aperte ESPAÇO para começar', textStyle(26, CSS.GOLD))
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: bestText, alpha: 1, delay: 1300, duration: 500 });

    // o navegador só libera áudio depois de uma interação do jogador,
    // por isso a música começa ao entrar na cena do jogo
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
  }

  /** Título com letras que caem quicando e depois ficam "ondulando". */
  createTitle() {
    const { width } = this.scale;

    const top = this.add.text(width / 2, 92, 'FUGA DAS', textStyle(46, CSS.CREAM)).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: top, alpha: 1, y: 104, duration: 500, ease: 'Cubic.easeOut' });

    const word = 'AGULHAS';
    const style = textStyle(124, CSS.GOLD, { fontStyle: '700', strokeThickness: 14 });
    const letters = [...word].map((ch) => this.add.text(0, 0, ch, style).setOrigin(0.5));
    const spacing = -6;
    const total = letters.reduce((sum, l) => sum + l.width + spacing, -spacing);
    let x = width / 2 - total / 2;

    letters.forEach((letter, i) => {
      letter.x = x + letter.width / 2;
      x += letter.width + spacing;
      const targetY = 198;
      letter.y = -120;
      letter.setAngle(Phaser.Math.Between(-25, 25));
      this.tweens.add({
        targets: letter,
        y: targetY,
        angle: 0,
        delay: 150 + i * 70,
        duration: 700,
        ease: 'Bounce.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: letter,
            y: targetY - 10,
            angle: i % 2 === 0 ? -3 : 3,
            duration: 1100,
            delay: i * 120,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
          });
        },
      });
    });
  }

  createControlsCard(x, y) {
    const items = [
      ['← →  A D', 'mover'],
      ['arrastar', 'no celular'],
      ['P  /  ESC', 'pausar'],
      ['↑ ↓', 'volume'],
    ];
    const cardWidth = 820;
    const card = this.add.container(x, y);
    card.add(drawPanel(this, 0, 0, cardWidth, 108, 26));

    const colWidth = cardWidth / items.length;
    items.forEach(([keys, label], i) => {
      const cx = -cardWidth / 2 + colWidth * (i + 0.5);
      card.add(
        this.add
          .text(cx, -14, keys, { fontFamily: FONT, fontSize: '28px', fontStyle: '700', color: CSS.CREAM })
          .setOrigin(0.5)
      );
      card.add(this.add.text(cx, 22, label, { fontFamily: FONT, fontSize: '20px', color: CSS.MUTED }).setOrigin(0.5));
      if (i > 0) {
        const line = this.add.rectangle(-cardWidth / 2 + colWidth * i, 0, 2, 60, 0xffffff, 0.12);
        card.add(line);
      }
    });

    card.setAlpha(0);
    card.y += 30;
    this.tweens.add({ targets: card, alpha: 1, y, delay: 950, duration: 600, ease: 'Cubic.easeOut' });
  }

  startGame() {
    goToScene(this, SCENE_KEYS.GAME_SCENE);
  }
}
