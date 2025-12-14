import React from 'react';
import type { Card as CardType } from '../types/game';
import clsx from 'clsx';
import './Card.css';

interface CardProps {
    card: CardType;
    index?: number; // Index in the pile (for stacking offset)
    onClick?: (e: React.MouseEvent) => void;
    onPointerDown?: (e: React.PointerEvent) => void;
    style?: React.CSSProperties;
    className?: string;
    isDragging?: boolean;
}

export const Card: React.FC<CardProps> = ({
    card,
    onClick,
    onPointerDown,
    style,
    className
}) => {
    return (
        <div
            className={clsx(
                'card',
                card.faceUp ? 'face-up' : 'face-down',
                card.rank === 1 && 'rank-1',
                className
            )}
            style={style}
            data-id={card.id}
            data-suit={card.suit}
            data-rank={card.rank}
            onClick={onClick}
            onPointerDown={card.faceUp ? onPointerDown : undefined} // Only draggable if face up
        >
            <div className="card-face card-front">
                <div className="card-header">
                    {card.rank === 1 ? (
                        <span className="card-suit-label">{card.suit}</span>
                    ) : (
                        <span className="card-rank-label">{card.text}</span>
                    )}
                </div>
                <div className="card-body">
                    <span className="card-word">{card.text}</span>
                </div>
                <div className="card-footer">
                    {card.rank === 1 && <span className="card-suit-label">{card.suit}</span>}
                </div>
            </div>
            <div className="card-face card-back">
                <div className="pattern"></div>
            </div>
        </div>
    );
};
