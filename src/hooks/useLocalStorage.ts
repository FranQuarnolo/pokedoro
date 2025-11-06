import { useState } from 'react';

// Hook genérico para cualquier valor en localStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    // Obtenemos el valor de localStorage o usamos el inicial
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Creamos la función para setear el valor
    const setValue = (value: T) => {
        try {
            // Permitimos que 'value' sea una función para tener la misma API que useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            // Guardamos en localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}