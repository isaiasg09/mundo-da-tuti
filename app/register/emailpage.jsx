import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  TextInput,
  ScrollView,
} from "react-native";

import { router } from "expo-router";
// import {
//   useFonts,
//   Fredoka_600SemiBold,
//   Fredoka_300Light,
// } from "@expo-google-fonts/fredoka";

import PinkButton from "@/components/pinkbutton";
import BackButton from "@/components/backbutton";
import DefaultInput from "@/components/defaultinput";

import { useRegistration } from "../../context/RegistrationContext";

const { width } = Dimensions.get("window");

function EmailPage() {
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [email, setEmail] = useState(true);
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook

  function handleGoNext() {
    if (!validateEmail(email)) {
      setIsEmailValid(validateEmail(email));
    } else {
      // Salva o email no contexto global ANTES de navegar
      setRegistrationData({ email: email });

      router.navigate("./senha");
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
              onChangeText={(text) => setEmail(text)}
            />

            {!isEmailValid && (
              <Text
                style={{
                  color: "#ff0000",
                  fontSize: 16,
                  fontFamily: "TTMilksCasualPie",
                }}
              >
                Email inválido!
              </Text>
            )}

            <Image
              source={require("@/assets/images/poses_tuti/tuti_oi.png")}
              style={styles.mascote}
              accessibilityLabel="Mascote Tuti apontando para a tela"
            />

            <PinkButton
              title="Próximo"
              onPress={handleGoNext}
              style={{ marginTop: 20 }}
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
});

export default EmailPage;
