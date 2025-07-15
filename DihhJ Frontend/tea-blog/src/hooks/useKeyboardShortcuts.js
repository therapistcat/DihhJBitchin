import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      switch (key) {
        // Navigation shortcuts
        case 'h':
          if (!isModifierPressed) {
            event.preventDefault();
            navigate('/');
          }
          break;

        case 'n':
          if (!isModifierPressed) {
            event.preventDefault();
            navigate('/create');
          }
          break;

        case 'p':
          if (!isModifierPressed) {
            event.preventDefault();
            navigate('/profile');
          }
          break;

        // Refresh page
        case 'r':
          if (!isModifierPressed) {
            event.preventDefault();
            window.location.reload();
          }
          break;

        // Go back
        case 'Escape':
          event.preventDefault();
          window.history.back();
          break;

        // Scroll shortcuts
        case 'j':
          if (!isModifierPressed) {
            event.preventDefault();
            window.scrollBy(0, 100);
          }
          break;

        case 'k':
          if (!isModifierPressed && !shiftKey) {
            event.preventDefault();
            window.scrollBy(0, -100);
          }
          break;

        // Scroll to top
        case 'g':
          if (!isModifierPressed) {
            event.preventDefault();
            window.scrollTo(0, 0);
          }
          break;

        // Scroll to bottom
        case 'G':
          if (shiftKey && !isModifierPressed) {
            event.preventDefault();
            window.scrollTo(0, document.body.scrollHeight);
          }
          break;

        // Show help
        case '?':
          if (!isModifierPressed) {
            event.preventDefault();
            showKeyboardHelp();
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const showKeyboardHelp = () => {
    const helpText = `
🔥 DihhJ Bitchers Keyboard Shortcuts 🔥

Navigation:
• h - Home/Feed
• n - New Post
• p - Profile
• r - Refresh
• Esc - Go Back

Scrolling:
• j - Scroll Down
• k - Scroll Up
• g - Go to Top
• G - Go to Bottom

Search:
• Ctrl/Cmd + K - Focus Search

Other:
• ? - Show this help
    `;

    alert(helpText);
  };

  return { showKeyboardHelp };
};

export default useKeyboardShortcuts;
