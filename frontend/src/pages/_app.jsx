// src/pages/_app.jsx
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css'; // Global Tailwind Styles

/**
 * Modera - Main App Wrapper
 * This file is the "Master" entry point for the entire website.
 * It wraps every page in the AuthProvider so the system knows 
 * if a user is an 'Admin' or a 'User' at all times.
 */
export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Modera | AI Content Moderation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Professional AI-Powered Content Moderation Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AuthProvider>
        {/* 
           The 'Component' here represents the specific page being viewed 
           (e.g., Dashboard, History, or Analytics). 
        */}
        <div className="antialiased font-sans">
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </>
  );
}