// context/AuthContext.js
import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import AuthService from "../services/authService";
import { auth } from "../services/firebase";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  guardianData: null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guardianData, setGuardianData] = useState(null);

  useEffect(() => {
    // console.log("🔄 Configurando listener de autenticação...");

    let unsubscribe = null;

    // Aguardar um pouco para garantir que o Firebase está inicializado
    const timer = setTimeout(() => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          // console.log("🔐 Estado de autenticação mudou:", user ? "Logado" : "Deslogado");

          if (user) {
            // console.log("👤 Usuário logado:", user.uid);
            setUser(user);

            // Aqui você pode buscar dados adicionais do usuário no Firestore se necessário
            // Por exemplo, dados do guardian, preferências, etc.
            try {
              // console.log("✅ Dados do usuário carregados");
            } catch (error) {
              console.error("❌ Erro ao carregar dados do usuário:", error);
            }
          } else {
            // console.log("👤 Usuário deslogado");
            setUser(null);
            setGuardianData(null);
          }

          setIsLoading(false);
        });
      } catch (error) {
        console.error("❌ Erro ao configurar listener de autenticação:", error);
        setIsLoading(false);
      }
    }, 100);

    return () => {
      // console.log("🔄 Removendo listener de autenticação");
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    // console.log("🔐 AuthContext: Iniciando login...");
    setIsLoading(true);

    try {
      const result = await AuthService.login(email, password);

      if (result.success) {
        // console.log("✅ AuthContext: Login realizado com sucesso");
        // O onAuthStateChanged vai atualizar o estado automaticamente
      } else {
        console.error("❌ AuthContext: Erro no login:", result.error);
      }

      return result;
    } catch (error) {
      console.error("💥 AuthContext: Erro inesperado no login:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // console.log("🚪 AuthContext: Iniciando logout...");
    setIsLoading(true);

    try {
      const result = await AuthService.logout();

      if (result.success) {
        // console.log("✅ AuthContext: Logout realizado com sucesso");
        // O onAuthStateChanged vai limpar o estado automaticamente
      } else {
        console.error("❌ AuthContext: Erro no logout:", result.error);
      }

      return result;
    } catch (error) {
      console.error("💥 AuthContext: Erro inesperado no logout:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    guardianData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export default AuthContext;
