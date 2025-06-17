import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import PinkButton from "@/components/pinkbutton";
import BackButton from "@/components/backbutton";
import DefaultInput from "@/components/defaultinput";

import { useRegistration } from "../../context/RegistrationContext";

const { width } = Dimensions.get("window");

export default function Nome() {
  const [name, setName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook

  function goNext() {
    // Validate the name input
    if (name.trim().length < 2) {
      setIsNameValid(false);
      return;
    } else {
      setIsNameValid(true);

      // Salva o nome no contexto antes de navegar
      setRegistrationData({ nome: name });

      router.navigate("./idade");
    }
  }

  const handleChange = (text) => {
    // regex to accept only letters, spaces, and hyphens
    const regex = /^[a-zA-ZÀ-ÿ\s-]*$/;
    if (!regex.test(text)) {
      // If the input does not match the regex, prevent input
      return;
    }
    // Update the state with the valid name
    setName(text);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={require("../../assets/images/bg_register.png")}
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

            <Text style={styles.title}>QUAL O NOME DA CRIANÇA?</Text>

            <DefaultInput
              placeholder="Nome"
              placeholderTextColor="#d3d3d3"
              onChangeText={(text) => handleChange(text)}
              value={name}
            />

            {!isNameValid && (
              <Text style={styles.errorText}>O NOME É INVÁLIDO!</Text>
            )}

            <Image
              source={require("../../assets/images/poses_tuti/tuti_7.png")}
              style={styles.mascote}
              accessibilityLabel="Mascote Tuti sorrindo"
            />

            <PinkButton title="Próximo" onPress={goNext} />
          </View>
        </ImageBackground>
      </ScrollView>
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
    marginTop: 50,
  },

  errorText: {
    color: "#ff0000",
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
  },

  mascote: {
    width: "100%",
    height: width * 0.8,
    resizeMode: "contain",
    marginVertical: 10,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
