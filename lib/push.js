import webpush from "web-push";
import {
  createGuardianNotification,
  deletePushSubscription,
  getGuardianUnreadNotificationCount,
  getPushSubscriptionsByGuardianId,
} from "./db";

export function getVapidPublicKey() {
  return String(process.env.VAPID_PUBLIC_KEY || "").trim();
}

export function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export function isKakaoMessageConfigured() {
  return Boolean(process.env.KAKAO_MESSAGE_API_URL && (process.env.KAKAO_MESSAGE_API_KEY || process.env.KAKAO_REST_API_KEY));
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
  const unreadCount = await getGuardianUnreadNotificationCount(guardianId);
  const subscriptions = await getPushSubscriptionsByGuardianId(guardianId);
  const payload = JSON.stringify({
    title,
    body,
    url: findUrl || "/",
    notificationId: notification.id,
    createdAt: new Date().toISOString(),
    unreadCount,
  });

  let sent = 0;
  for (const item of subscriptions) {
    try {
      await webpush.sendNotification(item.subscription, payload);
      sent += 1;
    } catch (error) {
      logPushFailure("found", guardianId, error);
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
  const unreadCount = await getGuardianUnreadNotificationCount(guardianId);
  const subscriptions = await getPushSubscriptionsByGuardianId(guardianId);
  const payload = JSON.stringify({
    title,
    body,
    url: mapUrl,
    notificationId: notification.id,
    createdAt: new Date().toISOString(),
    unreadCount,
  });

  let sent = 0;
  for (const item of subscriptions) {
    try {
      await webpush.sendNotification(item.subscription, payload);
      sent += 1;
    } catch (error) {
      logPushFailure("location", guardianId, error);
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

export async function notifyGuardianTest({ guardianId }) {
  configureWebPush();
  const subscriptions = await getPushSubscriptionsByGuardianId(guardianId);
  if (subscriptions.length === 0) {
    return { sent: 0, total: 0 };
  }

  const title = "zezari 테스트 알림";
  const body = "기기 알림이 정상적으로 연결되었습니다.";
  const notification = await createGuardianNotification({
    guardianId,
    title,
    body,
    url: "/?panel=my",
  });
  const unreadCount = await getGuardianUnreadNotificationCount(guardianId);
  const payload = JSON.stringify({
    title,
    body,
    url: "/?panel=my",
    notificationId: notification.id,
    createdAt: new Date().toISOString(),
    unreadCount,
  });

  let sent = 0;
  for (const item of subscriptions) {
    try {
      await webpush.sendNotification(item.subscription, payload);
      sent += 1;
    } catch (error) {
      logPushFailure("test", guardianId, error);
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

export async function notifyGuardiansFromAdmin({ guardianIds = [], recipients = [], channel = "push", title, body = "", url = "/" }) {
  const recipientList = normalizeAdminRecipients(recipients, guardianIds);
  const uniqueGuardianIds = [...new Set(recipientList.map((recipient) => recipient.id).filter(Boolean))];
  const pushReady = isPushConfigured();
  if (channel === "push" && pushReady) configureWebPush();

  let successCount = 0;
  let failureCount = 0;
  let subscriptionSent = 0;
  let subscriptionTargetCount = 0;

  for (const guardianId of uniqueGuardianIds) {
    const recipient = recipientList.find((item) => item.id === guardianId) || { id: guardianId };
    const notification = await createGuardianNotification({
      guardianId,
      title,
      body,
      url: url || "/",
    });
    const unreadCount = await getGuardianUnreadNotificationCount(guardianId);

    if (channel === "kakao") {
      const result = await sendKakaoMessageToGuardian({ recipient, title, body, url: url || "/" });
      if (result.ok) {
        successCount += 1;
      } else {
        failureCount += 1;
      }
      continue;
    }

    const subscriptions = await getPushSubscriptionsByGuardianId(guardianId);
    subscriptionTargetCount += subscriptions.length;
    if (!pushReady || subscriptions.length === 0) {
      failureCount += 1;
      continue;
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      notificationId: notification.id,
      createdAt: new Date().toISOString(),
      unreadCount,
    });

    let sentForGuardian = 0;
    for (const item of subscriptions) {
      try {
        await webpush.sendNotification(item.subscription, payload);
        sentForGuardian += 1;
        subscriptionSent += 1;
      } catch (error) {
        logPushFailure("admin", guardianId, error);
        if (error.statusCode === 404 || error.statusCode === 410) {
          await deletePushSubscription(item.id);
        }
      }
    }

    if (sentForGuardian > 0) {
      successCount += 1;
    } else {
      failureCount += 1;
    }
  }

  return {
    recipientCount: uniqueGuardianIds.length,
    successCount,
    failureCount,
    subscriptionSent,
    subscriptionTargetCount,
  };
}

function normalizeAdminRecipients(recipients, guardianIds) {
  if (Array.isArray(recipients) && recipients.length > 0) {
    const seen = new Set();
    return recipients
      .filter((recipient) => recipient?.id)
      .filter((recipient) => {
        if (seen.has(recipient.id)) return false;
        seen.add(recipient.id);
        return true;
      });
  }
  return [...new Set(guardianIds.filter(Boolean))].map((id) => ({ id }));
}

async function sendKakaoMessageToGuardian({ recipient, title, body, url }) {
  const phone = normalizePhone(recipient.phone || recipient.safe_phone);
  if (!phone) return { ok: false, reason: "missing_phone" };
  if (!isKakaoMessageConfigured()) return { ok: false, reason: "missing_kakao_config" };

  const apiKey = process.env.KAKAO_MESSAGE_API_KEY || process.env.KAKAO_REST_API_KEY;
  const payload = {
    receiver: phone,
    phone,
    recipientPhone: phone,
    recipientName: recipient.name || "",
    title,
    message: body,
    body,
    url,
    senderKey: process.env.KAKAO_MESSAGE_SENDER_KEY || "",
    senderNo: process.env.KAKAO_MESSAGE_SENDER_NO || "",
    channel: "kakao",
  };

  try {
    const response = await fetch(process.env.KAKAO_MESSAGE_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      reason: error.message || "kakao_send_failed",
    };
  }
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("82")) return `0${digits.slice(2)}`;
  return digits;
}

function logPushFailure(context, guardianId, error) {
  console.error("[push/send] failed", {
    context,
    guardianId,
    statusCode: Number(error?.statusCode || 0) || null,
    message: error?.message || String(error),
  });
}
