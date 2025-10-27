import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Conquista({
  title = "Conquista",
  image = "",
  unlocked = true,
  onPress = null,
}) {
  const Component = onPress ? TouchableOpacity : View;

  if (unlocked) {
    return (
      <Component
        style={{ alignItems: "center", gap: 2 }}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#bbe685",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <Image
            source={image || require("../assets/images/conquistas/conquista1.png")}
            style={{ width: 70, height: 70 }}
          />
        </View>

        <Text
          style={{
            fontFamily: "TTMilksCasualPie",
            color: "#48899d",
            fontSize: 12,
            textAlign: "center",
            maxWidth: 100,
          }}
        >
          {title}
        </Text>
      </Component>
    );
  } else {
    return (
      <Component style={{ alignItems: "center", gap: 2 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#6ecfff",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <Image
            source={require("../assets/images/cadeado.webp")}
            style={{ width: 70, height: 70, opacity: 0.5 }}
          />
        </View>
      </Component>
    );
  }
}
// Componente de Conquista (placeholder)
