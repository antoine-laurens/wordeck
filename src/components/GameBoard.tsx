import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Tableau } from './Tableau';
import { Foundation } from './Foundation';
import { StockWaste } from './StockWaste';
import { Card } from './Card';
import type { Card as CardType } from '../types/game';
import './GameBoard.css';

interface DragState {
    isDragging: boolean;
    cards: CardType[];
    source: { area: 'tableau' | 'waste' | 'foundation'; index: number };
    startPos: { x: number; y: number }; // Cursor start
    currentPos: { x: number; y: number }; // Cursor current
    cardOffset: { x: number; y: number }; // Cursor relative to card top-left
}

export const GameBoard: React.FC = () => {
    const {
        stock, waste, foundation, tableau, moves, status,
        startGame, drawCard, moveCards, restartGame
    } = useGameStore();

    // Use game store status directly
    const gameStatus = status;

    const [dragState, setDragState] = useState<DragState | null>(null);

    // Initialize game on mount
    useEffect(() => {
        // Only start if clean state or explicitly requested, but typically store handles init
        // If we want to ensure a game is running:
        if (foundation.every(p => p.length === 0) && tableau.every(p => p.length === 0)) {
            startGame();
        }
    }, []);

    // Handle Drag Events
    const handlePointerDown = (e: React.PointerEvent, card: CardType, area: 'tableau' | 'waste' | 'foundation', pileIndex: number) => {
        // 1. Determine cards to drag
        let draggingCards: CardType[] = [];

        if (area === 'tableau') {
            const column = tableau[pileIndex];
            const cardIndex = column.findIndex(c => c.id === card.id);
            if (cardIndex === -1) return;

            const stack = column.slice(cardIndex);
            // Validate stack: Must be same theme (Any Order)
            let isValidStack = true;
            for (let i = 0; i < stack.length - 1; i++) {
                if (stack[i].suit !== stack[i + 1].suit) {
                    isValidStack = false;
                    break;
                }
            }

            if (!isValidStack) return; // Cannot drag invalid stack
            draggingCards = stack;
        } else {
            draggingCards = [card];
        }

        // 2. Calculate offsets
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

        setDragState({
            isDragging: true,
            cards: draggingCards,
            source: { area, index: pileIndex },
            startPos: { x: e.clientX, y: e.clientY },
            currentPos: { x: e.clientX, y: e.clientY },
            cardOffset: { x: e.clientX - rect.left, y: e.clientY - rect.top }
        });

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragState?.isDragging) return;
        setDragState(prev => prev ? { ...prev, currentPos: { x: e.clientX, y: e.clientY } } : null);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!dragState?.isDragging) return;

        // Hit Testing
        // We use document.elementsFromPoint to find a drop zone
        // The DragOverlay has pointer-events: none, so we see through it
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        let target: { area: 'tableau' | 'foundation'; index: number } | null = null;

        for (const el of elements) {
            // Use closest to find the container if we dropped on a child (card)
            const htmlEl = el as HTMLElement;
            const container = htmlEl.closest('[data-area]');

            if (container) {
                const area = container.getAttribute('data-area');
                const index = container.getAttribute('data-index');

                if (area === 'tableau' && index !== null) {
                    target = { area: 'tableau', index: parseInt(index, 10) };
                    break;
                }
                if (area === 'foundation' && index !== null) {
                    target = { area: 'foundation', index: parseInt(index, 10) };
                    break;
                }
            }
        }


        if (target) {
            // Execute Move
            moveCards({ ...dragState.source, cards: dragState.cards }, target);
        }

        setDragState(null);
    };

    return (
        <div
            className="game-board"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => setDragState(null)} // Cancel drag if leaving window
        >
            {/* Header / Stats */}
            <div className="game-header">
                <div className="stats">
                    <button onClick={restartGame}>Restart</button>
                    <span>Moves: {moves}</span>
                </div>
            </div>

            {/* Top Area: Stock/Waste + Foundations */}
            <div className="top-row">
                <StockWaste
                    stock={stock}
                    waste={waste}
                    onDraw={drawCard}
                    onCardPointerDown={(e, card) => handlePointerDown(e, card, 'waste', 0)}
                />

                <div className="foundations">
                    {foundation.map((pile, index) => (
                        <Foundation
                            key={`foundation-${index}`}
                            pileIndex={index}
                            cards={pile}
                            onCardPointerDown={handlePointerDown}
                        />
                    ))}
                </div>
            </div>

            {/* Tableau */}
            <div className="tableau-grid">
                {tableau.map((pile, index) => (
                    <Tableau
                        key={`tableau-${index}`}
                        colIndex={index}
                        cards={pile}
                        onCardPointerDown={handlePointerDown}
                    />
                ))}
            </div>

            {/* Drag Layer */}
            {dragState && (
                <div
                    className="drag-layer"
                    style={{
                        transform: `translate(${dragState.currentPos.x - dragState.cardOffset.x}px, ${dragState.currentPos.y - dragState.cardOffset.y}px)`,
                    }}
                >
                    {dragState.cards.map((card, i) => (
                        <div key={card.id} className="drag-card" style={{ top: `${i * 25}px` }}> {/* Visual offset for stack */}
                            <Card card={card} />
                        </div>
                    ))}
                </div>
            )}

            {/* Win/Loss Overlays */}
            {(gameStatus === 'won' || gameStatus === 'lost') && (
                <div className="overlay-backdrop">
                    <div className={`result-modal ${gameStatus}`}>
                        <h2>{gameStatus === 'won' ? 'Victory!' : 'Game Over'}</h2>
                        <p>{gameStatus === 'won' ? 'You completed all themes!' : 'Out of moves!'}</p>

                        <div className="modal-actions">
                            <button onClick={restartGame} className="primary-btn">Play Again</button>
                            <button onClick={() => window.location.reload()} className="secondary-btn">Menu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
