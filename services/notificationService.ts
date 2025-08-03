
export const requestNotificationPermission = async (): Promise<void> => {
    if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }

    if (Notification.permission === 'denied') {
        // If denied, we should not ask again.
        return;
    }
    
    if (Notification.permission !== 'granted') {
        try {
            await Notification.requestPermission();
        } catch (error) {
            console.error("Error requesting notification permission:", error);
        }
    }
};

export const sendNotification = (title: string, options?: NotificationOptions): void => {
    if (!('Notification' in window)) {
        return;
    }

    if (Notification.permission === 'granted') {
        // Create a new notification.
        new Notification(title, {
            icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384065.png', // A generic icon
            ...options,
        });
    }
};
