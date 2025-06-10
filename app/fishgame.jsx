import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ImageBackground,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { router, useLocalSearchParams } from "expo-router";

import { useGameProgress } from "../context/GameContext";
import { CASTLE_PATH_GAMES } from "../constants/paths";
import { GAME_DIFFICULTY_CONFIG } from "../constants/gameConfig";

import BackButton from "@/components/backbutton";
import Fish from "@/components/Fish";
import ProgressBar from "@/components/progressbar";

const { width: windowWidth } = Dimensions.get("window");
// Dados de CONFIGURAÇÃO dos jogos deste caminho.
// Define as propriedades que não mudam: ID, nome, rota e posição X no mapa.

// --- NOVOS HELPERS E CONSTANTES ---

// Define um array de cores vibrantes para os números das bolhas
const BUBBLE_NUMBER_COLORS = [
  "#FF5733", // Laranja
  "#00911b", // Verde
  "#3357FF", // Azul
  "#FF33A1", // Rosa
  "#A133FF", // Roxo
  "#ff3333", // vermelho
];

// Função para pegar uma cor aleatória do nosso array
function getRandomColor() {
  return BUBBLE_NUMBER_COLORS[
    Math.floor(Math.random() * BUBBLE_NUMBER_COLORS.length)
  ];
}

// Função para gerar um deslocamento vertical aleatório para as bolhas
function getRandomVerticalOffset() {
  const maxOffset = 20; // As bolhas vão variar até 20 pixels para cima ou para baixo
  return Math.random() * maxOffset * 2 - maxOffset; // Gera um valor entre -20 e 20
}

// Total de rodadas/acertos necessários como uma constante
const ROUNDS_TO_WIN = 5;

