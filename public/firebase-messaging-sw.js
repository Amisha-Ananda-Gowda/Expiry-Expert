importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in your app's Firebase config object.
const firebaseConfig = {
    apiKey: "AIzaSyAiJHDxxRHQ908Giz98Cj-smsZA7afcZqs",
    authDomain: "expiry-expert.firebaseapp.com",
    projectId: "expiry-expert",
    storageBucket: "expiry-expert.appspot.com",
    messagingSenderId: "238047407921",
    appId: "1:238047407921:web:d0ac6a979708fb32464a10",
    measurementId: "G-Y52115VP3Y"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon // Corrected here
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
