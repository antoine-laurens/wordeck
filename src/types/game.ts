export interface ThemeDef {
    name: string;
    words: string[];
    totalWords?: number; // Added for game instance tracking
}

export type Suit = string; // The Theme Name acts as the Suit
export type Rank = number; // 1 to 13 (1 = Theme Card, 2-13 = Words)

export interface Card {
    id: string; // Unique ID (e.g., "Football-1", "Football-5")
    suit: Suit; // Theme Name (e.g., "Football")
    rank: Rank; // 1 = Ace (Theme Name), 2..13 = Words
    text: string; // The display text (Theme Name for Ace, Word for others)
    faceUp: boolean;
}

export interface GameState {
    stock: Card[]; // Draw pile
    waste: Card[]; // Discard pile
    foundation: Card[][]; // 4 piles
    tableau: Card[][]; // 7 piles
    moves: number;
    status: 'menu' | 'playing' | 'won' | 'lost';
    activeThemes: Record<string, number>; // Theme Name -> Total Word Count Target
    completedThemes: string[]; // List of completed theme names
    completingThemeIndex: number | null; // Index of foundation pile currently animating completion
}
