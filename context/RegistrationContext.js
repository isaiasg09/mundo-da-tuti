// context/RegistrationContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

// 1. Define o valor inicial para os dados do cadastro
const initialRegistrationData = {
  // Campos iniciais do cadastro
  email: "", // Email do responsável
  senha: "", // Senha do responsável
  codigoSeguranca: "", // Código de segurança do responsável
  nome: "", // Nome da criança
  idade: "", // Idade da criança
  sindromesCrianca: [], // Para as seleções da tela Pergunta1
  agitada: false, // Para a tela Pergunta2
  dificuldadeInstrucoes: false, // Para a tela Pergunta3
  birrasIntensas: false, // Para a tela Pergunta4
  seDistraiFacilmente: false, // Para a tela Pergunta5
  interageBem: false, // Para a tela Pergunta6
  usuario: "", // Nome de usuário do responsável
  imagemPerfil: "", // Imagem de perfil do responsável
};

// 2. Cria o Contexto
// Ele terá o estado dos dados e uma função para atualizá-los
const RegistrationContext = createContext({
  registrationData: initialRegistrationData,
  setRegistrationData: (data) => {}, // Função placeholder
});

// 3. Cria o Componente Provedor (Provider)
// Este componente vai envolver as partes do seu app que precisam acessar os dados do cadastro.
// Ele vai gerenciar o estado real e fornecer a função para modificá-lo.
export const RegistrationProvider = ({ children }) => {
  const [registrationData, setRegistrationDataState] = useState(
    initialRegistrationData
  );

  // Função para atualizar os dados do cadastro.
  // Você pode passar um objeto com os campos que quer atualizar.
  const handleSetRegistrationData = (newData) => {
    setRegistrationDataState((prevData) => ({
      ...prevData, // Mantém os dados antigos
      ...newData, // Sobrescreve/adiciona os novos dados
    }));
  };

  // ==================================================================
  // AQUI ESTÁ O useEffect PARA LOGAR AS MUDANÇAS
  // ==================================================================
  // useEffect(() => {
  //   // Este console.log será executado toda vez que o objeto 'registrationData' mudar.
  //   // Isso acontece após o estado ser atualizado e o componente Provedor ser re-renderizado.
  //   console.log("DADOS DO CONTEXTO DE CADASTRO ATUALIZADOS:", registrationData);
  // }, [registrationData]); // O array de dependências garante que o efeito rode apenas quando 'registrationData' mudar
  // ==================================================================

  return (
    <RegistrationContext.Provider
      value={{
        registrationData,
        setRegistrationData: handleSetRegistrationData,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

// 4. Cria um Hook personalizado para facilitar o uso do contexto
// Isso evita ter que importar useContext e RegistrationContext em todo componente.
export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error(
      "useRegistration deve ser usado dentro de um RegistrationProvider"
    );
  }
  return context;
};

// log toda vez que os dados mudarem
