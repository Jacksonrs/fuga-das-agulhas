import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS, BUTTON_FRAMES, NEEDLE_FRAMES } from '../common/assets.js';
import { GAME_CONFIG } from '../common/config.js';
import { changeVolume, getMusic, loadBestScore, saveBestScore } from '../common/utils.js';
import {
  BUTTON_COLORS,
  COLORS,
  createBackground,
  CSS,
  drawPanel,
  fadeIn,
  FONT,
  goToScene,
  TEX,
  textStyle,
} from '../common/ui.js';

// camadas de desenho (quanto maior, mais na frente)
const DEPTH = Object.freeze({ PLAYER: 60, OBJECTS: 61, FX: 62, FLASH: 90, HUD: 100, BANNER: 110 });

const JAR_SCALE = 0.55;
const FLOOR_Y = 706; // onde fica o fundo do pote

// caixa de colisão das agulhas: uma faixa fina no centro (igual para todas as agulhas)
const NEEDLE_HITBOX = { width: 10, height: 100 };
const BUTTON_RADIUS = 28;

export class GameScene extends Phaser.Scene {
  cursorsKeys;
  keyA;
  keyD;
  music;

  /** @type {Phaser.GameObjects.Container} */
  player;
  /** @type {Phaser.GameObjects.Image} */
  jar;
  /** @type {Phaser.GameObjects.Image} */
  shadow;
  /** @type {Phaser.GameObjects.Image[]} botõezinhos guardados dentro do pote */
  jarButtons = [];

  /** @type {{ sprite: Phaser.GameObjects.Image, marker: Phaser.GameObjects.Image | null, speed: number, phase: number }[]} */
  needles = [];
  /** @type {{ box: Phaser.GameObjects.Container, sprite: Phaser.GameObjects.Image, glow: Phaser.GameObjects.Image, frame: string, baseX: number, speed: number, phase: number }[]} */
  buttons = [];

  score = 0;
  shownScore = -1;
  best = 0;
  lives = GAME_CONFIG.START_LIVES;
  level = 1;
  elapsed = 0; // tempo de jogo em ms
  needleSpeed = GAME_CONFIG.NEEDLE_START_SPEED;
  needleDelay = GAME_CONFIG.NEEDLE_START_DELAY;
  invincibleUntil = 0;
  isGameOver = false;
  velocityX = 0;
  /** @type {number | null} posição x do dedo/mouse quando o jogador arrasta */
  pointerTargetX = null;
  trailTimer = 0;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  /**
   * Roda toda vez que a cena começa (inclusive ao jogar de novo),
   * então zeramos o estado aqui.
   */
  init() {
    this.needles = [];
    this.buttons = [];
    this.jarButtons = [];
    this.score = 0;
    this.shownScore = -1;
    this.best = loadBestScore();
    this.lives = GAME_CONFIG.START_LIVES;
    this.level = 1;
    this.elapsed = 0;
    this.needleSpeed = GAME_CONFIG.NEEDLE_START_SPEED;
    this.needleDelay = GAME_CONFIG.NEEDLE_START_DELAY;
    this.invincibleUntil = 0;
    this.isGameOver = false;
    this.velocityX = 0;
    this.pointerTargetX = null;
    this.trailTimer = 0;
    this.levelTimer = null;
  }

