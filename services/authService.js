// services/authService.js - Para Expo
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, firestore } from "./firebase";
import GameProgressService from "./gameProgressService";

class AuthService {
  // Helper para aguardar Firebase estar pronto
  async waitForFirebaseReady() {
    return new Promise((resolve) => {
      console.log("🔄 Verificando se Firebase está pronto...");
      console.log("🔍 Auth disponível:", !!auth);
      console.log("🔍 Firestore disponível:", !!firestore);

      if (auth && firestore) {
        console.log("✅ Firebase está pronto!");
        resolve(true);
      } else {
        console.log("⏳ Aguardando Firebase inicializar...");
        setTimeout(() => {
          console.log("✅ Timeout concluído, assumindo que Firebase está pronto");
          resolve(true);
        }, 1000);
      }
    });
  }

  // Helper para retry com delay
  async retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error) {
        console.error(`❌ Tentativa ${attempt} falhou:`, error.message);

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
      console.log("🔥 Iniciando registro do responsável...");

      // Aguardar Firebase estar pronto
      await this.waitForFirebaseReady();

      // Validar dados antes de enviar
      console.log("📧 Email recebido:", `"${guardianData.email}"`);
      console.log("🔑 Senha recebida:", `"${guardianData.senha}"`);
      console.log("🔍 Tipo do email:", typeof guardianData.email);
      console.log("🔍 Comprimento do email:", guardianData.email?.length);

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
        console.log("🔐 Criando conta no Firebase Auth...");
        console.log("📧 Email final:", `"${guardianData.email}"`);
        console.log("🔑 Senha final:", `"${guardianData.senha}"`);

        // 1. Criar conta no Firebase Auth
        return await createUserWithEmailAndPassword(
          auth,
          guardianData.email,
          guardianData.senha
        );
      });

      const user = result.user;
      console.log("✅ Usuário criado no Auth:", user.uid);

      // 2. Criar documento do responsável no Firestore
      await setDoc(doc(firestore, "guardians", user.uid), {
        email: guardianData.email,
        // nome: guardianData.usuario,
        codigo_seguranca: guardianData.codigoSeguranca,
        telefone: guardianData.telefone || "",
        tipo_responsavel: "responsavel",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        subscription_type: "free",
      });

      console.log("✅ Documento do responsável criado");

      // 3. Criar perfil da primeira criança
      const childResult = await this.createChildProfile(user.uid, guardianData);
      console.log("✅ Perfil da criança criado:", childResult.childId);

      return { success: true, guardianId: user.uid, childId: childResult.childId };
    } catch (error) {
      console.error("❌ Erro ao registrar responsável:", error);
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
      });

      return { success: true, childId: childRef.id };
    } catch (error) {
      console.error("❌ Erro ao criar perfil da criança:", error);
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
}

export default new AuthService();
