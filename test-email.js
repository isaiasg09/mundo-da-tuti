// Teste rápido para verificar fetchSignInMethodsForEmail
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "./services/firebase.js";

async function testEmailCheck() {
  try {
    // Teste com email que provavelmente existe
    console.log("🔍 Testando email que existe...");
    const methods1 = await fetchSignInMethodsForEmail(auth, "test@gmail.com");
    console.log("📊 Métodos para test@gmail.com:", methods1);
    console.log("📊 Quantidade:", methods1?.length || 0);

    // Teste com email que provavelmente não existe
    console.log("\n🔍 Testando email que não existe...");
    const methods2 = await fetchSignInMethodsForEmail(
      auth,
      "emailquenaoexiste123456789@gmail.com"
    );
    console.log("📊 Métodos para emailquenaoexiste123456789@gmail.com:", methods2);
    console.log("📊 Quantidade:", methods2?.length || 0);
  } catch (error) {
    console.error("❌ Erro no teste:", error);
    console.error("❌ Código:", error.code);
    console.error("❌ Mensagem:", error.message);
  }
}

// Execute o teste
testEmailCheck();
