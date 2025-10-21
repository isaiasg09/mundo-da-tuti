import BackButton from "@/components/backbutton";
import PinkButton from "@/components/pinkbutton";
import { resetGameProgress } from "@/utils/resetProgress";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Priv_Cod() {
  const [code, setCode] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const codeLength = 4;
  const inputRef = useRef(null);

  useEffect(() => {
    if (code.length === codeLength) {
      // Simular validação do código (você pode implementar a validação real aqui)
      console.log("Código digitado:", code);
      // Por enquanto, qualquer código de 4 dígitos é válido
      setShowConfig(true);
    }
  }, [code]);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleVerifyCode = () => {
    if (code.length === codeLength) {
      setShowConfig(true);
    }
  };

  const handleExcluirConta = () => {
    // Implementar lógica de exclusão de conta
    console.log("Excluir conta");
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
            <PinkButton title="Verificar" onPress={handleVerifyCode} />
          </>
        ) : (
          // Tela de configuração da conta
          <View style={styles.configContainer}>
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NOME DA CRIANÇA:</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.infoValue}>GUILHERMINHO</Text>
                  <Text style={styles.editIcon}>✏️</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>EMAIL:</Text>
                <Text style={styles.infoValue}>TUTITECECE@GMAIL.COM</Text>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <PinkButton title="MUDAR SENHA" style={styles.configButton} />
              <PinkButton
                title="MUDAR EMAIL"
                style={[styles.configButton, { backgroundColor: "#f453b6" }]}
              />
            </View>

            <View style={styles.bottomSection}>
              <PinkButton
                title="RESETAR PROGRESSO"
                onPress={resetGameProgress}
                style={{
                  backgroundColor: "#ff6600",
                  paddingVertical: 10,
                  marginBottom: 30,
                  width: "90%",
                }}
              />

              <Text style={styles.termsText}>TERMOS E POLÍTICAS DE USO</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={handleExcluirConta}>
                <Text style={styles.deleteButtonText}>EXCLUIR CONTA</Text>
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
  editIcon: {
    fontSize: 18,
    marginLeft: 10,
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
