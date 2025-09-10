<template>
  <div class="home">
    <header>
      <h1>Intérprete de Lenguaje de Señas</h1>
      <p>Comunicación bidireccional en tiempo real para personas sordas y oyentes</p>
    </header>

    <main>
      <sign-language-detection />
    </main>

    <footer>
      <p>Desarrollado para HackaTec - Interpretación de lenguaje de señas en tiempo real</p>
    </footer>
  </div>
</template>

<script>
import SignLanguageDetection from '@/components/SignLanguageDetection.vue'

export default {
  name: 'HomePage', // Cambiado a un nombre multi-palabra para satisfacer la regla de ESLint
  components: {
    SignLanguageDetection
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  text-align: center;
}

header h1 {
  margin: 0;
  font-size: 2.5rem;
}

header p {
  margin: 10px 0 0;
  font-size: 1.2rem;
  opacity: 0.8;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
}

footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 10px;
  font-size: 0.9rem;
}
</style>
