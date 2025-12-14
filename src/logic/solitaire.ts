
import type { Card } from '../types/game';

// Check if a card can be moved to a tableau pile
// Rule: Same Theme, Any Rank Order
export const canMoveToTableau = (card: Card, targetCard: Card | null): boolean => {
    if (!targetCard) {
        // Empty spot: Any card can go here?
        // Standard Solitaire usually requires King.
        // User said "supprimer le concept d'ordre".
        // Let's allow ANY card on empty spot for now to be permissive, 
        // OR restrict to Theme Card (Rank 1) if we want to encourage building from base.
        // But usually in "Free" variations, any card is fine.
        // Let's assume ANY card can start a column if empty.
        return true;
    }

    // Must be same theme
    if (card.suit !== targetCard.suit) {
        return false;
    }

    // Rank check removed
    return true;
};

// Check if a card can be moved to a foundation pile
// Rule: Same Theme, Any Ord er (but starts with Rank 1)
export const canMoveToFoundation = (card: Card, foundationPile: Card[]): boolean => {
    if (foundationPile.length === 0) {
        // Must be Rank 1 (Theme Card / Ace) to start the foundation
        return card.rank === 1;
    }

    const topCard = foundationPile[foundationPile.length - 1];

    // Must be same theme
    if (card.suit !== topCard.suit) {
        return false;
    }

    // Rank check removed
    return true;
};

export const checkWinCondition = (foundations: Card[][]): boolean => {
    // Win if all 4 foundations have 13 cards
    return foundations.every(pile => pile.length === 13);
};

