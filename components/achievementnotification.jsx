import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");

const AchievementNotification = ({ achievement, visible, onHide, onPress }) => {
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible && achievement) {
      // Animação de entrada
      translateY.value = withTiming(0, { duration: 500 });
      opacity.value = withTiming(1, { duration: 500 });
      scale.value = withSequence(
        withTiming(1.1, { duration: 300 }),
        withTiming(1, { duration: 200 })
      );

      // Auto-hide após 4 segundos
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, achievement]);

  const hideNotification = () => {
    translateY.value = withTiming(-200, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onHide)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (!visible || !achievement) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={styles.notification}
        onPress={() => {
          hideNotification();
          if (onPress) onPress(achievement);
        }}
        activeOpacity={0.9}
      >
        {/* Brilho de fundo */}
        <View style={styles.glow} />

        {/* Conteúdo */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>🏆 CONQUISTA DESBLOQUEADA!</Text>
          </View>

          <View style={styles.achievementInfo}>
            <Image
              source={achievement.image}
              style={styles.achievementImage}
              resizeMode="contain"
            />

            <View style={styles.textContainer}>
              <Text style={styles.achievementTitle} numberOfLines={2}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription} numberOfLines={2}>
                {achievement.description}
              </Text>
            </View>
          </View>

          <Text style={styles.tapHint}>Toque para ver detalhes</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: verticalScale(50),
    left: scale(20),
    right: scale(20),
    zIndex: 1000,
    elevation: 1000,
  },
  notification: {
    backgroundColor: "#FFD700",
    borderRadius: scale(20),
    padding: scale(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 3,
    borderColor: "#FFA500",
  },
  glow: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: "#FFD700",
    borderRadius: scale(25),
    opacity: 0.3,
    zIndex: -1,
  },
  content: {
    alignItems: "center",
  },
  header: {
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(16, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#8B4513",
    textAlign: "center",
  },
  achievementInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
    width: "100%",
  },
  achievementImage: {
    width: scale(60),
    height: scale(60),
    marginRight: scale(12),
  },
  textContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: moderateScale(18, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#8B4513",
    marginBottom: verticalScale(4),
  },
  achievementDescription: {
    fontSize: moderateScale(14, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#A0522D",
  },
  tapHint: {
    fontSize: moderateScale(12, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#8B4513",
    fontStyle: "italic",
  },
});

export default AchievementNotification;
