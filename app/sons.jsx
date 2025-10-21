import { Slider } from "@miblanchard/react-native-slider";
import React, { useState } from "react";
import { ImageBackground, SafeAreaView, StyleSheet, Text, View } from "react-native";

import BackButton from "../components/backbutton";

export default function Sons() {
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/images/config_bg.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.container}>
          {/* Botão de voltar */}
          <BackButton style={styles.backButton} />

          <Text style={styles.title}>CONFIGURAÇÃO DE SONS</Text>

          <View style={styles.boxConfigs}>
            {/* Music Effects Slider */}
            <Text style={styles.sliderLabel}>MÚSICA 🎵</Text>

            <Slider
              value={musicVolume}
              onValueChange={setMusicVolume}
              minimumTrackTintColor="#81b3ff"
              maximumTrackTintColor="#FFDAB9"
              thumbTintColor="transparent"
              trackStyle={{ height: 10, borderRadius: 10 }}
            />

            <Text style={styles.sliderLabel}>EFEITOS DE SOM 🔊</Text>

            <Slider
              value={sfxVolume}
              onValueChange={setSfxVolume}
              minimumTrackTintColor="#81b3ff"
              maximumTrackTintColor="#FFDAB9"
              thumbTintColor="transparent"
              trackStyle={{ height: 10, borderRadius: 10 }}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  sliderSection: {
    width: "100%", // Take full width of the container
  },

  slider: {
    width: "100%",
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

  boxConfigs: {
    backgroundColor: "#ffdb4d5e",
    padding: 16,
    width: "90%",
    borderRadius: 20,
  },

  title: {
    fontSize: 24,
    fontFamily: "TTMilksCasualPie",
    textTransform: "uppercase",
    color: "#f453b6",
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 20,
    fontFamily: "TTMilksCasualPie",
    color: "#476bb4",
    marginTop: 10,
  },

  backButton: {
    alignSelf: "flex-start",
  },
});
