import React from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css'; // Importando CSS module

const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <ul>
        <li><Link href="/users/users">Users</Link></li>
        <li><Link href="/parents/parents">Parents</Link></li>
        <li><Link href="/documents/documents">Documents</Link></li>
        <li><Link href="/tasks/tasks">Tasks</Link></li>
        <li><Link href="/students/students">Students</Link></li>
        <li><Link href="/videos/videos">Videos api</Link></li>
        <li><Link href="/uploads/uploads">Uploads</Link></li>
        <li><Link href="/photos/photos">Photos Api</Link></li>
        <li><Link href="/photos">Photos</Link></li>
        <li><Link href="/">Videos</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
