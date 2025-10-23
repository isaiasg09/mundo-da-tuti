import React, { useEffect } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Variantes suportadas: 'shell' | 'pearl'
// Props:
// id (number), x, y (center coordinates), state ('locked'|'unlocked'|'completed'), variant,
// onPress(levelMeta), images (array opcional para shells), glowImg, mainImg (para pearl), index
export default function LevelNode({
  id,
  x,
  y,
  state = "locked",
  variant = "shell",
  onPress,
  images = [],
  glowImg,
  mainImg,
  index = 0,
  disabled,
  disableAutoPosition = false,
  pulse = true,
  containerStyle,
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pulse && state !== "locked") {
      scale.value = withRepeat(withTiming(1.05, { duration: 1300 }), -1, true);
    }
  }, [state, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (state === "locked" || disabled) return;
    onPress && onPress({ id, state, variant, index });
  };

  const locked = state === "locked";
  const completed = state === "completed";

  // Dimensionamento por variante
  const size = variant === "shell" ? 85 : variant === "star" ? 70 : 60;
  // make an if clause for variante star
  const glowSize = variant === "shell" ? 225 : variant === "star" ? 150 : 200;
  const glowOffset = variant === "shell" ? -60 : variant === "star" ? -40 : -70;

  const shellImage =
    variant === "shell" && images.length > 0 ? images[(id - 1) % images.length] : null;

  // Always use ImageBackground because we render children (label/lock) inside
  const ContainerImage = ImageBackground;
  const containerImageSource = variant === "shell" ? shellImage : mainImg;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        !disableAutoPosition && { top: y - size / 2, left: x - size / 2 },
        { width: size + 15, height: size + 15 },
        pulse && animatedStyle,
        containerStyle,
      ]}
      accessibilityLabel={`Nível ${id} ${locked ? "bloqueado" : "disponível"}`}
      accessible
      pointerEvents="box-none"
    >
      {/* Glow layer - completamente isolado e atrás de tudo */}
      {glowImg && (
        <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
          <Image
            source={glowImg}
            resizeMode="contain"
            style={[
              styles.glow,
              {
                width: glowSize,
                height: glowSize,
                top: glowOffset,
                left: glowOffset,
                opacity: variant === "pearl" ? 0.9 : 1,
              },
            ]}
            pointerEvents="none"
          />
        </View>
      )}

      {/* Botão clicável - sempre acima do glow */}
      <TouchableOpacity
        activeOpacity={locked ? 1 : 0.6}
        onPress={handlePress}
        style={{ flex: 1, zIndex: 10 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ContainerImage
          source={containerImageSource}
          resizeMode="contain"
          style={[
            variant === "shell" ? styles.shellImage : styles.pearlImage,
            { width: size, height: size },
            locked && variant === "shell" && { opacity: 0.6 },
            locked && variant === "pearl" && { opacity: 0.5 },
          ]}
        >
          <Text
            style={[
              variant === "shell" || variant === "star"
                ? styles.shellLabel
                : styles.pearlLabel,
            ]}
          >
            {id}
          </Text>
          {locked && <Text style={styles.lockSymbol}>🔒</Text>}

          {completed && (
            <View style={styles.completedBadge} pointerEvents="none">
              <Text style={styles.completedCheck}>✓</Text>
            </View>
          )}
        </ContainerImage>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    zIndex: -99,
  },
  shellImage: {
    width: 85,
    height: 85,
    justifyContent: "center",
    alignItems: "center",
  },
  pearlImage: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  shellLabel: {
    fontFamily: "TTMilksCasualPie",
    fontSize: 30,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  pearlLabel: {
    fontFamily: "TTMilksCasualPie",
    fontSize: 28,
    color: "#f08faf",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  lockSymbol: {
    position: "absolute",
    bottom: 4,
    fontSize: 20,
    color: "#fff",
  },
  completedBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    minWidth: 18,
    minHeight: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  completedCheck: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 16,
  },
});
