/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
/// <reference lib="webworker" />

// To ensure TypeScript compiles this correctly as a service worker

self.addEventListener('push', function (event) {
  if (event.data) {
    var _data$data;
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/bitsaveicon.jpg',
      badge: '/bitsaveicon.jpg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: ((_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.url) || '/'
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});
self.addEventListener('notificationclick', function (event) {
  var _event$notification$d;
  console.log('Notification click received.');
  event.notification.close();
  const urlToOpen = ((_event$notification$d = event.notification.data) === null || _event$notification$d === void 0 ? void 0 : _event$notification$d.url) || '/';
  event.waitUntil(self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(clientList => {
    for (const client of clientList) {
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(urlToOpen);
    }
  }));
});

/******/ })()
;