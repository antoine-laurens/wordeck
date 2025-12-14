import React from 'react';
import type { Card as CardType } from '../types/game';
import { Card } from './Card';
import './StockWaste.css';
import { RefreshCw } from 'lucide-react';

interface StockWasteProps {
    stock: CardType[];
    waste: CardType[];
    onDraw: () => void;
    onCardPointerDown: (e: React.PointerEvent, card: CardType, area: 'waste', pileIndex: number) => void;
}

export const StockWaste: React.FC<StockWasteProps> = ({ stock, waste, onDraw, onCardPointerDown }) => {
    const topWaste = waste.length > 0 ? waste[waste.length - 1] : null;

    return (
        <div className="stock-waste-container">
            <div className="stock-pile" onClick={onDraw}>
                {stock.length > 0 ? (
                    <div className="card-back-placeholder">
                        <div className="pattern"></div>
                    </div>
                ) : (
                    <div className="empty-stock">
                        <RefreshCw size={24} color="#666" />
                    </div>
                )}
                <span className="count-badge">{stock.length}</span>
            </div>

            <div className="waste-pile" data-area="waste">
                {topWaste ? (
                    <Card
                        card={topWaste}
                        onPointerDown={(e) => onCardPointerDown(e, topWaste, 'waste', 0)}
                    />
                ) : null}
            </div>
        </div>
    );
};
