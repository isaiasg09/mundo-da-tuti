import { Image, ImageBackground } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import GameHeader from "../components/gameheader";
import WinScreen from "../components/winscreen";
import { GAME_DIFFICULTY_CONFIG } from "../constants/gameConfig";
import { useLevelNavigation } from "../hooks/useLevelNavigation";

import ProgressBar from "../components/progressbar";

const backgroundImg = require("../assets/images/bg_second_tall.png");
const { width, height } = Dimensions.get("window");

// Dados do jogo de combinação
const MATCH_ITEMS = [
  {
    id: 1,
    image: require("../assets/images/combinacao/ancora.webp"),
    letter: "A",
    name: "ancora",
  },
  {
    id: 2,
    image: require("../assets/images/combinacao/concha.webp"),
    letter: "C",
    name: "concha",
  },
  {
    id: 3,
    image: require("../assets/images/combinacao/estrela.png"),
    letter: "E",
    name: "estrela",
  },
  // Vamos adicionar um quarto item temporário para completar
  {
    id: 4,
    image: require("../assets/images/combinacao/peixe.png"),
    letter: "P",
    name: "peixe",
  },
  {
    id: 5,
    image: require("../assets/images/combinacao/treasure.png"),
    letter: "B",
    name: "bau",
  },
];

export default function MatchGame() {
  const params = useLocalSearchParams();
  const { pathId, gameId } = params;
  const difficulty = params.difficulty || "facil";
  const config = GAME_DIFFICULTY_CONFIG.match[difficulty];
  const { openMap, openNext, completeLevel, onWinMarkOnly } = useLevelNavigation(pathId);

  const [score, setScore] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [correctMatches, setCorrectMatches] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false); // Previne múltiplas conclusões

  // Selecionar apenas os itens baseados na dificuldade
  const gameItems = MATCH_ITEMS.slice(0, config.pairs);

  // Criar arrays embaralhados separadamente (fixos durante o jogo)
  const [randomizedImages] = useState(() => {
    return gameItems
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  });

  const [randomizedLetters] = useState(() => {
    return gameItems
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  });

  // Função para o GameHeader
  const handleBackPress = () => {
    if (isGameWon) {
      router.replace("/home");
    } else {
      openMap();
    }
  };

  const handleImagePress = (item) => {
    if (correctMatches.includes(item.id)) return; // Já foi combinado
    setSelectedImage(item.id === selectedImage ? null : item.id);
  };

  const handleLetterPress = (item) => {
    if (correctMatches.includes(item.id)) return; // Já foi combinado

    // Verificar se uma imagem foi selecionada primeiro
    if (!selectedImage) {
      alert("Comece selecionando a imagem");
      return;
    }

    const letterId = item.id;

    if (selectedImage === letterId) {
      // Combinação correta!
      const newCorrectMatches = [...correctMatches, item.id];
      setCorrectMatches(newCorrectMatches);
      setScore((prev) => prev + 1);
      setSelectedImage(null);
      setSelectedLetter(null);

      // Verificar se o jogo foi ganho
      if (newCorrectMatches.length === config.pairs) {
        setIsGameWon(true);
      }
    } else {
      // Combinação incorreta - mostrar seleção e resetar após delay
      setSelectedLetter(letterId);
      setTimeout(() => {
        setSelectedImage(null);
        setSelectedLetter(null);
      }, config.resetTime);
    }
  };

  // Marcar nível como completo quando o jogo é ganho
  useEffect(() => {
    if (isGameWon && !levelCompleted) {
      const current = Number(gameId);
      if (current) {
        setLevelCompleted(true); // Marca como completado para evitar múltiplas chamadas
        onWinMarkOnly(current);
      }
    }
  }, [isGameWon, gameId, onWinMarkOnly, levelCompleted]);
  const renderImageItem = (item) => {
    const isSelected = selectedImage === item.id;
    const isMatched = correctMatches.includes(item.id);

    // Ajustar tamanho baseado no número de items (5 items = tamanho menor)
    const cardWidth = config.pairs === 5 ? scale(85) : scale(100);
    const cardHeight = config.pairs === 5 ? verticalScale(75) : verticalScale(90);
    const imageWidth = config.pairs === 5 ? scale(65) : scale(80);
    const imageHeight = config.pairs === 5 ? verticalScale(58) : verticalScale(70);

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleImagePress(item)}
        style={{
          marginVertical: config.pairs === 5 ? verticalScale(6) : verticalScale(8),
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isMatched ? "#90EE90" : isSelected ? "#FFD700" : "#fef294",
            borderRadius: scale(12),
            borderWidth: isSelected ? 3 : 0,
            borderColor: "#FFA500",
            width: cardWidth,
            height: cardHeight,
          }}
        >
          <Image
            source={item.image}
            style={{
              width: imageWidth,
              height: imageHeight,
            }}
            contentFit="contain"
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderLetterItem = (item) => {
    const isSelected = selectedLetter === item.id;
    const isMatched = correctMatches.includes(item.id);

    // Ajustar tamanho baseado no número de items (5 items = tamanho menor)
    const cardWidth = config.pairs === 5 ? scale(85) : scale(100);
    const cardHeight = config.pairs === 5 ? verticalScale(75) : verticalScale(90);
    const fontSize = config.pairs === 5 ? moderateScale(52) : moderateScale(64);

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleLetterPress(item)}
        style={{
          marginVertical: config.pairs === 5 ? verticalScale(6) : verticalScale(8),
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isMatched ? "#90EE90" : isSelected ? "#FF69B4" : "#ffe6f6",
            borderColor: "#cb6ce6",
            borderWidth: scale(4),
            borderRadius: scale(12),
            width: cardWidth,
            height: cardHeight,
          }}
        >
          <Text
            style={{
              fontSize: fontSize,
              fontFamily: "TTMilksCasualPie",
              color: "#f453b6",
            }}
          >
            {item.letter}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={backgroundImg}
        style={{
          flex: 1,
          width: width,
          height: height,
        }}
      >
        <GameHeader onBackPress={handleBackPress} />

        <Text
          style={{
            color: "#fef294",
            fontSize: moderateScale(32),
            fontFamily: "TTMilksCasualPie",
            textAlign: "center",
            marginVertical: verticalScale(10),
          }}
        >
          Acertos: {score}/{config.pairs}
        </Text>

        {/* <Text
          style={{
            color: "white",
            fontSize: moderateScale(16),
            fontFamily: "TTMilksCasualPie",
            textAlign: "center",
            marginBottom: verticalScale(20),
          }}
        >
          Toque na imagem e depois na letra correspondente!
        </Text> */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            // flex: 1,
            paddingHorizontal: scale(20),
          }}
        >
          {/* Coluna das imagens */}
          <View style={{ flex: 1, alignItems: "center" }}>
            {randomizedImages.map(renderImageItem)}
          </View>

          {/* Coluna das letras */}
          <View style={{ flex: 1, alignItems: "center" }}>
            {randomizedLetters.map(renderLetterItem)}
          </View>
        </View>

        <View
          style={{
            // flex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            bottom: verticalScale(40),
            width: "100%",
          }}
        >
          <ProgressBar step={score} totalSteps={config.pairs} />
        </View>

        {isGameWon && (
          <WinScreen
            pathId={pathId}
            gameId={gameId}
            openMap={openMap}
            openNext={openNext}
            completeLevel={completeLevel}
            message="Parabéns!"
            subtitle="Você combinou todas as imagens com suas letras iniciais!"
          />
        )}
      </ImageBackground>
    </View>
  );
}
