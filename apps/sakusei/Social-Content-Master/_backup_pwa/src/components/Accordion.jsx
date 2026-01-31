import { useState } from 'react';

function Accordion({ title, icon = '', defaultOpen = false, colors, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-lg border-2 overflow-hidden mb-4"
      style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
    >
      {/* Header cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left transition-all hover:opacity-90"
        style={{ backgroundColor: isOpen ? colors.bleuRoyal : colors.cremeBlanc }}
      >
        <span className="flex items-center gap-2 font-bold text-lg" style={{ color: isOpen ? '#fff' : colors.bleuProfond }}>
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </span>
        <span
          className="text-2xl font-bold transition-transform"
          style={{
            color: isOpen ? '#fff' : colors.bleuProfond,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          ▼
        </span>
      </button>

      {/* Contenu */}
      {isOpen && (
        <div className="p-4 border-t-2" style={{ borderColor: colors.borderColor }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Accordion;
