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

export default function Idade() {
  const [idade, setIdade] = useState("");
  const [isIdadeValid, setIsIdadeValid] = useState(true);
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook

  function goNext() {
    // Validate the idade input
    if (idade.trim().length === 0 || isNaN(idade) || idade < 1 || idade > 99) {
      setIsIdadeValid(false);
      return;
    } else {
      setIsIdadeValid(true);

      // Salva a idade no contexto antes de navegar
      setRegistrationData({ idade: idade });

      router.navigate("./pergunta1");
    }
  }

  const handleChange = (text) => {
    // regex to accept only numbers, no space, but accept empty input
    const regex = /^[0-9]*$/; // Allows empty input and numbers only
    if (!regex.test(text)) {
      // If the input does not match the regex, prevent input
      return;
    }
    // Update the state with the valid name
    setIdade(text);
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

            <Text style={styles.texto}>QUAL A IDADE DELE(A)?</Text>

            <DefaultInput
              placeholder="Idade"
              // placeholderTextColor="#d3d3d3"
              keyboardType="numeric"
              maxLength={2}
              // minLength={1}
              onChangeText={(text) => handleChange(text)}
              value={idade}
            />

            {!isIdadeValid && (
              <Text style={styles.errorText}>A IDADE É INVÁLIDA!</Text>
            )}

            <Image
              source={require("../../assets/images/poses_tuti/tuti_7.png")}
              style={styles.mascote}
              accessibilityLabel="Mascote Tuti feliz"
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
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
    paddingTop: 26,
    paddingHorizontal: 24,
  },

  texto: {
    color: "#48899d",
    fontFamily: "TTMilksCasualPie",
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
