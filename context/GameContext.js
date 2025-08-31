// context/GameContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { PATHS, PATH_ORDER } from "@/constants/paths";

const STORAGE_KEY = "@mdt:progress:v1";

const RESET_PROGRESS_ON_START = false;

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
        game7: { status: "locked" },
        game8: { status: "locked" },
        game9: { status: "locked" },
        game10: { status: "locked" },
      },
    },
  },
};
const GameContext = createContext({
  gameProgress: initialGameProgress,
  setGameProgress: (data) => {},
});

const STATUS = { LOCKED: "locked", UNLOCKED: "unlocked", COMPLETED: "completed" };

export const GameProvider = ({ children }) => {
  const [gameProgress, setGameProgressState] = useState(initialGameProgress);
  const asyncStorageRef = useRef(null);
  const saveTimer = useRef(null);

  // Deep merge util (objects only)
  const deepMerge = (target, source) => {
    const out = Array.isArray(target) ? [...target] : { ...target };
    if (!source) return out;
    Object.keys(source).forEach((key) => {
      const srcVal = source[key];
      const tgtVal = out[key];
      if (srcVal && typeof srcVal === "object" && !Array.isArray(srcVal)) {
        out[key] = deepMerge(tgtVal || {}, srcVal);
      } else {
        out[key] = srcVal;
      }
    });
    return out;
  };

  // Lazy-load AsyncStorage and hydrate saved progress
  useEffect(() => {
    (async () => {
      if (RESET_PROGRESS_ON_START && asyncStorageRef.current) {
        await asyncStorageRef.current.removeItem(STORAGE_KEY);
        setGameProgressState(initialGameProgress);
        return;
      }

      try {
        const mod = await import("@react-native-async-storage/async-storage");
        asyncStorageRef.current = mod.default;
        const raw = await asyncStorageRef.current.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Merge with initial to keep any new keys introduced by updates
          setGameProgressState((prev) => deepMerge(prev, parsed));
        }
      } catch (e) {
        console.warn(
          "AsyncStorage indisponível (modo dev ou dependência não instalada). Progresso será mantido apenas em memória."
        );
      }
    })();
  }, []);

  // Debounced persist whenever gameProgress changes
  useEffect(() => {
    if (!asyncStorageRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await asyncStorageRef.current.setItem(STORAGE_KEY, JSON.stringify(gameProgress));
      } catch (e) {
        console.warn("Falha ao salvar progresso localmente:", e?.message);
      }
    }, 300);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
  }, [gameProgress]);

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

  const getGameKey = (index) => `game${index}`; // index 1-based

  const isLevelLocked = (pathId, levelIndex1Based) => {
    const gameKey = getGameKey(levelIndex1Based);
    return gameProgress.paths?.[pathId]?.games?.[gameKey]?.status === STATUS.LOCKED;
  };

  const updateGameStatus = (pathId, gameKey, newStatus) => {
    handleSetGameProgress({
      paths: {
        [pathId]: {
          games: {
            [gameKey]: { status: newStatus },
          },
        },
      },
    });
  };

  // Se o ultimo nível do caminho foi completado, desbloqueia o próximo nível
  const unlockNextLevel = (pathId, currentLevelIndex1Based) => {
    const nextKey = getGameKey(currentLevelIndex1Based + 1);
    const games = gameProgress.paths?.[pathId]?.games;
    if (games && games[nextKey] && games[nextKey].status === STATUS.LOCKED) {
      updateGameStatus(pathId, nextKey, STATUS.UNLOCKED);
    }
  };

  const markLevelCompleted = (pathId, levelIndex1Based) => {
    const key = getGameKey(levelIndex1Based);
    const current = gameProgress.paths?.[pathId]?.games?.[key];
    if (!current) return;
    if (current.status === STATUS.COMPLETED) return; // já concluído

    updateGameStatus(pathId, key, STATUS.COMPLETED);
    unlockNextLevel(pathId, levelIndex1Based);
  };

  const completeLevel = (pathId, levelIndex1Based) => {
    // Marca o nível e desbloqueia o próximo
    markLevelCompleted(pathId, levelIndex1Based);

    // Se for o último nível desse caminho, marca o caminho como concluído e desbloqueia o próximo caminho
    const totalLevels = PATHS[pathId]?.length || 0;
    if (totalLevels && levelIndex1Based >= totalLevels) {
      const currentIdx = PATH_ORDER.indexOf(pathId);
      const nextPathId = currentIdx >= 0 ? PATH_ORDER[currentIdx + 1] : undefined;

      const update = { paths: { [pathId]: { status: STATUS.COMPLETED } } };
      if (nextPathId) {
        update.paths[nextPathId] = { status: STATUS.UNLOCKED };
      }
      handleSetGameProgress(update);
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameProgress,
        setGameProgress: handleSetGameProgress,
        isLevelLocked,
        markLevelCompleted,
        unlockNextLevel,
        completeLevel,
      }}
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