export default function FishGame() {
  const confettiRef = useRef(null); // Referência para o ConfettiCannon

  // Nova função para disparar os confetes quando a imagem for clicada
  const fireConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.start(); // Inicia a animação de confetes
    }
  };

  const soundIcon = require("../assets/images/icons/sound_icon.png");

  const [fishesData, setFishesData] = useState([]);

  const [options, setOptions] = useState([]); // Agora vai guardar objetos: { value, color, verticalOffset }
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState(null); // Guarda o valor (número) selecionado

  // --- ESTADOS PARA O PROGRESSO ---
  // Conta quantas respostas corretas o jogador já deu
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Controla se o jogador já venceu o jogo (para mostrar a tela de sucesso)
  const [isGameWon, setIsGameWon] = useState(false);

  const { gameProgress, setGameProgress } = useGameProgress();
  const {
    pathId,
    gameId,
    contextKey,
    difficulty = "facil", // Pega o parâmetro de dificuldade da rota. Se nenhum for passado, ele assume 'facil' como padrão.
    gameType = "fish", // Pega o parâmetro de tipo de jogo da rota. Se nenhum for passado, ele assume 'soma' como padrão.
  } = useLocalSearchParams();

  // Pega as configurações para a dificuldade atual
  const config = GAME_DIFFICULTY_CONFIG[gameType][difficulty];

  useEffect(() => {
    generateGame();
  }, []);

  // useEffect para disparar os confetes na vitória
  useEffect(() => {
    // Se o jogo foi ganho...
    if (isGameWon) {
      // Usamos um pequeno timeout para garantir que o componente ConfettiCannon
      // já tenha sido montado e a ref esteja conectada antes de chamarmos o .start()
      if (confettiRef.current) {
        console.log("Disparando confetes de dentro do setTimeout...");
        confettiRef.current.start();
      } else {
        // Se esta mensagem aparecer, algo mais fundamental está errado.
        console.log("A ref do confete ainda é nula mesmo após o timeout.");
      } // 100ms é um atraso pequeno, geralmente imperceptível para o usuário.
    }
  }, [isGameWon]); // Dispara quando isGameWon muda para true

  // O container dos peixes pode ser um pouco menor que a altura total para não sobrepor os botões
  const containerHeight = Dimensions.get("window").height * 0.5;

  const generateGame = () => {
    // --- LÓGICA DE GERAÇÃO DE PEIXES ATUALIZADA ---
    const newFishesData = [];
    const usedPositions = [];
    const MIN_DISTANCE = config.minDistance;
    const MIN_SIZE = config.minFishSize;
    const MAX_SIZE = config.maxFishSize;
    const MAX_QUANTITY = config.maxQuantity;

    const quantity = Math.floor(Math.random() * MAX_QUANTITY) + 1;
    const fishAssets = {
      1: require("../assets/images/fishs/fish1.png"),
      2: require("../assets/images/fishs/fish2.png"),
      3: require("../assets/images/fishs/fish3.png"),
      4: require("../assets/images/fishs/fish4.png"),
      5: require("../assets/images/fishs/fish5.png"),
    };

    for (let i = 0; i < quantity; i++) {
      const fishNumber = Math.floor(Math.random() * MAX_QUANTITY) + 1;
      const sizeValue =
        Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
      const size = { width: sizeValue, height: sizeValue };

      let initialPosition,
        tries = 0;
      let overlaps;

      // Gera uma posição inicial que não sobrepõe outros peixes
      do {
        initialPosition = {
          x: Math.floor(Math.random() * (windowWidth - size.width)),
          y: Math.floor(Math.random() * (containerHeight - size.height)),
        };
        overlaps = usedPositions.some((pos) => {
          const dx = pos.x - initialPosition.x;
          const dy = pos.y - initialPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < MIN_DISTANCE;
        });
        tries++;
      } while (overlaps && tries < 100);

      usedPositions.push(initialPosition);

      // Adiciona um objeto com os dados necessários para o componente <Fish />
      newFishesData.push({
        id: `fish-${i}-${Date.now()}`, // Chave única

        source:
          fishNumber in fishAssets
            ? fishAssets[fishNumber]
            : fishAssets[fishNumber - 5], // Usa o peixe correspondente ou o peixe 1-5 se o número for maior que 5
        initialPosition,
        size,
      });
    }

    setFishesData(newFishesData); // Salva o array de dados dos peixes
    setCorrect(quantity);
    setOptions(generateOptions(quantity));
    setSelected(null);
  };

  const generateOptions = (correctValue) => {
    const set = new Set();
    set.add(correctValue);

    while (set.size < 3) {
      const fake = Math.floor(Math.random() * config.optionsRange) + 1;
      if (fake !== correctValue) set.add(fake);
    }

    // Converte o Set para um array e embaralha
    const array = Array.from(set).sort(() => Math.random() - 0.5);

    // --- MUDANÇA IMPORTANTE: Mapeia o array de números para um array de objetos ---
    // Cada opção agora terá seu valor, cor e posição vertical aleatórios
    return array.map((value) => ({
      value: value,
      color: getRandomColor(),
      verticalOffset: getRandomVerticalOffset(),
    }));
  };

  const handleAnswer = (value) => {
    setSelected(value); // Salva o número selecionado para feedback visual

    // Verifica se a resposta está correta
    if (value === correct) {
      // Se acertou, incrementa a contagem de respostas corretas
      // Usamos uma função no setState para garantir que estamos usando o valor mais recente
      const newScore = correctAnswersCount + 1;
      setCorrectAnswersCount(newScore);

      // Após 1 segundo de feedback visual...
      setTimeout(() => {
        // Verifica se o jogador atingiu o número de vitórias necessárias
        if (newScore >= ROUNDS_TO_WIN) {
          // Se sim, marca o jogo como vencido!
          setIsGameWon(true);
        } else {
          // Se não, gera a próxima rodada do jogo
          generateGame();
        }
      }, 1000);
    } else {
      // Se errou, o progresso não avança.
      // Apenas esperamos o feedback visual e geramos a próxima rodada.
      setTimeout(() => {
        generateGame();
      }, 1500);
    }
  };

  // Função para reiniciar o jogo do zero
  const resetGame = () => {
    setCorrectAnswersCount(0);
    setIsGameWon(false);
    generateGame(); // Gera a primeira rodada novamente
  };

  // --- SUBSTITUA SUA FUNÇÃO ANTIGA POR ESTA ---
  const handleGameCompletion = () => {
    // 1. Encontra o índice do jogo ATUAL na nossa lista de configuração.
    //    Isso nos diz a posição do jogo na sequência (0 para o primeiro, 1 para o segundo, etc.)
    const currentGameIndex = CASTLE_PATH_GAMES.findIndex(
      (game) => game.id === Number(gameId)
    );

    // 2. Checagem de segurança: se não encontrar o jogo, algo está errado (ex: gameId não foi passado corretamente).
    if (currentGameIndex === -1) {
      console.error(
        "ERRO CRÍTICO: Não foi possível encontrar o jogo atual na lista. Verifique se 'gameId' está sendo passado como parâmetro na navegação."
      );
      Alert.alert("Erro", "Não foi possível salvar seu progresso.");
      router.replace({ pathname: "/firstpath", params: { pathId } });
      return;
    }

    // 3. Prepara o objeto de atualização para o GameContext.
    //    Começamos criando a estrutura aninhada necessária.
    const progressUpdate = {
      paths: {
        [pathId]: {
          // Usa o pathId recebido (ex: 'castelo') para modificar o caminho certo
          games: {
            // Usa a contextKey (ex: 'game1') para marcar o jogo correto como completo
            [contextKey]: { status: "completed" },
          },
        },
      },
    };

    // 4. Encontra o PRÓXIMO jogo na lista, se houver.
    const nextGame = CASTLE_PATH_GAMES[currentGameIndex + 1];

    if (nextGame) {
      // 5. Se existe um próximo jogo, vamos desbloqueá-lo.
      //    A chave de contexto do próximo jogo será `game` + seu número (índice na lista + 1).
      const nextGameContextKey = `game${currentGameIndex + 1 + 1}`; // ex: se o atual é index 1, o próximo é index 2, a chave é 'game3'

      // Adiciona a instrução para desbloquear o próximo jogo ao nosso objeto de atualização
      progressUpdate.paths[pathId].games[nextGameContextKey] = {
        status: "unlocked",
      };
    } else {
      // 6. Se NÃO existe um próximo jogo, o jogador completou o caminho inteiro!

      // Adiciona a instrução para marcar o caminho atual como 'completed'
      progressUpdate.paths[pathId].status = "completed";
      // E desbloqueia o próximo caminho principal (ex: 'molusco_perola')
      progressUpdate.paths.molusco_perola = { status: "unlocked" };
    }

    // 7. Envia o objeto de atualização completo para o GameContext.
    // A função `setGameProgress` no seu contexto fará o "merge" inteligente dos dados.
    setGameProgress(progressUpdate);

    // 8. Navega o jogador de volta para a tela do mapa do caminho.
    console.log("Jogo concluído. Voltando para o mapa do caminho...");
    router.back();
  };

  // Tela de Sucesso
  if (isGameWon) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>Você Conseguiu!</Text>

        <TouchableWithoutFeedback onPress={fireConfetti}>
          <Image
            // Uma imagem da Tuti comemorando!
            source={require("../assets/images/tuti_festa.png")}
            style={styles.successImage}
            resizeMode="contain"
          />
        </TouchableWithoutFeedback>
        <Text style={styles.successMessage}>
          Você contou todos os peixes e desbloqueou o próximo nível!
        </Text>

        {/* <TouchableOpacity style={styles.successButton} onPress={resetGame}>
          <Text style={styles.successButtonText}>Jogar Novamente</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.successButton}
          onPress={handleGameCompletion}
        >
          <Text style={styles.successButtonText}>Próximo Nível</Text>
        </TouchableOpacity>

        {/* Canhão de Confetes! */}
        <ConfettiCannon
          ref={confettiRef} // Referência para o canhão de confetes
          count={200} // Quantidade de confetes
          origin={{ x: windowWidth / 2, y: -20 }} // Ponto de origem da "explosão" (centro superior da tela)
          autoStart={false} // Inicia automaticamente quando o componente monta
          fadeOut={true} // Faz os confetes desaparecerem suavemente
          explosionSpeed={350} // Velocidade inicial da explosão
          fallSpeed={1000} // Velocidade da queda
          // colors={['#ff69b4', '#1e90ff', '#32cd32', '#ffd700']} // Cores customizadas (opcional)
        />
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      {/* Topo da tela com botões */}
      <View style={styles.header}>
        <BackButton />
        <TouchableOpacity style={styles.soundButton}>
          <Image
            source={soundIcon}
            style={styles.soundIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Título da pergunta */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>QUAL A QUANTIDADE DE PEIXES?</Text>
      </View>

      {/* Área onde os peixes aparecem */}
      <View style={{ width: windowWidth, height: containerHeight }}>
        {fishesData.map((fishData) => (
          <Fish
            key={fishData.id} // Usa a chave única
            source={fishData.source}
            initialPosition={fishData.initialPosition}
            size={fishData.size}
            containerWidth={windowWidth}
            containerHeight={containerHeight}
          />
        ))}
      </View>

      {/* Container para as bolhas de opção */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selected === option.value;
          const isCorrect = option.value === correct;

          return (
            // --- MUDANÇA NO JSX DAS BOLHAS ---
            <ImageBackground
              key={index}
              source={require("../assets/images/bolha.png")} // Imagem de fundo da bolha
              resizeMode="contain" // 'contain' para não distorcer a imagem da bolha
              style={[
                styles.bubbleContainer, // Novo estilo para o container da bolha
                { transform: [{ translateY: option.verticalOffset }] }, // Aplica o deslocamento vertical aleatório
              ]}
            >
              <TouchableOpacity
                onPress={() => handleAnswer(option.value)}
                style={[
                  styles.bubbleTouchable, // Novo estilo para o touchable
                  selected !== null &&
                    (isCorrect
                      ? styles.correct
                      : isSelected
                      ? styles.wrong
                      : null), // Estilos de certo/errado
                ]}
                activeOpacity={0.7}
                disabled={selected !== null} // Desabilita o toque se já houver uma resposta selecionada
              >
                <Text style={[styles.bubbleText, { color: option.color }]}>
                  {/* Aplica a cor aleatória */}
                  {option.value}
                </Text>
              </TouchableOpacity>
            </ImageBackground>
          );
        })}
      </View>

      <ProgressBar step={correctAnswersCount} totalSteps={ROUNDS_TO_WIN} />
    </View>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    // Container principal do jogo
    flex: 1,
    backgroundColor: "#fff8b8", // Fundo amarelo claro
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 10,
    marginTop: 20, // Ajuste para SafeArea se necessário
  },
  soundButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 50, // Círculo perfeito
  },
  soundIcon: {
    width: 43,
    height: 35,
  },
  questionContainer: {
    paddingHorizontal: 10,
    marginVertical: 15,
  },
  questionText: {
    textTransform: "uppercase",
    color: "#f453b6", // Rosa
    fontFamily: "TTMilksCasualPie",
    fontSize: 35,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center", // Alinha verticalmente as bolhas (antes do offset)
    width: "100%",
    paddingHorizontal: 10,
    // Posiciona na parte inferior da tela
    // position: "absolute",
    // bottom: 30,
  },
  // --- NOVOS ESTILOS PARA AS BOLHAS ---
  bubbleContainer: {
    // Para o ImageBackground
    width: windowWidth * 0.25, // Largura da bolha (25% da tela)
    aspectRatio: 1, // Mantém a proporção quadrada para a imagem da bolha
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20%",
  },
  bubbleTouchable: {
    // Para o TouchableOpacity DENTRO do ImageBackground
    width: "100%", // Ocupa toda a área do ImageBackground
    height: "100%",
    justifyContent: "center", // Centraliza o texto verticalmente
    alignItems: "center", // Centraliza o texto horizontalmente
  },
  bubbleText: {
    fontSize: 40, // Tamanho grande para o número
    fontFamily: "TTMilksCasualPie",
  },
  correct: {
    // Para feedback visual. O ideal é mudar a cor da bolha, não do Touchable.
    // Para mudar a cor da bolha (ImageBackground), você pode usar o 'tintColor'
    // Ex: tintColor: '#8fff8f' na ImageBackground
    // Por simplicidade, um overlay de cor no Touchable pode funcionar:
    backgroundColor: "rgba(22, 214, 22, 0.699)", // Verde semi-transparente
    borderRadius: 100, // Círculo
  },
  wrong: {
    backgroundColor: "rgba(255, 93, 93, 0.61)", // Vermelho semi-transparente
    borderRadius: 100, // Círculo
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#62bfec", // Um fundo azul de comemoração
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
  },
  successTitle: {
    fontSize: 36,
    fontFamily: "TTMilksCasualPie",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  successImage: {
    width: windowWidth,
    height: windowWidth,
    marginBottom: 20,
  },
  successMessage: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    fontFamily: "TTMilksCasualPie",
  },
  successButton: {
    backgroundColor: "#ff4da6", // Rosa
    paddingVertical: 15,
    // paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 15,
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "TTMilksCasualPie",
  },
  successButtonSecondary: {
    backgroundColor: "transparent",
    borderColor: "#9d59ff",
    borderWidth: 2,
    paddingVertical: 15,
    // paddingHorizontal: 40,
    borderRadius: 30,
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  successButtonTextSecondary: {
    color: "#9d59ff",
    fontSize: 18,
    fontFamily: "TTMilksCasualPie",
  },
});
