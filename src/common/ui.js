import Phaser from '../lib/phaser.js';
import { ASSET_KEYS, BUTTON_FRAMES, NEEDLE_FRAMES, THREAD_FRAMES } from './assets.js';

// ===== Identidade visual =====

export const FONT = '"Fredoka", "Trebuchet MS", "Arial Rounded MT Bold", Arial, sans-serif';

export const COLORS = Object.freeze({
  NIGHT: 0x0d2b2e, // fundo escuro
  PANEL: 0x0a1f22,
  CREAM: 0xfff4e6,
  GOLD: 0xffd166,
  CORAL: 0xff6b6b,
  MINT: 0x5ce1b5,
  PINK: 0xf78fb3,
});

export const CSS = Object.freeze({
  CREAM: '#fff4e6',
  GOLD: '#ffd166',
  CORAL: '#ff6b6b',
  MINT: '#5ce1b5',
  MUTED: '#a9cfc9',
  DARK: '#0a1f22',
});

// cor de cada botão (para as partículas combinarem com ele)
export const BUTTON_COLORS = {
  'button1.png': 0x2fd0cc,
  'button2.png': 0xd0567e,
  'button3.png': 0xe462d2,
  'button4.png': 0xf7c6bd,
  'button5.png': 0xc42a2a,
};

export const TEX = Object.freeze({
  GLOW: 'TEX_GLOW',
  DOT: 'TEX_DOT',
  VIGNETTE: 'TEX_VIGNETTE',
  SHADOW: 'TEX_SHADOW',
  HEART: 'TEX_HEART',
  HEART_EMPTY: 'TEX_HEART_EMPTY',
  WARNING: 'TEX_WARNING',
  STREAK: 'TEX_STREAK',
});

/**
 * Estilo de texto padrão: fonte arredondada, contorno escuro e sombra suave.
 * @param {number} size
 * @param {string} [color]
 * @param {Phaser.Types.GameObjects.Text.TextStyle} [extra]
 */
export function textStyle(size, color = CSS.CREAM, extra = {}) {
  return {
    fontFamily: FONT,
    fontSize: `${size}px`,
    fontStyle: '600',
    color,
    stroke: CSS.DARK,
    strokeThickness: Math.max(3, Math.round(size / 7)),
    shadow: { offsetX: 0, offsetY: Math.max(2, Math.round(size / 14)), color: 'rgba(0,0,0,0.45)', blur: 0, fill: true, stroke: true },
    ...extra,
  };
}

// ===== Texturas desenhadas por código (não precisam de arquivo) =====

