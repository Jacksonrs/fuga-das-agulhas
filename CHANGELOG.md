# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Adicionado

- Visual novo: fonte Fredoka, fundo animado (tecido, luzes, poeira e vinheta), painéis de HUD, corações e barra de nível.
- Aviso no topo antes de cada agulha, rastro nas agulhas, brilho e explosão de partículas nos botões, botões guardados dentro do pote.
- Pote com aceleração suave, inclinação e "amassado" ao pegar botões.
- Controle por toque/mouse (arrastar), botão de pausa na tela, pausa automática ao trocar de aba.
- Cena de pausa separada, fim de jogo com placar contando, selo de novo recorde e confete, transições com fade.

### Corrigido

- Animações dos botões continuavam rodando depois de o botão sumir (vazamento de tweens).
- Caixa de colisão das agulhas agora é igual para todas (a agulha fina quase nunca acertava).
- Durante a pausa as animações também param.
- Recorde não é mais lido do localStorage a cada quadro.

## [1.0.0] - 2026-03-14

### Added

- Established core project structure for a barebones Phaser 4 JavaScript template.
