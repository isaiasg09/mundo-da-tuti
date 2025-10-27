import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import { useRegistration } from "@/context/RegistrationContext";
import BackButton from "../../components/backbutton";
import PinkButton from "../../components/pinkbutton";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const PARENTESCO_OPTIONS = [
  { label: "Pai/Mãe", value: "pai_mae" },
  { label: "Avô/Avó", value: "avo_avo" },
  { label: "Responsável legal", value: "responsavel_legal" },
  { label: "Cuidador(a)", value: "cuidador" },
  { label: "Professor(a)", value: "professor" },
  { label: "Terapeuta", value: "terapeuta" },
  { label: "Outro", value: "outro" },
];

export default function Parentesco() {
  const { registrationData, setRegistrationData } = useRegistration();
  const [selectedParentesco, setSelectedParentesco] = useState(
    registrationData.parentesco || ""
  );
  const [outroParentesco, setOutroParentesco] = useState(
    registrationData.outroParentesco || ""
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const handleParentescoSelect = (value) => {
    setSelectedParentesco(value);
    setShowDropdown(false);

    // Se não for "outro", limpar o campo de especificação
    if (value !== "outro") {
      setOutroParentesco("");
    }
  };

  const handleContinue = () => {
    if (!selectedParentesco) {
      Alert.alert("Atenção", "Por favor, selecione seu parentesco com a criança.");
      return;
    }

    if (selectedParentesco === "outro" && !outroParentesco.trim()) {
      Alert.alert("Atenção", "Por favor, especifique seu parentesco com a criança.");
      return;
    }

    // Salvar dados no contexto
    // Se for "outro", salva o texto digitado pelo usuário no campo parentesco
    const parentescoValue =
      selectedParentesco === "outro" ? outroParentesco.trim() : selectedParentesco;

    // console.log("Salvando parentesco no contexto:", parentescoValue);
    setRegistrationData({
      parentesco: parentescoValue,
    });

    // Navegar para próxima tela (código de segurança)
    router.push("./codigo");
  };

  const getSelectedLabel = () => {
    const option = PARENTESCO_OPTIONS.find((opt) => opt.value === selectedParentesco);
    return option ? option.label : "Selecione uma opção";
  };

  return (
    <ImageBackground
      source={require("../../assets/images/bg_register.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          <BackButton style={styles.backButton} />
        </View>
        <View style={styles.container}>
          {/* Título */}
          <Text style={styles.title}>Qual seu parentesco com a criança?</Text>

          {/* Dropdown de Parentesco */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Parentesco:</Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                showDropdown && styles.dropdownActive,
                !selectedParentesco && styles.dropdownPlaceholder,
              ]}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedParentesco && styles.dropdownPlaceholderText,
                ]}
              >
                {getSelectedLabel()}
              </Text>
              <Text style={styles.dropdownArrow}>{showDropdown ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {/* Lista de opções do dropdown */}
            {showDropdown && (
              <View style={styles.dropdownList}>
                {PARENTESCO_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dropdownOption,
                      selectedParentesco === option.value &&
                        styles.dropdownOptionSelected,
                    ]}
                    onPress={() => handleParentescoSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        selectedParentesco === option.value &&
                          styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Campo para especificar "Outro" */}
          {selectedParentesco === "outro" && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Especifique:</Text>
              <TextInput
                style={styles.textInput}
                value={outroParentesco}
                onChangeText={setOutroParentesco}
                placeholder="Digite seu parentesco com a criança"
                placeholderTextColor="#999"
                maxLength={50}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>
          )}

          {/* Botão Continuar */}
          <PinkButton
            title="CONTINUAR"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  scrollContainer: {
    // flex: 1,
    justifyContent: "center",
  },
  backButton: {
    // position: "absolute",
    // top: verticalScale(20),
    // left: scale(20),
    // zIndex: 10,
    marginTop: verticalScale(20),
    marginLeft: scale(10),
  },
  container: {
    // flex: 1,
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(5),
    paddingBottom: verticalScale(40),
    justifyContent: "center",
    // backgroundColor: "red",
  },
  title: {
    fontSize: moderateScale(24),
    color: "#48899d",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    marginBottom: verticalScale(50),
    lineHeight: moderateScale(35),
  },
  inputContainer: {
    marginBottom: verticalScale(25),
    position: "relative",
  },
  label: {
    fontSize: moderateScale(16),
    color: "#ffffffff",
    fontFamily: "TTMilksCasualPie",
    marginBottom: verticalScale(8),
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dropdown: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: moderateScale(15),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    borderWidth: 2,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dropdownActive: {
    borderColor: "#ff66c4",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownPlaceholder: {
    borderColor: "#ddd",
  },
  dropdownText: {
    fontSize: moderateScale(16),
    color: "#333",
    fontFamily: "TTMilksCasualPie",
    flex: 1,
  },
  dropdownPlaceholderText: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: moderateScale(14),
    color: "#666",
    fontFamily: "TTMilksCasualPie",
  },
  dropdownList: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 2,
    borderColor: "#ff66c4",
    borderTopWidth: 0,
    borderBottomLeftRadius: moderateScale(15),
    borderBottomRightRadius: moderateScale(15),
    // maxHeight: verticalScale(200),
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  dropdownOption: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownOptionSelected: {
    backgroundColor: "rgba(255, 102, 196, 0.1)",
  },
  dropdownOptionText: {
    fontSize: moderateScale(16),
    color: "#333",
    fontFamily: "TTMilksCasualPie",
  },
  dropdownOptionTextSelected: {
    color: "#ff66c4",
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: moderateScale(15),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    fontSize: moderateScale(16),
    color: "#333",
    fontFamily: "TTMilksCasualPie",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  continueButton: {
    marginTop: verticalScale(40),
    width: "100%",
    height: verticalScale(55),
    backgroundColor: "#ff66c4",
    elevation: 5,
  },
});
