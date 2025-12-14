import React from 'react';
import { X } from 'lucide-react';
import './HelpModal.css';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="help-modal-backdrop" onClick={onClose}>
            <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="help-modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <h2>Comment jouer</h2>

                <div className="help-section">
                    <h3>🎯 Objectif</h3>
                    <p>Rassemblez tous les mots associés à un même thème.</p>
                </div>

                <div className="help-section">
                    <h3>🃏 Règles</h3>
                    <ul>
                        <li><strong>Commencez par poser les cartes "thèmes" dans les emplacements supérieurs</strong></li>
                        <li><strong>Puis, à la manière d'un solitaire classique, regroupez les mots entre eux, puis placez-les sur les cartes thèmes</strong></li>
                    </ul>

                </div>


            </div>
        </div>
    );
};
