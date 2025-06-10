import React from "react";
import { TextInput } from "react-native";

export default function DefaultInput({ ...rest }) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <TextInput
      style={[
        {
          borderRadius: 30,
          padding: 20,
          width: "100%",
          fontSize: 16,
          fontFamily: "TTMilksCasualPie",
          backgroundColor: "#f3fcff",
          color: "#5483c4",
          // marginBottom: "5%",
        },
        isFocused && {
          backgroundColor: "#ffffff",
          shadowOpacity: 0.15,
          elevation: 4,
        },
      ]}
      placeholder="Digite aqui"
      placeholderTextColor="#2f5195"
      {...rest}
      onFocus={() => {
        setIsFocused(true);
      }}
      onBlur={() => setIsFocused(false)}
    />
  );
}
