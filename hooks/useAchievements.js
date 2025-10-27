import { useCallback, useState } from "react";
import { ACHIEVEMENTS } from "../constants/achievements";

// Mapeamento entre as chaves do Firestore e as chaves do arquivo de conquistas
const ACHIEVEMENT_MAPPING = {
  // Conquistas do GameProgressService
  estudo_focado: 2, // "Estudo focado" - Complete todos os jogos fáceis no castelo
  imbativel: 7, // "Imbatível!" - Complete todos os jogos da pérola
  mestre_calculo: 3, // "Mestre do Cálculo" - Complete todos os jogos de cálculo
  explorador: 4, // "Explorador do Castelo" - Complete todos os jogos do castelo
  campeao: 8, // "Aventuras Submarinas" - Complete todos os jogos da anêmona
  dedicado: 5, // "Aprendiz Dedicado" - Complete 10 jogos diferentes

  // Conquistas adicionais baseadas em contagem de jogos
  primeira_conquista: 1, // "Primeira Conquista" - Complete seu primeiro jogo
  aluno_brilhante: 6, // "Aluno Brilhante" - Complete 15 jogos diferentes
  mundo_completo: 9, // "TECECE" - Complete todos os jogos do Mundo da Tuti
};

export const useAchievements = () => {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  // Converter conquista do Firestore para formato com imagem
  const mapFirestoreAchievement = useCallback((key, firestoreAchievement) => {
    const achievementId = ACHIEVEMENT_MAPPING[key];
    const achievementData = ACHIEVEMENTS[achievementId];

    if (!achievementData) {
      console.warn(`Conquista não encontrada para a chave: ${key}`);
      return null;
    }

    return {
      id: achievementId,
      key,
      title: achievementData.title,
      description: achievementData.description,
      image: achievementData.image,
      unlocked: firestoreAchievement.unlocked || false,
      unlocked_at: firestoreAchievement.unlocked_at || null,
    };
  }, []);

  // Converter todas as conquistas do Firestore
  const mapAllAchievements = useCallback(
    (firestoreAchievements) => {
      const mappedAchievements = [];

      Object.entries(firestoreAchievements || {}).forEach(([key, achievement]) => {
        const mapped = mapFirestoreAchievement(key, achievement);
        if (mapped) {
          mappedAchievements.push(mapped);
        }
      });

      // Adicionar conquistas baseadas em contagem de jogos se não existirem
      const existingKeys = Object.keys(firestoreAchievements || {});

      if (!existingKeys.includes("primeira_conquista")) {
        mappedAchievements.push({
          id: 1,
          key: "primeira_conquista",
          title: ACHIEVEMENTS[1].title,
          description: ACHIEVEMENTS[1].description,
          image: ACHIEVEMENTS[1].image,
          unlocked: false,
          unlocked_at: null,
        });
      }

      return mappedAchievements.sort((a, b) => a.id - b.id);
    },
    [mapFirestoreAchievement]
  );

  // Mostrar notificação de conquista desbloqueada
  const showAchievementNotification = useCallback(
    (achievementKey, firestoreAchievement) => {
      const mapped = mapFirestoreAchievement(achievementKey, firestoreAchievement);
      if (mapped && mapped.unlocked) {
        setCurrentNotification(mapped);
        setShowNotification(true);
      }
    },
    [mapFirestoreAchievement]
  );

  // Esconder notificação
  const hideNotification = useCallback(() => {
    setShowNotification(false);
    setCurrentNotification(null);
  }, []);

  // Verificar quais conquistas foram desbloqueadas recentemente
  const checkNewAchievements = useCallback(
    (previousAchievements, currentAchievements) => {
      const newlyUnlocked = [];

      Object.entries(currentAchievements || {}).forEach(([key, achievement]) => {
        const previous = previousAchievements?.[key];
        const wasLocked = !previous?.unlocked;
        const isNowUnlocked = achievement.unlocked;

        if (wasLocked && isNowUnlocked) {
          const mapped = mapFirestoreAchievement(key, achievement);
          if (mapped) {
            newlyUnlocked.push({ key, achievement: mapped });
          }
        }
      });

      return newlyUnlocked;
    },
    [mapFirestoreAchievement]
  );

  return {
    currentNotification,
    showNotification,
    showAchievementNotification,
    hideNotification,
    mapFirestoreAchievement,
    mapAllAchievements,
    checkNewAchievements,
  };
};

export default useAchievements;
