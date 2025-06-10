// Importações de módulos e componentes necessários do React e React Native
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image, // Componente Image padrão do React Native (não usado diretamente neste arquivo, RNImage é usado)
  TouchableOpacity,
  Dimensions, // API para obter as dimensões da tela
  ActivityIndicator, // Componente para mostrar um indicador de carregamento
} from "react-native";
// Importações para animações da biblioteca Reanimated
import Animated, {
  useSharedValue, // Hook para criar valores compartilhados que podem ser animados
  useAnimatedStyle, // Hook para criar estilos que reagem a valores compartilhados
  withTiming, // Função para animar um valor ao longo do tempo com configurações específicas
  interpolate, // Função para mapear um valor de um intervalo para outro (usado em animações)
  Easing, // Define as curvas de aceleração/desaceleração para animações
} from "react-native-reanimated";
// Importa o componente Image do React Native como RNImage para evitar conflito de nome, usado para resolver as dimensões da imagem
import { Image as RNImage } from "react-native";
// Hook do Expo Router para navegação programática
import { useRouter } from "expo-router";
// Componente para controlar a barra de status do dispositivo
import { StatusBar } from "expo-status-bar";

// Obtém as dimensões iniciais da janela do dispositivo.
// windowWidth é usado nos estilos do logo. windowHeight pode ser referência inicial.
const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

// Importa a imagem de fundo principal (longa e vertical)
const longBackground = require("../assets/images/bg_1.png");
// Importa a imagem do logo
const logoImage = require("../assets/images/textologo.png");

