import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function DefaultInput({
  showToggle = false,
  secureTextEntry,
  style,
  ...rest
}) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isSecure, setIsSecure] = React.useState(!!secureTextEntry);

  React.useEffect(() => {
    setIsSecure(!!secureTextEntry);
  }, [secureTextEntry]);

  if (!showToggle) {
    // Comportamento padrão, sem ícone
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
          },
          isFocused && {
            backgroundColor: "#ffffff",
            shadowOpacity: 0.15,
            elevation: 4,
          },
          style,
        ]}
        placeholder="Digite aqui"
        placeholderTextColor="#2f5195"
        secureTextEntry={secureTextEntry}
        {...rest}
        onFocus={(e) => {
          setIsFocused(true);
          rest?.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          rest?.onBlur?.(e);
        }}
      />
    );
  }

  // Com ícone de mostrar/ocultar
  return (
    <View style={{ position: "relative", width: "100%", overflow: "visible" }}>
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
            paddingRight: 64, // mais espaço para o botão de olho
          },
          style,
        ]}
        placeholder="Digite aqui"
        placeholderTextColor="#2f5195"
        secureTextEntry={isSecure}
        {...rest}
        onFocus={(e) => {
          setIsFocused(true);
          rest?.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          rest?.onBlur?.(e);
        }}
      />

      <TouchableOpacity
        onPress={() => setIsSecure((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={isSecure ? "Mostrar senha" : "Ocultar senha"}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          position: "absolute",
          right: 20,
          top: 0,
          bottom: 0, // centraliza verticalmente
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
          zIndex: 100,
          elevation: 8, // fica acima do TextInput com elevation 4
        }}
      >
        <Text style={{ fontSize: 18 }}>{isSecure ? "👁️" : "🙈"}</Text>
      </TouchableOpacity>
    </View>
  );
}
