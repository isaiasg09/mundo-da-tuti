export const GAME_DIFFICULTY_CONFIG = {
  soma: {
    facil: { maxNumber: 3, optionsRange: 5 }, // Números de 1 a 5
    medio: { maxNumber: 5, optionsRange: 10 }, // Números de 1 a 10
    dificil: { maxNumber: 10, optionsRange: 20 }, // Números de 1 a 25
  },
  fish: {
    facil: {
      maxQuantity: 4,
      minFishSize: 120,
      maxFishSize: 150,
      minDistance: 100,
      optionsRange: 5, // Opções de 1 a 6
    },
    medio: {
      maxQuantity: 6,
      minFishSize: 70,
      maxFishSize: 130,
      minDistance: 80,
      optionsRange: 7, // Opções de 1 a 9
    },
    dificil: {
      maxQuantity: 7,
      minFishSize: 60,
      maxFishSize: 120,
      minDistance: 60,
      optionsRange: 8, // Opções de 1 a 11
    },
  },
  subtracao: {
    facil: { maxNumber: 6, optionsRange: 7 }, // Números de 1 a 10
    medio: { maxNumber: 10, optionsRange: 11 }, // Números de 1 a 20
    dificil: { maxNumber: 20, optionsRange: 21 }, // Números de 1 a 50
  },
  memory: {
    facil: {
      pairs: 3, // 3 pares = 6 cartas
      flipTime: 1000, // Tempo para ver as cartas (ms)
      matchTime: 800, // Tempo para verificar match (ms)
    },
    medio: {
      pairs: 4, // 4 pares = 8 cartas
      flipTime: 800,
      matchTime: 600,
    },
    complicado: {
      pairs: 5, // 5 pares = 10 cartas
      flipTime: 700,
      matchTime: 500,
    },
    dificil: {
      pairs: 6, // 6 pares = 12 cartas
      flipTime: 600,
      matchTime: 500,
    },
  },
  match: {
    facil: {
      pairs: 2,
      resetTime: 1000, // Tempo para resetar seleções incorretas (ms)
    },
    medio: {
      pairs: 3,
      resetTime: 800,
    },
    complicado: {
      pairs: 4,
      resetTime: 600,
    },
    dificil: {
      pairs: 5,
      resetTime: 600,
    },
  },
  word: {
    facil: { wordLength: 2 }, // Palavras de 2 letras
    medio: { wordLength: 3 }, // Palavras de 3 letras
    complicado: { wordLength: 4 }, // Palavras de 4 letras
    dificil: { wordLength: 5 }, // Palavras de 5 letras
  },
};
