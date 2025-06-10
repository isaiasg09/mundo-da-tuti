import React, { useState } from "react"; // Removido useEffect se não estiver usando
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground, // Image importada mas não usada, ImageBackground sim
  SafeAreaView, // SafeAreaView importada mas não usada no seu return, ImageBackground é o root
  Dimensions,
  ScrollView,
} from "react-native";

import { router } from "expo-router";

import { useRegistration } from "../../context/RegistrationContext";

import ProgressBar from "@/components/progressbar";
import BackButton from "@/components/backbutton";

const options = ["TEA", "TOD", "TDAH", "NENHUMA"];
const { width: screenWidth } = Dimensions.get("window"); // Pega a largura da tela

export default function Pergunta1() {
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook
  // Inicializa selectedButtons com os valores do contexto, se houver
  const [selectedButtons, setSelectedButtons] = useState(() => {
    // Converte os nomes das síndromes salvas de volta para índices
    return registrationData.sindromesCrianca
      .map((syndromeName) => options.indexOf(syndromeName))
      .filter((index) => index !== -1);
  });

  const toggleButtonSelection = (index) => {
    const optionName = options[index];

    const isNenhuma = options[index] === "NENHUMA";

    let newSelectedSyndromes = []; // Array para os nomes das síndromes

    if (isNenhuma) {
      // Se "NENHUMA" é clicado

      const isCurrentlySelected = selectedButtons.includes(index);
      if (isCurrentlySelected) {
        // Se já estava selecionado, desmarca
        setSelectedButtons([]);
        newSelectedSyndromes = [];
      } else {
        // Se não estava, marca apenas "NENHUMA"
        setSelectedButtons([index]);
        newSelectedSyndromes = ["NENHUMA"];
      }
    } else {
      // Se outra opção é clicada
      let currentSelections = [...selectedButtons];
      // Remove "NENHUMA" se estava selecionado
      const nenhumaIndex = options.indexOf("NENHUMA");
      if (currentSelections.includes(nenhumaIndex)) {
        currentSelections = []; // Limpa tudo se NENHUMA estava e outra foi clicada
      }

      if (currentSelections.includes(index)) {
        // Se já está selecionado, remove
        currentSelections = currentSelections.filter((i) => i !== index);
      } else {
        // Se não está, adiciona
        currentSelections.push(index);
      }
      setSelectedButtons(currentSelections);
      newSelectedSyndromes = currentSelections.map((i) => options[i]);
    }
    // Atualiza o contexto global com os NOMES das síndromes
    setRegistrationData({ sindromesCrianca: newSelectedSyndromes });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/bg_register.png")}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      {/* SafeAreaView é bom para o conteúdo principal, mas seu ScrollView já está dentro do ImageBackground */}
      {/* Se precisar de SafeArea, envolva o ScrollView ou o conteúdo dentro dele */}
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer} // Mudado para scrollViewContainer para clareza
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerNavigation}>
          <BackButton title="Voltar" />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>SOBRE A CRIANÇA</Text>
          <Text style={styles.instruction}>PREENCHA OS ITENS ABAIXO:</Text>
          <Text style={styles.question}>
            A CRIANÇA É PORTADORA DE ALGUMA SÍNDROME?
          </Text>
        </View>

        {/* Container dos botões de opção */}
        <View style={styles.optionsGridContainer}>
          {options.map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton, // Estilo base do botão
                selectedButtons.includes(index) && styles.buttonSelected, // Estilo quando selecionado
              ]}
              onPress={() => toggleButtonSelection(index)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedButtons.includes(index) && styles.optionTextSelected, // Estilo do texto quando selecionado
                  label === "NENHUMA" && styles.optionTextNenhuma, // Estilo específico para "NENHUMA"
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              // Botão só é opaco e clicável se alguma opção for selecionada
              { opacity: selectedButtons.length > 0 ? 1 : 0.5 },
            ]}
            onPress={() => {
              if (selectedButtons.length > 0) {
                router.navigate("./pergunta2");
              }
            }}
            disabled={selectedButtons.length === 0} // Desabilita se nada selecionado
            activeOpacity={0.7} // Opacidade padrão para quando clicável
          >
            <Text style={styles.nextButtonText}>PRÓXIMO</Text>
          </TouchableOpacity>
        </View>
        <ProgressBar step={1} totalSteps={6} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    // justifyContent e alignItems aqui podem não ser necessários se ScrollView cuida do layout interno
  },
  scrollViewContainer: {
    // Estilo para o contentContainer do ScrollView
    flexGrow: 1, // Permite que o conteúdo cresça e o scroll funcione se necessário
    alignItems: "center", // Centraliza o conteúdo horizontalmente
    justifyContent: "space-between", // Distribui o espaço entre header, opções e bottom
    paddingHorizontal: 24,
    paddingTop: 26, // Espaço no topo dentro do scroll
    paddingBottom: 30, // Espaço na base dentro do scroll
  },
  headerNavigation: {
    // Para o botão Voltar
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
  },
  headerContent: {
    // Para os textos de cabeçalho
    alignItems: "center",
    width: "100%",
    marginBottom: 30, // Espaço antes das opções
  },
  title: {
    fontSize: 32, // Ajuste conforme necessário
    color: "#1e3a8a",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
  },
  instruction: {
    fontSize: 20,
    color: "rgba(72, 137, 157, 0.81)",
    fontFamily: "TTMilksCasualPie",
    marginTop: 20,
    textAlign: "center",
  },
  question: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "TTMilksCasualPie",
    marginTop: 25,
    textAlign: "center",
    width: "100%",
    textShadowColor: "#48899d",
    textShadowOffset: { height: 1.5 },
    textShadowRadius: 2,
    elevation: 3,
  },
  optionsGridContainer: {
    // Renomeado de buttonContainer para clareza
    flexDirection: "row", // Organiza os botões em linhas
    flexWrap: "wrap", // Permite que os botões quebrem para a próxima linha
    justifyContent: "space-around", // Distribui espaço horizontalmente entre e ao redor dos botões
    width: "100%", // Ocupa a largura total disponível
    maxWidth: 500, // Largura máxima para o container dos botões em telas grandes
    alignItems: "center", // Alinha os botões no centro do eixo cruzado (verticalmente, neste caso)
    // O 'gap' pode ser aplicado aqui se preferir, ou margens nos botões
    // Se usar gap no container, remova margin dos optionButton
    // gap: 10,
    marginBottom: 30, // Espaço antes do botão PRÓXIMO
  },
  optionButton: {
    // Para ter 2 botões por linha com algum espaço:
    // (100% da largura do container / 2 botões) - (espaço para margens/gap)
    // Ex: Se o container tem padding, screenWidth pode não ser 100% da área útil para os botões
    // Vamos usar uma porcentagem da largura do optionsGridContainer
    width: "46%", // Aproximadamente 2 por linha, deixando espaço para o gap/margin
    aspectRatio: 2 / 1.1, // Mantém a proporção do botão (largura é o dobro da altura)
    // Ex: se width for 150, height será +/- 80.
    // height: 80, // Removido para usar aspectRatio ou padding para altura dinâmica
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 25, // Bordas mais suaves
    alignItems: "center",
    justifyContent: "center",
    margin: "2%", // Margem para dar espaçamento entre os botões
    // Se usar 'gap' no container, pode remover 'margin' aqui.
    paddingVertical: 10, // Padding para altura, se não usar height ou aspectRatio fixo
  },
  buttonSelected: {
    backgroundColor: "rgba(255, 131, 207, 0.7)", // Cor rosa quando selecionado
  },
  optionText: {
    color: "#3b5db6", // Azul para o texto da opção
    fontSize: 30,
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
  },
  optionTextSelected: {
    // Estilo para o texto do botão selecionado
    color: "#fff", // Branco quando selecionado
  },
  optionTextNenhuma: {
    // Estilo específico para o texto "NENHUMA"
    fontSize: 22, // Menor que os outros textos
  },
  bottomContainer: {
    width: "100%", // Garante que o container ocupe a largura para centralizar o botão
    alignItems: "center", // Centraliza o botão PRÓXIMO
    paddingBottom: 20, // Reduzido o padding inferior, ajuste conforme necessário
  },
  nextButton: {
    backgroundColor: "#ff4db8",
    paddingHorizontal: 40, // Ajustado padding
    paddingVertical: 12, // Ajustado padding
    borderRadius: 30, // Mais arredondado
    marginBottom: 20, // Espaço antes da ProgressBar
    minWidth: "60%", // Largura mínima para o botão
    alignItems: "center", // Centraliza o texto do botão
  },
  nextButtonText: {
    color: "white",
    fontSize: 28,
    fontFamily: "TTMilksCasualPie",
  },
});
