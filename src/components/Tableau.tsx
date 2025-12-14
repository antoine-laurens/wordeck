
import React from 'react';
import type { Card as CardType } from '../types/game';
import { Card } from './Card';
import './Tableau.css';

interface TableauProps {
    cards: CardType[];
    colIndex: number;
    onCardPointerDown: (e: React.PointerEvent, card: CardType, area: 'tableau', pileIndex: number) => void;
}

export const Tableau: React.FC<TableauProps> = ({ cards, colIndex, onCardPointerDown }) => {
    return (
        <div className="tableau-column" data-area="tableau" data-index={colIndex}>
            {cards.map((card, index) => {
                // Calculate offset
                // Face down cards are close together
                // Face up cards are further apart
                // But CSS handles flowing layout better if we use negative margins
                const prevCard = index > 0 ? cards[index - 1] : null;
                let marginTop = 0;

                if (index > 0) {
                    marginTop = prevCard && prevCard.faceUp ? -95 : -130;  // Adjust these values based on card height
                    // Card height is 140px (desktop) or 112px (mobile).
                    // If we want 20px visible for face down, overlap should be Height - 20.
                    // If we want 40px visible for face up, overlap should be Height - 40.
                    // We can use CSS variables for this logic? 
                    // Better to use a class or inline style with calc.
                }

                return (
                    <div
                        key={card.id}
                        className="tableau-card-wrapper"
                        style={{
                            marginTop: index === 0 ? 0 : marginTop,
                            // we can handle overlap via CSS class based on previous card state
                        }}
                        data-index={index}
                    >
                        <Card
                            card={card}
                            onPointerDown={(e) => onCardPointerDown(e, card, 'tableau', colIndex)}
                        />
                    </div>
                );
            })}
            {/* Empty placeholder if no cards */}
            {cards.length === 0 && <div className="empty-slot" />}
        </div>
    );
};
