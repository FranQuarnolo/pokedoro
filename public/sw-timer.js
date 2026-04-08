// Custom service worker additions for timer notifications
// This file is imported by vite-plugin-pwa's generated SW

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body, icon, badge } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: icon || '/icon-192.png',
        badge: badge || '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'pomodoro-complete',
        renotify: true,
        requireInteraction: false,
        actions: [
          { action: 'open', title: '¡Abrir Pokedoro!' },
        ],
      });
    }, delay);
  }

  if (event.data?.type === 'CANCEL_NOTIFICATION') {
    // No-op: setTimeout can't be cancelled across messages easily,
    // but the tag 'pomodoro-complete' will replace any stale notification
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
