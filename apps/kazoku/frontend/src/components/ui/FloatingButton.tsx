/**
 * FloatingButton Component - Floating action button with contextual menu
 * © 2025 La Voie Shinkofa
 */

import { Plus, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface FloatingAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingButtonProps {
  actions: FloatingAction[];
}

export default function FloatingButton({ actions }: FloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40">
      {/* Action Menu */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-white rounded-xl shadow-2xl p-2 min-w-[200px] border border-gray-200 animate-fade-in">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left ${
                action.color || 'text-shinkofa-blue-deep'
              }`}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-600 rotate-45'
            : 'bg-shinkofa-emerald hover:bg-opacity-90'
        }`}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu de création'}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <Plus className="w-8 h-8 text-white" />
        )}
      </button>
    </div>
  );
}
