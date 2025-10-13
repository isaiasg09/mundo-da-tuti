export const PATHS = {
  castelo: [
    {
      id: 1,
      name: "Jogo dos Peixes Fácil",
      route: "/fishgame",
      x: 175,
      gameType: "fish",
      difficulty: "facil",
    },
    {
      id: 2,
      name: "Jogo da Soma Fácil",
      route: "/plusgame",
      x: 70,
      gameType: "soma",
      difficulty: "facil",
    },
    {
      id: 3,
      name: "Jogo da Subtração Fácil",
      route: "/minusgame",
      x: 210,
      gameType: "subtracao",
      difficulty: "facil",
    },
    {
      id: 4,
      name: "Jogo dos Peixes Difícil",
      route: "/fishgame",
      x: 320,
      gameType: "fish",
      difficulty: "dificil",
    },
    {
      id: 5,
      name: "Jogo da Subtração Difícil",
      route: "/minusgame",
      x: 140,
      gameType: "subtracao",
      difficulty: "dificil",
    },
    {
      id: 6,
      name: "Jogo da Soma Difícil",
      route: "/plusgame",
      x: 250,
      gameType: "soma",
      difficulty: "dificil",
    },
  ],
  molusco_perola: [
    {
      id: 1,
      name: "Jogo da Memória Fácil",
      route: "/memorygame",
      x: 175,
      gameType: "memory",
      difficulty: "facil",
    },
    {
      id: 2,
      name: "Jogo de Combinar Fácil",
      route: "/matchgame",
      x: 70,
      gameType: "match",
      difficulty: "facil",
    },
    {
      id: 3,
      name: "Jogo da Memória Médio",
      route: "/memorygame",
      x: 175,
      gameType: "memory",
      difficulty: "medio",
    },
    {
      id: 4,
      name: "Jogo de Combinar Médio",
      route: "/matchgame",
      x: 70,
      gameType: "match",
      difficulty: "medio",
    },
    {
      id: 5,
      name: "Jogo da Memória Difícil",
      route: "/memorygame",
      x: 175,
      gameType: "memory",
      difficulty: "dificil",
    },
    {
      id: 6,
      name: "Jogo de Combinar Difícil",
      route: "/matchgame",
      x: 70,
      gameType: "match",
      difficulty: "dificil",
    },
  ],
};

// Ordem dos caminhos do jogo (para desbloqueio sequencial)
export const PATH_ORDER = ["castelo", "molusco_perola"];

// Mapeamento de caminho para a tela correspondente (expo-router pathname)
export const PATH_TO_SCREEN = {
  castelo: "/firstpath",
  molusco_perola: "/secondpath",
};

export const PROFILE_IMAGE_OPTIONS = [
  {
    key: "perfil_tuti.png",
    source: require("@/assets/images/perfis/profile_placeholder.png"),
  },
  {
    key: "perfil_baiacu.png",
    source: require("@/assets/images/perfis/baiacu_perfil.png"),
  },
  {
    key: "perfil_baleia.png",
    source: require("@/assets/images/perfis/baleia_perfil.png"),
  },
  {
    key: "perfil_carangueijo.png",
    source: require("@/assets/images/perfis/carangueijo_perfil.png"),
  },
  {
    key: "perfil_estrela.png",
    source: require("@/assets/images/perfis/estrela_perfil.png"),
  },
  {
    key: "perfil_peixe.png",
    source: require("@/assets/images/perfis/peixe_perfil.png"),
  },
  {
    key: "perfil_tubarao.png",
    source: require("@/assets/images/perfis/tubarao_perfil.png"),
  },
];
