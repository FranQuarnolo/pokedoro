import { useState, useRef, useEffect, useCallback } from 'react';

export const usePomodoro = (initialSeconds: number) => {
    // Estado para el tiempo restante
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    // Estado para saber si está corriendo
    const [isRunning, setIsRunning] = useState(false);

    // Usamos useRef para el ID del intervalo, esto evita re-renders
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Función para limpiar el intervalo (reutilizable)
    const clearTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // --- API del Hook ---

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
        clearTimer(); // Limpiamos al pausar
    }, []);

    const reset = useCallback((newSeconds: number) => {
        pause(); // Pausamos
        setTimeLeft(newSeconds); // Reseteamos el tiempo
    }, [pause]);

    // El efecto principal que maneja el temporizador
    useEffect(() => {
        // Si no está corriendo, no hacemos nada
        if (!isRunning) {
            return;
        }

        // Si está corriendo, iniciamos el intervalo
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Si llega a 0 (o 1), paramos el timer y limpiamos
                    clearTimer();
                    setIsRunning(false);
                    // Opcional: aquí podrías reproducir un sonido
                    return 0;
                }
                // Restamos 1 segundo
                return prev - 1;
            });
        }, 1000); // Se ejecuta cada segundo

        // Función de limpieza: se ejecuta cuando el componente se desmonta
        // o cuando 'isRunning' cambia (de true a false)
        return clearTimer;
    }, [isRunning]); // Este efecto depende SOLAMENTE de 'isRunning'

    return { timeLeft, isRunning, start, pause, reset };
};