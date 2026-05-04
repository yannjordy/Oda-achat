import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:contact@odamarket.cm',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);

    if (error.statusCode === 410) {
      return { success: false, expired: true };
    }

    return { success: false, error: error.message };
  }
}

export async function sendPushToAll(subscriptions, payload) {
  const results = await Promise.all(
    subscriptions.map(async (sub) => {
      const result = await sendPushNotification(sub, payload);
      return { subscription: sub.endpoint, ...result };
    })
  );

  return results;
}
