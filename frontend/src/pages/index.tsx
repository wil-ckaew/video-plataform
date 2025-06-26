// pages/index.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

const HomePage = () => {
  return (
    <main className={styles.container}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/jogador-futebol.gif"
          alt="Jogador de Futebol"
          width={200}
          height={200}
        />
      </div>
      <h1 className={styles.headerTitle}>
        Bem-vindo à página da{' '}
        <span className={styles.redText}>Retesp</span> -{' '}
        <span className={styles.greenText}>Projeto 4 Linhas</span>!
      </h1>
      <p className={styles.paragraph}>
        ......Desafiando pequenos Gigantes......
      </p>
      <Link href="/meus_videos/videos">
        <button className={styles.button}>Clique Aqui!</button>
      </Link>
    </main>
  );
};

export default HomePage;
