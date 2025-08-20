import { useRouter } from "expo-router";
import { PATHS } from "@/constants/paths";
import { useGameProgress } from "@/context/GameContext";

const PATH_TO_SCREEN = { castelo: "/firstpath", molusco_perola: "/secondpath" };

export function useLevelNavigation(pathId) {
  const router = useRouter();
  const ctx = useGameProgress();
  const { isLevelLocked, completeLevel } = ctx || {};

  const getLevelConfig = (levelIndex1Based) => {
    if (!pathId || !PATHS[pathId]) return undefined;
    return PATHS[pathId].find((level) => level.id === levelIndex1Based);
  };

  const levelCount = PATHS[pathId]?.length ?? 0;

  function openLevel(levelIndex1Based, options = { replace: false }) {
    if (!pathId || !PATHS[pathId]) return { ok: false, reason: "invalid-path" };

    const cfg = getLevelConfig(levelIndex1Based);
    if (!cfg) return { ok: false, reason: "not-found" };

    const safeIsLevelLocked =
      typeof isLevelLocked === "function" ? isLevelLocked : () => false;
    if (safeIsLevelLocked(pathId, levelIndex1Based))
      return { ok: false, reason: "locked" };

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

  function completeLevelAndMaybeOpenNext(levelIndex1Based) {
    if (!pathId || !PATHS[pathId]) return { ok: false, reason: "invalid-path" };
    if (typeof completeLevel === "function") completeLevel(pathId, levelIndex1Based);

    const next = levelIndex1Based + 1;
    const res = openLevel(next);
    if (!res || res.ok === false) {
      const screen = PATH_TO_SCREEN[pathId] || "/firstpath";
      router.replace({ pathname: screen, params: { pathId } });
    }
    return { ok: true };
  }

  return {
    openLevel,
    completeLevel: completeLevelAndMaybeOpenNext,
    getLevelConfig,
    levelCount,
  };
}
