import { useLocalStorage } from './useLocalStorage';

/**
 * Hook for managing user's name with localStorage persistence
 * Returns empty string if not set, with fallback to "random podtardstr"
 */
export function useUserName() {
  const [userName, setUserName] = useLocalStorage<string>('podtardstr_user_name', '');
  
  // Get display name - returns stored name or fallback
  const getDisplayName = () => {
    return userName.trim() || 'random podtardstr';
  };
  
  // Clear user name - useful for logout
  const clearUserName = () => {
    setUserName('');
  };
  
  return {
    userName,
    setUserName,
    getDisplayName,
    clearUserName
  };
} 