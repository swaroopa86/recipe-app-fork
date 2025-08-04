import { useState } from 'react';

export const useLocalStorage = (key, initialValue, serializer = JSON) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? serializer.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, serializer.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
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