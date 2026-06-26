import webpush from "web-push";
import { createGuardianNotification, deletePushSubscription, getPushSubscriptionsByGuardianId } from "./db";

export function getVapidPublicKey() {
  return String(process.env.VAPID_PUBLIC_KEY || "").trim();
}

export function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function configureWebPush() {
  if (!isPushConfigured()) throw new Error("Push VAPID keys are missing.");
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:general@zezari.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function notifyGuardianFound({ guardianId, subjectName, findUrl }) {
  configureWebPush();
  const title = `${subjectName}을 찾았습니다`;
  const body = "QR 페이지에서 보호자에게 알림을 보냈습니다.";
  const notification = await createGuardianNotification({
    guardianId,
    title,
    body,
    url: findUrl || "/",
  });
  const subscriptions = await getPushSubscriptionsByGuardianId(guardianId);
  const payload = JSON.stringify({
    title,
    body,
    url: findUrl || "/",
    notificationId: notification.id,
    createdAt: new Date().toISOString(),
  });

  let sent = 0;
  for (const item of subscriptions) {
    try {
      await webpush.sendNotification(item.subscription, payload);
      sent += 1;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await deletePushSubscription(item.id);
      }
    }
  }

  return {
    sent,
    total: subscriptions.length,
  };
}

export async function notifyGuardianLocationShared({
  guardianId,
  subjectName,
  kakaoMapUrl,
  naverMapUrl,
  addressLabel,
}) {
  configureWebPush();
  const mapUrl = kakaoMapUrl || naverMapUrl || "/";
  const mapLabel = kakaoMapUrl ? "카카오맵" : naverMapUrl ? "네이버 지도" : "지도";
  const title = `${subjectName} 발견 위치가 공유되었습니다`;
  const body = `${addressLabel || "지도에서 위치 확인"} - 알림을 누르면 지도가 열립니다.`;
  const notification = await createGuardianNotification({
    guardianId,
    title,
    body: `${body} ${mapLabel} 링크: ${mapUrl}`,
    url: mapUrl,
  });
  const subscriptions = await getPushSubscriptionsByGuardianId(guardianId);
  const payload = JSON.stringify({
    title,
    body,
    url: mapUrl,
    notificationId: notification.id,
    createdAt: new Date().toISOString(),
  });

  let sent = 0;
  for (const item of subscriptions) {
    try {
      await webpush.sendNotification(item.subscription, payload);
      sent += 1;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await deletePushSubscription(item.id);
      }
    }
  }

  return {
    sent,
    total: subscriptions.length,
  };
}
