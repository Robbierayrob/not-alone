// Utility function to scroll to bottom of a ref
export function scrollToBottom(ref: React.RefObject<HTMLDivElement>) {
  if (ref.current) {
    ref.current.scrollTop = ref.current.scrollHeight;
  }
}

// Toast management utility
export function createToast(
  message: string, 
  type: 'success' | 'error' | 'warning' = 'success',
  duration: number = 3000
) {
  console.log(`🍞 Toast [${type.toUpperCase()}]: ${message}`);
  // You can expand this to use a toast library or custom toast implementation
  return {
    message,
    type,
    duration
  };
}

// Debounce utility for performance optimization
export function debounce<F extends (...args: any[]) => any>(
  func: F, 
  delay: number
): F {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return ((...args: Parameters<F>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as F;
}
