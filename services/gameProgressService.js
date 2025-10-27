// services/gameProgressService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { logger } from "../utils/logger";
import { auth, firestore } from "./firebase";

class GameProgressService {
  constructor(guardianId = null, childId = null) {
    this.guardianId = guardianId;
    this.childId = childId;
    this.unsubscribeProgress = null;
  }

  // Obter referência do documento do progresso para criança específica - NOVA ESTRUTURA
  getProgressRef(guardianId = null, childId = null) {
    const gId = guardianId || this.guardianId || auth.currentUser?.uid;
    const cId = childId || this.childId;

    if (!cId) {
      throw new Error("childId é obrigatório");
    }

    // Nova estrutura: guardians/{guardianId}/children/{childId}
    return doc(firestore, "guardians", gId, "children", cId);
  }

  // Obter referência da estrutura antiga (para migração)
  getLegacyProgressRef(guardianId = null, childId = null) {
    const gId = guardianId || this.guardianId || auth.currentUser?.uid;
    const cId = childId || this.childId;

    if (!cId) {
      throw new Error("childId é obrigatório");
    }

    // Estrutura antiga: gameProgress/guardianId_childId
    return doc(firestore, "gameProgress", `${gId}_${cId}`);
  }

  // Gerar chave de armazenamento local
  getStorageKey(guardianId = null, childId = null) {
    const gId = guardianId || this.guardianId || auth.currentUser?.uid;
    const cId = childId || this.childId;

    if (!cId) {
      throw new Error("childId é obrigatório");
    }
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
      logger.dev.sync(`Progresso salvo localmente para criança ${childId}: ${key}`);
      return { success: true };
    } catch (error) {
      logger.error("Erro ao salvar progresso local:", error);
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
        logger.dev.sync(`Progresso carregado do local para criança ${childId}: ${key}`);
        return progress;
      }

