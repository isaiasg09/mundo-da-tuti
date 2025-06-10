// components/Fish.jsx
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet } from "react-native";

const Fish = ({
  source,
  initialPosition,
  size,
  containerWidth,
  containerHeight,
}) => {
  // Guarda a posição animada do peixe (x, y). Usamos useRef para que não seja recriado a cada renderização.
  const position = useRef(new Animated.ValueXY(initialPosition)).current;

  // Estado para controlar se a imagem do peixe está virada (flipped) horizontalmente
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Função recursiva para animar o peixe continuamente
    const animateFish = () => {
      // 1. Calcula um novo destino aleatório (x, y) e uma nova duração
      const newX = Math.random() * (containerWidth - size.width);
      const newY = Math.random() * (containerHeight - size.height);
      const duration = 3000 + Math.random() * 4000; // Duração entre 3 e 7 segundos

      // Determina se o peixe deve virar
      const shouldFlip = newX < position.x._value;

      // --- CORREÇÃO DO WARNING AQUI ---
      // Usamos requestAnimationFrame para agendar a atualização de estado para um momento seguro,
      // evitando o warning do 'useInsertionEffect'.
      requestAnimationFrame(() => {
        setIsFlipped(shouldFlip);
      });
      // --- FIM DA CORREÇÃO ---

      // 3. Inicia a animação de 'timing' para o novo destino
      Animated.timing(position, {
        toValue: { x: newX, y: newY },
        duration: duration,
        useNativeDriver: true, // Importante para performance
      }).start(() => {
        // 4. Quando a animação termina, chama a si mesma para começar um novo movimento
        animateFish();
      });
    };

    // Inicia a primeira animação
    animateFish();

    // Função de limpeza: para a animação se o componente for desmontado
    return () => position.stopAnimation();
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez (na montagem)

  // Estilo animado que aplica a posição e a transformação para virar o peixe
  const animatedStyle = {
    ...styles.fish,
    width: size.width,
    height: size.height,
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { scaleX: isFlipped ? -1 : 1 }, // Vira a imagem no eixo X se isFlipped for true
    ],
  };

  return (
    <Animated.Image
      source={source}
      style={animatedStyle}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  fish: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});

export default Fish;
