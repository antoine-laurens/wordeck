import { create } from 'zustand';
import type { Card, GameState, ThemeDef } from '../types/game';
import { getRandomThemes, generateDeck, shuffleDeck, dealGame } from '../utils/deck';
import { canMoveToTableau, canMoveToFoundation } from '../logic/solitaire';

interface GameStore extends GameState {
    currentThemes: ThemeDef[];
    activeThemes: Record<string, number>;
    completedThemes: string[];
    completingThemeIndex: number | null;

    startGame: () => void;
    finishThemeCompletion: (pileIndex: number) => void;
    drawCard: () => void;
    moveCards: (
        source: { area: 'tableau' | 'waste' | 'foundation'; index: number; cards: Card[] },
        target: { area: 'tableau' | 'foundation'; index: number }
    ) => void;
    restartGame: () => void;
}

const MAX_MOVES_BASE = 80; // Reduced for difficulty


export const useGameStore = create<GameStore>((set, get) => ({
    stock: [],
    waste: [],
    foundation: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    moves: 0,
    status: 'menu',
    currentThemes: [],
    activeThemes: {},
    completedThemes: [],
    completingThemeIndex: null,

    startGame: () => {
        const themes = getRandomThemes(8); // Pick 8 themes
        const { deck, themeTargets } = generateDeck(themes);
        const shuffledDeck = shuffleDeck(deck);
        const { tableau, stock } = dealGame(shuffledDeck);

        set({
            stock,
            waste: [],
            foundation: [[], [], [], []],
            tableau,
            moves: MAX_MOVES_BASE,
            status: 'playing',
            currentThemes: themes,
            activeThemes: themeTargets,
            completedThemes: [],
            completingThemeIndex: null,
        });
    },

    finishThemeCompletion: (pileIndex: number) => {
        set((state) => {
            const newFoundation = state.foundation.map(pile => [...pile]);
            const pile = newFoundation[pileIndex];
            if (pile.length === 0) return { ...state, completingThemeIndex: null };

            const themeName = pile[0].suit;
            const newCompletedThemes = [...state.completedThemes, themeName];

            // Clear the slot
            newFoundation[pileIndex] = [];

            // 4. Check Win Condition
            // Win if all active themes are in completedThemes
            const allThemesCompleted = Object.keys(state.activeThemes).every(t => newCompletedThemes.includes(t));

            return {
                ...state,
                foundation: newFoundation,
                completedThemes: newCompletedThemes,
                completingThemeIndex: null,
                status: allThemesCompleted ? 'won' : state.status
            };
        });
    },

    restartGame: () => {
        get().startGame();
    },

    drawCard: () => {
        set((state) => {
            if (state.moves <= 0) return { ...state, status: 'lost' };

            const { stock, waste } = state;

            // If stock is empty, recycle waste
            if (stock.length === 0) {
                if (waste.length === 0) return state; // Nothing to do
                // Recycle waste to stock (reverse order usually?)
                // Standard Solitaire: Turn over waste to stock.
                const newStock = [...waste].reverse().map(c => ({ ...c, faceUp: false }));
                return {
                    stock: newStock,
                    waste: [],
                    moves: state.moves - 1,
                };
            }

            // Draw one card
            const newStock = [...stock];
            const card = newStock.shift()!;
            card.faceUp = true;
            const newWaste = [...waste, card];

            return {
                stock: newStock,
                waste: newWaste,
                moves: state.moves - 1,
            };
        });
    },

    moveCards: (source, target) => {
        set((state) => {
            if (state.status !== 'playing') return state;
            if (state.completingThemeIndex !== null) return state; // Block moves during animation
            if (state.moves <= 0) return { ...state, status: 'lost' };

            // Clone state for mutation
            const newTableau = state.tableau.map(col => [...col]);
            const newFoundation = state.foundation.map(pile => [...pile]);
            const newWaste = [...state.waste];
            let newMoves = state.moves - 1;

            // Validate and Execute Move
            const cardsToMove = source.cards;
            const primaryCard = cardsToMove[0];

            // Prevent moving to the same pile
            if (source.area === target.area && source.index === target.index) {
                return state;
            }

            let isValid = false;

            // 1. Check logic based on Target Area
            if (target.area === 'tableau') {
                const targetPile = newTableau[target.index];
                const targetCard = targetPile.length > 0 ? targetPile[targetPile.length - 1] : null;
                isValid = canMoveToTableau(primaryCard, targetCard);
            } else if (target.area === 'foundation') {
                // Can only move one card to foundation at a time
                if (cardsToMove.length === 1) {
                    const targetPile = newFoundation[target.index];
                    isValid = canMoveToFoundation(primaryCard, targetPile);
                }
            }

            if (!isValid) return state; // No change

            // 2. Remove from Source
            if (source.area === 'tableau') {
                const sourceCol = newTableau[source.index];
                // Remove the cards (they should be at the end)
                sourceCol.splice(sourceCol.length - cardsToMove.length, cardsToMove.length);

                // Flip the new top card if it exists and is face down
                if (sourceCol.length > 0) {
                    const newTop = sourceCol[sourceCol.length - 1];
                    if (!newTop.faceUp) {
                        newTop.faceUp = true;
                        // Optionally, flipping a card could cost a move or score points?
                        // We just stick to 1 move cost per action.
                    }
                }
            } else if (source.area === 'waste') {
                newWaste.pop(); // Remove top card
            } else if (source.area === 'foundation') {
                // Usually moving back from foundation is allowed
                newFoundation[source.index].pop();
            }

            // 3. Add to Target
            let completingIndex: number | null = null;
            if (target.area === 'tableau') {
                newTableau[target.index].push(...cardsToMove);
            } else if (target.area === 'foundation') {
                newFoundation[target.index].push(primaryCard);

                // CHECK FOR THEME COMPLETION
                const pile = newFoundation[target.index];
                if (pile.length > 0) {
                    const themeName = pile[0].suit;
                    const targetCount = state.activeThemes[themeName];
                    // pile has (1 theme card) + (targetCount words)
                    // So total length should be targetCount + 1
                    if (pile.length === targetCount + 1) {
                        // Trigger completion sequence (delay handled by UI + finishThemeCompletion)
                        completingIndex = target.index;
                    }
                }
            }

            // 4. Check Win Condition (now handled by finishThemeCompletion)
            // Win if all active themes are in completedThemes

            return {
                tableau: newTableau,
                foundation: newFoundation,
                waste: newWaste,
                moves: newMoves,
                status: (newMoves <= 0 && !completingIndex) ? 'lost' : 'playing',
                completedThemes: state.completedThemes, // Completion is now deferred
                completingThemeIndex: completingIndex
            };
        });
    },
}));