      logger.dev.sync(
        `Nenhum progresso local encontrado para criança ${childId}: ${key}`
      );
      return null;
    } catch (error) {
      logger.error("Erro ao carregar progresso local:", error);
      return null;
    }
  }

  // Salvar progresso completo de um jogo para criança específica
  async saveGameProgress(guardianId, childId, pathKey, gameKey, progressData) {
    try {
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

      // Salva no Firebase usando a nova estrutura
      await setDoc(
        progressRef,
        {
          gameProgress: currentProgress,
          "profile.updated_at": serverTimestamp(),
        },
        { merge: true }
      );

      // Salva localmente também
      await this.saveLocalProgress(guardianId, childId, currentProgress);

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

        // Salva no Firebase usando a nova estrutura
        await setDoc(
          progressRef,
          {
            gameProgress: currentProgress,
            "profile.updated_at": serverTimestamp(),
          },
          { merge: true }
        );

        // Salva localmente
        await this.saveLocalProgress(guardianId, childId, currentProgress);

        return { success: true, nextGame: nextGameKey, progress: currentProgress };
      } else {
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

        // Salva no Firebase usando a nova estrutura
        await setDoc(
          progressRef,
          {
            gameProgress: currentProgress,
            "profile.updated_at": serverTimestamp(),
          },
          { merge: true }
        );

        // Salva localmente
        await this.saveLocalProgress(guardianId, childId, currentProgress);

        return { success: true, nextPath: nextPathKey, progress: currentProgress };
      }

      return { success: true, nextPath: null };
    } catch (error) {
      console.error("❌ Erro ao desbloquear próximo caminho:", error);
      return { success: false, error: error.message };
    }
  }

  // Desbloquear um caminho específico
  async unlockPath(guardianId, childId, pathKey) {
    try {
      const progressRef = this.getProgressRef(guardianId, childId);

      // Pega progresso atual
      const currentDoc = await getDoc(progressRef);
      let currentProgress = this.getDefaultProgress();

      if (currentDoc.exists()) {
        currentProgress = currentDoc.data().gameProgress || this.getDefaultProgress();
      }

      // Verifica se o caminho existe
      if (!currentProgress.paths[pathKey]) {
        console.error(`❌ Caminho ${pathKey} não existe`);
        return { success: false, error: `Caminho ${pathKey} não existe` };
      }

      // Desbloqueia o caminho
      currentProgress.paths[pathKey].status = "unlocked";
      if (currentProgress.paths[pathKey].games.game1) {
        currentProgress.paths[pathKey].games.game1.status = "unlocked";
      }

      // Salva no Firebase usando a nova estrutura
      await setDoc(
        progressRef,
        {
          gameProgress: currentProgress,
          "profile.updated_at": serverTimestamp(),
        },
        { merge: true }
      );

      // Salva localmente
      await this.saveLocalProgress(guardianId, childId, currentProgress);

      return { success: true, pathKey: pathKey, progress: currentProgress };
    } catch (error) {
      console.error(`❌ Erro ao desbloquear caminho ${pathKey}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Carregar progresso de uma criança específica do Firebase
  async loadProgressFromFirebase(guardianId, childId) {
    try {
      // Tentar carregar da nova estrutura primeiro
      const progressRef = this.getProgressRef(guardianId, childId);
      const doc = await getDoc(progressRef);

      if (doc.exists()) {
        const data = doc.data();

        // Extrair o gameProgress da estrutura do perfil
        const gameProgress = data.gameProgress || this.getDefaultProgress();

        // Salvar localmente como backup
        await this.saveLocalProgress(guardianId, childId, gameProgress);

        return { success: true, data: gameProgress };
      } else {
        // Tentar migrar da estrutura antiga
        const legacyRef = this.getLegacyProgressRef(guardianId, childId);
        const legacyDoc = await getDoc(legacyRef);

        if (legacyDoc.exists()) {
          const legacyData = legacyDoc.data();

          const gameProgress = legacyData.gameProgress || legacyData;

          // Migrar para nova estrutura
          await this.migrateToNewStructure(guardianId, childId, gameProgress);

          // Salvar localmente
          await this.saveLocalProgress(guardianId, childId, gameProgress);

          return { success: true, data: gameProgress };
        } else {
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

  // Migrar dados da estrutura antiga para a nova
  async migrateToNewStructure(guardianId, childId, gameProgress) {
    try {
      const progressRef = this.getProgressRef(guardianId, childId);

      // Criar estrutura completa compatível com a nova arquitetura
      const fullProfile = {
        profile: {
          username: `Criança ${childId}`, // Nome/username da criança
          nome: `Criança ${childId}`, // Mantém também no nome para compatibilidade
          idade: null,
          genero: "",
          avatar_url: "👧", // Avatar padrão da criança
          data_nascimento: null,
          level: 1, // Nível inicial
          total_xp: 0, // XP total
          xp_to_next_level: 30, // XP necessário para próximo nível (3 jogos * 10 XP)
          total_games_completed: 0, // Total de jogos completados
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          active: true,
        },

        behavioral_profile: {
          se_distrai_facilmente: false,
          birras_intensas: false,
          interage_bem: false,
          agitada: false,
          dificuldade_instrucoes: false,
          necessidades_especiais: {
            tea: false,
            tdah: false,
            tod: false,
            nenhuma: true,
          },
          configuracoes_acessibilidade: {
            texto_grande: false,
            alto_contraste: false,
            interface_simplificada: false,
            tempo_resposta_extra: false,
            feedback_visual_intenso: false,
            reducao_estimulos: false,
          },
          descricao_personalizada: "",
          estilo_aprendizado: null,
          tempo_concentracao_minutos: null,
          melhor_periodo: null,
          updated_at: serverTimestamp(),
        },

        gameProgress: gameProgress,

        settings: {
          audio: {
            sound_enabled: true,
            music_enabled: true,
            volume: 0.7,
          },
          gameplay: {
            max_session_time_minutes: 25,
            break_reminders: false,
            positive_reinforcement_frequency: "media",
          },
        },

        achievements: {
          estudo_focado: {
            title: "Estudo Focado",
            description: "Complete sua primeira atividade",
            unlocked: false,
            unlocked_at: null,
          },
          imbativel: {
            title: "Imbatível!",
            description: "Desbloqueie o segundo caminho",
            unlocked: false,
            unlocked_at: null,
          },
          mestre_calculo: {
            title: "Mestre do Cálculo",
            description: "Complete 5 atividades",
            unlocked: false,
            unlocked_at: null,
          },
          explorador: {
            title: "Explorador",
            description: "Complete 10 atividades",
            unlocked: false,
            unlocked_at: null,
          },
          campeao: {
            title: "Campeão",
            description: "Desbloqueie o terceiro caminho",
            unlocked: false,
            unlocked_at: null,
          },
          dedicado: {
            title: "Dedicado",
            description: "Complete 15 atividades",
            unlocked: false,
            unlocked_at: null,
          },
        },

        statistics: {
          learning: {
            total_playtime_minutes: 0,
            average_session_length: 0,
            games_completed_by_type: {
              memory: 0,
              word: 0,
              match: 0,
              fish: 0,
              plus: 0,
              minus: 0,
            },
            last_session: null,
          },
        },
      };

      // Salvar na nova estrutura
      await setDoc(progressRef, fullProfile);

      return { success: true };
    } catch (error) {
      console.error(`❌ Erro na migração para criança ${childId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Listener em tempo real para progresso de criança específica
  subscribeToProgress(guardianId, childId, callback) {
    try {
      const progressRef = this.getProgressRef(guardianId, childId);

      this.unsubscribeProgress = onSnapshot(
        progressRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();

            // Extrair gameProgress da estrutura do perfil
            const gameProgress = data.gameProgress || this.getDefaultProgress();

            // Salvar localmente também
            this.saveLocalProgress(guardianId, childId, gameProgress);

            callback({ success: true, data: gameProgress });
          } else {
            callback({ success: false, error: "Documento não encontrado" });
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
      this.unsubscribeProgress();
      this.unsubscribeProgress = null;
    }
  }

  // Completar jogo (método principal)
  async completeGame(guardianId, childId, pathKey, gameIndex, score) {
    try {
      const gameKey = `game${gameIndex}`;
      const progressRef = this.getProgressRef(guardianId, childId);

      // Pegar progresso atual uma única vez
      const currentDoc = await getDoc(progressRef);
      let currentProgress = this.getDefaultProgress();

      if (currentDoc.exists()) {
        currentProgress = currentDoc.data().gameProgress || this.getDefaultProgress();
      }

      // Preparar todas as mudanças em uma única operação
      const now = new Date().toISOString();

      // Dados do jogo completado
      const gameData = {
        status: "completed",
        completed_at: now,
        best_score: score,
        total_attempts: 1,
      };

      // Atualizar jogo atual
      if (!currentProgress.paths[pathKey]) {
        currentProgress.paths[pathKey] = this.getDefaultProgress().paths[pathKey];
      }
      if (!currentProgress.paths[pathKey].games) {
        currentProgress.paths[pathKey].games =
          this.getDefaultProgress().paths[pathKey].games;
      }

      currentProgress.paths[pathKey].games[gameKey] = gameData;

      // Verificar e desbloquear próximo jogo na mesma operação
      const nextGameKey = `game${gameIndex + 1}`;
      const nextGameExists = currentProgress.paths[pathKey].games[nextGameKey];

      if (
        nextGameExists &&
        currentProgress.paths[pathKey].games[nextGameKey].status === "locked"
      ) {
        currentProgress.paths[pathKey].games[nextGameKey].status = "unlocked";
      }

      // Atualizar timestamps uma única vez
      currentProgress.overall_progress.last_played = now;

      // ÚNICA operação Firebase - batch update
      const result = await this.batchUpdateProgress(guardianId, childId, currentProgress);

      if (!result.success) {
        return result;
      }

      // Verificar se completou todos os jogos do caminho
      const path = currentProgress.paths[pathKey];
      const allGamesCompleted = Object.values(path.games).every(
        (game) => game.status === "completed"
      );

      if (allGamesCompleted) {
        // Marcar path como completed, mas NÃO desbloquear próximo caminho
        // O próximo caminho será desbloqueado apenas quando o usuário abrir o baú
        const updatedProgressWithPathCompleted = { ...currentProgress };
        if (!updatedProgressWithPathCompleted.paths[pathKey]) {
          updatedProgressWithPathCompleted.paths[pathKey] = {};
        }
        updatedProgressWithPathCompleted.paths[pathKey].status = "completed";

        // Atualizar apenas o status do path sem desbloquear o próximo
        const pathCompletedResult = await this.batchUpdateProgress(
          guardianId,
          childId,
          updatedProgressWithPathCompleted
        );

        if (pathCompletedResult.success) {
          currentProgress = pathCompletedResult.progress;
        }
      }

      return { success: true, progress: currentProgress };
    } catch (error) {
      console.error(`❌ Erro ao completar jogo para criança ${childId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Método otimizado para batch updates
  async batchUpdateProgress(guardianId, childId, operationsOrProgress) {
    try {
      const progressRef = this.getProgressRef(guardianId, childId);

      // Se recebeu um array de operações, processar cada uma
      if (Array.isArray(operationsOrProgress)) {
        // Buscar o progresso atual
        const progressResult = await this.loadProgressFromFirebase(guardianId, childId);
        const currentProgress = progressResult.success
          ? progressResult.data
          : this.getDefaultProgress();
        let updatedProgress = { ...currentProgress };

        // Aplicar cada operação
        for (const operation of operationsOrProgress) {
          switch (operation.operation) {
            case "unlockPath":
              if (!updatedProgress.paths) updatedProgress.paths = {};
              if (!updatedProgress.paths[operation.pathId]) {
                updatedProgress.paths[operation.pathId] = {};
              }
              updatedProgress.paths[operation.pathId].status = "unlocked";
              break;

            case "setChestOpened":
              if (!updatedProgress.paths) updatedProgress.paths = {};
              if (!updatedProgress.paths[operation.pathId]) {
                updatedProgress.paths[operation.pathId] = {};
              }
              updatedProgress.paths[operation.pathId].chestOpened = true;
              break;
          }
        }

        // Salvar o progresso atualizado
        await updateDoc(progressRef, {
          gameProgress: updatedProgress,
          updated_at: serverTimestamp(),
        });

        // Salvar localmente
        const storageKey = this.getStorageKey(guardianId, childId);
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedProgress));

        return { success: true, progress: updatedProgress };
      } else {
        // Comportamento original: recebeu progresso direto
        const progress = operationsOrProgress;

        // Uma única operação Firebase
        await updateDoc(progressRef, {
          gameProgress: progress,
          updated_at: serverTimestamp(),
        });

        // Salvar localmente uma única vez
        const storageKey = this.getStorageKey(guardianId, childId);
        await AsyncStorage.setItem(storageKey, JSON.stringify(progress));

        return { success: true, progress };
      }
    } catch (error) {
      console.error(`❌ Erro no batch update para criança ${childId}:`, error);

      // Fallback: salvar apenas localmente
      try {
        const storageKey = this.getStorageKey(guardianId, childId);
        let progressToSave;
        if (Array.isArray(operationsOrProgress)) {
          const progressResult = await this.loadProgressFromFirebase(guardianId, childId);
          progressToSave = progressResult.success
            ? progressResult.data
            : this.getDefaultProgress();
        } else {
          progressToSave = operationsOrProgress;
        }
        await AsyncStorage.setItem(storageKey, JSON.stringify(progressToSave));
        return { success: true, progress: progressToSave };
      } catch (localError) {
        console.error("❌ Erro ao salvar localmente também:", localError);
        return { success: false, error: localError.message };
      }
    }
  }

  // === FUNÇÕES DE GERENCIAMENTO DE PERFIS ===

  // Buscar todos os perfis de crianças de um guardião
  async getChildrenProfiles(guardianId) {
    try {
      // Buscar perfis na coleção guardians/{guardianId}/children
      const childrenRef = collection(firestore, "guardians", guardianId, "children");
      const querySnapshot = await getDocs(childrenRef);

      const profiles = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const profile = data.profile;

        if (profile) {
          profiles.push({
            id: doc.id,
            name: profile.username || profile.nome || "Criança", // Usa username primeiro, depois nome como fallback
            avatar: profile.avatar_url || "👧",
            color: this.getDefaultColors()[profiles.length] || "#FF6B6B",
            lastPlayed: data.gameProgress?.overall_progress?.last_played || null,
            totalGames: data.gameProgress?.overall_progress?.total_games_completed || 0,
            age: profile.idade || null,
            gender: profile.genero || null,
          });
        }
      });

      return profiles;
    } catch (error) {
      console.error("❌ Erro ao buscar perfis de crianças:", error);
      return [];
    }
  }

  // Criar novo perfil de criança
  async createChildProfile(guardianId, childData) {
    try {
      // Encontrar próximo ID disponível
      const existingProfiles = await this.getChildrenProfiles(guardianId);

      // Criar referência para nova criança na estrutura guardians/{guardianId}/children
      const childrenRef = collection(firestore, "guardians", guardianId, "children");
      const newChildRef = doc(childrenRef);

      // Estrutura do perfil compatível com AuthService
      const childProfile = {
        profile: {
          username: childData.name, // Nome/username da criança
          nome: childData.name, // Mantém também no nome para compatibilidade
          idade: childData.age || null,
          genero: childData.gender || "",
          avatar_url: childData.avatar || null, // Avatar da criança
          data_nascimento: null,
          level: 1, // Nível inicial
          total_xp: 0, // XP total
          xp_to_next_level: 30, // XP necessário para próximo nível (3 jogos * 10 XP)
          total_games_completed: 0, // Total de jogos completados
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          active: true,
        },

        behavioral_profile: {
          se_distrai_facilmente: false,
          birras_intensas: false,
          interage_bem: false,
          agitada: false,
          dificuldade_instrucoes: false,
          necessidades_especiais: {
            tea: false,
            tdah: false,
            tod: false,
            nenhuma: true,
          },
          configuracoes_acessibilidade: {
            texto_grande: false,
            alto_contraste: false,
            interface_simplificada: false,
            tempo_resposta_extra: false,
            feedback_visual_intenso: false,
            reducao_estimulos: false,
          },
          descricao_personalizada: "",
          estilo_aprendizado: null,
          tempo_concentracao_minutos: null,
          melhor_periodo: null,
          updated_at: serverTimestamp(),
        },

        gameProgress: {
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
              games: {},
            },
            anemona: {
              status: "locked",
              games: {},
            },
          },
          overall_progress: {
            total_games_completed: 0,
            last_played: null,
            learning_velocity: null,
            retention_rate: null,
          },
        },

        settings: {
          audio: {
            sound_enabled: true,
            music_enabled: true,
            volume: 0.7,
          },
          gameplay: {
            max_session_time_minutes: 25,
            break_reminders: false,
            positive_reinforcement_frequency: "media",
          },
        },

        achievements: {
          estudo_focado: {
            title: "Estudo Focado",
            description: "Complete sua primeira atividade",
            unlocked: false,
            unlocked_at: null,
          },
          imbativel: {
            title: "Imbatível!",
            description: "Desbloqueie o segundo caminho",
            unlocked: false,
            unlocked_at: null,
          },
          mestre_calculo: {
            title: "Mestre do Cálculo",
            description: "Complete 5 atividades",
            unlocked: false,
            unlocked_at: null,
          },
          explorador: {
            title: "Explorador",
            description: "Complete 10 atividades",
            unlocked: false,
            unlocked_at: null,
          },
          campeao: {
            title: "Campeão",
            description: "Desbloqueie o terceiro caminho",
            unlocked: false,
            unlocked_at: null,
          },
          dedicado: {
            title: "Dedicado",
            description: "Complete 15 atividades",
            unlocked: false,
            unlocked_at: null,
          },
        },

        statistics: {
          learning: {
            total_playtime_minutes: 0,
            average_session_length: 0,
            games_completed_by_type: {
              memory: 0,
              word: 0,
              match: 0,
              fish: 0,
              plus: 0,
              minus: 0,
            },
            last_session: null,
          },
        },
      };

      // Salvar no Firebase
      await setDoc(newChildRef, childProfile);

      const newProfile = {
        id: newChildRef.id,
        name: childData.name,
        avatar: childData.avatar || "👧",
        color:
          childData.color ||
          this.getDefaultColors()[existingProfiles.length] ||
          "#FF6B6B",
        lastPlayed: null,
        totalGames: 0,
        age: childData.age || null,
        gender: childData.gender || null,
      };

      return { success: true, profile: newProfile };
    } catch (error) {
      console.error("❌ Erro ao criar perfil de criança:", error);
      return { success: false, error: error.message };
    }
  }

  // Atualizar perfil de criança existente
  async updateChildProfile(guardianId, childId, profileUpdates) {
    try {
      const childRef = this.getProgressRef(guardianId, childId);

      // Preparar os updates com timestamp
      const updates = {};

      if (profileUpdates.username) {
        updates["profile.username"] = profileUpdates.username;
        updates["profile.nome"] = profileUpdates.username; // Manter compatibilidade
      }

      if (profileUpdates.avatar_url) {
        updates["profile.avatar_url"] = profileUpdates.avatar_url;
      }

      // Sempre atualizar o timestamp
      updates["profile.updated_at"] = serverTimestamp();

      // Aplicar as atualizações
      await updateDoc(childRef, updates);

      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao atualizar perfil da criança:", error);
      return { success: false, error: error.message };
    }
  }

  // Cores padrão para perfis
  getDefaultColors() {
    return [
      "#FF6B6B", // Vermelho coral
      "#4ECDC4", // Turquesa
      "#45B7D1", // Azul claro
      "#FFA07A", // Salmão claro
      "#98D8C8", // Verde menta
      "#FFB6C1", // Rosa claro
      "#DDA0DD", // Ameixa
      "#F0E68C", // Cáqui
      "#87CEEB", // Azul céu
      "#FFE4B5", // Pêssego
    ];
  }

  // === FUNÇÃO DE RESET DE PROGRESSO ===

  async resetChildProgress(guardianId, childId) {
    try {
      const progressRef = this.getProgressRef(guardianId, childId);
      const initialProgress = this.getDefaultProgress();

      // 1) Remover campos de estatística de cada jogo existente (best_score, total_attempts, completed_at)
      try {
        const currentDoc = await getDoc(progressRef);
        if (currentDoc.exists()) {
          const current = currentDoc.data()?.gameProgress || {};
          const updates = {};

          const paths = current.paths || {};
          Object.keys(paths).forEach((pathKey) => {
            const games = paths[pathKey]?.games || {};
            Object.keys(games).forEach((gameKey) => {
              updates[`gameProgress.paths.${pathKey}.games.${gameKey}.best_score`] =
                deleteField();
              updates[`gameProgress.paths.${pathKey}.games.${gameKey}.total_attempts`] =
                deleteField();
              updates[`gameProgress.paths.${pathKey}.games.${gameKey}.completed_at`] =
                deleteField();
            });
          });

          if (Object.keys(updates).length > 0) {
            await updateDoc(progressRef, updates);
          }
        }
      } catch (statsErr) {
        console.warn("⚠️ Falha ao limpar estatísticas antes do reset:", statsErr);
      }

      // 2) Resetar progresso e conquistas no Firebase para o estado inicial
      const resetAchievements = this.getDefaultAchievements();

      await setDoc(
        progressRef,
        {
          gameProgress: initialProgress,
          achievements: resetAchievements,
          "profile.level": 1,
          "profile.total_xp": 0,
          "profile.xp_to_next_level": 30,
          "profile.total_games_completed": 0,
          "profile.updated_at": serverTimestamp(),
        },
        { merge: true }
      );

      // 3) Limpar progresso local
      await this.clearLocalProgress(guardianId, childId);

      return { success: true, progress: initialProgress };
    } catch (error) {
      console.error(`❌ Erro ao resetar progresso da criança ${childId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Limpar progresso local específico de uma criança
  async clearLocalProgress(guardianId, childId) {
    try {
      const key = `@mdt:progress:${guardianId}:${childId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ Erro ao limpar progresso local da criança ${childId}:`, error);
    }
  }

  async updateLearningStats(guardianId, childId, stats = {}) {
    try {
      const { gameType, sessionMs, sessionMinutes, completed } = stats || {};
      const progressRef = this.getProgressRef(guardianId, childId);

      // Carregar doc atual
      const snap = await getDoc(progressRef);
      const data = snap.exists() ? snap.data() : {};

      const learning = data?.statistics?.learning || {};
      const prevTotal = Number(learning.total_playtime_minutes || 0);
      const prevAvg = Number(learning.average_session_length || 0);
      const prevSessions = Number(learning.sessions_count || 0);

      // Normalizar minutos da sessão
      let minutes = 0;
      if (typeof sessionMinutes === "number") minutes = sessionMinutes;
      else if (typeof sessionMs === "number") minutes = Math.round(sessionMs / 60000);
      // mínimo de 1 min para não poluir com 0
      if (!minutes || minutes < 1) minutes = 1;

      const newSessions = prevSessions + 1;
      const newTotal = prevTotal + minutes;
      const newAvg = Math.round((prevAvg * prevSessions + minutes) / newSessions);

      const updates = {
        "statistics.learning.last_session": serverTimestamp(),
        "statistics.learning.total_playtime_minutes": newTotal,
        "statistics.learning.average_session_length": newAvg,
        "statistics.learning.sessions_count": newSessions,
      };

      if (completed && gameType) {
        const validTypes = ["memory", "word", "match", "fish", "plus", "minus"];
        const key = validTypes.includes(gameType) ? gameType : null;
        if (key) {
          const byType = learning.games_completed_by_type || {};
          const prev = Number(byType[key] || 0);
          updates[`statistics.learning.games_completed_by_type.${key}`] = prev + 1;
        }
      }

      await updateDoc(progressRef, updates);

      // Se um jogo foi completado, atualizar XP, nível e conquistas
      let profileUpdateResult = null;
      if (completed) {
        profileUpdateResult = await this.updateProfileProgress(guardianId, childId);
      }

      return {
        success: true,
        profileUpdate: profileUpdateResult,
      };
    } catch (error) {
      console.error("❌ Erro ao atualizar estatísticas de aprendizado:", error);
      return { success: false, error: error.message };
    }
  }

  // Atualizar progresso do perfil (XP, nível, conquistas)
  async updateProfileProgress(guardianId, childId) {
    try {
      const progressRef = this.getProgressRef(guardianId, childId);
      const snap = await getDoc(progressRef);

      if (!snap.exists()) {
        console.warn("⚠️ Documento do perfil não encontrado para atualizar progresso");
        return { success: false, error: "Perfil não encontrado" };
      }

      const data = snap.data();
      const gameProgress = data.gameProgress || {};
      const previousAchievements = data.achievements || {};

      // Calcular total de jogos completados
      const totalGamesCompleted = this.calculateTotalGamesCompleted(gameProgress);

      // Calcular XP (10 XP por jogo completado)
      const xpPerGame = 10;
      const totalXP = totalGamesCompleted * xpPerGame;

      // Calcular nível (a cada 3 jogos = 1 nível, começando do nível 1)
      const level = Math.floor(totalGamesCompleted / 3) + 1;
      const xpToNextLevel = level * 3 * xpPerGame - totalXP;

      // Verificar conquistas
      const newAchievements = this.calculateAchievements(
        gameProgress,
        totalGamesCompleted,
        previousAchievements
      );

      // Detectar conquistas recém-desbloqueadas
      const newlyUnlocked = [];
      Object.entries(newAchievements).forEach(([key, achievement]) => {
        const previous = previousAchievements[key];
        const wasLocked = !previous?.unlocked;
        const isNowUnlocked = achievement.unlocked;

        if (wasLocked && isNowUnlocked) {
          newlyUnlocked.push({ key, achievement });
        }
      });

      // Preparar resultado com conquistas antes de salvar no Firebase
      const resultToReturn = {
        success: true,
        level,
        totalXP,
        totalGamesCompleted,
        achievements: newAchievements,
        newlyUnlocked: newlyUnlocked.map((unlock) => ({
          key: unlock.key,
          achievement: unlock.achievement,
        })),
      };

      const updates = {
        "profile.level": level,
        "profile.total_xp": totalXP,
        "profile.xp_to_next_level": Math.max(xpToNextLevel, 0),
        "profile.total_games_completed": totalGamesCompleted,
        "profile.updated_at": serverTimestamp(),
        achievements: newAchievements,
      };

      await updateDoc(progressRef, updates);

      return resultToReturn;
    } catch (error) {
      console.error("❌ Erro ao atualizar progresso do perfil:", error);
      return { success: false, error: error.message };
    }
  }

  // Calcular total de jogos completados
  calculateTotalGamesCompleted(gameProgress) {
    let total = 0;
    const paths = gameProgress.paths || {};

    Object.values(paths).forEach((path) => {
      const games = path.games || {};
      Object.values(games).forEach((game) => {
        if (game.status === "completed") {
          total++;
        }
      });
    });

    return total;
  }

  // Calcular conquistas baseadas no progresso
  calculateAchievements(gameProgress, totalGamesCompleted, previousAchievements = {}) {
    const paths = gameProgress.paths || {};

    const achievements = {};

    // Primeira conquista - Complete seu primeiro jogo
    const isFirstGameComplete = totalGamesCompleted >= 1;
    achievements.primeira_conquista = {
      title: "Primeira Conquista",
      description: "Complete seu primeiro jogo",
      unlocked: isFirstGameComplete,
      unlocked_at:
        isFirstGameComplete && !previousAchievements.primeira_conquista?.unlocked
          ? serverTimestamp()
          : previousAchievements.primeira_conquista?.unlocked_at || null,
    };

    // Estudo focado - Complete os primeiros 3 jogos fáceis do castelo
    const casteloEasyGamesCompleted = this.countCompletedGamesInPath(paths.castelo, 3); // Apenas os primeiros 3
    const isEstudoFocadoComplete = casteloEasyGamesCompleted >= 3;
    achievements.estudo_focado = {
      title: "Estudo Focado",
      description: "Complete todos os jogos fáceis no castelo",
      unlocked: isEstudoFocadoComplete,
      unlocked_at:
        isEstudoFocadoComplete && !previousAchievements.estudo_focado?.unlocked
          ? serverTimestamp()
          : previousAchievements.estudo_focado?.unlocked_at || null,
    };

    // Imbatível - Complete todos os jogos da pérola
    const isImbativelComplete = paths.molusco_perola?.status === "completed";
    achievements.imbativel = {
      title: "Imbatível!",
      description: "Complete todos os jogos da pérola",
      unlocked: isImbativelComplete,
      unlocked_at:
        isImbativelComplete && !previousAchievements.imbativel?.unlocked
          ? serverTimestamp()
          : previousAchievements.imbativel?.unlocked_at || null,
    };

    // Mestre do Cálculo - Complete todos os jogos de cálculo (Plus e Minus)
    const calculoGamesCompleted = this.countCalculoGamesCompleted(gameProgress);
    const isMestreCalculoComplete = calculoGamesCompleted >= 6; // 3 plus + 3 minus
    achievements.mestre_calculo = {
      title: "Mestre do Cálculo",
      description: "Complete todos os jogos de cálculo",
      unlocked: isMestreCalculoComplete,
      unlocked_at:
        isMestreCalculoComplete && !previousAchievements.mestre_calculo?.unlocked
          ? serverTimestamp()
          : previousAchievements.mestre_calculo?.unlocked_at || null,
    };

    // Explorador do Castelo - Complete todos os jogos do castelo
    const isExploradorComplete = paths.castelo?.status === "completed";
    achievements.explorador = {
      title: "Explorador do Castelo",
      description: "Complete todos os jogos do castelo",
      unlocked: isExploradorComplete,
      unlocked_at:
        isExploradorComplete && !previousAchievements.explorador?.unlocked
          ? serverTimestamp()
          : previousAchievements.explorador?.unlocked_at || null,
    };

    // Aventuras Submarinas (Campeão) - Complete todos os jogos da anêmona
    const isCampeaoComplete = paths.anemona?.status === "completed";
    achievements.campeao = {
      title: "Aventuras Submarinas",
      description: "Complete todos os jogos da anêmona",
      unlocked: isCampeaoComplete,
      unlocked_at:
        isCampeaoComplete && !previousAchievements.campeao?.unlocked
          ? serverTimestamp()
          : previousAchievements.campeao?.unlocked_at || null,
    };

    // Aprendiz Dedicado - Complete 10 jogos diferentes
    const isDedicadoComplete = totalGamesCompleted >= 10;
    achievements.dedicado = {
      title: "Aprendiz Dedicado",
      description: "Complete 10 jogos diferentes",
      unlocked: isDedicadoComplete,
      unlocked_at:
        isDedicadoComplete && !previousAchievements.dedicado?.unlocked
          ? serverTimestamp()
          : previousAchievements.dedicado?.unlocked_at || null,
    };

    // Aluno Brilhante - Complete 15 jogos diferentes
    const isAlunoBrilhanteComplete = totalGamesCompleted >= 15;
    achievements.aluno_brilhante = {
      title: "Aluno Brilhante",
      description: "Complete 15 jogos diferentes",
      unlocked: isAlunoBrilhanteComplete,
      unlocked_at:
        isAlunoBrilhanteComplete && !previousAchievements.aluno_brilhante?.unlocked
          ? serverTimestamp()
          : previousAchievements.aluno_brilhante?.unlocked_at || null,
    };

    // TECECE - Complete todos os jogos do Mundo da Tuti
    const isMundoCompletoComplete =
      paths.castelo?.status === "completed" &&
      paths.molusco_perola?.status === "completed" &&
      paths.anemona?.status === "completed";
    achievements.mundo_completo = {
      title: "TECECE",
      description: "Complete todos os jogos do Mundo da Tuti",
      unlocked: isMundoCompletoComplete,
      unlocked_at:
        isMundoCompletoComplete && !previousAchievements.mundo_completo?.unlocked
          ? serverTimestamp()
          : previousAchievements.mundo_completo?.unlocked_at || null,
    };

    return achievements;
  }

  // Contar jogos de cálculo completados (plus e minus)
  countCalculoGamesCompleted(gameProgress) {
    let count = 0;
    const paths = gameProgress.paths || {};

    Object.values(paths).forEach((path) => {
      const games = path.games || {};
      Object.entries(games).forEach(([gameKey, game]) => {
        // Verificar se é um jogo de cálculo baseado no tipo
        const gameTypes = game.types || [];
        if (gameTypes.includes("plus") || gameTypes.includes("minus")) {
          if (game.status === "completed") {
            count++;
          }
        }
      });
    });

    return count;
  }

  // Obter conquistas no estado inicial (todas bloqueadas)
  getDefaultAchievements() {
    return {
      primeira_conquista: {
        title: "Primeira Conquista",
        description: "Complete seu primeiro jogo",
        unlocked: false,
        unlocked_at: null,
      },
      estudo_focado: {
        title: "Estudo Focado",
        description: "Complete todos os jogos fáceis no castelo",
        unlocked: false,
        unlocked_at: null,
      },
      imbativel: {
        title: "Imbatível!",
        description: "Complete todos os jogos da pérola",
        unlocked: false,
        unlocked_at: null,
      },
      mestre_calculo: {
        title: "Mestre do Cálculo",
        description: "Complete todos os jogos de cálculo",
        unlocked: false,
        unlocked_at: null,
      },
      explorador: {
        title: "Explorador do Castelo",
        description: "Complete todos os jogos do castelo",
        unlocked: false,
        unlocked_at: null,
      },
      campeao: {
        title: "Aventuras Submarinas",
        description: "Complete todos os jogos da anêmona",
        unlocked: false,
        unlocked_at: null,
      },
      dedicado: {
        title: "Aprendiz Dedicado",
        description: "Complete 10 jogos diferentes",
        unlocked: false,
        unlocked_at: null,
      },
      aluno_brilhante: {
        title: "Aluno Brilhante",
        description: "Complete 15 jogos diferentes",
        unlocked: false,
        unlocked_at: null,
      },
      mundo_completo: {
        title: "TECECE",
        description: "Complete todos os jogos do Mundo da Tuti",
        unlocked: false,
        unlocked_at: null,
      },
    };
  }

  // Contar jogos completados em um caminho específico (limitado aos primeiros N jogos)
  countCompletedGamesInPath(pathData, maxGames = null) {
    if (!pathData || !pathData.games) return 0;

    const games = pathData.games;
    const gameKeys = Object.keys(games).sort(); // game1, game2, game3, etc.

    let count = 0;
    const limit = maxGames || gameKeys.length;

    for (let i = 0; i < Math.min(limit, gameKeys.length); i++) {
      const gameKey = gameKeys[i];
      const game = games[gameKey];
      if (game && game.status === "completed") {
        count++;
      }
    }

    return count;
  }
}

export default GameProgressService;
