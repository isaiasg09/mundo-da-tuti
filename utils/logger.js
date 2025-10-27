// utils/logger.js
// Sistema de logs condicional para desenvolvimento vs produção

/**
 * Sistema de logging condicional
 * - Em desenvolvimento (__DEV__ = true): todos os logs são exibidos
 * - Em produção (__DEV__ = false): apenas logs de erro críticos são exibidos
 */

// Verifica se estamos em ambiente de desenvolvimento
const isDevelopment = __DEV__ || process.env.NODE_ENV === "development";

/**
 * Logger minimalista - apenas logs essenciais
 * Removemos a maioria dos logs de desenvolvimento para produção limpa
 */
export const devLog = {
  // Desabilitados por padrão - apenas erros essenciais
  log: () => {},
  info: () => {},
  warn: () => {},
  debug: () => {},

  // Logs específicos desabilitados - apenas para debug crítico se necessário
  auth: () => {},
  game: () => {},
  firebase: () => {},
  navigation: () => {},
  achievement: () => {},
  sync: () => {},
  progress: () => {},
};

/**
 * Logger para produção - apenas logs críticos e essenciais
 */
export const prodLog = {
  error: console.error,
  critical: (...args) => console.error("🚨 [CRITICAL]", ...args),
};

/**
 * Logger unificado - use este na maioria dos casos
 */
export const logger = {
  // Logs de desenvolvimento (só aparecem em dev)
  dev: devLog,

  // Logs de produção (sempre aparecem)
  error: prodLog.error,
  critical: prodLog.critical,
  userAction: prodLog.userAction,
  systemEvent: prodLog.systemEvent,

  // Método utilitário para logs condicionais personalizados
  conditional: (condition, ...args) => {
    if (condition) console.log(...args);
  },

  // Método para logs com níveis
  level: (level, ...args) => {
    const levels = {
      debug: isDevelopment ? console.debug : () => {},
      info: isDevelopment ? console.info : () => {},
      warn: console.warn, // Warnings sempre visíveis
      error: console.error, // Erros sempre visíveis
    };

    if (levels[level]) {
      levels[level](...args);
    }
  },
};

/**
 * Exemplos de uso:
 *
 * // Logs que só aparecem em desenvolvimento
 * logger.dev.auth('Usuario logado:', userId);
 * logger.dev.game('Jogo iniciado:', gameData);
 * logger.dev.log('Debug info:', data);
 *
 * // Logs que sempre aparecem (produção)
 * logger.error('Erro crítico:', error);
 * logger.critical('Sistema falhou:', details);
 * logger.userAction('Usuario completou jogo:', gameId);
 *
 * // Logs condicionais
 * logger.conditional(isDebugMode, 'Debug ativo:', debugData);
 * logger.level('error', 'Erro importante:', errorDetails);
 */

// Exporta também individualmente para flexibilidade
export { isDevelopment };
export default logger;
