// services/gameProgressService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "./firebase";

class GameProgressService {
  constructor(guardianId = null, childId = null) {
    this.guardianId = guardianId;
    this.childId = childId;
    this.unsubscribeProgress = null;
  }

  // Obter referência do documento do progresso para criança específica
  getProgressRef(guardianId = null, childId = null) {
    const gId = guardianId || this.guardianId || auth.currentUser?.uid;
    const cId = childId || this.childId || 'child1';
    // Estrutura: gameProgress/guardianId_childId
    return doc(firestore, "gameProgress", `${gId}_${cId}`);
  }

  // Gerar chave de armazenamento local
  getStorageKey(guardianId = null, childId = null) {
    const gId = guardianId || this.guardianId || auth.currentUser?.uid;
    const cId = childId || this.childId || "child1";
    return `@game_progress_${gId}_${cId}`;
  }

  // Salvar progresso localmente
  async saveLocalProgress(progressData, guardianId = null, childId = null) {
    try {
      const key = this.getStorageKey(guardianId, childId);
      const dataToSave = {
        ...progressData,
        lastModified: new Date().toISOString(),
        syncStatus: "local",
      };

      await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
      console.log(`💾 Progresso salvo localmente: ${key}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao salvar progresso local:", error);
      return { success: false, error: error.message };
    }
  }

  // Carregar progresso local
  async loadProgress(guardianId = null, childId = null) {
    try {
      const key = this.getStorageKey(guardianId, childId);
      const savedData = await AsyncStorage.getItem(key);

      if (savedData) {
        const progress = JSON.parse(savedData);
        console.log(`📱 Progresso carregado do local: ${key}`);
        return progress;
      }

      console.log(`📱 Nenhum progresso local encontrado para: ${key}`);
      return null;
    } catch (error) {
      console.error("❌ Erro ao carregar progresso local:", error);
      return null;
    }
  }

  // Inicializar progresso padrão se necessário
  getDefaultProgress() {
    return {
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
            game1: { status: "unlocked" },
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
            game1: { status: "unlocked" },
            game2: { status: "locked" },
            game3: { status: "locked" },
            game4: { status: "locked" },
          },
        },
      },
    };
  }

  // Salvar progresso completo
  async saveGameProgress(progressData) {
    try {
      // 1. Salvar localmente primeiro (offline-first)
      const localSave = await this.saveLocalProgress(progressData);
      if (!localSave.success) {
        console.error("❌ Falha ao salvar localmente");
        return localSave;
      }

      // 2. Tentar salvar no Firebase se conectado
      const user = auth.currentUser;
      if (user) {
        try {
          const progressRef = this.getProgressRef();

          // Usar setDoc com merge para criar o documento se não existir
          await setDoc(
            progressRef,
            {
              gameProgress: progressData,
              userId: user.uid,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            { merge: true }
          );

          console.log("✅ Progresso sincronizado com Firebase");
        } catch (firebaseError) {
          console.warn("⚠️ Erro no Firebase, dados salvos localmente:", firebaseError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao salvar progresso:", error);
      return { success: false, error: error.message };
    }
  } // Desbloquear próximo jogo
  async unlockNextGame(childId, pathKey, currentGameNumber) {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "Não autenticado" };

      const nextGameKey = `game${currentGameNumber + 1}`;
      const progressRef = this.getProgressRef();

      const updateData = {
        [`gameProgress.paths.${pathKey}.games.${nextGameKey}.status`]: "unlocked",
        [`gameProgress.paths.${pathKey}.games.${nextGameKey}.unlocked_at`]:
          new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await setDoc(progressRef, updateData, { merge: true });

      console.log(`🔓 Próximo jogo desbloqueado: ${pathKey}/${nextGameKey}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao desbloquear próximo jogo:", error);
      return { success: false, error: error.message };
    }
  }

  // Desbloquear próximo caminho
  async unlockNextPath(childId, currentPathKey) {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "Não autenticado" };

      const pathOrder = ["castelo", "molusco_perola", "anemona"];
      const currentIndex = pathOrder.indexOf(currentPathKey);

      if (currentIndex < pathOrder.length - 1) {
        const nextPathKey = pathOrder[currentIndex + 1];
        const progressRef = this.getProgressRef();

        const updateData = {
          [`gameProgress.paths.${nextPathKey}.status`]: "unlocked",
          [`gameProgress.paths.${nextPathKey}.unlocked_at`]: new Date().toISOString(),
          [`gameProgress.paths.${nextPathKey}.games.game1.status`]: "unlocked",
          updated_at: new Date().toISOString(),
        };

        await setDoc(progressRef, updateData, { merge: true });

        console.log(`🛤️ Próximo caminho desbloqueado: ${nextPathKey}`);
        return { success: true, nextPath: nextPathKey };
      }

      return { success: true, nextPath: null };
    } catch (error) {
      console.error("❌ Erro ao desbloquear próximo caminho:", error);
      return { success: false, error: error.message };
    }
  }

  // Atualizar estatísticas
  async updateStatistics(childId, gameType, sessionData) {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "Não autenticado" };

      const childRef = this.getProgressRef(user.uid, childId);

      await updateDoc(childRef, {
        [`statistics.learning.games_completed_by_type.${gameType}`]:
          sessionData.gamesCompleted,
        [`statistics.learning.total_playtime_minutes`]: sessionData.totalTime,
        [`statistics.learning.last_session`]: new Date().toISOString(),
        [`gameProgress.overall_progress.total_games_completed`]:
          sessionData.totalGamesOverall,
      });

      console.log("📊 Estatísticas atualizadas");
      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao atualizar estatísticas:", error);
      return { success: false, error: error.message };
    }
  }

  // Carregar progresso completo (com listener em tempo real)
  subscribeToProgress(childId, callback) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("❌ Usuário não autenticado para subscription");
        return null;
      }

      console.log(`👂 Configurando listener para progresso da criança: ${childId}`);

      const childRef = this.getProgressRef(user.uid, childId);

      this.unsubscribeProgress = onSnapshot(
        childRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            console.log("📡 Progresso atualizado do Firebase:", data.gameProgress);
            callback({ success: true, data: data.gameProgress });
          } else {
            console.log("📄 Documento não encontrado");
            callback({ success: false, error: "Progresso não encontrado" });
          }
        },
        (error) => {
          console.error("❌ Erro no listener de progresso:", error);
          callback({ success: false, error: error.message });
        }
      );

      return this.unsubscribeProgress;
    } catch (error) {
      console.error("❌ Erro ao configurar listener:", error);
      return null;
    }
  }

  // Parar listener
  unsubscribeFromProgress() {
    if (this.unsubscribeProgress) {
      console.log("🔇 Parando listener de progresso");
      this.unsubscribeProgress();
      this.unsubscribeProgress = null;
    }
  }

  // Carregar progresso uma vez (sem listener)
  async loadProgress(childId) {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "Não autenticado" };

      const childRef = this.getProgressRef(user.uid, childId);
      const doc = await getDoc(childRef);

      if (doc.exists()) {
        const data = doc.data();
        console.log("📥 Progresso carregado:", data.gameProgress);
        return { success: true, data: data.gameProgress };
      } else {
        return { success: false, error: "Progresso não encontrado" };
      }
    } catch (error) {
      console.error("❌ Erro ao carregar progresso:", error);
      return { success: false, error: error.message };
    }
  }

  // Método principal para completar um jogo
  async completeGame(pathId, gameIndex, score = null) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("❌ Usuário não autenticado");
        return { success: false, error: "Usuário não autenticado" };
      }

      const gameKey = `game${gameIndex}`;
      const childId = this.childId || "child1";

      console.log(`🎯 Completando jogo: ${pathId}.${gameKey} com score: ${score}`);

      // 1. Carregar progresso atual ou usar padrão
      let currentProgress = await this.loadProgress();
      if (!currentProgress) {
        console.log("📝 Inicializando progresso padrão");
        currentProgress = this.getDefaultProgress();
        await this.saveLocalProgress(currentProgress);
      }
      console.log(
        "📥 Progresso atual carregado:",
        JSON.stringify(currentProgress, null, 2)
      );

      // 2. Atualizar progresso local
      const updatedProgress = {
        ...currentProgress,
        paths: {
          ...currentProgress?.paths,
          [pathId]: {
            ...currentProgress?.paths?.[pathId],
            games: {
              ...currentProgress?.paths?.[pathId]?.games,
              [gameKey]: {
                status: "completed",
                completedAt: new Date().toISOString(),
                score: score,
              },
            },
          },
        },
      };

      console.log("🔄 Progresso atualizado:", JSON.stringify(updatedProgress, null, 2)); // 3. Verificar se deve desbloquear próximo jogo
      let nextGameUnlocked = false;
      const nextGameKey = `game${gameIndex + 1}`;
      const pathGames = updatedProgress.paths[pathId]?.games;

      console.log(`🔍 Verificando próximo jogo: ${nextGameKey}`);
      console.log(`🎮 Jogos do caminho ${pathId}:`, pathGames);

      if (
        pathGames &&
        pathGames[nextGameKey] &&
        pathGames[nextGameKey].status === "locked"
      ) {
        pathGames[nextGameKey] = { status: "unlocked" };
        nextGameUnlocked = true;
        console.log(`🔓 Próximo jogo desbloqueado: ${nextGameKey}`);
      } else {
        console.log(
          `⚠️ Próximo jogo não desbloqueado - pathGames: ${!!pathGames}, nextGame: ${!!pathGames?.[nextGameKey]}, status: ${pathGames?.[nextGameKey]?.status}`
        );
      }

      // 4. Verificar se deve desbloquear próximo caminho
      let nextPathUnlocked = null;
      const pathOrder = ["castelo", "molusco_perola", "anemona"];
      const pathGameCounts = { castelo: 6, molusco_perola: 8, anemona: 4 };

      if (gameIndex === pathGameCounts[pathId]) {
        const currentPathIndex = pathOrder.indexOf(pathId);
        if (currentPathIndex < pathOrder.length - 1) {
          const nextPath = pathOrder[currentPathIndex + 1];
          if (updatedProgress.paths[nextPath]?.status === "locked") {
            updatedProgress.paths[nextPath] = {
              ...updatedProgress.paths[nextPath],
              status: "unlocked",
            };
            nextPathUnlocked = nextPath;
          }
        }
      }

      // 5. Salvar localmente
      await this.saveLocalProgress(updatedProgress);

      // 6. Tentar sincronizar com Firebase
      try {
        await this.saveGameProgress(childId, pathId, gameKey, {
          status: "completed",
          completedAt: new Date().toISOString(),
          score: score,
        });

        if (nextGameUnlocked) {
          await this.unlockNextGame(childId, pathId, gameKey);
        }

        if (nextPathUnlocked) {
          await this.unlockNextPath(childId, pathId);
        }
      } catch (firebaseError) {
        console.warn("⚠️ Erro no Firebase, mantendo apenas local:", firebaseError);
      }

      return {
        success: true,
        updatedProgress,
        nextGameUnlocked,
        nextPathUnlocked,
      };
    } catch (error) {
      console.error("❌ Erro ao completar jogo:", error);
      return { success: false, error: error.message };
    }
  }

  // Sincronização forçada (para quando volta online)
  async forceSyncProgress() {
    try {
      console.log("🔄 Forçando sincronização...");
      // Firestore faz isso automaticamente, mas podemos disparar manualmente
      await firestore.enableNetwork();
      console.log("✅ Rede reabilitada para sincronização");
      return { success: true };
    } catch (error) {
      console.error("❌ Erro na sincronização forçada:", error);
      return { success: false, error: error.message };
    }
  }
}

export default GameProgressService;
