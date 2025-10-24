// services/gameProgressService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
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
    const cId = childId || this.childId || "child1";
    // Estrutura: gameProgress/guardianId_childId
    return doc(firestore, "gameProgress", `${gId}_${cId}`);
  }

  // Gerar chave de armazenamento local
  getStorageKey(guardianId = null, childId = null) {
    const gId = guardianId || this.guardianId || auth.currentUser?.uid;
    const cId = childId || this.childId || "child1";
    return `@game_progress_${gId}_${cId}`;
  }

  // Progresso padrão para nova criança
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
  }

  // Salvar progresso localmente
  async saveLocalProgress(guardianId, childId, progressData) {
    try {
      const key = this.getStorageKey(guardianId, childId);
      const dataToSave = {
        ...progressData,
        lastModified: new Date().toISOString(),
        syncStatus: "local",
      };

      await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
      console.log(`💾 Progresso salvo localmente para criança ${childId}: ${key}`);
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
        console.log(`📱 Progresso carregado do local para criança ${childId}: ${key}`);
        return progress;
      }

      console.log(`📱 Nenhum progresso local encontrado para criança ${childId}: ${key}`);
      return null;
    } catch (error) {
      console.error("❌ Erro ao carregar progresso local:", error);
      return null;
    }
  }

  // Salvar progresso completo de um jogo para criança específica
  async saveGameProgress(guardianId, childId, pathKey, gameKey, progressData) {
    try {
      console.log(
        `🎮 Salvando progresso para criança ${childId}: ${pathKey}/${gameKey}`,
        progressData
      );

      const progressRef = this.getProgressRef(guardianId, childId);

      // Primeiro, pega o progresso atual
      const currentDoc = await getDoc(progressRef);
      let currentProgress = this.getDefaultProgress();

      if (currentDoc.exists()) {
        currentProgress = currentDoc.data().gameProgress || this.getDefaultProgress();
      }

      // Atualiza o jogo específico
      if (!currentProgress.paths[pathKey]) {
        currentProgress.paths[pathKey] = this.getDefaultProgress().paths[pathKey];
      }
      if (!currentProgress.paths[pathKey].games) {
        currentProgress.paths[pathKey].games =
          this.getDefaultProgress().paths[pathKey].games;
      }

      currentProgress.paths[pathKey].games[gameKey] = {
        ...progressData,
        updated_at: new Date().toISOString(),
      };

      if (!currentProgress.overall_progress) {
        currentProgress.overall_progress = {
          total_games_completed: 0,
          last_played: null,
        };
      }
      currentProgress.overall_progress.last_played = new Date().toISOString();

      // Salva no Firebase
      await setDoc(
        progressRef,
        {
          guardianId,
          childId,
          gameProgress: currentProgress,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        { merge: true }
      );

      // Salva localmente também
      await this.saveLocalProgress(guardianId, childId, currentProgress);

      console.log("✅ Progresso salvo com sucesso");
      return { success: true, progress: currentProgress };
    } catch (error) {
      console.error("❌ Erro ao salvar progresso:", error);

      // Fallback: salvar apenas localmente
      try {
        const storageKey = this.getStorageKey(guardianId, childId);
        const stored = await AsyncStorage.getItem(storageKey);
        let localProgress = stored ? JSON.parse(stored) : this.getDefaultProgress();

        if (!localProgress.paths[pathKey]) {
          localProgress.paths[pathKey] = this.getDefaultProgress().paths[pathKey];
        }
        if (!localProgress.paths[pathKey].games) {
          localProgress.paths[pathKey].games =
            this.getDefaultProgress().paths[pathKey].games;
        }

        localProgress.paths[pathKey].games[gameKey] = {
          ...progressData,
          updated_at: new Date().toISOString(),
          pendingSync: true, // Marcar para sincronizar depois
        };

        await AsyncStorage.setItem(storageKey, JSON.stringify(localProgress));
        console.log("⚠️ Progresso salvo apenas localmente (Firebase falhou)");

        return { success: true, progress: localProgress };
      } catch (localError) {
        console.error("❌ Erro ao salvar localmente também:", localError);
        return { success: false, error: localError.message };
      }
    }
  }

  // Desbloquear próximo jogo
  async unlockNextGame(guardianId, childId, pathKey, currentGameNumber) {
    try {
      const nextGameKey = `game${currentGameNumber + 1}`;
      console.log(
        `🔓 Desbloqueando próximo jogo para criança ${childId}: ${pathKey}/${nextGameKey}`
      );

      const progressRef = this.getProgressRef(guardianId, childId);

      // Pega progresso atual
      const currentDoc = await getDoc(progressRef);
      let currentProgress = this.getDefaultProgress();

      if (currentDoc.exists()) {
        currentProgress = currentDoc.data().gameProgress || this.getDefaultProgress();
      }

      // Verifica se o próximo jogo existe
      if (
        currentProgress.paths[pathKey] &&
        currentProgress.paths[pathKey].games[nextGameKey]
      ) {
        currentProgress.paths[pathKey].games[nextGameKey] = {
          status: "unlocked",
          unlocked_at: new Date().toISOString(),
        };

        // Salva no Firebase
        await setDoc(
          progressRef,
          {
            guardianId,
            childId,
            gameProgress: currentProgress,
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );

        // Salva localmente
        await this.saveLocalProgress(guardianId, childId, currentProgress);

        console.log(`✅ Próximo jogo desbloqueado: ${nextGameKey}`);
        return { success: true, nextGame: nextGameKey, progress: currentProgress };
      } else {
        console.log(`ℹ️ Não há próximo jogo em ${pathKey}`);
        return { success: true, nextGame: null, progress: currentProgress };
      }
    } catch (error) {
      console.error("❌ Erro ao desbloquear próximo jogo:", error);
      return { success: false, error: error.message };
    }
  }

  // Desbloquear próximo caminho
  async unlockNextPath(guardianId, childId, currentPathKey) {
    try {
      const pathOrder = ["castelo", "molusco_perola", "anemona"];
      const currentIndex = pathOrder.indexOf(currentPathKey);

      if (currentIndex < pathOrder.length - 1) {
        const nextPathKey = pathOrder[currentIndex + 1];
        console.log(
          `🛤️ Desbloqueando próximo caminho para criança ${childId}: ${nextPathKey}`
        );

        const progressRef = this.getProgressRef(guardianId, childId);

        // Pega progresso atual
        const currentDoc = await getDoc(progressRef);
        let currentProgress = this.getDefaultProgress();

        if (currentDoc.exists()) {
          currentProgress = currentDoc.data().gameProgress || this.getDefaultProgress();
        }

        // Marca o caminho atual como completo
        currentProgress.paths[currentPathKey].status = "completed";

        // Desbloqueia o próximo caminho
        currentProgress.paths[nextPathKey].status = "unlocked";
        if (currentProgress.paths[nextPathKey].games.game1) {
          currentProgress.paths[nextPathKey].games.game1.status = "unlocked";
        }

        // Salva no Firebase
        await setDoc(
          progressRef,
          {
            guardianId,
            childId,
            gameProgress: currentProgress,
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );

        // Salva localmente
        await this.saveLocalProgress(guardianId, childId, currentProgress);

        console.log(`✅ Próximo caminho desbloqueado: ${nextPathKey}`);
        return { success: true, nextPath: nextPathKey, progress: currentProgress };
      }

      console.log(`ℹ️ Não há próximo caminho após ${currentPathKey}`);
      return { success: true, nextPath: null };
    } catch (error) {
      console.error("❌ Erro ao desbloquear próximo caminho:", error);
      return { success: false, error: error.message };
    }
  }

  // Carregar progresso de uma criança específica do Firebase
  async loadProgressFromFirebase(guardianId, childId) {
    try {
      console.log(`📥 Carregando progresso da criança ${childId} do Firebase...`);

      const progressRef = this.getProgressRef(guardianId, childId);
      const doc = await getDoc(progressRef);

      if (doc.exists()) {
        const data = doc.data();
        console.log("✅ Progresso carregado do Firebase");

        // Salvar localmente como backup
        await this.saveLocalProgress(guardianId, childId, data.gameProgress);

        return { success: true, data: data.gameProgress };
      } else {
        console.log("📱 Progresso não encontrado no Firebase, tentando carregar local");
        const localProgress = await this.loadProgress(guardianId, childId);
        if (localProgress) {
          return { success: true, data: localProgress };
        } else {
          console.log(`🆕 Criando progresso inicial para criança ${childId}`);
          const defaultProgress = this.getDefaultProgress();
          await this.saveLocalProgress(guardianId, childId, defaultProgress);
          return { success: true, data: defaultProgress };
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar do Firebase:", error);
      // Fallback para progresso local
      const localProgress = await this.loadProgress(guardianId, childId);
      if (localProgress) {
        return { success: true, data: localProgress };
      } else {
        const defaultProgress = this.getDefaultProgress();
        await this.saveLocalProgress(guardianId, childId, defaultProgress);
        return { success: true, data: defaultProgress };
      }
    }
  }

  // Listener em tempo real para progresso de criança específica
  subscribeToProgress(guardianId, childId, callback) {
    try {
      console.log(`👂 Configurando listener para criança ${childId}`);

      const progressRef = this.getProgressRef(guardianId, childId);

      this.unsubscribeProgress = onSnapshot(
        progressRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            console.log(`📡 Progresso atualizado para criança ${childId}`);

            // Salvar localmente também
            this.saveLocalProgress(guardianId, childId, data.gameProgress);

            callback({ success: true, data: data.gameProgress });
          } else {
            console.log(`📄 Documento não encontrado para criança ${childId}`);
            callback({ success: false, error: "Progresso não encontrado" });
          }
        },
        (error) => {
          console.error(`❌ Erro no listener para criança ${childId}:`, error);
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

  // Completar jogo (método principal)
  async completeGame(guardianId, childId, pathKey, gameIndex, score) {
    try {
      console.log(
        `🎯 Completando jogo para criança ${childId}: ${pathKey}/game${gameIndex} - Score: ${score}`
      );

      const gameKey = `game${gameIndex}`;

      // Dados do jogo completado
      const gameData = {
        status: "completed",
        completed_at: new Date().toISOString(),
        best_score: score,
        total_attempts: 1, // Por enquanto sempre 1, pode ser expandido
      };

      // Salvar progresso do jogo
      const result = await this.saveGameProgress(
        guardianId,
        childId,
        pathKey,
        gameKey,
        gameData
      );

      if (!result.success) {
        return result;
      }

      let currentProgress = result.progress;

      // Verificar se deve desbloquear próximo jogo
      const nextGameResult = await this.unlockNextGame(
        guardianId,
        childId,
        pathKey,
        gameIndex
      );
      if (nextGameResult.success && nextGameResult.progress) {
        currentProgress = nextGameResult.progress;
      }

      // Verificar se completou todos os jogos do caminho
      const path = currentProgress.paths[pathKey];
      const allGamesCompleted = Object.values(path.games).every(
        (game) => game.status === "completed"
      );

      if (allGamesCompleted && nextGameResult.nextGame === null) {
        // Desbloquear próximo caminho
        const nextPathResult = await this.unlockNextPath(guardianId, childId, pathKey);
        if (nextPathResult.success && nextPathResult.progress) {
          currentProgress = nextPathResult.progress;
        }
      }

      console.log(`✅ Jogo completado com sucesso para criança ${childId}`);
      return { success: true, progress: currentProgress };
    } catch (error) {
      console.error(`❌ Erro ao completar jogo para criança ${childId}:`, error);
      return { success: false, error: error.message };
    }
  }
}

export default GameProgressService;
