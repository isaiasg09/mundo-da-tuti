import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  // Animated, // Removido - Usaremos Reanimated para o pop-up
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react"; // useEffect pode ser removido se não usado para o fade-in do Reanimated

// Importações do Reanimated
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS, // Para executar funções JS a partir da UI thread (ex: setState)
  // Easing, // Importe se precisar de easings específicos não padrão
} from "react-native-reanimated";

import { router } from "expo-router";
import { useRegistration } from "../../context/RegistrationContext";

// Seus componentes personalizados
import BackButton from "@/components/backbutton";
import DefaultInput from "@/components/defaultinput";
import PinkButton from "@/components/pinkbutton";

// Obtém a largura da tela
const { width } = Dimensions.get("window");

// Crie um componente TouchableOpacity animável com Reanimated
// Isso permite que o próprio TouchableOpacity receba estilos animados.
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function Codigo() {
  // Estado para controlar a visibilidade LÓGICA do pop-up de ajuda
  const [isHelp, setIsHelp] = useState(false);
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook
  // Valor compartilhado do Reanimated para a opacidade do pop-up
  const overlayOpacity = useSharedValue(0); // Inicia com 0 (transparente)

  const [codigo, setCodigo] = useState("");
  const [isCodigoValid, setIsCodigoValid] = useState(true);

  function handleGoNext() {
    if (codigo.length !== 4) {
      // Mantida a correção para !==
      setIsCodigoValid(false);
    } else {
      setIsCodigoValid(true); // Limpa o erro se o código for válido

      // Salva o codigo no contexto global ANTES de navegar
      setRegistrationData({ codigoSeguranca: codigo });

      router.navigate("./nome");
    }
  }

  // useEffect para disparar a animação de entrada quando isHelp se torna true
  // Esta é uma forma limpa de iniciar a animação após o estado mudar.
  useEffect(() => {
    if (isHelp) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
    }
    // Não precisamos de um 'else' aqui para o fade-out se o handlePress
    // já cuida de animar para 0 e *depois* setar isHelp para false.
  }, [isHelp, overlayOpacity]); // Executa quando isHelp ou overlayOpacity (identidade) muda

  // Função para controlar a exibição (toggle) do pop-up de ajuda
  const handlePress = () => {
    if (!isHelp) {
      // Para mostrar: Define o estado lógico e o useEffect acima iniciará a animação de fade-in.
      // Garante que a opacidade comece de 0 caso haja cliques rápidos.
      overlayOpacity.value = 0;
      setIsHelp(true);
    } else {
      // Para esconder: Inicia a animação de fade-out.
      // No callback da animação, o estado lógico isHelp será definido como false.
      overlayOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          // Importante: runOnJS para chamar uma função da thread JS (setState)
          // a partir do callback da animação da UI thread.
          runOnJS(setIsHelp)(false);
        }
      });
    }
  };

  // Define o estilo animado para o overlay usando useAnimatedStyle do Reanimated
  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/images/bg_cod.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <BackButton title="Voltar" />
          </View>

          <Text style={styles.title}>DIGITE UM CÓDIGO DE SEGURANÇA:</Text>

          <DefaultInput
            placeholder="CÓDIGO"
            keyboardType="numeric"
            maxLength={4}
            // Lembre-se de conectar este input ao estado 'codigo'
            onChangeText={(text) => setCodigo(text)} // Exemplo de como conectar
            value={codigo}
          />

          {!isCodigoValid && (
            <Text style={styles.errorText}>
              {" "}
              {/* Usando o estilo definido abaixo */}O código deve ter 4 dígitos
            </Text>
          )}

          <TouchableOpacity onPress={handlePress}>
            <Image
              source={require("../../assets/images/help_bubble.png")}
              style={styles.helpIcon}
              accessibilityLabel="Ajuda sobre o código de segurança"
            />
          </TouchableOpacity>

          <PinkButton title="Próximo" onPress={handleGoNext} />

          {/* Seção do pop-up de ajuda, renderizada condicionalmente */}
          {isHelp && (
            // AnimatedTouchableOpacity (do Reanimated) para o overlay completo
            <AnimatedTouchableOpacity
              style={[styles.overlay, animatedOverlayStyle]} // Aplica o estilo animado aqui
              onPress={handlePress} // Clicar em qualquer lugar do overlay fecha
              activeOpacity={1}
              // key={"helpOverlayReanimated"} // Pode adicionar uma key se suspeitar de problemas de montagem
            >
              {/* Container para o conteúdo do overlay. Não precisa mais ser Animated.View
                  se a opacidade já está no AnimatedTouchableOpacity pai.
                  Mas manter como View é bom para estrutura.
              */}
              <View style={styles.overlayContentContainer}>
                <View
                  style={styles.helpBox}
                  // onStartShouldSetResponder={() => true} // Removido/Comentado para permitir que clique no conteúdo feche
                >
                  <Text style={styles.helpTitle}>
                    O QUE É O{" "}
                    <Text style={styles.enfasis}>CÓDIGO DE SEGURANÇA?</Text>
                  </Text>
                  <View style={styles.helpContentRow}>
                    <View style={styles.baloesWrapper}>
                      <ImageBackground
                        source={require("@/assets/images/balao_ajuda.png")}
                        style={styles.balao}
                        resizeMode="cover"
                      >
                        <Text style={styles.balaoTexto}>
                          É um código para manter a segurança do usuário
                        </Text>
                      </ImageBackground>
                      <ImageBackground
                        style={styles.balao}
                        source={require("@/assets/images/balao_ajuda.png")}
                        resizeMode="cover"
                      >
                        <Text style={styles.balaoTexto}>
                          Ele será pedido para fazer alterações importantes!
                        </Text>
                      </ImageBackground>
                    </View>
                    <View style={styles.tartarugaWrapper}>
                      <Image
                        source={require("../../assets/images/poses_tuti/tuti_gira.png")}
                        style={styles.tartarugaImage}
                        resizeMode="contain"
                        accessibilityLabel="Tartaruga explicando o código de segurança"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </AnimatedTouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
    paddingTop: 26,
    paddingHorizontal: 24,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
  },
  title: {
    color: "#48899d",
    fontFamily: "TTMilksCasualPie",
    fontSize: 22,
    textAlign: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  errorText: {
    color: "#ff0000",
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    marginBottom: 10, // Espaço abaixo da mensagem de erro
  },
  helpIcon: {
    width: width * 0.55,
    height: width * 0.55, // Se for um ícone menor, ajuste estas dimensões.
    resizeMode: "contain",
    marginTop: 15,
    marginBottom: 30,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(98, 191, 236, 0.82)",
    paddingTop: 50,
    alignItems: "center",
    // justifyContent: "center", // Removido para que paddingTop tenha efeito, overlayContentContainer pode centralizar
  },
  overlayContentContainer: {
    width: "100%",
    justifyContent: "center", // Centraliza helpBox verticalmente
    alignItems: "center", // Centraliza helpBox horizontalmente
  },
  helpBox: {
    width: "95%",
    // maxWidth: 480,
    backgroundColor: "transparent",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  helpTitle: {
    fontFamily: "TTMilksCasualPie",
    fontSize: 35,
    color: "#ff83cf",
    textAlign: "center",
    marginBottom: 50,
    textShadowColor: "#48899d",
    textShadowOffset: {
      width: 1.5,
      height: 1.5,
    },
    textShadowRadius: 1.41,
    textShadowOpacity: 0.4,
    elevation: 3, // Adicionado para compatibilidade com Android
    marginTop: 10, // Adicionado para espaçamento
    // width: "100%",
    // backgroundColor: "white",
  },
  enfasis: {
    color: "#ff4da6",
    fontFamily: "TTMilksCasualPie",
    textShadowColor: "#48899d",
    textShadowOffset: {
      width: 1.5,
      height: 1.5,
    },
    textShadowRadius: 1.41,
    textShadowOpacity: 0.4,
    elevation: 3, // Adicionado para compatibilidade com Android
  },
  helpContentRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  baloesWrapper: {
    flex: 2,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginTop: 85,
    marginRight: 40, // Mudado de 80 para 10 para menos espaço ou ajuste conforme necessário
  },
  balao: {
    borderRadius: 20,
    paddingTop: 30,
    paddingHorizontal: 28,
    width: width * 0.6,
    height: width * 0.36,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Adicionado para ImageBackground
  },
  balaoTexto: {
    fontSize: 13,
    lineHeight: 17,
    color: "#47276b",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    marginTop: 0, // Removido o marginTop: 30, o padding/justifyContent do balão deve cuidar disso
  },
  tartarugaWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
    marginTop: 0,
    // marginLeft: width * 0.17, // Removido para um layout flex mais simples, ajuste com padding/margin no baloesWrapper se necessário
  },
  tartarugaImage: {
    width: width,
    height: width,
    position: "absolute",
    right: width * -0.55, // Ajustado o 'right' para tentar posicionar como na imagem
    // Valores negativos aqui podem fazer a imagem sair da tela ou do wrapper.
    // Pode ser melhor não usar position:absolute e controlar com flex e margins/paddings.
    // Se remover absolute, ajuste o tartarugaWrapper.
    // top: 0, // Se precisar de ajuste vertical dentro do wrapper
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
