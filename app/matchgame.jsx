import GameHeader from "@/components/gameheader";
import { Image, ImageBackground } from "expo-image";
import { Dimensions, Text, View } from "react-native";

const backgroundImg = require("../assets/images/bg_second_tall.png");
const { width, height } = Dimensions.get("window");

export default function MatchGame() {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={backgroundImg}
        style={{
          flex: 1,
          width: width,
          height: height,
        }}
        // contentFit="cover"
        // contentPosition="center"
      >
        <GameHeader />

        <Text
          style={{
            color: "white",
            fontSize: 24,
            fontFamily: "TTMilksCasualPie",
            textAlign: "center",
          }}
        >
          Acertos: 0
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          {/* view das imagens */}
          <View>
            <View
              style={{
                alignItems: "center",
                backgroundColor: "#fef294",
                padding: 5,
                borderRadius: 10,
              }}
            >
              <Image source={require("../assets/images/combinacao/concha.webp")} />
            </View>
          </View>

          {/* view das letras */}
          <View>
            <View
              style={{
                alignItems: "center",
                backgroundColor: "#ffe6f6",
                padding: 5,
                borderColor: "#cb6ce6",
                borderWidth: 2,
                borderRadius: 10,
              }}
            >
              <Text>C</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
