import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import React from "react";
import BackButton from "../components/backbutton";
import PinkButton from "../components/pinkbutton";
// import { Button } from "../components/button/buttons";
// import { Input } from "../components/input/input";

const { width } = Dimensions.get("window");

export default function Settings() {
  function goToScreen(screenName) {
    router.navigate(`./${screenName}`);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground // fundo
        source={require("../assets/images/config_bg.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.container}>
          <BackButton style={{ position: "absolute", top: 10, left: 20 }} />

          <Text style={styles.title}>Configurações</Text>

          <Image
            source={require("../assets/images/poses_tuti/perfil_1.png")}
            style={styles.foto}
          />

          <Text style={styles.subTitle}> Mudar Avatar</Text>

          {/* <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ backgroundColor: "white", }}
          > */}
          <TextInput
            placeholder="USUÁRIO"
            placeholderTextColor="#476bb4"
            style={styles.input}
          />
          {/* </ScrollView> */}

          <PinkButton
            title="SONS"
            onPress={() => goToScreen("sons")}
            style={{
              width: "75%",
              height: 50,
              padding: 0,
              marginTop: 20,
              elevation: 0,
              backgroundColor: "#ff55a7",
            }}
          />
          <PinkButton
            title="PREFERÊNCIAS"
            onPress={() => goToScreen("preferencias")}
            style={{
              width: "75%",
              height: 50,
              padding: 0,
              elevation: 0,
              backgroundColor: "#ff66c4",
            }}
          />
          <PinkButton
            title="PRIVACIDADE"
            onPress={() => goToScreen("priv_cod")}
            style={{
              width: "75%",
              height: 50,
              padding: 0,
              elevation: 0,
              backgroundColor: "#ff78cb",
            }}
          />

          <Text style={styles.subTitle}>Quem Somos?</Text>

          <Text style={styles.text}>Termos e políticas de uso</Text>

          <PinkButton
            title="SAIR"
            style={{ backgroundColor: "#ff0734", paddingVertical: 10 }}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  foto: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 100,
    resizeMode: "cover",
  },

  container: {
    flex: 1,
    gap: 15,
    padding: 24,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  safeArea: {
    alignItems: "center",
    flex: 1,
  },

  title: {
    textTransform: "uppercase",
    color: "#9d59ff",
    fontSize: 24,
    fontFamily: "TTMilksCasualPie",
  },

  subTitle: {
    color: "#f56796",
    fontFamily: "TTMilksCasualPie",
  },
  text: {
    color: "#ff3e3e",
    fontFamily: "TTMilksCasualPie",
    fontSize: 14,
    marginTop: 10,
  },

  input: {
    width: width * 0.8,
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    borderRadius: 15,
    backgroundColor: "#fbfefe",
    borderWidth: 0,
    borderColor: "#121214",
    paddingVertical: 10,
    paddingLeft: 20,
  },
});
