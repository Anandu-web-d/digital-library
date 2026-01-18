import React, { useState, useEffect } from 'react';
import '../styles/theme.css';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, explorer!";
  if (hour < 18) return "Good afternoon, creator!";
  return "Good evening, innovator!";
}

export default function App() {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const timer = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animated" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 className="accent" style={{ fontSize: '2.5rem', letterSpacing: '2px' }}>{greeting}</h1>
      <p style={{ maxWidth: 500, textAlign: 'center', margin: '1.5em 0' }}>
        Welcome to <span className="accent">Unidot</span>! Dive into a creative, dynamic experience with a sleek black theme. 
        <br />
        <span style={{ color: '#ff00c8', fontWeight: 'bold' }}>Try interacting with the buttons below!</span>
      </p>
      <button className="button animated" onClick={() => alert('You discovered a hidden gem!')}>
        Surprise Me
      </button>
    </div>
  );
}
