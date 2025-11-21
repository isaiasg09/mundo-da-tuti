// Teste rápido para validação de email
import AuthService from "./services/authService.js";

async function testEmailValidation() {
  console.log("🧪 Iniciando testes de validação de email\n");

  const emailsToTest = [
    "teste123456789@gmail.com", // Provavelmente não existe
    "admin@gmail.com", // Provavelmente existe
    "test@test.com", // Pode existir ou não
    "naoexiste12345@teste.com", // Provavelmente não existe
  ];

  for (const email of emailsToTest) {
    console.log(`\n📧 Testando: ${email}`);
    try {
      const exists = await AuthService.checkEmailExists(email);
      console.log(`   Resultado: ${exists ? "❌ JÁ EXISTE" : "✅ DISPONÍVEL"}`);
    } catch (error) {
      console.log(`   Erro: ${error.message}`);
    }

    // Aguardar um pouco entre testes
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n🏁 Testes concluídos");
}

// Executar o teste
testEmailValidation().catch(console.error);