// Componente principal da tela Index (geralmente a tela inicial da rota /)
export default function Index() {
  // Inicializa o hook do Expo Router para permitir a navegação
  const router = useRouter();

  // Estado para controlar o carregamento da navegação para a próxima tela (login)
  const [loading, setLoading] = useState(false); // Não está sendo usado para controlar UI no JSX atual, mas está na função handleNavigate

  // Função assíncrona para navegar para a tela de login com uma tela de carregamento intermediária
  const handleNavigate = async () => {
    // Define o estado de carregamento (atualmente não reflete na UI)
    // setLoading(true);

    // 1. Navega para uma rota '/loading' (presume-se que exista uma tela loading.js/tsx)
    // router.push("/loading");

    // 2. Tenta pré-carregar o módulo da tela de login.
    // Isso pode ajudar a reduzir o tempo de carregamento da próxima tela após a navegação.
    // Nota: O import() dinâmico aqui pode ter suas próprias considerações de performance e bundling.
    // await import("./login");

    // 3. Após o "pré-carregamento", substitui a tela atual (ou /loading) pela tela /login
    router.replace("/login");
    // setLoading(false); // Considerar se setLoading deve ser false aqui ou na tela de destino
  };

  // Estado para controlar a visualização entre duas "cenas" ou "etapas" da animação na tela
  const [showEnter, setShowEnter] = useState(false); // false: estado inicial, true: estado "entrar"

  // Valor compartilhado do Reanimated para o progresso da animação (0 = inicial, 1 = final/entrar)
  const progress = useSharedValue(0);

  // Estado para armazenar a altura da imagem de fundo depois de escalada proporcionalmente à largura da tela
  const [imageHeight, setImageHeight] = useState(null); // Inicia como null para indicar que não foi calculado
  // Estados para armazenar as dimensões reais do viewport (container principal), obtidas via onLayout
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  // Função callback para o evento onLayout do View principal.
  // Atualiza os estados viewportWidth e viewportHeight com as dimensões reais do layout.
  const onLayoutRootView = (event) => {
    const { width, height } = event.nativeEvent.layout;
    // Atualiza os estados apenas se as dimensões realmente mudaram e são válidas
    if (width > 0 && width !== viewportWidth) {
      setViewportWidth(width);
    }
    if (height > 0 && height !== viewportHeight) {
      setViewportHeight(height);
    }
  };

  // useEffect para calcular a altura da imagem de fundo (`imageHeight`)
  // É executado quando `viewportWidth` muda (e é maior que 0).
  useEffect(() => {
    if (viewportWidth > 0) {
      // Obtém as dimensões originais (largura/altura em pixels) do asset da imagem
      const source = RNImage.resolveAssetSource(longBackground);
      if (source && source.width && source.height) {
        // Verifica se 'source' e suas dimensões são válidas
        // Calcula a altura da imagem escalada para preencher a largura do viewport, mantendo a proporção
        const scaledHeight = (viewportWidth / source.width) * source.height;
        if (isFinite(scaledHeight)) {
          // Garante que scaledHeight é um número válido
          setImageHeight(scaledHeight);
        } else {
          // Se o cálculo resultar em NaN ou Infinity, define um estado de erro para imageHeight
          setImageHeight(-1); // -1 indica um erro no cálculo
        }
      } else {
        // Se não for possível obter as dimensões da imagem, define um estado de erro
        setImageHeight(-1);
      }
    }
  }, [viewportWidth]); // Array de dependências: re-executa o efeito se viewportWidth mudar

  // Função para alternar o estado da tela (entre visualização inicial e visualização "entrar")
  const toggleScreen = () => {
    // Inverte o estado de showEnter
    setShowEnter((prev) => !prev);
    // Anima o valor de 'progress' para 0 ou 1, dependendo do estado de showEnter
    // Usa withTiming para uma animação suave com duração e curva de easing específicas
    progress.value = withTiming(showEnter ? 0 : 1, {
      // Se showEnter era true, anima para 0 (volta), senão para 1 (avança)
      duration: 900, // Duração da animação em milissegundos
      easing: Easing.out(Easing.cubic), // Curva de easing para suavizar o final da animação
    });
  };

  // Calcula o deslocamento vertical máximo que a imagem de fundo pode ter.
  // Se a imagem for mais alta que o viewport, calcula a diferença. Caso contrário, o deslocamento é 0.
  const maxTranslateY =
    imageHeight &&
    imageHeight > 0 &&
    viewportHeight &&
    imageHeight > viewportHeight // Verifica se todas as dimensões são válidas e se a imagem é mais alta
      ? imageHeight - viewportHeight // Diferença que pode ser "rolada"
      : 0; // Sem rolagem se a imagem for mais curta ou de igual altura, ou se houver erro em imageHeight

  // Estilo animado para o container que envolve a imagem de fundo.
  // Este container tem a altura do viewport e corta o conteúdo da imagem que transborda (overflow: "hidden").
  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: viewportHeight, // Altura igual à do viewport medido
    overflow: "hidden", // Essencial para o efeito de "janela" na imagem que se move
    width: viewportWidth, // Largura igual à do viewport medido
  }));

  // Estilo animado para a imagem de fundo.
  // Controla o deslocamento vertical (translateY) da imagem e suas dimensões.
  const animatedImageStyle = useAnimatedStyle(() => {
    // Interpola o valor de 'progress' (0 a 1) para um valor de 'translateY' (0 a -maxTranslateY)
    // Isso faz a imagem "subir" conforme 'progress' aumenta
    const translateY = interpolate(progress.value, [0, 1], [0, -maxTranslateY]);

    // Determina a altura do componente Animated.Image.
    // Garante que o componente da imagem seja pelo menos tão alto quanto o viewport,
    // ou tão alto quanto a própria imagem escalada (imageHeight), o que for maior.
    // Isso assegura que a imagem cubra o fundo, mesmo que a imagem escalada seja mais curta que o viewport.
    const componentHeight =
      imageHeight && imageHeight > 0 && viewportHeight // Verifica se as dimensões são válidas
        ? Math.max(imageHeight, viewportHeight) // Usa o maior valor entre a altura da imagem e a altura do viewport
        : viewportHeight; // Fallback para a altura do viewport se imageHeight não for válido

    return {
      transform: [{ translateY }], // Aplica o deslocamento vertical calculado
      position: "absolute", // Posicionamento absoluto dentro do animatedContainerStyle
      top: 0,
      left: 0,
      width: viewportWidth, // Largura igual à do viewport
      height: componentHeight, // Altura calculada para cobrir e/ou permitir rolagem
    };
  });

  // Estilo animado para o logo.
  // O logo se move verticalmente (translateY) com base no 'progress' da animação.
  const animatedLogoStyle = useAnimatedStyle(() => {
    // Interpola 'progress' para diferentes posições Y do logo
    const translateY = interpolate(progress.value, [0, 1], [-100, -170]); // Valores negativos movem para cima
    return {
      transform: [{ translateY }],
    };
  });

  // Estilo animado para o texto "CLIQUE PARA MERGULHAR".
  // O texto também se move verticalmente e sua opacidade muda (fade out).
  const animatedTextStyle = useAnimatedStyle(() => {
    // O texto sobe um pouco e desaparece (opacidade para 0) até a metade da animação (progress = 0.5)
    const translateY = interpolate(progress.value, [0, 0.5], [-60, 0]); // Movimento de subida
    const opacity = interpolate(progress.value, [0, 0.5], [1, 0]); // Fade out
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Estilo animado para o container do botão "entrar".
  // O botão aparece (opacidade de 0 para 1) e se move verticalmente.
  const animatedButtonStyle = useAnimatedStyle(() => {
    // O botão se torna visível (fade in) na segunda metade da animação (progress de 0.7 a 1)
    const opacity = interpolate(progress.value, [0.7, 1], [0, 1]);
    // O botão se move de uma posição mais baixa para sua posição final
    const translateY = interpolate(progress.value, [0, 1], [60, -270]);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Condição de carregamento: se as dimensões cruciais (imageHeight, viewportHeight)
  // ainda não foram calculadas/definidas ou se houve erro no cálculo de imageHeight.
  if (imageHeight === null || imageHeight === -1 || viewportHeight === 0) {
    let statusMessage = "Medindo dimensões..."; // Mensagem padrão
    if (imageHeight === -1) {
      // Se houve erro ao calcular imageHeight
      statusMessage = "Erro ao carregar dimensões da imagem.";
    } else if (
      viewportHeight === 0 &&
      imageHeight !== null &&
      imageHeight !== -1
    ) {
      // Se já temos imageHeight mas não viewportHeight
      statusMessage = "Aguardando dimensões do layout...";
    }

    // Retorna uma tela de carregamento/status
    return (
      <View
        style={[
          styles.container, // Estilo base do container
          { justifyContent: "center", alignItems: "center" }, // Centraliza o conteúdo do loading
        ]}
        onLayout={onLayoutRootView} // onLayout também aqui para garantir que as dimensões sejam capturadas caso esta View seja a primeira a renderizar com tamanho
      >
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>{statusMessage}</Text>
        {/* Texto de depuração para as dimensões (pode ser removido em produção) */}
        <Text>
          (VH: {String(viewportHeight)}, VW: {String(viewportWidth)}, IH:{" "}
          {String(imageHeight)})
        </Text>
      </View>
    );
  }

  // Estrutura JSX principal da tela, renderizada após as dimensões serem carregadas
  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Controla a barra de status (escondida neste caso) */}
      <StatusBar style="dark" hidden={true} />

      {/* Container principal para a animação da imagem de fundo, aplica o recorte */}
      <Animated.View style={[animatedContainerStyle]}>
        {/* A imagem de fundo animada */}
        <Animated.Image
          source={longBackground} // Fonte da imagem de fundo
          style={[animatedImageStyle]} // Estilos animados (posição, tamanho, transform)
          resizeMode="cover" // Garante que a imagem cubra as dimensões do componente, cortando se necessário
        />
        {/* Container para o conteúdo que fica sobre a imagem de fundo (logo, texto, botão) */}
        <View style={styles.content}>
          {/* Imagem do logo animada */}
          <Animated.Image
            source={logoImage}
            style={[styles.logo, animatedLogoStyle]} // Combina estilos fixos e animados
            resizeMode="contain" // Garante que o logo seja totalmente visível dentro de suas dimensões, sem cortes
          />
          {/* Texto "CLIQUE PARA MERGULHAR", renderizado condicionalmente e animado */}
          {!showEnter && ( // Só mostra este texto se showEnter for false (estado inicial)
            <Animated.Text style={[styles.text, animatedTextStyle]}>
              CLIQUE PARA MERGULHAR
            </Animated.Text>
          )}
          {/* Container do botão "entrar", renderizado condicionalmente e animado */}
          <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
            {showEnter && ( // Só mostra o botão se showEnter for true (estado "entrar")
              <TouchableOpacity
                onPress={handleNavigate} // Ação ao pressionar o botão
                style={styles.button}
                accessibilityLabel="Botão para entrar" // Label de acessibilidade
                accessibilityRole="button"
              >
                <Text style={styles.buttonText}>entrar</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Animated.View>

      {/* TouchableOpacity transparente que cobre toda a tela para capturar o toque inicial */}
      {/* Usado para acionar a animação 'toggleScreen' apenas no estado inicial */}
      {!showEnter && ( // Só habilita este toque se showEnter for false
        <TouchableOpacity
          style={StyleSheet.absoluteFill} // Faz o touchable ocupar toda a tela
          activeOpacity={1} // Mantém a opacidade total ao tocar (sem feedback visual de toque)
          onPress={toggleScreen} // Chama a função para iniciar a animação
        />
      )}
    </View>
  );
}

// Definição dos estilos usando StyleSheet
const styles = StyleSheet.create({
  // Container principal da tela, ocupa todo o espaço disponível
  container: { flex: 1 /* backgroundColor: "green" */ }, // A cor de fundo foi removida para não interferir com a imagem
  // Container para o conteúdo sobreposto (logo, texto, botão)
  content: {
    flex: 1, // Ocupa todo o espaço do seu pai (Animated.View)
    minHeight: "100%", // Garante que tenha pelo menos a altura do pai
    justifyContent: "center", // Centraliza o conteúdo verticalmente
    alignItems: "center", // Centraliza o conteúdo horizontalmente
    position: "relative", // Permite posicionamento absoluto para filhos como o buttonContainer
  },
  // Estilo para o logo
  logo: {
    width: windowWidth * 0.8, // Largura do logo como 80% da largura da tela
    height: 150, // Altura fixa para o logo (ajuste conforme necessário)
    marginBottom: 20, // Margem inferior para separar do texto "CLIQUE PARA MERGULHAR"
  },
  // Estilo para o texto "CLIQUE PARA MERGULHAR"
  text: {
    fontSize: 20,
    color: "#5483c476", // Cor do texto (com transparência)
    fontFamily: "TTMilksCasualPie", // Fonte personalizada (certifique-se que está carregada no projeto)
  },
  // Container para o botão "entrar", posicionado absolutamente na parte inferior
  buttonContainer: {
    position: "absolute",
    bottom: 80, // Distância da parte inferior da tela
  },
  // Estilo para o botão "entrar"
  button: {
    backgroundColor: "#ff66c4", // Cor de fundo do botão
    borderRadius: 10, // Bordas arredondadas
    padding: 12, // Espaçamento interno
    width: 120, // Largura fixa
    alignItems: "center", // Centraliza o texto do botão horizontalmente
  },
  // Estilo para o texto dentro do botão "entrar"
  buttonText: {
    fontFamily: "TTMilksCasualPie", // Fonte personalizada
    fontSize: 20,
    color: "#fff", // Cor do texto
    textAlign: "center",
    textTransform: "uppercase", // Texto em maiúsculas
  },
});
