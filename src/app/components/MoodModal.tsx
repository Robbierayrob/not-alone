interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSelect: (mood: string) => void;
}

export default function MoodModal({ isOpen, onClose, onMoodSelect }: MoodModalProps) {
  if (!isOpen) return null;

  return (
    <div className="mood-modal-overlay" onClick={onClose}>
      <div className="mood-modal" onClick={e => e.stopPropagation()}>
        <h2>How are you feeling today?</h2>
        <div className="mood-options">
          <button 
            className="mood-button" 
            onClick={() => onMoodSelect('happy')}
            aria-label="Happy"
          >
            <svg viewBox="0 0 24 24" className="mood-svg happy">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <circle cx="9" cy="9" r="1.5" />
              <circle cx="15" cy="9" r="1.5" />
            </svg>
            <span>Happy</span>
          </button>
          
          <button 
            className="mood-button" 
            onClick={() => onMoodSelect('neutral')}
            aria-label="Neutral"
          >
            <svg viewBox="0 0 24 24" className="mood-svg neutral">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="14" x2="16" y2="14" />
              <circle cx="9" cy="9" r="1.5" />
              <circle cx="15" cy="9" r="1.5" />
            </svg>
            <span>Neutral</span>
          </button>
          
          <button 
            className="mood-button" 
            onClick={() => onMoodSelect('sad')}
            aria-label="Sad"
          >
            <svg viewBox="0 0 24 24" className="mood-svg sad">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
              <circle cx="9" cy="9" r="1.5" />
              <circle cx="15" cy="9" r="1.5" />
            </svg>
            <span>Sad</span>
          </button>
        </div>
      </div>
    </div>
  );
}
