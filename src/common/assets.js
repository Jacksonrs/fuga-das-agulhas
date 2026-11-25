export const ASSET_KEYS = Object.freeze({
  BACKGROUND: 'BACKGROUND',
  MUSIC: 'MUSIC',
  OBJECTS: 'OBJECTS',
  JAR: 'JAR',
});

// nomes dos quadros (frames) dentro do spritesheet
export const NEEDLE_FRAMES = [
  'needle_pin1.png',
  'needle_pin2.png',
  'needle_pin3.png',
  'needle_pin4.png',
  'needle_pin5.png',
];

export const BUTTON_FRAMES = [
  'button1.png',
  'button2.png',
  'button3.png',
  'button4.png',
  'button5.png',
];

export const THREAD_FRAMES = ['thread1.png', 'thread2.png', 'thread3.png'];

export const IMAGE_ASSETS = [
  {
    assetKey: ASSET_KEYS.BACKGROUND,
    path: 'assets/images/background.png',
  },
  {
    assetKey: ASSET_KEYS.JAR,
    path: 'assets/images/jar.png',
  },
];

export const AUDIO_ASSETS = [
  {
    assetKey: ASSET_KEYS.MUSIC,
    path: 'assets/audios/music.mp3',
  },
];

export const TEXTURE_ATLAS_ASSETS = [
  {
    assetKey: ASSET_KEYS.OBJECTS,
    textureURL: 'assets/images/spritesheet.png',
    atlasURL: 'assets/images/spritesheet.json',
  },
];
