// app/page.tsx

import React from 'react';
import styles from './page.module.css'; // Se você quiser adicionar estilos

const HomePage = () => {
  return (
    <main className={styles.container}>
      <h1>Bem-vindo ao Meu Site!</h1>
      <p>Esta é a página inicial usando a nova estrutura do Next.js.</p>
      <button className={styles.button}>Clique Aqui!</button>
    </main>
  );
};

export default HomePage;
