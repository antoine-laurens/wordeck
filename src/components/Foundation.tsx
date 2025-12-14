
import React from 'react';
import type { Card as CardType } from '../types/game';
import { Card } from './Card';
import './Foundation.css';
import { useGameStore } from '../store/gameStore';

interface FoundationProps {
    cards: CardType[];
    pileIndex: number;
    onCardPointerDown: (e: React.PointerEvent, card: CardType, area: 'foundation', pileIndex: number) => void;
}

export const Foundation: React.FC<FoundationProps> = ({ cards, pileIndex, onCardPointerDown }) => {
    const topCard = cards.length > 0 ? cards[cards.length - 1] : null;
    const activeThemes = useGameStore(state => state.activeThemes);
    const completingThemeIndex = useGameStore(state => state.completingThemeIndex);
    const finishThemeCompletion = useGameStore(state => state.finishThemeCompletion);

    const isCompleting = completingThemeIndex === pileIndex;

    React.useEffect(() => {
        if (isCompleting) {
            const timer = setTimeout(() => {
                finishThemeCompletion(pileIndex);
            }, 1000); /* 1.0s wait (animation + slight pause) */
            return () => clearTimeout(timer);
        }
    }, [isCompleting, pileIndex, finishThemeCompletion]);

    let progress = "";
    let themeName = "";

    if (cards.length > 0) {
        themeName = cards[0].suit; // Base card determines theme
        const targetCount = activeThemes[themeName]; // Total Words
        const currentWords = cards.length - 1; // Minus the theme card
        progress = `${currentWords}/${targetCount}`;
    }

    return (
        <div className={`foundation-wrapper ${isCompleting ? 'completing' : ''}`}>
            {themeName && (
                <div className="theme-tag">
                    <span className="theme-name">{themeName}</span>
                    <span className="theme-count">{progress}</span>
                </div>
            )}
            <div className="foundation-pile" data-area="foundation" data-index={pileIndex}>
                {topCard ? (
                    <Card
                        card={topCard}
                        onPointerDown={(e) => onCardPointerDown(e, topCard, 'foundation', pileIndex)}
                    />
                ) : (
                    <div className="empty-foundation-slot">
                        <span className="foundation-icon">A</span>
                    </div>
                )}
            </div>
        </div>
    );
};

