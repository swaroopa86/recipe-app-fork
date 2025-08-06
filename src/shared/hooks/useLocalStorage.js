import { useState } from 'react';

export const useLocalStorage = (key, initialValue, serializer = JSON) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? serializer.parse(item) : initialValue;
    } catch (error) {
      // Error reading localStorage
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(prev => {
        const valueToStore = typeof value === 'function' ? value(prev) : value;
        window.localStorage.setItem(key, serializer.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      // Error setting localStorage
    }
  };

  return [storedValue, setValue];
};

// Custom serializer for handling Sets in user data
export const userSerializer = {
  stringify: (users) => {
    const usersForStorage = users.map(user => ({
      ...user,
      allergens: [...user.allergens]
    }));
    return JSON.stringify(usersForStorage);
  },
  parse: (usersJson) => {
    const parsedUsers = JSON.parse(usersJson);
    return parsedUsers.map(user => ({
      ...user,
      allergens: new Set(user.allergens || [])
    }));
  }
}; 