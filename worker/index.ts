/// <reference lib="webworker" />

// To ensure TypeScript compiles this correctly as a service worker
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    const options: any = {
      body: data.body,
      icon: data.icon || '/bitsaveicon.jpg',
      badge: '/bitsaveicon.jpg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.data?.url || '/',
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

export {};
