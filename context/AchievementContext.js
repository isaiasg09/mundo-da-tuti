import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useAchievements from "../hooks/useAchievements";

const AchievementContext = createContext();

export const AchievementProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [isShowingNotification, setIsShowingNotification] = useState(false);

  // console.log("🎉 AchievementProvider inicializado");

  const { mapFirestoreAchievement, mapAllAchievements, checkNewAchievements } =
    useAchievements();

  // Adicionar notificações à fila
  const queueAchievementNotifications = useCallback(
    (newlyUnlocked) => {
      // console.log("📥 queueAchievementNotifications recebeu:", newlyUnlocked);
      if (!newlyUnlocked || newlyUnlocked.length === 0) {
        console.log("⚠️ Nenhuma conquista para adicionar à fila");
        return;
      }

      const mappedNotifications = newlyUnlocked
        .map(({ key, achievement }) => {
          // console.log(`🔄 Mapeando conquista: ${key}`, achievement);
          const mapped = mapFirestoreAchievement(key, achievement);
          // console.log("✅ Mapeamento resultado:", mapped);
          return mapped;
        })
        .filter(Boolean);

      // console.log(`🎉 Adicionando ${mappedNotifications.length} notificações à fila`);
      setNotifications((prev) => {
        const newNotifications = [...prev, ...mappedNotifications];
        // console.log("📋 Fila atualizada:", newNotifications);
        return newNotifications;
      });
    },
    [mapFirestoreAchievement]
  );

  // Auto-mostrar notificação quando a fila é atualizada
  useEffect(() => {
    if (
      notifications.length > 0 &&
      !isShowingNotification &&
      currentNotificationIndex === 0
    ) {
      // console.log("🚀 Auto-iniciando primeira notificação");
      const timer = setTimeout(() => {
        setIsShowingNotification(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [notifications.length, isShowingNotification, currentNotificationIndex]);

  // Mostrar próxima notificação da fila
  const showNextNotification = useCallback(() => {
    if (notifications.length > 0 && !isShowingNotification) {
      // console.log(
      //   `📱 Mostrando notificação ${currentNotificationIndex + 1}/${notifications.length}`
      // );
      setIsShowingNotification(true);
    }
  }, [notifications.length, currentNotificationIndex, isShowingNotification]);

  // Esconder notificação atual e avançar para a próxima
  const hideCurrentNotification = useCallback(() => {
    setIsShowingNotification(false);

    setTimeout(() => {
      setCurrentNotificationIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= notifications.length) {
          // Todas as notificações foram mostradas, limpar a fila
          setNotifications([]);
          return 0;
        }
        return nextIndex;
      });
    }, 300); // Pequeno delay para animação
  }, [notifications.length]);

  // Processar conquistas recém-desbloqueadas
  const processNewAchievements = useCallback(
    (newlyUnlocked) => {
      // console.log("🎉 AchievementContext - processNewAchievements chamado!");
      // console.log("🎯 Conquistas recebidas:", JSON.stringify(newlyUnlocked, null, 2));
      // console.log(
      //   "🎯 Tipo das conquistas:",
      //   typeof newlyUnlocked,
      //   Array.isArray(newlyUnlocked)
      // );

      if (newlyUnlocked && newlyUnlocked.length > 0) {
        // console.log(
        //   `📋 Adicionando ${newlyUnlocked.length} conquistas à fila de notificações`
        // );
        queueAchievementNotifications(newlyUnlocked);
      } else {
        console.log("⚠️ Nenhuma conquista válida recebida para processamento");
      }
    },
    [queueAchievementNotifications]
  );

  // Obter notificação atual
  const getCurrentNotification = useCallback(() => {
    if (notifications.length > 0 && currentNotificationIndex < notifications.length) {
      return notifications[currentNotificationIndex];
    }
    return null;
  }, [notifications, currentNotificationIndex]);

  // Verificar se há notificações pendentes
  const hasPendingNotifications = notifications.length > 0 && !isShowingNotification;

  const value = {
    // Estado
    currentNotification: getCurrentNotification(),
    isShowingNotification,
    hasPendingNotifications,
    totalNotifications: notifications.length,
    currentNotificationIndex,

    // Ações
    processNewAchievements,
    showNextNotification,
    hideCurrentNotification,
    queueAchievementNotifications,

    // Utilitários
    mapFirestoreAchievement,
    mapAllAchievements,
    checkNewAchievements,
  };

  return (
    <AchievementContext.Provider value={value}>{children}</AchievementContext.Provider>
  );
};

export const useAchievementContext = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievementContext must be used within an AchievementProvider");
  }
  return context;
};

export default AchievementContext;
