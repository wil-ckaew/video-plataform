// src/components/Header.tsx
// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';
import { HiMenu, HiX } from 'react-icons/hi';
import { ArrowLeft } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setActiveSection(null);
  };

  const menuSections = [
    {
      name: 'Cadastros',
      items: [
        { href: '/users/users', label: 'Usuários' },
        { href: '/parents/parents', label: 'Parentes' },
        { href: '/students/students', label: 'Alunos' },
        { href: '/phones/phones', label: 'Telefone' },
        { href: '/groups/groups', label: 'Turmas' },
        { href: '/guardians/guardians', label: 'Guardians' },
        { href: '/documents/documents', label: 'Documentos' },
        { href: '/tasks/tasks', label: 'Tarefas' },
      ],
    },
    {
      name: 'Serviços',
      items: [
        { href: '/attendances/attendances', label: 'Presenças' },
        { href: '/warnings/warnings', label: 'Advertências' },
        { href: '/schedule_changes/schedule_changes', label: 'Mudanças de Horário' },
      ],
    },
    {
      name: 'Mídia',
      items: [
        { href: '/uploads/uploads', label: 'Uploads' },
        { href: '/meus_videos/videos', label: 'Meus Vídeos' },
        { href: '/videos/videos', label: 'Vídeos' },
        { href: '/allvideos/allvideos', label: 'Todos os Vídeos' },
        { href: '/photos/photos', label: 'Fotos' },
        { href: '/photos/photos_geral', label: 'Fotos Geral' },
      ],
    },
    {
      name: 'Comunicação',
      items: [
        { href: '/chat_rooms/chat_rooms', label: 'Salas de Chat' },
        { href: '/messages/messages', label: 'Mensagens' },
      ],
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image src="/images/logo.jpeg" alt="Logo" width={110} height={30} />
        <div className={styles.titleContainer}>
          <h1 className="text-2xl font-bold">
            <span className="text-red-500">Retesp</span> -{' '}
            <span className="text-green-500">Projeto 4 Linhas</span>
          </h1>
          <h2 className="text-xl font-semibold">Desafiando Pequenos Gigantes</h2>
        </div>
      </div>

      <button onClick={toggleMenu} className={styles.menuBtn}>
        {isMenuOpen ? <HiX /> : isMobile ? <HiMenu /> : 'Menu'}
      </button>

      {isClient && (
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <ul className={styles.navList}>
            {!activeSection ? (
              <>
                {/* Botão Home */}
                <li className={styles.navItem}>
                  <Link href="/" className={styles.navLink}>
                    Home
                  </Link>
                </li>
                {/* Seções do menu */}
                {menuSections.map((section) => (
                  <li key={section.name}>
                    <button
                      onClick={() => setActiveSection(section.name)}
                      className="w-full text-left text-gray-800 font-semibold hover:text-green-600"
                    >
                      {section.name}
                    </button>
                  </li>
                ))}
              </>
            ) : (
              <>
                <li>
                  <button
                    onClick={() => setActiveSection(null)}
                    className="flex items-center text-sm text-gray-600 hover:text-green-600 mb-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                  </button>
                </li>
                <li className="font-semibold text-gray-700 mb-2">{activeSection}</li>
                {menuSections
                  .find((section) => section.name === activeSection)
                  ?.items.map((item) => (
                    <li key={item.href} className={styles.navItem}>
                      <Link href={item.href} className={styles.navLink}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
