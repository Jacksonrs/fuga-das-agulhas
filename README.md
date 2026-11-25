# Fuga das Agulhas

![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)

Desvie das agulhas e pegue os botões! Um jogo de navegador feito com [Phaser 4](https://phaser.io).

**▶ Jogue agora:** https://jacksonrs.github.io/fuga-das-agulhas/

## Como jogar

Você controla um pote que se move pelo chão. Agulhas caem do alto e cada acerto custa um coração (você começa com 3). Pegue os botões que caem para ganhar pontos extras. A cada 10 segundos o nível sobe e as agulhas ficam mais rápidas e frequentes.

| Tecla | Ação |
| --- | --- |
| ← → ou A D | mover |
| arrastar (toque/mouse) | mover no celular |
| P ou ESC | pausar |
| ↑ ↓ | volume |
| ESPAÇO ou ENTER | começar / jogar de novo |
| M | voltar ao menu |

### Pontuação

- 10 pontos por segundo sobrevivido
- 50 pontos por botão coletado
- O recorde fica salvo no navegador

## Rodando localmente

Não tem etapa de build, basta servir a pasta com um servidor local. Na raiz do projeto:

```sh
python3 -m http.server 8080
```

Depois abra http://localhost:8080/ no navegador. Também funciona com `npx http-server` ou com a extensão **Live Server** do VS Code.

## Estrutura

- `index.html`: página principal
- `src/main.js`: ponto de entrada do jogo
- `src/scenes/`: cenas (carregamento, menu, jogo, pausa, fim de jogo)
- `src/common/config.js`: valores de ajuste (velocidade, vidas, dificuldade)
- `assets/`: imagens, áudio, estilos e a biblioteca Phaser

Para deixar o jogo mais fácil ou mais difícil, mude os valores em `src/common/config.js`.

## Publicação

O jogo é publicado automaticamente pelo GitHub Pages a cada `git push` na branch `main`.

Para gerar uma pasta `dist/` com só os arquivos necessários (para hospedar em outro lugar):

```sh
bash scripts/bundle.sh
```

## Changelog

As mudanças do projeto estão registradas no [CHANGELOG.md](CHANGELOG.md).

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).
