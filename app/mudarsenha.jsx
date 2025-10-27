import { router } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BackButton from "../components/backbutton";
import DefaultInput from "../components/defaultinput";
import PinkButton from "../components/pinkbutton";
import { useAuth } from "../context/AuthContext";

export default function MudarSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { user } = useAuth();

  const validateInputs = () => {
    if (!senhaAtual.trim()) {
      Alert.alert("Atenção", "Por favor, digite sua senha atual.");
      return false;
    }

    if (!novaSenha.trim()) {
      Alert.alert("Atenção", "Por favor, digite sua nova senha.");
      return false;
    }

    if (novaSenha.length < 6) {
      Alert.alert("Atenção", "A nova senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (!confirmarSenha.trim()) {
      Alert.alert("Atenção", "Por favor, confirme sua nova senha.");
      return false;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Atenção", "A confirmação da senha não confere com a nova senha.");
      return false;
    }

    if (senhaAtual === novaSenha) {
      Alert.alert("Atenção", "A nova senha deve ser diferente da senha atual.");
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateInputs()) return;
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      if (!user || !user.email) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      // 1. Reautenticar o usuário com a senha atual
      const credential = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credential);

      // 2. Atualizar a senha
      await updatePassword(user, novaSenha);

      Alert.alert("Sucesso", "Sua senha foi alterada com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            // Limpar campos e voltar
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
            router.back();
          },
        },
      ]);
    } catch (error) {
      let errorMessage = "Ocorreu um erro ao alterar a senha. Tente novamente.";

      if (error.code === "auth/wrong-password") {
        errorMessage = "A senha atual está incorreta.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "A nova senha é muito fraca. Use pelo menos 6 caracteres.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Por segurança, faça login novamente e tente alterar a senha.";
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = () => {
    if (isUpdating) {
      Alert.alert("Aguarde", "Operação em andamento. Aguarde a conclusão.");
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/config_bg.png")}
        resizeMode="cover"
        style={styles.backgroundImg}
      >
        <BackButton
          style={{ position: "absolute", top: 10, left: 20 }}
          onPress={handleBack}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>MUDAR SENHA</Text>

            <Text style={styles.subtitle}>
              Para sua segurança, digite sua senha atual e depois sua nova senha duas
              vezes.
            </Text>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Senha Atual</Text>
              <DefaultInput
                placeholder="Digite sua senha atual"
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                secureTextEntry={true}
                style={styles.input}
                editable={!isUpdating}
              />

              <Text style={styles.label}>Nova Senha</Text>
              <DefaultInput
                placeholder="Digite sua nova senha (mín. 6 caracteres)"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry={true}
                style={styles.input}
                editable={!isUpdating}
              />

              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <DefaultInput
                placeholder="Digite novamente sua nova senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={true}
                style={styles.input}
                editable={!isUpdating}
              />
            </View>

            <View style={styles.buttonContainer}>
              <PinkButton
                title={isUpdating ? "ALTERANDO..." : "ALTERAR SENHA"}
                onPress={handleChangePassword}
                disabled={isUpdating}
                style={{
                  opacity: isUpdating ? 0.6 : 1,
                  marginTop: 20,
                }}
              />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5B8",
  },
  backgroundImg: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "TTMilksCasualPie",
    color: "#FF6EC7",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#2F4F9D",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "TTMilksCasualPie",
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    color: "#2F4F9D",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    marginBottom: 5,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
});
