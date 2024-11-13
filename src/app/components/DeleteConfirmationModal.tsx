"use client";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatId?: string;  // Optional prop for additional context if needed
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  chatId 
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 m-0 p-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      style={{ 
        position: 'fixed', 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        zIndex: 100000,
        pointerEvents: 'auto'
      }}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
        style={{ position: 'relative' }}
      >
        <h3 className="text-lg font-semibold mb-4">Delete Chat</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this chat? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
