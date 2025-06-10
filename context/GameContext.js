// context/GameContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

const initialGameProgress = {
  paths: {
    // Caminho do Castelo
    castelo: {
      status: "unlocked", // O caminho em si está desbloqueado
      games: {
        // O status de cada um dos 6 jogos dentro deste caminho
        game1: { status: "unlocked" }, // O primeiro jogo (FishGame) começa desbloqueado
        game2: { status: "locked" },
        game3: { status: "locked" },
        game4: { status: "locked" },
        game5: { status: "locked" },
        game6: { status: "locked" },
      },
    },
    // Próximo caminho principal
    molusco_perola: {
      status: "locked", // Começa bloqueado
      games: {
        game1: { status: "unlocked" }, // O primeiro jogo deste caminho só será jogável quando o caminho for desbloqueado
        game2: { status: "locked" },
        game3: { status: "locked" },
        game4: { status: "locked" },
        game5: { status: "locked" },
        game6: { status: "locked" },
      },
    },
  },
};
const GameContext = createContext({
  gameProgress: initialGameProgress,
  setGameProgress: (data) => {},
});

export const GameProvider = ({ children }) => {
  const [gameProgress, setGameProgressState] = useState(initialGameProgress);

  const handleSetGameProgress = (newData) => {
    // Lógica de merge profundo para atualizar estados aninhados sem apagar dados
    setGameProgressState((prevProgress) => {
      // Cria uma cópia profunda do estado anterior para evitar mutações diretas
      const newProgress = JSON.parse(JSON.stringify(prevProgress));

      // Itera sobre os caminhos que estão sendo atualizados (ex: 'castelo')
      for (const pathKey in newData.paths) {
        if (newProgress.paths[pathKey]) {
          // Se o caminho existe no estado

          const pathData = newData.paths[pathKey];

          // Se a atualização contém um objeto 'games'...
          if (pathData.games) {
            // ...mescla o objeto 'games' antigo com o novo!
            // Isso mantém os jogos que não foram atualizados (game4, game5, etc.)
            // e atualiza os que foram (game2, game3).
            pathData.games = {
              ...newProgress.paths[pathKey].games, // <-- A MÁGICA ACONTECE AQUI
              ...pathData.games,
            };
          }

          // Mescla os dados atualizados do caminho (incluindo o 'games' mesclado)
          newProgress.paths[pathKey] = {
            ...newProgress.paths[pathKey],
            ...pathData,
          };
        }
      }
      return newProgress;
    });
  };

  useEffect(() => {
    console.log("PROGRESSO DO JOGO ATUALIZADO:", gameProgress);
  }, [gameProgress]);

  return (
    <GameContext.Provider
      value={{ gameProgress, setGameProgress: handleSetGameProgress }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameProgress = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameProgress deve ser usado dentro de um GameProvider");
  }
  return context;
};
