export const GAME_DIFFICULTY_CONFIG = {
  soma: {
    facil: { maxNumber: 5, optionsRange: 10 }, // Números de 1 a 5
    medio: { maxNumber: 10, optionsRange: 20 }, // Números de 1 a 10
    dificil: { maxNumber: 25, optionsRange: 50 }, // Números de 1 a 25
  },
  fish: {
    facil: {
      maxQuantity: 5,
      minFishSize: 120,
      maxFishSize: 150,
      minDistance: 100,
      optionsRange: 6, // Opções de 1 a 6
    },
    medio: {
      maxQuantity: 8,
      minFishSize: 70,
      maxFishSize: 130,
      minDistance: 80,
      optionsRange: 9, // Opções de 1 a 9
    },
    dificil: {
      maxQuantity: 10,
      minFishSize: 60,
      maxFishSize: 120,
      minDistance: 60,
      optionsRange: 11, // Opções de 1 a 11
    },
  },
  subtracao: {
    facil: { maxNumber: 10, optionsRange: 11 }, // Números de 1 a 10
    medio: { maxNumber: 20, optionsRange: 21 }, // Números de 1 a 20
    dificil: { maxNumber: 50, optionsRange: 51 }, // Números de 1 a 50
  },
};
