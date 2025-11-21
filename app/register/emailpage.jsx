import { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
// import {
//   useFonts,
//   Fredoka_600SemiBold,
//   Fredoka_300Light,
// } from "@expo-google-fonts/fredoka";

import BackButton from "@/components/backbutton";
import DefaultInput from "@/components/defaultinput";
import PinkButton from "@/components/pinkbutton";

import { useRegistration } from "@/context/RegistrationContext";
import AuthService from "@/services/authService";

const { width } = Dimensions.get("window");

function EmailPage() {
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook

  async function handleGoNext() {
    // Limpar erros anteriores
    setErrorMessage("");
    setIsEmailValid(true);

    // Validar formato do email
    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }

    // Mostrar loading
    setIsLoading(true);

    try {
      // Verificar se email já existe
      const emailExists = await AuthService.checkEmailExists(email);

      if (emailExists) {
        setErrorMessage("Este email já está sendo usado por outra conta.");
        setIsLoading(false);
        return;
      }

      // Email está disponível, salvar no contexto e navegar
      setRegistrationData({ email: email });
      setIsLoading(false);
      router.navigate("./senha");
    } catch (error) {
      setErrorMessage("Erro ao verificar email. Tente novamente.");
      setIsLoading(false);
    }
  }

  const validateEmail = (text) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return emailRegex.test(text);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={require("@/assets/images/bg_register.png")}
          resizeMode="cover"
          style={styles.background}
        >
          <View style={styles.container}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "100%",
              }}
            >
              <BackButton
                title="Voltar"
                style={
                  {
                    // flex: "0 0 auto",
                  }
                }
              />
            </View>
            <Text style={styles.texto}>DIGITE SEU MELHOR EMAIL:</Text>

            <DefaultInput
              placeholder="Email do Responsável"
              keyboardType="email-address"
              onChangeText={(text) => {
                setEmail(text);
                // Limpar erros quando usuário começar a digitar
                if (errorMessage) setErrorMessage("");
                if (!isEmailValid) setIsEmailValid(true);
              }}
            />

            {!isEmailValid && <Text style={styles.errorText}>Email inválido!</Text>}

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Image
              source={require("@/assets/images/poses_tuti/tuti_oi.png")}
              style={styles.mascote}
              accessibilityLabel="Mascote Tuti apontando para a tela"
            />

            <PinkButton
              title={isLoading ? "Verificando..." : "Próximo"}
              onPress={handleGoNext}
              style={{
                marginTop: 20,
                opacity: isLoading ? 0.6 : 1,
              }}
              disabled={isLoading}
            />
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

// estilos
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "flex-start",
    // paddingTop: 26,
    paddingHorizontal: 24,
    gap: 20,
    paddingVertical: 26,
  },

  texto: {
    color: "#48899d",
    fontFamily: "TTMilksCasualPie",
    fontSize: 22,
    textAlign: "center",
    marginTop: 50,
  },

  mascote: {
    width: "100%",
    height: width * 0.8,
    resizeMode: "contain",
    marginTop: 20,
    // backgroundColor: "red",
    transform: [{ rotateY: "-180deg" }],
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    color: "#ff0000",
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    textTransform: "uppercase",
  },
});

export default EmailPage;
