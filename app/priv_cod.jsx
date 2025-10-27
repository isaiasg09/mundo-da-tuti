import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BackButton from "../components/backbutton";
import PinkButton from "../components/pinkbutton";
import { useAuth } from "../context/AuthContext";
import { useGameProgress } from "../context/GameContext";
import AuthService from "../services/authService";
import { firestore } from "../services/firebase";
import { logger } from "../utils/logger";
import { resetGameProgress } from "../utils/resetProgress";

export default function Priv_Cod() {
  const [code, setCode] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [childName, setChildName] = useState("—");
  const [guardianEmail, setGuardianEmail] = useState("—");

  const codeLength = 4;
  const inputRef = useRef(null);
  const { user } = useAuth();
  const { currentChildId } = useGameProgress();

  const handleValidateCode = async () => {
    // Validação básica
    if (!code.trim()) {
      Alert.alert("Atenção", "Por favor, digite o código de segurança.");
      return;
    }

    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    setIsValidating(true);

    try {
      // Chamar o serviço de validação
      const result = await AuthService.validateSecurityCode(user.uid, code.trim());

      if (result.success) {
        handleSecurityAction();
      } else {
        Alert.alert(
          "Código Incorreto",
          result.message || "O código digitado não confere com o cadastrado."
        );
        setCode(""); // Limpar campo para nova tentativa
      }
    } catch (error) {
      logger.error("❌ Erro na validação:", error);
      Alert.alert("Erro", "Ocorreu um erro ao validar o código. Tente novamente.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSecurityAction = () => {
    setShowConfig(true);
  };

  // Carrega dados do responsável e da criança ao abrir a área de configuração
  useEffect(() => {
    const loadAccountData = async () => {
      try {
        // Email do responsável: preferir do objeto user
        if (user?.email) setGuardianEmail(user.email);

        // Nome da criança atual (do Firestore)
        if (user?.uid && currentChildId) {
          // Buscar diretamente o documento da criança na coleção children
          const childRef = doc(
            firestore,
            "guardians",
            user.uid,
            "children",
            currentChildId
          );
          const childSnap = await getDoc(childRef);
          if (childSnap.exists()) {
            const childData = childSnap.data();
            const profile = childData?.profile || {};
            const name =
              profile.nome ??
              profile.name ??
              profile.username ??
              childData?.nome ??
              childData?.name ??
              childData?.username ??
              "—";
            setChildName(name);
          } else {
            setChildName("—");
          }
        }

        // Fallback de e-mail a partir do documento do guardião
        if (user?.uid && !user?.email) {
          const guardianRef = doc(firestore, "guardians", user.uid);
          const snap = await getDoc(guardianRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data?.email) setGuardianEmail(data.email);
          }
        }
      } catch (err) {
        logger.dev.firebase("⚠️ Falha ao carregar dados da conta:", err);
      }
    };

    if (showConfig) {
      loadAccountData();
    }
  }, [showConfig, user?.uid, currentChildId]);

  useEffect(() => {
    if (code.length === codeLength) {
      handleValidateCode();
    }
  }, [code]);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleExcluirConta = () => {
    if (isDeleting) return;

    Alert.alert(
      "Excluir Conta",
      "Tem certeza que deseja excluir sua conta? Esta ação é permanente e não poderá ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const res = await AuthService.deleteGuardianAccount(code);
              if (res?.success) {
                Alert.alert("Conta excluída", "Sua conta foi excluída com sucesso.", [
                  { text: "OK", onPress: () => router.replace("/login") },
                ]);
              } else if (res?.error === "requires-recent-login") {
                Alert.alert(
                  "Reautenticação necessária",
                  res?.message ||
                    "Por segurança, faça login novamente e tente excluir a conta mais uma vez.",
                  [{ text: "OK", onPress: () => router.replace("/login") }]
                );
              } else {
                Alert.alert(
                  "Erro ao excluir",
                  res?.message || res?.error || "Não foi possível excluir a conta."
                );
              }
            } catch (e) {
              logger.error("❌ Erro inesperado ao excluir conta:", e);
              Alert.alert("Erro", "Ocorreu um erro inesperado. Tente novamente.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/config_bg.png")}
        resizeMode="cover"
        style={styles.backgroundImg}
      >
        <BackButton style={{ position: "absolute", top: 10, left: 20 }} />
        <View style={styles.rows}>
          <Text style={styles.greeting}>PRIVACIDADE</Text>
        </View>

        {!showConfig ? (
          // Tela de código
          <>
            <Text style={styles.subText}>
              Digite seu código de segurança para acessar:
            </Text>

            {/* Caixa clicável */}
            <TouchableOpacity
              style={styles.codeView}
              activeOpacity={0.8}
              onPress={handlePress}
            >
              {Array(codeLength)
                .fill(0)
                .map((_, index) => {
                  const digit = code[index] || "";
                  return (
                    <View key={index} style={styles.codeBox}>
                      <Text style={styles.codeText}>{digit || "—"}</Text>
                    </View>
                  );
                })}
            </TouchableOpacity>

            {/* Input invisível para capturar o código */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={codeLength}
              value={code}
              onChangeText={setCode}
            />

            <Text style={styles.forgot}>Esqueceu seu código?</Text>
            <PinkButton
              title={isValidating ? "VALIDANDO..." : "VERIFICAR"}
              onPress={handleValidateCode}
              disabled={isValidating}
              style={{
                opacity: isValidating ? 0.6 : 1,
                // width: "50%",
                padding: 10,
              }}
            />
          </>
        ) : (
          // Tela de configuração da conta
          <View style={styles.configContainer}>
            <View style={styles.infoSection}>
              {/* Nome da criança atual */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NOME DA CRIANÇA:</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.infoValue}>{childName}</Text>
                </View>
              </View>

              {/* Email do responsável */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>EMAIL:</Text>
                <Text style={styles.infoValue}>{guardianEmail}</Text>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <PinkButton
                title="MUDAR SENHA"
                style={styles.configButton}
                onPress={() => router.push("/mudarsenha")}
              />
              <PinkButton
                title="MUDAR EMAIL"
                style={[styles.configButton, { backgroundColor: "#f453b6" }]}
                onPress={() => router.push("/mudaremail")}
              />
            </View>

            <View style={styles.bottomSection}>
              <PinkButton
                title="RESETAR PROGRESSO"
                onPress={() => resetGameProgress(user, currentChildId)}
                style={{
                  backgroundColor: "#ff6600",
                  paddingVertical: 10,
                  marginBottom: 30,
                  width: "90%",
                }}
              />

              <Text style={styles.termsText}>TERMOS E POLÍTICAS DE USO</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={handleExcluirConta}>
                <Text style={styles.deleteButtonText}>
                  {isDeleting ? "EXCLUINDO..." : "EXCLUIR CONTA"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5B8", // cor de fundo amarela
    alignItems: "center",
  },
  backgroundImg: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  greeting: {
    fontSize: 26,
    fontFamily: "TTMilksCasualPie",
    color: "#FF6EC7", // rosa
    marginTop: 60,
  },
  subText: {
    fontSize: 24,
    color: "#2F4F9D",
    textAlign: "center",
    marginTop: 40,
    fontFamily: "TTMilksCasualPie",
    // maxWidth: "80%",
  },
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginVertical: 50,
    backgroundColor: "#FFE17D",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  codeBox: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  codeText: {
    fontSize: 45,
    color: "#00BFFF", // azul claro
    fontFamily: "TTMilksCasualPie",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
  },
  forgot: {
    fontSize: 14,
    color: "#2F4F9D",
    fontFamily: "TTMilksCasualPie",
    marginBottom: 40,
  },

  rows: {
    flexDirection: "row",
  },

  // Estilos para a tela de configuração
  configContainer: {
    flex: 1,
    width: "90%",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffdb4d5e",
    paddingVertical: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  infoSection: {
    width: "100%",
    marginTop: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    color: "#476bb4",
    marginRight: 10,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "TTMilksCasualPie",
    color: "#48899d",
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 15,
  },
  configButton: {
    marginVertical: 5,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: "auto",
  },
  bottomSection: {
    alignItems: "center",
    marginTop: 20,
  },
  termsText: {
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    color: "#FF6EC7",
    marginBottom: 20,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  deleteButtonText: {
    fontSize: 18,
    fontFamily: "TTMilksCasualPie",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