/** @param {Phaser.Scene} scene */
export function createGeneratedTextures(scene) {
  const make = (key, w, h, draw) => {
    if (scene.textures.exists(key)) return;
    const tex = scene.textures.createCanvas(key, w, h);
    if (!tex) return;
    draw(tex.getContext(), w, h);
    tex.refresh();
  };

  make(TEX.GLOW, 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  make(TEX.DOT, 16, 16, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  make(TEX.STREAK, 6, 40, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  make(TEX.VIGNETTE, 1280, 720, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h * 0.45, h * 0.35, w / 2, h / 2, w * 0.75);
    g.addColorStop(0, 'rgba(5,18,20,0)');
    g.addColorStop(1, 'rgba(5,18,20,0.85)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  make(TEX.SHADOW, 160, 40, (ctx, w, h) => {
    ctx.save();
    ctx.scale(1, h / w);
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
    ctx.restore();
  });

  const heartPath = (ctx, w, h) => {
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.92);
    ctx.bezierCurveTo(w * 0.05, h * 0.6, w * 0.02, h * 0.18, w * 0.28, h * 0.1);
    ctx.bezierCurveTo(w * 0.42, h * 0.06, w * 0.5, h * 0.2, w / 2, h * 0.28);
    ctx.bezierCurveTo(w * 0.5, h * 0.2, w * 0.58, h * 0.06, w * 0.72, h * 0.1);
    ctx.bezierCurveTo(w * 0.98, h * 0.18, w * 0.95, h * 0.6, w / 2, h * 0.92);
    ctx.closePath();
  };

  make(TEX.HEART, 52, 48, (ctx, w, h) => {
    heartPath(ctx, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#ff8a8a');
    g.addColorStop(1, '#e0434f');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0a1f22';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(w * 0.3, h * 0.28, 5, 3.5, -0.6, 0, Math.PI * 2);
    ctx.fill();
  });

  make(TEX.HEART_EMPTY, 52, 48, (ctx, w, h) => {
    heartPath(ctx, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();
  });

  // seta de aviso que aparece no topo antes de a agulha cair
  make(TEX.WARNING, 44, 40, (ctx, w, h) => {
    ctx.beginPath();
    ctx.moveTo(w / 2, h - 3);
    ctx.lineTo(3, 6);
    ctx.quadraticCurveTo(w / 2, 0, w - 3, 6);
    ctx.closePath();
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0a1f22';
    ctx.stroke();
    ctx.fillStyle = '#fff4e6';
    ctx.fillRect(w / 2 - 2.5, 9, 5, 13);
    ctx.fillRect(w / 2 - 2.5, 25, 5, 5);
  });
}

// ===== Fundo animado (usado em todas as cenas) =====

/**
 * Fundo com o tecido se mexendo devagar, luzes coloridas, poeirinha e vinheta.
 * @param {Phaser.Scene} scene
 * @param {{ dim?: number }} [options]
 */
export function createBackground(scene, { dim = 0.35 } = {}) {
  const { width, height } = scene.scale;

  const fabric = scene.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND).setScale(1.12);
  scene.tweens.add({
    targets: fabric,
    x: width / 2 + 30,
    y: height / 2 - 20,
    scale: 1.16,
    duration: 14000,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
  });

  scene.add.rectangle(width / 2, height / 2, width, height, COLORS.NIGHT, dim);

  // manchas de luz que flutuam
  const lights = [
    { x: 0.2, y: 0.25, tint: COLORS.MINT, s: 7 },
    { x: 0.8, y: 0.3, tint: COLORS.GOLD, s: 6 },
    { x: 0.55, y: 0.85, tint: COLORS.PINK, s: 8 },
  ];
  lights.forEach((l, i) => {
    const glow = scene.add
      .image(width * l.x, height * l.y, TEX.GLOW)
      .setScale(l.s)
      .setTint(l.tint)
      .setAlpha(0.12)
      .setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: glow,
      x: glow.x + Phaser.Math.Between(-140, 140),
      y: glow.y + Phaser.Math.Between(-80, 80),
      alpha: 0.2,
      duration: 6000 + i * 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  });

  // poeirinha / fiapos subindo
  scene.add.particles(0, 0, TEX.DOT, {
    x: { min: 0, max: width },
    y: height + 10,
    lifespan: 9000,
    speedY: { min: -40, max: -15 },
    speedX: { min: -10, max: 10 },
    scale: { min: 0.15, max: 0.45 },
    alpha: { start: 0.35, end: 0 },
    frequency: 220,
    blendMode: 'ADD',
    advance: 8000,
  });

  scene.add.image(width / 2, height / 2, TEX.VIGNETTE).setDepth(50);
}

/**
 * Objetos de costura flutuando ao fundo (menu e fim de jogo).
 * @param {Phaser.Scene} scene
 * @param {number} count
 */
export function createFloatingDecor(scene, count = 12) {
  const { width, height } = scene.scale;
  const frames = [...BUTTON_FRAMES, ...THREAD_FRAMES, ...NEEDLE_FRAMES];
  for (let i = 0; i < count; i++) {
    const frame = frames[i % frames.length];
    const near = Math.random() < 0.4; // objetos "perto" são maiores e mais nítidos
    const baseScale = frame.startsWith('needle') ? 0.9 : 0.55;
    const obj = scene.add
      .image(Phaser.Math.Between(40, width - 40), Phaser.Math.Between(0, height), ASSET_KEYS.OBJECTS, frame)
      .setScale(baseScale * (near ? 1 : 0.6))
      .setAlpha(near ? 0.55 : 0.25)
      .setAngle(Phaser.Math.Between(-30, 30));
    const fall = () => {
      obj.y = -80;
      obj.x = Phaser.Math.Between(40, width - 40);
      scene.tweens.add({
        targets: obj,
        y: height + 100,
        angle: obj.angle + Phaser.Math.Between(-120, 120),
        duration: Phaser.Math.Between(near ? 7000 : 12000, near ? 11000 : 18000),
        onComplete: fall,
      });
    };
    // primeiro trajeto começa de onde o objeto já está, para a tela não começar vazia
    scene.tweens.add({
      targets: obj,
      y: height + 100,
      angle: obj.angle + Phaser.Math.Between(-90, 90),
      duration: Phaser.Math.Between(5000, 12000),
      onComplete: fall,
    });
  }
}

// ===== Botão arredondado com hover e clique =====

/**
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {string} label
 * @param {() => void} onClick
 * @param {{ width?: number, height?: number, color?: number, textColor?: string, fontSize?: number }} [options]
 */
export function createPillButton(scene, x, y, label, onClick, options = {}) {
  const { width = 320, height = 76, color = COLORS.GOLD, textColor = CSS.DARK, fontSize = 34 } = options;
  const container = scene.add.container(x, y);

  const g = scene.add.graphics();
  const draw = (pressed) => {
    g.clear();
    // sombra/"base" do botão
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-width / 2, -height / 2 + 8, width, height, height / 2);
    // corpo
    g.fillStyle(color, 1);
    g.fillRoundedRect(-width / 2, -height / 2 + (pressed ? 5 : 0), width, height, height / 2);
    // brilho em cima
    g.fillStyle(0xffffff, 0.28);
    g.fillRoundedRect(-width / 2 + 14, -height / 2 + 7 + (pressed ? 5 : 0), width - 28, height * 0.32, height * 0.16);
    g.lineStyle(3, COLORS.PANEL, 1);
    g.strokeRoundedRect(-width / 2, -height / 2 + (pressed ? 5 : 0), width, height, height / 2);
  };
  draw(false);

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: FONT,
      fontSize: `${fontSize}px`,
      fontStyle: '700',
      color: textColor,
    })
    .setOrigin(0.5);

  container.add([g, text]);
  container.setSize(width, height + 8);
  container.setInteractive({ useHandCursor: true });

  container.on('pointerover', () => scene.tweens.add({ targets: container, scale: 1.06, duration: 150, ease: 'Back.easeOut' }));
  container.on('pointerout', () => {
    draw(false);
    text.y = 0;
    scene.tweens.add({ targets: container, scale: 1, duration: 150 });
  });
  container.on('pointerdown', () => {
    draw(true);
    text.y = 5;
  });
  container.on('pointerup', () => {
    draw(false);
    text.y = 0;
    onClick();
  });

  return container;
}

/**
 * Painel de vidro escuro com borda clara.
 * @param {Phaser.Scene} scene
 */
export function drawPanel(scene, x, y, width, height, radius = 24, alpha = 0.55) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(COLORS.PANEL, alpha);
  g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  g.lineStyle(2, 0xffffff, 0.14);
  g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  return g;
}

// ===== Transição entre cenas =====

/**
 * Escurece a tela e troca de cena.
 * @param {Phaser.Scene} scene
 * @param {string} key
 * @param {object} [data]
 */
export function goToScene(scene, key, data) {
  if (scene.isLeaving) return;
  scene.isLeaving = true;
  scene.cameras.main.fadeOut(280, 5, 18, 20);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => scene.scene.start(key, data));
}

/** @param {Phaser.Scene} scene */
export function fadeIn(scene) {
  scene.isLeaving = false;
  scene.cameras.main.fadeIn(320, 5, 18, 20);
}