  create() {
    fadeIn(this);
    createBackground(this, { dim: 0.4 });

    this.createPlayer();
    this.createEffects();
    this.createUI();
    this.createInput();

    this.music = getMusic(this);
    this.updateVolumeUI();

    // agulhas e botões aparecem com temporizadores
    this.scheduleNeedle();
    this.time.addEvent({
      delay: GAME_CONFIG.BUTTON_DELAY,
      loop: true,
      callback: () => this.spawnButton(),
    });

    // a cada X segundos, o nível sobe: agulhas mais rápidas e mais frequentes
    this.levelTimer = this.time.addEvent({
      delay: GAME_CONFIG.LEVEL_UP_TIME,
      loop: true,
      callback: () => this.levelUp(),
    });

    // música pausa/volta junto com o jogo
    this.events.on(Phaser.Scenes.Events.PAUSE, () => this.music.pause());
    this.events.on(Phaser.Scenes.Events.RESUME, () => {
      this.music.resume();
      this.pointerTargetX = null;
    });

    // se o jogador trocar de aba ou janela, o jogo pausa sozinho
    const onBlur = () => this.openPause();
    this.game.events.on(Phaser.Core.Events.BLUR, onBlur);
    this.game.events.on(Phaser.Core.Events.HIDDEN, onBlur);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, onBlur);
      this.game.events.off(Phaser.Core.Events.HIDDEN, onBlur);
    });
  }

  // ===== Criação =====

  createPlayer() {
    const { width } = this.scale;

    this.shadow = this.add.image(width / 2, FLOOR_Y + 2, TEX.SHADOW).setDepth(DEPTH.PLAYER - 1);

    // o pote é um container: assim os botões coletados ficam "dentro" dele e se movem junto
    this.player = this.add.container(width / 2, FLOOR_Y).setDepth(DEPTH.PLAYER);
    this.jar = this.add.image(0, 0, ASSET_KEYS.JAR).setOrigin(0.5, 1).setScale(JAR_SCALE);
    this.player.add(this.jar);

    // entrada do pote: cai de cima com um quique
    this.player.y = -100;
    this.tweens.add({ targets: this.player, y: FLOOR_Y, duration: 600, ease: 'Bounce.easeOut' });
  }

  createEffects() {
    // rastro das agulhas
    this.trailEmitter = this.add
      .particles(0, 0, TEX.STREAK, {
        emitting: false,
        lifespan: 260,
        alpha: { start: 0.35, end: 0 },
        scaleY: { start: 1.3, end: 0.3 },
        scaleX: 0.8,
        blendMode: 'ADD',
      })
      .setDepth(DEPTH.OBJECTS - 1);

    // explosão colorida ao pegar um botão
    this.burstEmitter = this.add
      .particles(0, 0, TEX.DOT, {
        emitting: false,
        lifespan: { min: 400, max: 800 },
        speed: { min: 120, max: 380 },
        scale: { start: 0.9, end: 0 },
        gravityY: 500,
        blendMode: 'ADD',
      })
      .setDepth(DEPTH.FX);

    // faíscas metálicas quando uma agulha acerta o pote
    this.sparkEmitter = this.add
      .particles(0, 0, TEX.DOT, {
        emitting: false,
        lifespan: { min: 250, max: 550 },
        speed: { min: 200, max: 520 },
        scale: { start: 0.6, end: 0 },
        tint: [0xffffff, 0xd8e6ea, COLORS.CORAL],
        gravityY: 700,
        blendMode: 'ADD',
      })
      .setDepth(DEPTH.FX);

    // tela vermelha rápida ao levar dano
    const { width, height } = this.scale;
    this.hurtFlash = this.add.rectangle(width / 2, height / 2, width, height, COLORS.CORAL, 0).setDepth(DEPTH.FLASH);
  }

  createUI() {
    const { width } = this.scale;

    // painel de pontos (canto esquerdo)
    const scorePanel = this.add.container(24, 20).setDepth(DEPTH.HUD);
    scorePanel.add(drawPanel(this, 150, 66, 300, 132, 24));
    scorePanel.add(this.add.text(22, 14, 'PONTOS', { fontFamily: FONT, fontSize: '18px', fontStyle: '600', color: CSS.MUTED }));
    scorePanel.add(
      this.add.text(278, 14, `★ ${this.best}`, { fontFamily: FONT, fontSize: '18px', fontStyle: '600', color: CSS.GOLD }).setOrigin(1, 0)
    );
    this.scoreText = this.add.text(20, 32, '0', textStyle(44, CSS.CREAM, { fontStyle: '700' }));
    scorePanel.add(this.scoreText);

    // nível + barra de progresso até o próximo nível
    this.levelText = this.add.text(22, 110, 'Nível 1', { fontFamily: FONT, fontSize: '18px', fontStyle: '700', color: CSS.GOLD }).setOrigin(0, 0.5);
    scorePanel.add(this.levelText);
    const barX = 110;
    const barW = 168;
    const barTrack = this.add.graphics();
    barTrack.fillStyle(0xffffff, 0.12);
    barTrack.fillRoundedRect(barX, 104, barW, 12, 6);
    this.levelBar = this.add.graphics();
    this.levelBarArea = { x: barX, y: 104, w: barW, h: 12 };
    scorePanel.add([barTrack, this.levelBar]);

    // corações (canto direito)
    const heartsPanel = this.add.container(width - 24, 20).setDepth(DEPTH.HUD);
    const panelW = 60 * GAME_CONFIG.START_LIVES + 24;
    heartsPanel.add(drawPanel(this, -panelW / 2, 36, panelW, 72, 24));
    this.hearts = [];
    for (let i = 0; i < GAME_CONFIG.START_LIVES; i++) {
      const heart = this.add.image(-panelW + 42 + i * 60, 36, TEX.HEART);
      heartsPanel.add(heart);
      this.hearts.push(heart);
      // batimento suave
      this.tweens.add({ targets: heart, scale: 1.08, duration: 500, delay: i * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // botão de pausa (bom para celular) e volume
    const pauseBtn = this.add.container(width - 52, 132).setDepth(DEPTH.HUD).setSize(56, 56).setInteractive({ useHandCursor: true });
    const pauseBg = this.add.graphics();
    pauseBg.fillStyle(COLORS.PANEL, 0.55);
    pauseBg.fillCircle(0, 0, 28);
    pauseBg.lineStyle(2, 0xffffff, 0.14);
    pauseBg.strokeCircle(0, 0, 28);
    pauseBg.fillStyle(COLORS.CREAM, 1);
    pauseBg.fillRoundedRect(-10, -11, 7, 22, 3);
    pauseBg.fillRoundedRect(3, -11, 7, 22, 3);
    pauseBtn.add(pauseBg);
    pauseBtn.on('pointerover', () => this.tweens.add({ targets: pauseBtn, scale: 1.1, duration: 120 }));
    pauseBtn.on('pointerout', () => this.tweens.add({ targets: pauseBtn, scale: 1, duration: 120 }));
    pauseBtn.on('pointerup', () => this.openPause());

    this.volumeText = this.add
      .text(width - 96, 132, '', { fontFamily: FONT, fontSize: '20px', fontStyle: '600', color: CSS.MUTED })
      .setOrigin(1, 0.5)
      .setDepth(DEPTH.HUD);

    // aviso rápido no começo
    const hint = this.add
      .text(width / 2, 300, 'Prepare-se!', textStyle(64, CSS.CREAM, { fontStyle: '700' }))
      .setOrigin(0.5)
      .setDepth(DEPTH.BANNER)
      .setScale(0);
    this.tweens.chain({
      targets: hint,
      tweens: [
        { scale: 1, duration: 400, ease: 'Back.easeOut' },
        { alpha: 0, y: 260, duration: 400, delay: 700 },
      ],
      onComplete: () => hint.destroy(),
    });

    this.updateUI();
  }

  createInput() {
    this.cursorsKeys = this.input.keyboard?.createCursorKeys();
    this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // música e controle de volume (↑ ↓)
    this.input.keyboard?.on('keydown-UP', () => this.onVolume(GAME_CONFIG.VOLUME_STEP));
    this.input.keyboard?.on('keydown-DOWN', () => this.onVolume(-GAME_CONFIG.VOLUME_STEP));

    // pausa
    this.input.keyboard?.on('keydown-P', () => this.openPause());
    this.input.keyboard?.on('keydown-ESC', () => this.openPause());

    // toque / mouse: o pote segue o dedo enquanto ele estiver encostado na tela
    this.input.on('pointerdown', (pointer, over) => {
      if (over.length === 0) this.pointerTargetX = pointer.x;
    });
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown && this.pointerTargetX !== null) this.pointerTargetX = pointer.x;
    });
    this.input.on('pointerup', () => {
      this.pointerTargetX = null;
    });
  }

  // ===== HUD =====

  updateUI() {
    const score = Math.floor(this.score);
    if (score !== this.shownScore) {
      this.shownScore = score;
      this.scoreText.setText(String(score));
      // passou do recorde: o número fica dourado
      this.scoreText.setColor(this.best > 0 && score > this.best ? CSS.GOLD : CSS.CREAM);
    }

    const { x, y, w, h } = this.levelBarArea;
    const progress = this.levelTimer ? this.levelTimer.getProgress() : 0;
    this.levelBar.clear();
    this.levelBar.fillStyle(COLORS.GOLD, 1);
    this.levelBar.fillRoundedRect(x, y, Math.max(h, w * progress), h, h / 2);
  }

  updateVolumeUI() {
    this.volumeText.setText(`♪ ${Math.round(this.music.volume * 100)}%`);
  }

  onVolume(delta) {
    changeVolume(this.music, delta);
    this.updateVolumeUI();
    this.tweens.add({ targets: this.volumeText, scale: { from: 1.3, to: 1 }, duration: 200, ease: 'Back.easeOut' });
  }

  openPause() {
    if (this.isGameOver || this.isLeaving || !this.scene.isActive()) {
      return;
    }
    this.scene.pause();
    this.scene.launch(SCENE_KEYS.PAUSE_SCENE);
  }

  // ===== Criação dos objetos que caem =====

  scheduleNeedle() {
    // usamos delayedCall em vez de loop para o intervalo poder mudar a cada nível
    this.time.delayedCall(this.needleDelay, () => {
      if (this.isGameOver) return;
      this.spawnNeedle();
      // no nível 3 em diante, às vezes caem duas agulhas juntas
      if (this.level >= 3 && Math.random() < 0.3) {
        this.spawnNeedle();
      }
      this.scheduleNeedle();
    });
  }

  spawnNeedle() {
    const x = Phaser.Math.Between(30, this.scale.width - 30);
    const frame = Phaser.Utils.Array.GetRandom(NEEDLE_FRAMES);
    // nasce bem acima da tela, para dar tempo de ver o aviso
    const sprite = this.add.image(x, -170, ASSET_KEYS.OBJECTS, frame).setDepth(DEPTH.OBJECTS);

    // seta de aviso no topo da tela
    const marker = this.add.image(x, 26, TEX.WARNING).setDepth(DEPTH.HUD - 1).setScale(0);
    this.tweens.add({ targets: marker, scale: 0.8, duration: 160, ease: 'Back.easeOut' });
    this.tweens.add({ targets: marker, alpha: 0.4, duration: 140, yoyo: true, repeat: -1 });

    // cada agulha tem uma velocidade um pouco diferente
    this.needles.push({
      sprite,
      marker,
      speed: this.needleSpeed * Phaser.Math.FloatBetween(0.85, 1.2),
      phase: Math.random() * Math.PI * 2,
    });
  }

  spawnButton() {
    if (this.isGameOver) return;
    const x = Phaser.Math.Between(70, this.scale.width - 70);
    const frame = Phaser.Utils.Array.GetRandom(BUTTON_FRAMES);
    const color = BUTTON_COLORS[frame] ?? COLORS.GOLD;

    const box = this.add.container(x, -70).setDepth(DEPTH.OBJECTS);
    const glow = this.add.image(0, 0, TEX.GLOW).setTint(color).setAlpha(0.45).setBlendMode(Phaser.BlendModes.ADD);
    const sprite = this.add.image(0, 0, ASSET_KEYS.OBJECTS, frame).setScale(0.6);
    box.add([glow, sprite]);

    this.buttons.push({ box, sprite, glow, frame, baseX: x, speed: GAME_CONFIG.BUTTON_SPEED, phase: Math.random() * Math.PI * 2 });
  }

  levelUp() {
    if (this.isGameOver) return;
    this.level += 1;
    this.needleSpeed = Math.min(this.needleSpeed + 0.07, GAME_CONFIG.NEEDLE_MAX_SPEED);
    this.needleDelay = Math.max(this.needleDelay - 100, GAME_CONFIG.NEEDLE_MIN_DELAY);
    this.levelText.setText(`Nível ${this.level}`);
    this.tweens.add({ targets: this.levelText, scale: { from: 1.5, to: 1 }, duration: 350, ease: 'Back.easeOut' });

    const { width } = this.scale;
    const banner = this.add.container(width / 2, 250).setDepth(DEPTH.BANNER);
    const title = this.add.text(0, 0, `NÍVEL ${this.level}`, textStyle(84, CSS.GOLD, { fontStyle: '700', strokeThickness: 12 })).setOrigin(0.5);
    const sub = this.add.text(0, 66, 'mais rápido!', textStyle(30, CSS.CREAM)).setOrigin(0.5);
    banner.add([title, sub]);
    banner.setScale(0).setAngle(-8);
    this.tweens.chain({
      targets: banner,
      tweens: [
        { scale: 1, angle: 0, duration: 450, ease: 'Back.easeOut' },
        { alpha: 0, y: 190, duration: 450, delay: 650, ease: 'Cubic.easeIn' },
      ],
      onComplete: () => banner.destroy(),
    });
    // brilho dourado suave na tela
    this.hurtFlash.setFillStyle(COLORS.GOLD).setAlpha(0);
    this.tweens.add({
      targets: this.hurtFlash,
      alpha: 0.16,
      duration: 150,
      yoyo: true,
      onComplete: () => this.hurtFlash.setFillStyle(COLORS.CORAL).setAlpha(0),
    });
  }

  // ===== Laço principal =====

  /**
   * @param {number} time
   * @param {number} delta ms desde o último quadro
   */
  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    this.elapsed += delta;
    this.score += (GAME_CONFIG.POINTS_PER_SECOND * delta) / 1000;

    this.movePlayer(delta);
    this.moveObjects(time, delta);
    this.checkCollisions();
    this.updateUI();
  }

  movePlayer(delta) {
    const maxSpeed = GAME_CONFIG.PLAYER_SPEED;
    let target = 0;

    if (this.pointerTargetX !== null) {
      // vai até o dedo, sem passar da velocidade máxima
      const distance = this.pointerTargetX - this.player.x;
      target = Phaser.Math.Clamp(distance / Math.max(delta, 1), -maxSpeed, maxSpeed);
    } else {
      if (this.cursorsKeys?.left.isDown || this.keyA?.isDown) target -= maxSpeed;
      if (this.cursorsKeys?.right.isDown || this.keyD?.isDown) target += maxSpeed;
    }

    // aceleração suave: o pote "embala" e "freia" em vez de mudar na hora
    const smoothing = Math.min(1, delta * 0.02);
    this.velocityX += (target - this.velocityX) * smoothing;
    this.player.x += this.velocityX * delta;

    // mantém o pote dentro da tela
    const halfWidth = this.jar.displayWidth / 2;
    const clamped = Phaser.Math.Clamp(this.player.x, halfWidth, this.scale.width - halfWidth);
    if (clamped !== this.player.x) {
      this.player.x = clamped;
      this.velocityX = 0;
    }

    // inclina na direção do movimento
    const tilt = (this.velocityX / maxSpeed) * 10;
    this.player.angle += (tilt - this.player.angle) * smoothing;
    this.shadow.x = this.player.x;
  }

  moveObjects(time, delta) {
    const bottom = this.scale.height + 100;

    this.trailTimer += delta;
    const emitTrail = this.trailTimer > 35;
    if (emitTrail) this.trailTimer = 0;

    // percorre de trás para frente para poder remover do array com segurança
    for (let i = this.needles.length - 1; i >= 0; i--) {
      const needle = this.needles[i];
      const sprite = needle.sprite;
      sprite.y += needle.speed * delta;
      sprite.angle = Math.sin(time * 0.006 + needle.phase) * 4;

      // a agulha já apareceu: some com o aviso
      if (needle.marker && sprite.y > -40) {
        this.destroyObject(needle.marker);
        needle.marker = null;
      }
      if (emitTrail && sprite.y > -60) {
        this.trailEmitter.emitParticleAt(sprite.x, sprite.y - 40);
      }

      if (sprite.y > bottom) {
        // agulha saiu da tela: desviou com sucesso!
        this.removeNeedle(i);
      }
    }

    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const button = this.buttons[i];
      button.box.y += button.speed * delta;
      button.box.x = button.baseX + Math.sin(time * 0.003 + button.phase) * 18;
      button.sprite.angle += delta * 0.15; // gira sem precisar de tween (não sobra nada ao destruir)
      button.glow.setScale(1.05 + Math.sin(time * 0.008 + button.phase) * 0.12);
      if (button.box.y > bottom) {
        this.removeButton(i);
      }
    }
  }

  // ===== Colisões =====

  getPlayerHitbox() {
    // um pouco menor que o desenho do pote, para a colisão ficar justa
    const w = this.jar.displayWidth - 40;
    const h = this.jar.displayHeight - 30;
    return new Phaser.Geom.Rectangle(this.player.x - w / 2, this.player.y - h - 8, w, h);
  }

  checkCollisions() {
    const playerBox = this.getPlayerHitbox();
    const isInvincible = this.time.now < this.invincibleUntil;

    if (!isInvincible) {
      for (let i = this.needles.length - 1; i >= 0; i--) {
        const { sprite } = this.needles[i];
        const needleBox = new Phaser.Geom.Rectangle(
          sprite.x - NEEDLE_HITBOX.width / 2,
          sprite.y - NEEDLE_HITBOX.height / 2,
          NEEDLE_HITBOX.width,
          NEEDLE_HITBOX.height
        );
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBox, needleBox)) {
          const hitX = sprite.x;
          const hitY = Math.max(sprite.y + 40, playerBox.top);
          this.removeNeedle(i);
          this.hitPlayer(hitX, hitY);
          break; // só um dano por vez
        }
      }
    }

    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const { box } = this.buttons[i];
      const circle = new Phaser.Geom.Circle(box.x, box.y, BUTTON_RADIUS);
      if (Phaser.Geom.Intersects.CircleToRectangle(circle, playerBox)) {
        this.collectButton(this.buttons[i]);
        this.removeButton(i);
      }
    }
  }

  hitPlayer(x, y) {
    this.invincibleUntil = this.time.now + GAME_CONFIG.INVINCIBLE_TIME;
    this.lives -= 1;

    this.sparkEmitter.explode(22, x, y);
    this.cameras.main.shake(220, 0.012);
    this.tweens.killTweensOf(this.hurtFlash);
    this.hurtFlash.setFillStyle(COLORS.CORAL).setAlpha(0);
    this.tweens.add({ targets: this.hurtFlash, alpha: 0.32, duration: 80, yoyo: true });

    // coração perdido: pula e fica vazio
    const heart = this.hearts[this.lives];
    if (heart) {
      this.tweens.killTweensOf(heart);
      this.tweens.chain({
        targets: heart,
        tweens: [
          { scale: 1.6, duration: 120, ease: 'Cubic.easeOut' },
          { scale: 1, duration: 260, ease: 'Back.easeOut', onStart: () => heart.setTexture(TEX.HEART_EMPTY) },
        ],
      });
    }

    // pote dá um pulinho e pisca enquanto está invencível
    this.tweens.add({ targets: this.jar, y: -14, duration: 90, yoyo: true, ease: 'Quad.easeOut' });
    this.tweens.add({
      targets: this.player,
      alpha: 0.25,
      duration: 100,
      yoyo: true,
      repeat: Math.floor(GAME_CONFIG.INVINCIBLE_TIME / 200) - 1,
      onComplete: () => this.player.setAlpha(1),
    });

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  collectButton(button) {
    const { x, y } = button.box;
    const color = BUTTON_COLORS[button.frame] ?? COLORS.GOLD;
    this.score += GAME_CONFIG.BUTTON_POINTS;

    this.burstEmitter.setParticleTint(color);
    this.burstEmitter.explode(20, x, y);

    // anel de luz que se espalha
    const ring = this.add.image(x, y, TEX.GLOW).setTint(color).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.FX).setScale(0.5);
    this.tweens.add({ targets: ring, scale: 2.6, alpha: 0, duration: 380, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });

    const text = this.add
      .text(x, y - 20, `+${GAME_CONFIG.BUTTON_POINTS}`, textStyle(38, CSS.MINT, { fontStyle: '700' }))
      .setOrigin(0.5)
      .setDepth(DEPTH.FX)
      .setScale(0.4);
    this.tweens.chain({
      targets: text,
      tweens: [
        { scale: 1.1, y: y - 60, duration: 220, ease: 'Back.easeOut' },
        { alpha: 0, y: y - 110, duration: 450, ease: 'Cubic.easeIn' },
      ],
      onComplete: () => text.destroy(),
    });

    this.tweens.add({ targets: this.scoreText, scale: { from: 1.25, to: 1 }, duration: 260, ease: 'Back.easeOut' });

    // pote "amassa" ao receber o botão
    this.tweens.killTweensOf(this.jar);
    this.jar.setScale(JAR_SCALE).setY(0);
    this.tweens.add({ targets: this.jar, scaleX: JAR_SCALE * 1.12, scaleY: JAR_SCALE * 0.86, duration: 90, yoyo: true, ease: 'Quad.easeOut' });

    this.addButtonToJar(button.frame);
  }

  /** Guarda um botãozinho dentro do pote (dá para ver pelo vidro). */
  addButtonToJar(frame) {
    const mini = this.add
      .image(Phaser.Math.Between(-30, 30), -110, ASSET_KEYS.OBJECTS, frame)
      .setScale(0.26)
      .setAngle(Phaser.Math.Between(0, 360));
    this.player.addAt(mini, 0); // atrás do vidro
    const restY = -18 - Math.min(this.jarButtons.length, 7) * 7 - Phaser.Math.Between(0, 6);
    this.tweens.add({ targets: mini, y: restY, duration: 350, ease: 'Bounce.easeOut' });
    this.jarButtons.push(mini);
    if (this.jarButtons.length > 10) {
      this.destroyObject(this.jarButtons.shift());
    }
  }

  // ===== Remoção (sempre apaga as animações junto, para não sobrarem tweens rodando) =====

  destroyObject(obj) {
    this.tweens.killTweensOf(obj);
    obj.destroy();
  }

  removeNeedle(index) {
    const needle = this.needles[index];
    if (needle.marker) this.destroyObject(needle.marker);
    this.destroyObject(needle.sprite);
    this.needles.splice(index, 1);
  }

  removeButton(index) {
    this.destroyObject(this.buttons[index].box);
    this.buttons.splice(index, 1);
  }

  // ===== Fim de jogo =====

  gameOver() {
    this.isGameOver = true;
    this.updateUI();

    const finalScore = Math.floor(this.score);
    const isNewRecord = finalScore > this.best;
    if (isNewRecord) {
      saveBestScore(finalScore);
    }

    // o pote tomba e os objetos param no lugar
    this.tweens.killTweensOf(this.player);
    this.player.setAlpha(1);
    this.tweens.add({ targets: this.player, angle: 90 * Math.sign(this.velocityX || 1), x: this.player.x, duration: 500, ease: 'Bounce.easeOut' });
    this.tweens.add({ targets: this.shadow, alpha: 0, duration: 400 });
    this.needles.forEach(({ sprite }) => this.tweens.add({ targets: sprite, alpha: 0, duration: 600 }));
    this.buttons.forEach(({ box }) => this.tweens.add({ targets: box, alpha: 0, duration: 600 }));
    this.needles.forEach((n) => {
      if (n.marker) this.destroyObject(n.marker);
      n.marker = null;
    });

    this.time.delayedCall(1000, () => {
      goToScene(this, SCENE_KEYS.GAME_OVER_SCENE, {
        score: finalScore,
        best: Math.max(this.best, finalScore),
        isNewRecord,
        level: this.level,
        seconds: Math.floor(this.elapsed / 1000),
      });
    });
  }
}
