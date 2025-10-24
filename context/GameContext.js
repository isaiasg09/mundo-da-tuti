// context/GameContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import GameProgressService from "../services/gameProgressService";
import { useAuth } from "./AuthContext";

// Progresso inicial (mesmo para todas as crianças)
const initialGameProgress = {
  paths: {
    castelo: {
      status: "unlocked",
      games: {
        game1: { status: "unlocked" },
        game2: { status: "locked" },
        game3: { status: "locked" },
        game4: { status: "locked" },
        game5: { status: "locked" },
        game6: { status: "locked" },
      },
    },
    molusco_perola: {
      status: "locked",
      games: {
        game1: { status: "locked" },
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
      status: "locked",
      games: {
        game1: { status: "locked" },
        game2: { status: "locked" },
        game3: { status: "locked" },
        game4: { status: "locked" },
      },
    },
  },
  overall_progress: {
    total_games_completed: 0,
    last_played: null,
  },
};

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameProgress, setGameProgress] = useState(initialGameProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChildId, setCurrentChildId] = useState(null); // Sem ID padrão
  const { user, isAuthenticated } = useAuth();
  const [gameService] = useState(new GameProgressService());

  // Carregar primeira criança automaticamente quando usuário faz login
  useEffect(() => {
    if (isAuthenticated && user && !currentChildId) {
      console.log("� Usuário logado, buscando primeira criança...");
      loadFirstChild();
    } else if (!isAuthenticated) {
      console.log("🚪 Usuário não logado, usando progresso inicial");
      setCurrentChildId(null);
      setGameProgress(initialGameProgress);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Carregar progresso quando usuário/criança mudam
  useEffect(() => {
    if (isAuthenticated && user && currentChildId) {
      console.log(
        `🔄 Carregando progresso - Usuário: ${user.uid}, Criança: ${currentChildId}`
      );
      loadProgressFromFirebase();
    }
  }, [isAuthenticated, user, currentChildId]);

  // Carregar primeira criança disponível
  const loadFirstChild = async () => {
    try {
      const profiles = await gameService.getChildrenProfiles(user.uid);
      if (profiles.length > 0) {
        const firstChild = profiles[0];
        console.log(
          `👶 Primeira criança encontrada: ${firstChild.id} (${firstChild.name})`
        );
        setCurrentChildId(firstChild.id);
      } else {
        console.log("⚠️ Nenhum perfil de criança encontrado");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar primeira criança:", error);
      setIsLoading(false);
    }
  };

  // Configurar listener em tempo real quando há usuário logado
  useEffect(() => {
    if (isAuthenticated && currentChildId && user) {
      console.log(`🔗 Configurando listener para criança ${currentChildId}`);

      const unsubscribe = gameService.subscribeToProgress(
        user.uid,
        currentChildId,
        (result) => {
          if (result.success) {
            console.log(`📡 Progresso sincronizado para criança ${currentChildId}`);
            setGameProgress(result.data);
          } else {
            console.log(
              `⚠️ Erro no listener para criança ${currentChildId}:`,
              result.error
            );
          }
        }
      );

      return () => {
        if (unsubscribe) {
          gameService.unsubscribeFromProgress();
        }
      };
    }
  }, [isAuthenticated, currentChildId, user]);

  // Carregar progresso do Firebase
  const loadProgressFromFirebase = async () => {
    if (!user || !currentChildId) {
      console.log("❌ Usuário ou criança não definidos");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        `📥 Carregando progresso - Usuário: ${user.uid}, Criança: ${currentChildId}`
      );

      const result = await gameService.loadProgressFromFirebase(user.uid, currentChildId);

      if (result.success) {
        console.log(`✅ Progresso carregado para criança ${currentChildId}`);
        setGameProgress(result.data);
      } else {
        console.log(
          `⚠️ Erro ao carregar progresso para criança ${currentChildId}:`,
          result.error
        );
        setGameProgress(initialGameProgress);
      }
    } catch (error) {
      console.error(
        `❌ Erro ao carregar progresso para criança ${currentChildId}:`,
        error
      );
      setGameProgress(initialGameProgress);
    } finally {
      setIsLoading(false);
    }
  };

  // Função principal para completar jogo
  const completeGame = async (pathKey, gameKeyOrIndex, score = 0) => {
    console.log(
      `[GameContext] completeGame called with pathKey=${pathKey}, gameKeyOrIndex=${gameKeyOrIndex}, score=${score}`
    );

    if (!user || !currentChildId) {
      console.log("⚠️ Usuário não logado ou criança não selecionada");
      return { success: false, error: "Usuário não logado" };
    }

    try {
      // Converte gameKey (ex: "game1") para gameIndex (ex: 1) se necessário
      let gameIndex;
      if (typeof gameKeyOrIndex === "string" && gameKeyOrIndex.startsWith("game")) {
        gameIndex = parseInt(gameKeyOrIndex.replace("game", ""));
      } else {
        gameIndex = gameKeyOrIndex;
      }

      console.log(
        `🎯 Completando jogo - Criança: ${currentChildId}, ${pathKey}/game${gameIndex}, Score: ${score}`
      );

      const result = await gameService.completeGame(
        user.uid,
        currentChildId,
        pathKey,
        gameIndex,
        score
      );

      if (result.success) {
        console.log(`✅ Jogo completado para criança ${currentChildId}`);
        // O listener em tempo real atualizará o estado automaticamente
        return result;
      } else {
        console.error(
          `❌ Erro ao completar jogo para criança ${currentChildId}:`,
          result.error
        );
        return result;
      }
    } catch (error) {
      console.error(
        `❌ Erro inesperado ao completar jogo para criança ${currentChildId}:`,
        error
      );
      return { success: false, error: error.message };
    }
  };

  // Função para trocar de criança ativa
  const setActiveChild = (childId) => {
    console.log(`👶 Trocando criança ativa para: ${childId}`);
    setCurrentChildId(childId);
    // O useEffect carregará automaticamente o progresso da nova criança
  };

  // Função para listar crianças reais do Firebase
  const getAvailableChildren = async () => {
    if (!user) return [];

    try {
      // Busca todos os perfis de crianças salvos no Firebase para este guardião
      const profiles = await GameProgressService.getChildrenProfiles(user.uid);
      return profiles;
    } catch (error) {
      console.error("❌ Erro ao buscar perfis de crianças:", error);
      return [];
    }
  };

  const value = {
    gameProgress,
    setGameProgress,
    completeGame,
    completeLevel: completeGame, // Alias para compatibilidade com useLevelNavigation
    markLevelCompleted: completeGame, // Alias para markCompleted no useLevelNavigation
    isLevelLocked: (pathKey, levelIndex1Based) => {
      const gameKey = `game${levelIndex1Based}`;
      const gameStatus = gameProgress.paths[pathKey]?.games[gameKey]?.status;
      return gameStatus === "locked" || !gameStatus;
    },
    isLoading,
    currentChildId,
    setActiveChild,
    getAvailableChildren,

    // Funções de utilidade
    isGameUnlocked: (pathKey, gameKey) => {
      return (
        gameProgress.paths[pathKey]?.games[gameKey]?.status === "unlocked" ||
        gameProgress.paths[pathKey]?.games[gameKey]?.status === "completed"
      );
    },
    isPathUnlocked: (pathKey) => {
      return (
        gameProgress.paths[pathKey]?.status === "unlocked" ||
        gameProgress.paths[pathKey]?.status === "completed"
      );
    },
    getTotalGamesCompleted: () => {
      let total = 0;
      Object.values(gameProgress.paths).forEach((path) => {
        Object.values(path.games).forEach((game) => {
          if (game.status === "completed") total++;
        });
      });
      return total;
    },

    // Verificar se um path foi completado (todos os jogos finalizados)
    isPathCompleted: (pathKey) => {
      const path = gameProgress.paths[pathKey];
      if (!path || !path.games) return false;

      const games = Object.values(path.games);
      if (games.length === 0) return false;

      // Todos os jogos devem estar completados
      return games.every((game) => game.status === "completed");
    },

    // Desbloquear próximo path via baú de recompensa
    unlockNextPathViaChest: async (pathKey) => {
      if (!user || !currentChildId) {
        console.log("⚠️ Usuário não logado ou criança não selecionada");
        return false;
      }

      // Mapear qual é o próximo path
      const pathOrder = {
        castelo: "molusco_perola",
        molusco_perola: "anemona",
        anemona: null, // último path
      };

      const nextPathKey = pathOrder[pathKey];
      if (!nextPathKey) {
        console.log("📍 Este é o último path, não há próximo para desbloquear");
        return false;
      }

      try {
        console.log(`🔓 Desbloqueando próximo path: ${nextPathKey}`);

        // Usar o GameProgressService para desbloquear o próximo path
        const result = await gameService.unlockPath(
          user.uid,
          currentChildId,
          nextPathKey
        );

        if (result.success) {
          console.log(`✅ Path ${nextPathKey} desbloqueado com sucesso`);
          // O listener em tempo real atualizará o estado automaticamente
          return true;
        } else {
          console.error(`❌ Erro ao desbloquear path ${nextPathKey}:`, result.error);
          return false;
        }
      } catch (error) {
        console.error(`❌ Erro inesperado ao desbloquear path ${nextPathKey}:`, error);
        return false;
      }
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useGameProgress = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameProgress deve ser usado dentro de GameProvider");
  }
  return context;
};

// Exportar também como useGame para compatibilidade
export const useGame = useGameProgress;
