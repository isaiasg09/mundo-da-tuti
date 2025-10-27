import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";

export default function Loading() {
  const textoLogo = require("../assets/images/textologo.png");
  const tutiFesta = require("../assets/images/tuti_festa.png");
  const mundoImg = require("../assets/images/mundo.png");

  // Pré-carrega alguns assets críticos (shells, pérola, bolha, sombras, peixes)
  useEffect(() => {
    if (__DEV__) return;
    (async () => {
      try {
        const mod = await import("expo-asset");
        const { Asset } = mod;
        const assets = [
          // UI comuns
          require("../assets/images/icons/sound_icon.png"),
          require("../assets/images/bolha.png"),
          require("../assets/images/sombra.png"),
          // Conchas e brilho
          require("../assets/images/shells/shell1.png"),
          require("../assets/images/shells/shell2.png"),
          require("../assets/images/shells/shell3.png"),
          require("../assets/images/shells/shell4.png"),
          require("../assets/images/shells/shell5.png"),
          require("../assets/images/brilho.png"),
          // Pérola e glow
          require("../assets/images/perola.png"),
          require("../assets/images/wm_s2.png"),
          // Peixes
          require("../assets/images/fishs/fish1.png"),
          require("../assets/images/fishs/fish2.png"),
          require("../assets/images/fishs/fish3.png"),
          require("../assets/images/fishs/fish4.png"),
          require("../assets/images/fishs/fish5.png"),
        ];
        await Promise.all(assets.map((a) => Asset.fromModule(a).downloadAsync()));
      } catch (e) {
        // Se o pacote não estiver instalado, apenas ignore silenciosamente
      }
    })();
  }, []);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Gira a imagem continuamente
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotatingStyle = {
    transform: [{ rotate: spin }],
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff6a5",
        alignItems: "center",
        paddingTop: 50,
      }}
    >
      <Image
        source={textoLogo}
        style={{
          width: 300,
          height: 160,
        }}
        resizeMode="contain"
      />
      <Image
        source={tutiFesta}
        style={{
          height: 380,
        }}
        resizeMode="contain"
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: -20,
          paddingTop: 0,
        }}
      >
        <Animated.Image
          source={mundoImg}
          resizeMode="contain"
          style={[
            {
              height: 150,
            },
            rotatingStyle,
          ]}
        />

        <Text
          style={{
            color: "#5483c4",
            textTransform: "uppercase",
            fontFamily: "TTMilksCasualPie",
            fontSize: 20,
          }}
        >
          Carregando...
        </Text>
      </View>
    </View>
  );
}
