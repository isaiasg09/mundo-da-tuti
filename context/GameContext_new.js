// context/GameContext.js
import { createContext, useContext, useEffect, useState } from "react";
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
  const [currentChildId, setCurrentChildId] = useState("child1"); // ID padrão temporário
  const { user, isAuthenticated } = useAuth();
  const [gameService] = useState(new GameProgressService());

  // Carregar progresso quando usuário/criança mudam
  useEffect(() => {
    if (isAuthenticated && user && currentChildId) {
      console.log(
        `🔄 Carregando progresso - Usuário: ${user.uid}, Criança: ${currentChildId}`
      );
      loadProgressFromFirebase();
    } else if (!isAuthenticated) {
      console.log("🚪 Usuário não logado, usando progresso inicial");
      setGameProgress(initialGameProgress);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, currentChildId]);

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
  const completeGame = async (pathKey, gameIndex, score) => {
    if (!user || !currentChildId) {
      console.log("⚠️ Usuário não logado ou criança não selecionada");
      return { success: false, error: "Usuário não logado" };
    }

    try {
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

  // Função para listar crianças (será útil quando implementarmos seleção de perfil)
  const getAvailableChildren = () => {
    // Por enquanto retorna lista estática, no futuro virá do Firebase
    return [
      { id: "child1", name: "Maria", avatar: "👧", color: "#FF6B6B" },
      { id: "child2", name: "João", avatar: "👦", color: "#4ECDC4" },
      { id: "child3", name: "Ana", avatar: "👧", color: "#45B7D1" },
    ];
  };

  const value = {
    gameProgress,
    setGameProgress,
    completeGame,
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
