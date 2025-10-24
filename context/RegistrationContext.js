// context/RegistrationContext.js
import React, { createContext, useContext, useState } from "react";
import AuthService from "../services/authService";

const initialRegistrationData = {
  email: "",
  senha: "",
  codigoSeguranca: "",
  nome: "",
  idade: "",
  genero: "", // Adicionar este campo
  sindromesCrianca: [],
  agitada: false,
  dificuldadeInstrucoes: false,
  birrasIntensas: false,
  seDistraiFacilmente: false,
  interageBem: false,
  usuario: "",
  imagemPerfil: "",
  observacoes: "", // Adicionar para observações personalizadas
};

const RegistrationContext = createContext({
  registrationData: initialRegistrationData,
  setRegistrationData: (data) => {},
  submitRegistration: () => {}, // Nova função
  isLoading: false, // Novo estado
  error: null, // Novo estado
});

export const RegistrationProvider = ({ children }) => {
  const [registrationData, setRegistrationDataState] = useState(initialRegistrationData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSetRegistrationData = (newData) => {
    setRegistrationDataState((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  // Nova função para submeter o registro
  const submitRegistration = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.registerGuardian(registrationData);

      if (result.success) {
        // Limpar dados após sucesso
        setRegistrationDataState(initialRegistrationData);
        return { success: true, guardianId: result.guardianId };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegistrationContext.Provider
      value={{
        registrationData,
        setRegistrationData: handleSetRegistrationData,
        submitRegistration, // Nova função disponível
        isLoading,
        error,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error("useRegistration deve ser usado dentro de um RegistrationProvider");
  }
  return context;
};
