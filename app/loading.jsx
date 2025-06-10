import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";

export default function Loading() {
  const router = useRouter();

  const textoLogo = require("../assets/images/textologo.png");
  const tutiFesta = require("../assets/images/tuti_festa.png");
  const mundoImg = require("../assets/images/mundo.png");

  // useEffect(() => {
  // });

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
        // justifyContent: "start",
        paddingTop: 50,
      }}
    >
      <Image
        source={textoLogo}
        style={{
          width: 300,
          // backgroundColor: "white",
          height: 160,
        }}
        resizeMode="contain"
      />
      <Image
        source={tutiFesta}
        style={{
          // width: 300,
          height: 380,
          // backgroundColor: "white",
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
              // outros estilos opcionais...
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

// const styles = StyleSheet.create({
//   container:
// });
