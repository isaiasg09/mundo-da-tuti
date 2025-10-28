import { StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function PinkButton({ title, style, ...rest }) {
  return (
    <TouchableOpacity style={[styles.button, styles.elevation, style]} {...rest}>
      <Text style={styles.Vtext}>{title}</Text>
    </TouchableOpacity>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  button: {
    minWidth: scale(140),
    maxWidth: screenWidth * 0.8, // 80% da largura da tela
    width: '100%',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    backgroundColor: "#ff66c4",
    borderRadius: moderateScale(20),
    justifyContent: "center",
    alignItems: "center",
  },

  Vtext: {
    color: "#fff",
    fontFamily: "TTMilksCasualPie",
    fontSize: moderateScale(20),
    textAlign: 'center',
    flexShrink: 1, // Permite que o texto se ajuste se necessário
  },

  elevation: {
    elevation: 20,
    shadowColor: "#52006A",
  },
});
