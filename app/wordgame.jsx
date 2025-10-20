import GameHeader from "@/components/gameheader";
import WinScreen from "@/components/WinScreen";
import { GAME_DIFFICULTY_CONFIG } from "@/constants/gameConfig";
import { useLevelNavigation } from "@/hooks/useLevelNavigation";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const backgroundImg = require("../assets/images/bg_1.png");
const { width, height } = Dimensions.get("window");

// Banco de palavras organizado por dificuldade (usando imagens temporárias existentes)
const WORD_BANK = {
  2: [
    { word: "OI", image: require("../assets/images/words/oi.png") },
    { word: "VÓ", image: require("../assets/images/words/vo.webp") },
    { word: "RÃ", image: require("../assets/images/words/ra.webp") },
    { word: "PÉ", image: require("../assets/images/words/pe.webp") },
  ],
  3: [
    { word: "OVO", image: require("../assets/images/combinacao/ancora.webp") },
    { word: "SOL", image: require("../assets/images/combinacao/estrela.png") },
    { word: "CÃO", image: require("../assets/images/combinacao/peixe.png") },
    { word: "PÃO", image: require("../assets/images/combinacao/treasure.png") },
    { word: "MÃO", image: require("../assets/images/combinacao/concha.webp") },
  ],
  4: [
    { word: "BOLA", image: require("../assets/images/combinacao/treasure.png") },
    { word: "CASA", image: require("../assets/images/castelo.png") },
    { word: "GATO", image: require("../assets/images/combinacao/peixe.png") },
    { word: "PATO", image: require("../assets/images/combinacao/peixe.png") },
    { word: "MESA", image: require("../assets/images/combinacao/treasure.png") },
  ],
  5: [
    { word: "BALÃO", image: require("../assets/images/combinacao/treasure.png") },
    { word: "CARRO", image: require("../assets/images/castelo.png") },
    { word: "FLORE", image: require("../assets/images/combinacao/estrela.png") },
    { word: "PEIXE", image: require("../assets/images/combinacao/peixe.png") },
    { word: "PASTO", image: require("../assets/images/combinacao/estrela.png") },
  ],
};

