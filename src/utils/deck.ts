import type { Card, ThemeDef } from '../types/game';
import themesData from '../data/themes.json';

// Get more themes since they are shorter now (e.g. 6 to 8)
export const getRandomThemes = (count: number = 8): ThemeDef[] => {
    const allThemes = themesData.themes;
    const shuffled = [...allThemes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const generateDeck = (themes: ThemeDef[]): { deck: Card[], themeTargets: Record<string, number> } => {
    const deck: Card[] = [];
    const themeTargets: Record<string, number> = {};

    themes.forEach((theme) => {
        // Determine random length for this game: 3 to 7 words
        const numWords = Math.floor(Math.random() * 5) + 3; // 3, 4, 5, 6, 7
        themeTargets[theme.name] = numWords;

        // Shuffle words to pick random ones from the pool
        const availableWords = [...theme.words].sort(() => 0.5 - Math.random());
        const selectedWords = availableWords.slice(0, numWords);

        // Rank 1 (Ace) = Theme Name
        deck.push({
            id: `${theme.name}-1`,
            suit: theme.name,
            rank: 1,
            text: theme.name,
            faceUp: false,
        });

        // Rank 2..N+1
        selectedWords.forEach((word, index) => {
            deck.push({
                id: `${theme.name}-${index + 2}`,
                suit: theme.name,
                rank: index + 2,
                text: word,
                faceUp: false,
            });
        });
    });

    return { deck, themeTargets };
};

export const shuffleDeck = (deck: Card[]): Card[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};

// Initial deal structure for Solitaire
// 7 columns.
// Col 1: 1 card (1 up)
// Col 2: 2 cards (1 up)
// ...
// Col 7: 7 cards (1 up)
// Rest to Stock.
export interface DealResult {
    tableau: Card[][];
    stock: Card[];
}

export const dealGame = (deck: Card[]): DealResult => {
    const tableau: Card[][] = Array(7).fill([]).map(() => []);
    let cardIndex = 0;

    for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= col; row++) {
            if (cardIndex < deck.length) {
                const card = { ...deck[cardIndex] };
                if (row === col) {
                    card.faceUp = true; // Top card is face up
                }
                tableau[col].push(card);
                cardIndex++;
            }
        }
    }

    const stock = deck.slice(cardIndex).map(c => ({ ...c, faceUp: false }));

    return { tableau, stock };
};
