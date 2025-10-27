import { router } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
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
import { firestore } from "../services/firebase";

export default function MudarEmail() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { user } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailExists = async (email) => {
    try {
      // Verificar se o email já existe na coleção de guardiões
      const guardiansRef = collection(firestore, "guardians");
      const q = query(guardiansRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      throw error;
    }
  };

  const validateInputs = async () => {
    if (!senhaAtual.trim()) {
      Alert.alert("Atenção", "Por favor, digite sua senha atual.");
      return false;
    }

    if (!novoEmail.trim()) {
      Alert.alert("Atenção", "Por favor, digite o novo email.");
      return false;
    }

    if (!validateEmail(novoEmail)) {
      Alert.alert("Atenção", "Por favor, digite um email válido.");
      return false;
    }

    if (novoEmail.toLowerCase() === user?.email?.toLowerCase()) {
      Alert.alert("Atenção", "O novo email deve ser diferente do email atual.");
      return false;
    }

    // Verificar se o email já existe
    const emailExists = await checkEmailExists(novoEmail.toLowerCase());
    if (emailExists) {
      Alert.alert("Atenção", "Este email já está sendo usado por outra conta.");
      return false;
    }

    return true;
  };

  const handleChangeEmail = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      const isValid = await validateInputs();
      if (!isValid) return;

      if (!user || !user.email) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      // 1. Reautenticar o usuário com a senha atual
      const credential = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credential);

      // 2. Atualizar o email no Firebase Auth
      await updateEmail(user, novoEmail.toLowerCase());

      // 3. Atualizar o email no documento do Firestore
      const guardianRef = doc(firestore, "guardians", user.uid);
      await updateDoc(guardianRef, {
        email: novoEmail.toLowerCase(),
        updated_at: new Date(),
      });

      Alert.alert(
        "Sucesso",
        "Seu email foi alterado com sucesso! Você pode precisar verificar o novo email para confirmar a alteração.",
        [
          {
            text: "OK",
            onPress: () => {
              // Limpar campos e voltar
              setSenhaAtual("");
              setNovoEmail("");
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      let errorMessage = "Ocorreu um erro ao alterar o email. Tente novamente.";

      if (error.code === "auth/wrong-password") {
        errorMessage = "A senha atual está incorreta.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está sendo usado por outra conta.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "O email fornecido não é válido.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Por segurança, faça login novamente e tente alterar o email.";
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
        <BackButton style={{ position: "absolute", top: 20, left: 20 }} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>MUDAR EMAIL</Text>

            <Text style={styles.subtitle}>
              Para alterar seu email, confirme sua senha e digite o novo endereço de
              email.
            </Text>

            <View style={styles.currentEmailContainer}>
              <Text style={styles.currentEmailLabel}>Email atual:</Text>
              <Text style={styles.currentEmail}>{user?.email || "—"}</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Senha Atual</Text>
              <DefaultInput
                placeholder="Digite sua senha para confirmar"
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                secureTextEntry={true}
                style={styles.input}
                editable={!isUpdating}
              />

              <Text style={styles.label}>Novo Email</Text>
              <DefaultInput
                placeholder="Digite seu novo email"
                value={novoEmail}
                onChangeText={setNovoEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                editable={!isUpdating}
              />
            </View>

            <View style={styles.buttonContainer}>
              <PinkButton
                title={isUpdating ? "ALTERANDO..." : "ALTERAR EMAIL"}
                onPress={handleChangeEmail}
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
    marginBottom: 20,
    fontFamily: "TTMilksCasualPie",
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  currentEmailContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  currentEmailLabel: {
    fontSize: 14,
    fontFamily: "TTMilksCasualPie",
    color: "#666",
    marginBottom: 5,
  },
  currentEmail: {
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    color: "#2F4F9D",
    fontWeight: "bold",
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
