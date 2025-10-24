// services/gameProgressService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
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

      // Debug: verificar estrutura atual
      console.log(`🔍 Verificando se ${nextGameKey} existe em ${pathKey}`);
      console.log(`🔍 Path existe:`, !!currentProgress.paths[pathKey]);
      console.log(
        `🔍 Games do path:`,
        Object.keys(currentProgress.paths[pathKey]?.games || {})
      );
      console.log(
        `🔍 Próximo jogo existe:`,
        !!currentProgress.paths[pathKey]?.games[nextGameKey]
      );

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

        console.log(`✅ Próximo jogo desbloqueado: ${nextGameKey}`);
        return { success: true, nextGame: nextGameKey, progress: currentProgress };
      } else {
        console.log(
          `ℹ️ Não há próximo jogo em ${pathKey} (próximo seria: ${nextGameKey})`
        );
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
        console.log(`🛤️ Desbloqueando próximo caminho: ${nextPathKey}`);
        currentProgress.paths[nextPathKey].status = "unlocked";

        if (currentProgress.paths[nextPathKey].games.game1) {
          console.log(`🎮 Desbloqueando game1 do caminho: ${nextPathKey}`);
          currentProgress.paths[nextPathKey].games.game1.status = "unlocked";
        } else {
          console.log(`⚠️ Game1 não encontrado no caminho: ${nextPathKey}`);
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

  // Desbloquear um caminho específico
  async unlockPath(guardianId, childId, pathKey) {
    try {
      console.log(`🔓 Desbloqueando caminho para criança ${childId}: ${pathKey}`);

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

      console.log(`✅ Caminho desbloqueado: ${pathKey}`);
      return { success: true, pathKey: pathKey, progress: currentProgress };
    } catch (error) {
      console.error(`❌ Erro ao desbloquear caminho ${pathKey}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Carregar progresso de uma criança específica do Firebase
  async loadProgressFromFirebase(guardianId, childId) {
    try {
      console.log(`📥 Carregando progresso da criança ${childId} do Firebase...`);

      // Tentar carregar da nova estrutura primeiro
      const progressRef = this.getProgressRef(guardianId, childId);
      const doc = await getDoc(progressRef);

      if (doc.exists()) {
        const data = doc.data();
        console.log("✅ Progresso carregado do Firebase (nova estrutura)");

        // Extrair o gameProgress da estrutura do perfil
        const gameProgress = data.gameProgress || this.getDefaultProgress();

        // Salvar localmente como backup
        await this.saveLocalProgress(guardianId, childId, gameProgress);

        return { success: true, data: gameProgress };
      } else {
        // Tentar migrar da estrutura antiga
        console.log("🔄 Tentando migrar da estrutura antiga...");
        const legacyRef = this.getLegacyProgressRef(guardianId, childId);
        const legacyDoc = await getDoc(legacyRef);

        if (legacyDoc.exists()) {
          const legacyData = legacyDoc.data();
          console.log("📦 Dados encontrados na estrutura antiga, migrando...");

          const gameProgress = legacyData.gameProgress || legacyData;

          // Migrar para nova estrutura
          await this.migrateToNewStructure(guardianId, childId, gameProgress);

          // Salvar localmente
          await this.saveLocalProgress(guardianId, childId, gameProgress);

          return { success: true, data: gameProgress };
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
      console.log(`🔄 Migrando dados para nova estrutura - criança ${childId}`);

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

        achievements: {},

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

      console.log(`✅ Migração concluída para criança ${childId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Erro na migração para criança ${childId}:`, error);
      return { success: false, error: error.message };
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

            // Extrair gameProgress da estrutura do perfil
            const gameProgress = data.gameProgress || this.getDefaultProgress();

            // Salvar localmente também
            this.saveLocalProgress(guardianId, childId, gameProgress);

            callback({ success: true, data: gameProgress });
          } else {
            console.log(`📄 Documento não encontrado para criança ${childId}`);
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
      console.log(`🎮 Tentando desbloquear próximo jogo após completar game${gameIndex}`);
      const nextGameResult = await this.unlockNextGame(
        guardianId,
        childId,
        pathKey,
        gameIndex
      );
      console.log(`🎮 Resultado do desbloqueio:`, nextGameResult);

      if (nextGameResult.success && nextGameResult.progress) {
        currentProgress = nextGameResult.progress;
      }

      // Verificar se completou todos os jogos do caminho
      const path = currentProgress.paths[pathKey];
      const allGamesCompleted = Object.values(path.games).every(
        (game) => game.status === "completed"
      );

      console.log(`🏁 Checking if path ${pathKey} is completed:`);
      console.log(`🏁 All games completed: ${allGamesCompleted}`);
      console.log(`🏁 Next game result: ${nextGameResult.nextGame}`);
      console.log(
        `🏁 Games status:`,
        Object.keys(path.games).map((key) => `${key}: ${path.games[key].status}`)
      );

      if (allGamesCompleted && nextGameResult.nextGame === null) {
        console.log(`🎯 Path ${pathKey} completed! Unlocking next path...`);
        // Desbloquear próximo caminho
        const nextPathResult = await this.unlockNextPath(guardianId, childId, pathKey);
        console.log(`🎯 Next path unlock result:`, nextPathResult);

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

  // === FUNÇÕES DE GERENCIAMENTO DE PERFIS ===

  // Buscar todos os perfis de crianças de um guardião
  async getChildrenProfiles(guardianId) {
    try {
      console.log(`🔍 Buscando perfis de crianças para guardião ${guardianId}`);

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

      console.log(`✅ Encontrados ${profiles.length} perfis de crianças`);
      return profiles;
    } catch (error) {
      console.error("❌ Erro ao buscar perfis de crianças:", error);
      return [];
    }
  }

  // Criar novo perfil de criança
  async createChildProfile(guardianId, childData) {
    try {
      console.log(`🆕 Criando novo perfil de criança para guardião ${guardianId}`);

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

        achievements: {},

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

      console.log(`✅ Perfil criado com sucesso: ${newChildRef.id}`);
      return { success: true, profile: newProfile };
    } catch (error) {
      console.error("❌ Erro ao criar perfil de criança:", error);
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
      console.log(
        `🔄 Resetando progresso da criança ${childId} para guardião ${guardianId}`
      );

      const progressRef = this.getProgressRef(guardianId, childId);
      const initialProgress = this.getDefaultProgress();

      // Resetar progresso no Firebase para o progresso inicial
      await setDoc(
        progressRef,
        {
          gameProgress: initialProgress,
          "profile.updated_at": serverTimestamp(),
        },
        { merge: true }
      );

      // Limpar progresso local
      await this.clearLocalProgress(guardianId, childId);

      console.log(`✅ Progresso da criança ${childId} resetado com sucesso`);
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
      console.log(`🗑️ Progresso local da criança ${childId} removido`);
    } catch (error) {
      console.error(`❌ Erro ao limpar progresso local da criança ${childId}:`, error);
    }
  }
}

export default GameProgressService;
