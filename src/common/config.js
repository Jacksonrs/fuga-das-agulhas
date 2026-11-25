// Valores de ajuste do jogo (mude aqui para deixar mais fácil ou mais difícil)
export const GAME_CONFIG = Object.freeze({
  PLAYER_SPEED: 0.6, // pixels por milissegundo
  START_LIVES: 3,
  INVINCIBLE_TIME: 1200, // ms piscando depois de levar dano

  NEEDLE_START_SPEED: 0.25, // pixels por ms
  NEEDLE_MAX_SPEED: 0.9,
  NEEDLE_START_DELAY: 900, // ms entre uma agulha e outra
  NEEDLE_MIN_DELAY: 250,

  BUTTON_DELAY: 2500, // ms entre um botão e outro
  BUTTON_SPEED: 0.2,
  BUTTON_POINTS: 50,

  POINTS_PER_SECOND: 10, // pontos por sobreviver
  LEVEL_UP_TIME: 10000, // a cada 10 s o nível sobe

  VOLUME_STEP: 0.1,
  BEST_SCORE_KEY: 'fuga-das-agulhas-recorde',
});
