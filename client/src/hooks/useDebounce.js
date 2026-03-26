import { useState, useEffect, useRef } from "react";

/**
 * useDebounce Hook
 * 
 * Debounces a value or a callback function.
 * 
 * @param {any} value - The value to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {any} - The debounced value.
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useDebounceCallback Hook
 * 
 * Debounces a callback function.
 * 
 * @param {Function} callback - The callback function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - The debounced callback function.
 */
export const useDebounceCallback = (callback, delay) => {
  const timeoutRef = useRef(null);

  return (...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};
