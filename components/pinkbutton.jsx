import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  StyleSheet,
} from "react-native";

export default function PinkButton({ title, style, ...rest }) {
  return (
    <TouchableOpacity
      style={[styles.button, styles.elevation, style]}
      {...rest}
    >
      <Text style={styles.Vtext}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 175,
    // height: 50,
    padding: 20,
    backgroundColor: "#ff66c4",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // text: {
  //   color: "#fff",
  //   fontFamily: "Fredoka_600SemiBold",
  //   fontSize: 25,
  //   padding: 5,
  // },

  Vtext: {
    color: "#fff",
    fontFamily: "TTMilksCasualPie",
    fontSize: 22,
    // padding: 5,
  },

  elevation: {
    elevation: 20,
    shadowColor: "#52006A",
  },
});
