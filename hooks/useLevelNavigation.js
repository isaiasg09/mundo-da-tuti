import { PATHS, PATH_TO_SCREEN } from "@/constants/paths";
import { useGameProgress } from "@/context/GameContext";
import { useRouter } from "expo-router";

export function useLevelNavigation(pathId) {
  const router = useRouter();
  const ctx = useGameProgress();
  const { isLevelLocked, completeLevel, markLevelCompleted } = ctx || {};

  const getLevelConfig = (levelIndex1Based) => {
    if (!pathId || !PATHS[pathId]) return undefined;
    return PATHS[pathId].find((level) => level.id === levelIndex1Based);
  };

  const levelCount = PATHS[pathId]?.length ?? 0;

  function openLevel(levelIndex1Based, options = { replace: false }) {
    // Garantir que seja número
    const levelNum = Number(levelIndex1Based);
    
    if (!pathId || !PATHS[pathId]) {
      return { ok: false, reason: "invalid-path" };
    }

    const cfg = getLevelConfig(levelNum);
    if (!cfg) {
      return { ok: false, reason: "not-found" };
    }

    const safeIsLevelLocked =
      typeof isLevelLocked === "function" ? isLevelLocked : () => false;
    const isLocked = safeIsLevelLocked(pathId, levelNum);

    if (isLocked) {
      return { ok: false, reason: "locked" };
    }

    const nav = {
      pathname: cfg.route,
      params: {
        pathId,
        gameId: cfg.id,
        difficulty: cfg.difficulty,
        gameType: cfg.gameType,
      },
    };
    options?.replace ? router.replace(nav) : router.push(nav);
    return { ok: true };
  }

  // Marca apenas o nível atual como concluído (sem navegar)
  function markCompleted(levelIndex1Based) {
    if (!pathId || !PATHS[pathId]) return { ok: false, reason: "invalid-path" };
    if (typeof markLevelCompleted === "function")
      markLevelCompleted(pathId, levelIndex1Based);
    return { ok: true };
  }

  // Conclui e tenta abrir o próximo; se não der, volta ao mapa
  function completeLevelAndMaybeOpenNext(levelIndex1Based) {
    if (!pathId || !PATHS[pathId]) return { ok: false, reason: "invalid-path" };
    if (typeof completeLevel === "function") {
      // Convert levelIndex1Based to gameKey format (e.g., 1 -> "game1")
      const gameKey = `game${levelIndex1Based}`;
      completeLevel(pathId, gameKey);
    }

    // Converter para número para evitar concatenação de strings
    const currentLevel = Number(levelIndex1Based);
    const next = currentLevel + 1;
    const res = openLevel(next);
    if (!res || res.ok === false) {
      // Usa a mesma lógica do openMap() para garantir navegação correta
      const screen = PATH_TO_SCREEN[pathId] || "/firstpath";
      try {
        router.dismissAll();
        // Pequeno delay para garantir que dismissAll() complete antes do push
        setTimeout(() => {
          router.push({ pathname: screen, params: { pathId } });
        }, 100);
      } catch (error) {
        console.error("Erro na navegação após completar nível:", error);
        // Fallback: tentar navegação direta
        router.push({ pathname: screen, params: { pathId } });
      }
    }
    return { ok: true };
  }

  // Utilitário para telas de vitória: marca conclusão imediatamente (inclui avanço de caminho no último nível), sem navegar
  function onWinMarkOnly(levelIndex1Based) {
    // console.log(
    //   `[useLevelNavigation] onWinMarkOnly called with level: ${levelIndex1Based}, pathId: ${pathId}`
    // );

    if (!pathId || !PATHS[pathId]) {
      console.log(`[useLevelNavigation] Invalid path: pathId=${pathId}`);
      return { ok: false, reason: "invalid-path" };
    }

    if (typeof completeLevel === "function") {
      // Convert levelIndex1Based to gameKey format (e.g., 1 -> "game1")
      const gameKey = `game${levelIndex1Based}`;
      // console.log(
      //   `[useLevelNavigation] Calling completeLevel with pathId=${pathId}, gameKey=${gameKey}`
      // );
      completeLevel(pathId, gameKey);
    } else {
      console.log(
        `[useLevelNavigation] completeLevel is not a function:`,
        typeof completeLevel
      );
    }
    return { ok: true };
  }

  function openMap() {
    const screen = PATH_TO_SCREEN[pathId] || "/firstpath";
    // Navegar de volta para a home primeiro, depois para o mapa
    // Isso garante que o BackButton na tela do mapa leve de volta para a home
    try {
      router.dismissAll();
      // Pequeno delay para garantir que dismissAll() complete antes do push
      setTimeout(() => {
        router.push({ pathname: screen, params: { pathId } });
      }, 100);
    } catch (error) {
      console.error("Erro na navegação para o mapa:", error);
      // Fallback: tentar navegação direta
      router.push({ pathname: screen, params: { pathId } });
    }
  }

  function openNext(levelIndex1Based) {
    // Converter para número para evitar concatenação de strings
    const currentLevel = Number(levelIndex1Based);
    const next = currentLevel + 1;
    
    const res = openLevel(next);
    if (!res || res.ok === false) {
      openMap();
    }
    return res;
  }

  return {
    openLevel,
    completeLevel: completeLevelAndMaybeOpenNext,
    getLevelConfig,
    levelCount,
    markCompleted,
    onWinMarkOnly,
    openMap,
    openNext,
  };
}
