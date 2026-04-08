import { useCallback, useEffect, useRef } from "react";

export const useNotifications = () => {
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        swRef.current = reg;
      });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }, []);

  const scheduleNotification = useCallback(
    (delayMs: number, title: string, body: string, icon?: string) => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const sw = swRef.current;
      if (sw?.active) {
        sw.active.postMessage({
          type: "SCHEDULE_NOTIFICATION",
          delay: delayMs,
          title,
          body,
          icon: icon || "/icon-192.png",
        });
      } else {
        // Fallback: local timeout notification
        setTimeout(() => {
          new Notification(title, { body, icon: icon || "/icon-192.png" });
        }, delayMs);
      }
    },
    []
  );

  const cancelScheduled = useCallback(() => {
    swRef.current?.active?.postMessage({ type: "CANCEL_NOTIFICATION" });
  }, []);

  return { requestPermission, scheduleNotification, cancelScheduled };
};