export default function WordGame() {
  const params = useLocalSearchParams();
  const { pathId, gameId } = params;
  const difficulty = params.difficulty || "facil";
  const config = GAME_DIFFICULTY_CONFIG.word[difficulty];
  const { openMap, openNext, completeLevel, onWinMarkOnly } = useLevelNavigation(pathId);

  const [currentWord, setCurrentWord] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);

  // Função para embaralhar array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Inicializar jogo
  useEffect(() => {
    const wordLength = config.wordLength;
    const wordsOfLength = WORD_BANK[wordLength] || [];

    if (wordsOfLength.length > 0) {
      // Selecionar palavra aleatória
      const randomWord = wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
      setCurrentWord(randomWord);

      // Criar letras da palavra
      const wordLetters = randomWord.word.split("").map((letter, index) => ({
        id: `word_${index}`,
        letter: letter,
        isWordLetter: true,
      }));

      // Gerar letras distratoras (não da palavra) - quantidade limitada como no design
      const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      const wordLettersOnly = randomWord.word.split("");
      const availableDistractors = allLetters.filter(
        (letter) => !wordLettersOnly.includes(letter)
      );

      // Adicionar apenas algumas letras distratoras para não ficar muito difícil
      const numDistractors = wordLength <= 3 ? 1 : 2; // 1 distrator para palavras pequenas, 2 para maiores
      const distractorLetters = shuffleArray(availableDistractors)
        .slice(0, numDistractors)
        .map((letter, index) => ({
          id: `distractor_${index}`,
          letter: letter,
          isWordLetter: false,
        }));

      // Combinar e embaralhar todas as letras
      const allAvailableLetters = shuffleArray([...wordLetters, ...distractorLetters]);
      setAvailableLetters(allAvailableLetters);
    }
  }, [config.wordLength]);

  // Função para o GameHeader
  const handleBackPress = () => {
    if (isGameWon) {
      router.replace("/home");
    } else {
      openMap();
    }
  };

  // Função para selecionar letra
  const handleLetterPress = (letterObj) => {
    // Verificar se a letra já foi selecionada
    if (selectedLetters.find((l) => l.id === letterObj.id)) return;

    // Verificar se ainda há espaço para letras
    if (selectedLetters.length >= currentWord.word.length) return;

    const newSelected = [...selectedLetters, letterObj];
    setSelectedLetters(newSelected);

    // Verificar vitória
    if (newSelected.length === currentWord.word.length) {
      const formedWord = newSelected.map((l) => l.letter).join("");
      if (formedWord === currentWord.word) {
        // Pequeno delay para mostrar a palavra completa antes da vitória
        setTimeout(() => {
          setIsGameWon(true);
        }, 500);
      }
    }
  };

  // Função para remover letra selecionada
  const handleSelectedLetterPress = (index) => {
    const newSelected = selectedLetters.filter((_, i) => i !== index);
    setSelectedLetters(newSelected);
  };

  // Marcar nível como completo quando o jogo é ganho
  useEffect(() => {
    if (isGameWon && !levelCompleted) {
      const current = Number(gameId);
      if (current) {
        setLevelCompleted(true);
        onWinMarkOnly(current);
      }
    }
  }, [isGameWon, gameId, onWinMarkOnly, levelCompleted]);

  // Se não há palavra carregada ainda
  if (!currentWord) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  // Renderizar slots da palavra
  const renderWordSlots = () => {
    const slots = [];
    // Ajustar tamanho dos slots baseado no tamanho da palavra
    const wordLength = currentWord.word.length;
    const slotWidth = wordLength >= 5 ? scale(50) : scale(60); // Menor para 5+ letras
    const slotMargin = wordLength >= 5 ? scale(6) : scale(8); // Menor espaçamento para 5+ letras

    for (let i = 0; i < currentWord.word.length; i++) {
      const selectedLetter = selectedLetters[i];
      slots.push(
        <TouchableOpacity
          key={i}
          onPress={() => selectedLetter && handleSelectedLetterPress(i)}
          style={{
            width: slotWidth,
            height: verticalScale(8),
            backgroundColor: "#4A9EFF",
            borderRadius: scale(4),
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: slotMargin,
          }}
        >
          {/* Linha azul como mostrado nas imagens */}
        </TouchableOpacity>
      );
    }
    return slots;
  };

  // Renderizar letras disponíveis
  const renderAvailableLetters = () => {
    // Ajustar tamanho baseado no número total de letras
    const totalLetters = availableLetters.length;
    const wordLength = currentWord.word.length;

    // Três tamanhos: normal (até 3 letras), médio (4 letras), pequeno (5+ letras)
    let letterWidth, letterHeight, fontSize, marginHorizontal, marginVertical;

    if (wordLength >= 5) {
      // Tamanho pequeno para palavras de 5+ letras
      letterWidth = scale(75);
      letterHeight = verticalScale(75);
      fontSize = moderateScale(42);
      marginHorizontal = scale(6);
      marginVertical = verticalScale(3);
    } else if (totalLetters >= 6) {
      // Tamanho médio para palavras de 4 letras
      letterWidth = scale(85);
      letterHeight = verticalScale(85);
      fontSize = moderateScale(50);
      marginHorizontal = scale(8);
      marginVertical = verticalScale(4);
    } else {
      // Tamanho normal para palavras de 2-3 letras
      letterWidth = scale(100);
      letterHeight = verticalScale(100);
      fontSize = moderateScale(60);
      marginHorizontal = scale(10);
      marginVertical = verticalScale(5);
    }

    return availableLetters.map((letterObj) => {
      const isUsed = selectedLetters.find((l) => l.id === letterObj.id);

      return (
        <TouchableOpacity
          key={letterObj.id}
          onPress={() => !isUsed && handleLetterPress(letterObj)}
          style={{
            width: letterWidth,
            height: letterHeight,
            backgroundColor: isUsed ? "#E0E0E0" : "#FFFFFF",
            borderRadius: scale(20),
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: marginHorizontal,
            marginVertical: marginVertical,
            opacity: isUsed ? 0.3 : 1,
            // Sombra sutil
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: fontSize,
              fontFamily: "TTMilksCasualPie",
              color: "#E856A6",
            }}
          >
            {letterObj.letter}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <ImageBackground
      source={require("../assets/images/bg_third_tall.png")}
      style={{ flex: 1, backgroundColor: "#FF9BB5" }}
    >
      {/* Fundo rosa sólido como nas imagens */}
      <View style={{ flex: 1 }}>
        <GameHeader onBackPress={handleBackPress} />

        {/* Título */}
        <Text
          style={{
            color: "#FEF294",
            fontSize: moderateScale(28),
            fontFamily: "TTMilksCasualPie",
            textAlign: "center",
            marginTop: verticalScale(20),
            marginBottom: verticalScale(30),
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
          }}
        >
          MONTE A PALAVRA:
        </Text>

        {/* Imagem da palavra */}
        <View style={{ alignItems: "center", marginBottom: verticalScale(30) }}>
          <Image
            source={currentWord.image}
            style={{
              width: scale(150),
              height: verticalScale(150),
            }}
            contentFit="contain"
          />
        </View>

        {/* Área da palavra com letras selecionadas e slots */}
        <View
          style={{
            alignItems: "center",
            marginBottom: verticalScale(40),
          }}
        >
          {/* Letras selecionadas */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: verticalScale(10),
              minHeight: verticalScale(50),
            }}
          >
            {selectedLetters.map((letterObj, index) => {
              // Ajustar tamanho das letras selecionadas baseado no tamanho da palavra
              const wordLength = currentWord.word.length;
              const letterWidth = wordLength >= 5 ? scale(50) : scale(60);
              const fontSize = wordLength >= 5 ? moderateScale(30) : moderateScale(36);
              const marginHorizontal = wordLength >= 5 ? scale(6) : scale(8);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectedLetterPress(index)}
                  style={{
                    width: letterWidth,
                    height: verticalScale(50),
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: marginHorizontal,
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontSize,
                      fontFamily: "TTMilksCasualPie",
                      color: "#FFFFFF",
                      textShadowColor: "rgba(0,0,0,0.3)",
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    {letterObj.letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Slots da palavra (linhas azuis) */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {renderWordSlots()}
          </View>
        </View>

        {/* Letras disponíveis em grade */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: scale(15),
            marginBottom: verticalScale(40),
            // Largura ajustada baseada no tamanho da palavra
            maxWidth:
              currentWord.word.length >= 5
                ? scale(320)
                : availableLetters.length >= 6
                  ? scale(350)
                  : scale(400),
            alignSelf: "center",
          }}
        >
          {renderAvailableLetters()}
        </View>

        {isGameWon && (
          <WinScreen
            pathId={pathId}
            gameId={gameId}
            openMap={openMap}
            openNext={openNext}
            completeLevel={completeLevel}
            message="Parabéns!"
            subtitle={`Você montou a palavra "${currentWord.word}" corretamente!`}
          />
        )}
      </View>
    </ImageBackground>
  );
}
