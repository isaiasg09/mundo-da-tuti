// context/GameContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { PATH_ORDER } from "../constants/paths";

const STORAGE_KEY = "@mdt:progress:v1";

const DONT_RESET_PROGRESS_ON_START = true;

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
        game1: { status: "unlocked" }, // O primeiro jogo deste caminho começa desbloqueado
        game2: { status: "locked" },
        game3: { status: "locked" },
        game4: { status: "locked" },
        game5: { status: "locked" },
        game6: { status: "locked" },
        game7: { status: "locked" },
        game8: { status: "locked" },
      },
    },
    anemona: {
      status: "locked", // Começa bloqueado
      games: {
        game1: { status: "unlocked" },
        game2: { status: "locked" },
        game3: { status: "locked" },
        game4: { status: "locked" },
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
      console.log("📱 Carregando progresso do AsyncStorage...");

      try {
        const mod = await import("@react-native-async-storage/async-storage");
        asyncStorageRef.current = mod.default;

        // Se não deve manter progresso, limpa o storage
        if (!DONT_RESET_PROGRESS_ON_START) {
          await asyncStorageRef.current.removeItem(STORAGE_KEY);
          console.log("🗑️ Progresso resetado");
          return;
        }

        const raw = await asyncStorageRef.current.getItem(STORAGE_KEY);

        if (raw) {
          console.log("💾 Progresso encontrado no AsyncStorage:", raw);
          const parsed = JSON.parse(raw);
          // Merge with initial to keep any new keys introduced by updates
          setGameProgressState((prev) => {
            const merged = deepMerge(prev, parsed);
            console.log(
              "🔄 Progresso carregado e mesclado:",
              JSON.stringify(merged, null, 2)
            );
            return merged;
          });
        } else {
          console.log("📝 Nenhum progresso salvo encontrado, usando inicial");
        }
      } catch (e) {
        console.warn(
          "AsyncStorage indisponível (modo dev ou dependência não instalada). Progresso será mantido apenas em memória.",
          e
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
        console.log("💾 Salvando progresso no AsyncStorage...");
        await asyncStorageRef.current.setItem(STORAGE_KEY, JSON.stringify(gameProgress));
        console.log("✅ Progresso salvo com sucesso");
      } catch (e) {
        console.warn("❌ Falha ao salvar progresso localmente:", e?.message);
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

  const getLevelIndex1Based = (gameKey) => {
    // Extrai o número do gameKey (ex: "game3" -> 3)
    return parseInt(gameKey.replace("game", ""), 10);
  };

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

  // Se o ultimo nível do caminho foi completado, desbloqueia o próximo nível (mas não próximo caminho)
  const unlockNextLevel = (pathId, currentLevelIndex1Based) => {
    const nextKey = getGameKey(currentLevelIndex1Based + 1);
    const games = gameProgress.paths?.[pathId]?.games;

    if (games && games[nextKey] && games[nextKey].status === STATUS.LOCKED) {
      console.log(`🔓 Desbloqueando próximo nível: ${pathId}.${nextKey}`);
      updateGameStatus(pathId, nextKey, STATUS.UNLOCKED);
    }
    // Removido o desbloqueio automático do próximo caminho - agora é feito pelo baú
  };

  // Verifica se deve desbloquear o próximo caminho após completar o último jogo do caminho atual
  const checkAndUnlockNextPath = (pathId, currentLevelIndex1Based) => {
    // Definir quantos jogos cada caminho tem
    const pathGameCounts = {
      castelo: 6,
      molusco_perola: 8,
      anemona: 4,
    };

    // Usar a ordem dos caminhos importada
    const pathOrder = PATH_ORDER;

    const currentPathIndex = pathOrder.indexOf(pathId);
    const isLastGameOfPath = currentLevelIndex1Based === pathGameCounts[pathId];

    // Se é o último jogo do caminho atual E há um próximo caminho
    if (isLastGameOfPath && currentPathIndex < pathOrder.length - 1) {
      const nextPathId = pathOrder[currentPathIndex + 1];
      const nextPathStatus = gameProgress.paths?.[nextPathId]?.status;

      if (nextPathStatus === STATUS.LOCKED) {
        console.log(`🎉 Desbloqueando próximo caminho: ${nextPathId}`);
        handleSetGameProgress({
          paths: {
            [nextPathId]: {
              status: STATUS.UNLOCKED,
            },
          },
        });
      }
    }
  };

  const markLevelCompleted = (pathId, levelIndex1Based) => {
    const key = getGameKey(levelIndex1Based);
    const current = gameProgress.paths?.[pathId]?.games?.[key];
    if (!current || current.status === STATUS.COMPLETED) {
      return; // já concluído ou não existe
    }

    console.log(`✅ Completando nível: ${pathId}.${key}`);
    updateGameStatus(pathId, key, STATUS.COMPLETED);
    unlockNextLevel(pathId, levelIndex1Based);
  };

  const completeLevel = (pathId, gameKey) => {
    const levelIndex = getLevelIndex1Based(gameKey);
    console.log(`🎯 Completando jogo: ${pathId}.${gameKey}`);

    // Marca o nível como completado
    updateGameStatus(pathId, gameKey, STATUS.COMPLETED);

    // Desbloqueia o próximo nível
    unlockNextLevel(pathId, levelIndex);
  };

  // Verifica se um caminho foi completamente finalizado (todos os jogos completos)
  const isPathCompleted = (pathId) => {
    // Mapear pathId para os IDs internos se necessário
    const pathMapping = {
      first: "castelo",
      second: "molusco_perola",
      third: "anemona",
    };

    const internalPathId = pathMapping[pathId] || pathId;

    const pathGameCounts = {
      castelo: 6,
      molusco_perola: 8,
      anemona: 4,
    };

    const totalGames = pathGameCounts[internalPathId];
    if (!totalGames) return false;

    const games = gameProgress.paths?.[internalPathId]?.games;
    if (!games) return false;

    // Verificar se todos os jogos estão completos
    for (let i = 1; i <= totalGames; i++) {
      const gameKey = getGameKey(i);
      if (games[gameKey]?.status !== STATUS.COMPLETED) {
        return false;
      }
    }
    return true;
  };

  // Função para o baú desbloquear o próximo caminho
  const unlockNextPathViaChest = (pathId) => {
    // Mapear pathId para os IDs internos se necessário
    const pathMapping = {
      first: "castelo",
      second: "molusco_perola",
      third: "anemona",
    };

    const internalPathId = pathMapping[pathId] || pathId;

    const pathOrder = PATH_ORDER;
    const currentPathIndex = pathOrder.indexOf(internalPathId);

    if (currentPathIndex < pathOrder.length - 1) {
      const nextPathId = pathOrder[currentPathIndex + 1];
      const nextPathStatus = gameProgress.paths?.[nextPathId]?.status;

      if (nextPathStatus === STATUS.LOCKED) {
        console.log(`🎉 Desbloqueando próximo caminho via baú: ${nextPathId}`);
        handleSetGameProgress({
          paths: {
            [nextPathId]: {
              status: STATUS.UNLOCKED,
            },
          },
        });
        return nextPathId; // Retorna o caminho desbloqueado para mostrar na mensagem
      }
    }
    return null;
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
        getGameKey,
        getLevelIndex1Based,
        isPathCompleted,
        unlockNextPathViaChest,
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
