import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import BackButton from "@/components/backbutton";
import DefaultInput from "@/components/defaultinput";
import PinkButton from "@/components/pinkbutton";
import { router } from "expo-router";

import { useRegistration } from "../../context/RegistrationContext";

const { width } = Dimensions.get("window");

export default function Senha() {
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState("É importante usar uma senha forte!");
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook

  function handleGoNext() {
    if (senha.length < 5) {
      setMessage("A senha deve ter pelo menos 5 caracteres.");
    } else {
      // Salva a senha no contexto global ANTES de navegar
      setRegistrationData({ senha: senha });

      router.navigate("./codigo");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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

          <Text style={styles.title}>DIGITE UMA SENHA:</Text>

          <DefaultInput
            placeholder="Senha"
            secureTextEntry={true}
            onChangeText={(text) => setSenha(text)}
          />

          <Text style={styles.subtitle}>
            {/* change text content if senha lenght < 5 but only after press button */}
            {message || "A senha deve ter pelo menos 5 caracteres."}
          </Text>

          <Image
            source={require("../../assets/images/poses_tuti/tuti_olhos.png")}
            style={styles.mascote}
            accessibilityLabel="Mascote Tuti dando dica de segurança"
          />

          <PinkButton
            title="PROXIMO"
            onPress={handleGoNext}
            style={{ marginTop: 20 }}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

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
    justifyContent: "flex-start",
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 26,
  },

  title: {
    fontFamily: "TTMilksCasualPie",
    color: "#48899d",
    fontSize: 22,
    textAlign: "center",
    marginTop: 20,
  },

  subtitle: {
    color: "red",
    fontFamily: "TTMilksCasualPie",
    fontSize: 14,
    textAlign: "center",
    textTransform: "uppercase",
  },

  mascote: {
    width: width * 0.9,
    height: width * 0.9,
    resizeMode: "contain",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
