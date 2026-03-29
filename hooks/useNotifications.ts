import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, scheduleLocalNotification } from '../services/notifications';
import { savePushToken, getPushToken } from '../services/storage';

export function useNotifications() {
  const [pushToken, setPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    void (async () => {
      // Try cached token first
      const cached = await getPushToken();
      if (cached) {
        setPushToken(cached);
      }
      // Register for fresh token
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        await savePushToken(token);
      }
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener((_response) => {
      // Handle notification tap - navigate to results
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const sendLocalNotification = async (title: string, body: string) => {
    await scheduleLocalNotification(title, body);
  };

  return { pushToken, notification, sendLocalNotification };
}
