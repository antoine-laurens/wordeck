import React from 'react';
import { useGameStore } from '../store/gameStore';

export const StartScreen: React.FC = () => {
    const startGame = useGameStore(state => state.startGame);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg)', // Ensure background covers
            zIndex: 1000,
            textAlign: 'center',
            gap: '20px',
            padding: 0,
            margin: 0
        }}>
            <img
                src="/wordeck-logo.png"
                alt="Wordeck Logo"
                style={{
                    width: '300px',
                    height: 'auto',
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                }}
            />
            <h1 style={{ fontFamily: '"BBH Sans Hegarty", sans-serif', fontSize: '4rem', marginBottom: '0', color: '#34495e' }}>WORDECK</h1>
            <p style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>Stack words by theme</p>

            <button
                onClick={startGame}
                style={{
                    fontSize: '1.5rem',
                    padding: '12px 32px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginTop: '20px',
                    fontWeight: 'bold'
                }}
            >
                Play
            </button>
        </div>
    );
};
