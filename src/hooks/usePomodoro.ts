import { useState, useRef, useEffect, useCallback } from "react";

export const usePomodoro = (initialSeconds: number, onFinish?: () => void) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
        clearTimer();
    }, []);

    const reset = useCallback(
        (newSeconds: number) => {
            pause();
            setTimeLeft(newSeconds);
        },
        [pause]
    );

    useEffect(() => {
        if (!isRunning) return;

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearTimer();
                    setIsRunning(false);
                    onFinish?.(); // 🔔 callback cuando termina
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return clearTimer;
    }, [isRunning, onFinish]);

    return { timeLeft, isRunning, start, pause, reset };
};
