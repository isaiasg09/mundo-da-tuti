// services/authService.js - Para Expo
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { logger } from "../utils/logger";
import { auth, firestore } from "./firebase";
import GameProgressService from "./gameProgressService";

class AuthService {
  // Helper para aguardar Firebase estar pronto
  async waitForFirebaseReady() {
    return new Promise((resolve) => {
      logger.dev.firebase("Verificando se Firebase está pronto...");
      logger.dev.firebase("Auth disponível:", !!auth);
      logger.dev.firebase("Firestore disponível:", !!firestore);

      if (auth && firestore) {
        logger.dev.firebase("Firebase está pronto!");
        resolve(true);
      } else {
        logger.dev.firebase("Aguardando Firebase inicializar...");
        setTimeout(() => {
          logger.dev.firebase("Timeout concluído, assumindo que Firebase está pronto");
          resolve(true);
        }, 1000);
      }
    });
  }

  // Helper para retry com delay
  async retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.dev.firebase(`Tentativa ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error) {
        logger.error(`Tentativa ${attempt} falhou:`, error.message);

        if (attempt === maxRetries) {
          throw error;
        }

        // Aguardar antes da próxima tentativa
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  // Registrar responsável
  async registerGuardian(guardianData) {
    try {
      logger.dev.auth("Iniciando registro do responsável...");

      // Aguardar Firebase estar pronto
      await this.waitForFirebaseReady();

      // Validar dados antes de enviar
      logger.dev.auth("Email recebido:", `"${guardianData.email}"`);
      logger.dev.auth("Senha recebida:", `"${guardianData.senha}"`);
      logger.dev.auth("Tipo do email:", typeof guardianData.email);
      logger.dev.auth("Comprimento do email:", guardianData.email?.length);

      // Verificar se email e senha existem
      if (!guardianData.email || !guardianData.senha) {
        throw new Error("Email ou senha não fornecidos");
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guardianData.email)) {
        throw new Error(`Email inválido: "${guardianData.email}"`);
      }

      // Usar retry logic para criar usuário
      const result = await this.retryOperation(async () => {
        logger.dev.firebase("Criando conta no Firebase Auth...");
        logger.dev.firebase("Email final:", `"${guardianData.email}"`);
        logger.dev.firebase("Senha final:", `"${guardianData.senha}"`);

        // 1. Criar conta no Firebase Auth
        return await createUserWithEmailAndPassword(
          auth,
          guardianData.email,
          guardianData.senha
        );
      });

      const user = result.user;
      logger.dev.firebase("Usuário criado no Auth:", user.uid);

      // 2. Criar documento do responsável no Firestore
      await setDoc(doc(firestore, "guardians", user.uid), {
        email: guardianData.email,
        // nome: guardianData.usuario,
        codigo_seguranca: guardianData.codigoSeguranca,
        parentesco: guardianData.parentesco || "",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        subscription_type: "free",
      });

      logger.dev.firebase("Documento do responsável criado");

      // 3. Criar perfil da primeira criança
      const childResult = await this.createChildProfile(user.uid, guardianData);
      logger.dev.firebase("Perfil da criança criado:", childResult.childId);

      return { success: true, guardianId: user.uid, childId: childResult.childId };
    } catch (error) {
      logger.error("Erro ao registrar responsável:", error);
      return { success: false, error: error.message };
    }
  }

  // Criar perfil da criança
  async createChildProfile(guardianId, childData) {
    try {
      const childRef = doc(collection(firestore, "guardians", guardianId, "children"));

      await setDoc(childRef, {
        profile: {
          username: childData.usuario, // Nome/username da criança
          nome: childData.nome, // Mantém também no nome para compatibilidade
          idade: parseInt(childData.idade),
          genero: childData.genero || "",
          avatar_url: childData.imagemPerfil || null, // Avatar da criança, não do guardião
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
          se_distrai_facilmente: childData.seDistraiFacilmente || false,
          birras_intensas: childData.birrasIntensas || false,
          interage_bem: childData.interageBem || false,
          agitada: childData.agitada || false,
          dificuldade_instrucoes: childData.dificuldadeInstrucoes || false,

          necessidades_especiais: {
            tea: childData.sindromesCrianca?.includes("TEA") || false,
            tdah: childData.sindromesCrianca?.includes("TDAH") || false,
            tod: childData.sindromesCrianca?.includes("TOD") || false,
            nenhuma: childData.sindromesCrianca?.includes("NENHUMA") || false,
          },

          configuracoes_acessibilidade: {
            texto_grande: false,
            alto_contraste: false,
            interface_simplificada: this.shouldSimplifyInterface(childData),
            tempo_resposta_extra:
              childData.dificuldadeInstrucoes || childData.seDistraiFacilmente,
            feedback_visual_intenso: childData.agitada || childData.birrasIntensas,
            reducao_estimulos: childData.seDistraiFacilmente,
          },

          descricao_personalizada: childData.observacoes || "",
          estilo_aprendizado: null,
          tempo_concentracao_minutos: null,
          melhor_periodo: null,
          updated_at: serverTimestamp(),
        },

        gameProgress: new GameProgressService().getDefaultProgress(),

        settings: {
          audio: {
            sound_enabled: true,
            music_enabled: true,
            volume: 0.7,
          },
          gameplay: {
            max_session_time_minutes: this.calculateSessionTime(childData),
            break_reminders: childData.seDistraiFacilmente || childData.agitada,
            positive_reinforcement_frequency: childData.birrasIntensas ? "alta" : "media",
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
      });

      return { success: true, childId: childRef.id };
    } catch (error) {
      logger.error("Erro ao criar perfil da criança:", error);
      return { success: false, error: error.message };
    }
  }

  // Helpers
  shouldSimplifyInterface(childData) {
    return (
      childData.dificuldadeInstrucoes ||
      childData.seDistraiFacilmente ||
      childData.sindromesCrianca?.includes("TEA") ||
      childData.sindromesCrianca?.includes("TDAH") ||
      childData.sindromesCrianca?.includes("TOD")
    );
  }

  calculateSessionTime(childData) {
    if (childData.seDistraiFacilmente || childData.agitada) return 15;
    if (childData.dificuldadeInstrucoes) return 20;
    return 25;
  }

  // Login
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, guardianId: userCredential.user.uid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Verificar usuário atual
  getCurrentUser() {
    return auth.currentUser;
  }

  // Listener de mudanças na autenticação
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Valida o código de segurança do responsável, recebe o id do usuario logado e o código digitado
   */
  async validateSecurityCode(userId, inputCode) {
    try {
      if (!userId) return { success: false, message: "Usuário inválido." };

      const guardianRef = doc(firestore, "guardians", userId);

      const guardianSnap = await getDoc(guardianRef);

      let data = guardianSnap.exists() ? guardianSnap.data() : null;

      if (!data) return { success: false, message: "Usuário não encontrado." };

      const stored = (data.codigo_seguranca ?? "").toString().trim();
      const input = (inputCode ?? "").toString().trim();

      if (!stored) return { success: false, message: "Código não configurado." };
      return stored === input
        ? { success: true }
        : { success: false, message: "Código de segurança incorreto." };
    } catch (e) {
      console.error("❌ validateSecurityCode error:", e);
      return { success: false, message: "Erro interno. Tente novamente." };
    }
  }

  async deleteGuardianAccount(securityCode) {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "Usuário não autenticado." };

      // Validar código de segurança
      const validation = await this.validateSecurityCode(user.uid, securityCode);
      if (!validation.success) {
        return { success: false, error: validation.message || "Código inválido." };
      }

      // Buscar todas as crianças
      const childrenRef = collection(firestore, "guardians", user.uid, "children");
      const childrenSnap = await getDocs(childrenRef);

      // Apagar dados no Firestore em batch
      const batch = writeBatch(firestore);
      const childIds = [];
      childrenSnap.forEach((childDoc) => {
        batch.delete(childDoc.ref);
        childIds.push(childDoc.id);
      });
      // Apagar doc do guardião
      batch.delete(doc(firestore, "guardians", user.uid));
      await batch.commit();

      // Limpar caches locais de progresso
      for (const childId of childIds) {
        try {
          await AsyncStorage.removeItem(`@game_progress_${user.uid}_${childId}`);
        } catch {}
        try {
          await AsyncStorage.removeItem(`@mdt:progress:${user.uid}:${childId}`);
        } catch {}
      }

      // Por fim, apagar o usuário do Auth
      try {
        await deleteUser(user);
      } catch (e) {
        if (e && e.code === "auth/requires-recent-login") {
          return {
            success: false,
            error: "requires-recent-login",
            message:
              "Por segurança, faça login novamente e tente excluir a conta mais uma vez.",
          };
        }
        throw e;
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao excluir conta:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "Usuário não autenticado." };

      // Reautenticar com a senha atual
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Atualizar senha
      await updatePassword(user, newPassword);

      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao alterar senha:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Alterar email do usuário
   */
  async changeEmail(currentPassword, newEmail) {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "Usuário não autenticado." };

      // Verificar se o email já existe
      const emailExists = await this.checkEmailExists(newEmail);
      if (emailExists) {
        return {
          success: false,
          error: "Este email já está sendo usado por outra conta.",
        };
      }

      // Reautenticar com a senha atual
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Atualizar email no Auth
      await updateEmail(user, newEmail);

      // Atualizar email no Firestore
      const guardianRef = doc(firestore, "guardians", user.uid);
      await updateDoc(guardianRef, {
        email: newEmail.toLowerCase(),
        updated_at: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao alterar email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar se um email já existe
   */
  async checkEmailExists(email) {
    try {
      const guardiansRef = collection(firestore, "guardians");
      const q = query(guardiansRef, where("email", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("❌ Erro ao verificar email:", error);
      return false;
    }
  }
}

export default new AuthService();
