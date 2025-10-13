import { Image, Text, View } from "react-native";
export default function Conquista({ title = "Conquista", image = "", unlocked = true }) {
  if (unlocked) {
    return (
      <View style={{ alignItems: "center", gap: 2 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#bbe685",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <Image
            source={require("../assets/images/conquistas/conquista1.webp")}
            style={{ width: 70, height: 70 }}
          />
        </View>

        <Text style={{ fontFamily: "TTMilksCasualPie", color: "#48899d", fontSize: 12 }}>
          Conquista 1
        </Text>
      </View>
    );
  } else {
    return (
      <View style={{ alignItems: "center", gap: 2 }}>
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

        {/* <Text style={{ fontFamily: "TTMilksCasualPie", color: "#b0b0b0", fontSize: 12 }}>
          Conquista Trancada
        </Text> */}
      </View>
    );
  }
}
// Componente de Conquista (placeholder)
