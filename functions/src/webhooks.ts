import { Request, Response } from "express";
import * as admin from "firebase-admin";
import crypto from "crypto";

/**
 * Handles Dodo Payments webhook notifications for payment.succeeded, subscription.active, etc.
 */
export async function handleDodoPaymentsWebhook(req: Request, res: Response) {
  console.log("[Dodo Payments Webhook] Received webhook POST event in Cloud Functions.");
  try {
    const db = admin.firestore();
    const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "";

    if (secret) {
      const webhookId = (req.headers["webhook-id"] || req.headers["Webhook-Id"]) as string;
      const webhookTimestamp = (req.headers["webhook-timestamp"] || req.headers["Webhook-Timestamp"]) as string;
      const webhookSignature = (req.headers["webhook-signature"] || req.headers["Webhook-Signature"]) as string;

      if (!webhookId || !webhookTimestamp || !webhookSignature) {
        console.error("Missing Dodo Payments signature headers.");
        return res.status(401).json({ error: "Missing signature headers" });
      }

      const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

      let secretKey: Buffer;
      if (secret.startsWith("whsec_")) {
        const b64Secret = secret.slice("whsec_".length);
        secretKey = Buffer.from(b64Secret, "base64");
      } else {
        secretKey = Buffer.from(secret, "utf8");
      }

      const computedSig = crypto.createHmac("sha256", secretKey).update(signedContent).digest("base64");
      const sigList = webhookSignature.split(" ");
      let verified = false;
      for (const item of sigList) {
        const parts = item.split(",");
        const sigVal = parts.length > 1 ? parts[1] : parts[0];
        try {
          if (crypto.timingSafeEqual(Buffer.from(sigVal), Buffer.from(computedSig))) {
            verified = true;
            break;
          }
        } catch {
          // Ignore length mismatch
        }
      }

      if (!verified) {
        console.error("Invalid Dodo Payments signature.");
        return res.status(401).json({ error: "Invalid signature" });
      }
    } else {
      console.log("No DODO_PAYMENTS_WEBHOOK_SECRET configured; bypassing signature verification.");
    }

    const payload = req.body || {};
    const eventType = payload.type || payload.event_type || payload.event || "unknown";
    const data = payload.data || payload;

    const metadata = data.metadata || payload.metadata || {};
    const customer = data.customer || {};
    const customerEmail = customer.email || data.email;
    const userId = metadata.userId || metadata.user_id;
    const requestedPlan = metadata.plan || (data.product_id?.includes("agency") ? "Agency" : "Pro");
    const subId = data.subscription_id || data.payment_id || data.id || `sub_dodo_${Date.now()}`;
    const renewalDate = data.next_billing_date ? data.next_billing_date.split("T")[0] : "";

    console.log(`[Dodo Payments Functions] Processing event: ${eventType} for sub: ${subId}, user: ${userId}`);

    if (
      eventType === "payment.succeeded" ||
      eventType === "subscription.active" ||
      eventType === "subscription.created" ||
      eventType === "subscription.renewed" ||
      eventType === "subscription.updated"
    ) {
      const planStatus = requestedPlan === "Agency" ? "Agency" : "Pro";

      const subRef = db.collection("subscriptions").doc(String(subId));
      await subRef.set({
        id: String(subId),
        userId: userId || "",
        customerEmail: customerEmail || "",
        plan: `${planStatus} Plan`,
        status: "active",
        renewalDate: renewalDate,
        gateway: "dodo_payments",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      if (userId) {
        const userRef = db.collection("users").doc(userId);
        await userRef.set({
          planStatus: planStatus,
          lastActive: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`User ${userId} planStatus updated to ${planStatus}`);
      } else if (customerEmail) {
        const userQuery = await db.collection("users").where("email", "==", customerEmail).limit(1).get();
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.set({
            planStatus: planStatus,
            lastActive: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          await subRef.set({ userId: userDoc.id }, { merge: true });
          console.log(`User found by email ${customerEmail}. Plan updated to ${planStatus}`);
        }
      }

      return res.status(200).json({ success: true, event: eventType, planStatus });
    }

    if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.expired" ||
      eventType === "subscription.failed" ||
      eventType === "subscription.on_hold"
    ) {
      const subRef = db.collection("subscriptions").doc(String(subId));
      await subRef.set({
        status: "cancelled",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      if (userId) {
        const userRef = db.collection("users").doc(userId);
        await userRef.set({
          planStatus: "Free",
          lastActive: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`User ${userId} downgraded to Free`);
      }

      return res.status(200).json({ success: true, event: eventType, planStatus: "Free" });
    }

    return res.status(200).json({ success: true, event: eventType, message: "Event received" });
  } catch (error: any) {
    console.error("Dodo webhook processing failed:", error);
    return res.status(500).json({ error: error.message || "Webhook processing failed" });
  }
}

export async function handleLemonSqueezyWebhook(req: Request, res: Response) {
  console.log("[Lemon Squeezy Webhook] Received webhook POST request.");
  try {
    const db = admin.firestore();
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";
    
    if (secret) {
      const signature = req.headers["x-signature"] as string;
      if (!signature) {
        console.error("Missing Lemon Squeezy signature header.");
        return res.status(401).json({ error: "Missing signature header" });
      }

      // Read raw body to compute signature
      const hmac = crypto.createHmac("sha256", secret);
      const digest = hmac.update(JSON.stringify(req.body)).digest("hex");
      if (signature !== digest) {
        console.error("Invalid Lemon Squeezy signature.");
        return res.status(401).json({ error: "Invalid signature" });
      }
    } else {
      console.log("No LEMON_SQUEEZY_WEBHOOK_SECRET set; bypassing signature verification.");
    }

    const payload = req.body;
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;
    const userId = customData?.userId || customData?.user_id;

    console.log(`Processing event: ${eventName} for user: ${userId}`);

    if (eventName === "subscription_created" || eventName === "subscription_updated") {
      const subData = payload.data;
      const subId = subData.id;
      const attributes = subData.attributes;
      const status = attributes.status;
      const planName = attributes.variant_name || attributes.product_name || "Pro Plan";
      const renewalDate = attributes.renews_at ? attributes.renews_at.split("T")[0] : "";

      // Save subscription in Firestore
      const subRef = db.collection("subscriptions").doc(String(subId));
      await subRef.set({
        id: String(subId),
        userId: userId || "",
        plan: planName,
        status: status,
        renewalDate: renewalDate,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Update user planStatus to 'Pro' if active
      if (userId) {
        const userRef = db.collection("users").doc(userId);
        const planStatus = (status === "active" || status === "trialing") ? "Pro" : "Free";
        await userRef.set({
          planStatus: planStatus,
          lastActive: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`User ${userId} planStatus updated to ${planStatus}`);
      } else {
        // Fallback email query
        const customerEmail = attributes.user_email;
        if (customerEmail) {
          const userQuery = await db.collection("users").where("email", "==", customerEmail).limit(1).get();
          if (!userQuery.empty) {
            const userDoc = userQuery.docs[0];
            const foundUserId = userDoc.id;
            const planStatus = (status === "active" || status === "trialing") ? "Pro" : "Free";
            await userDoc.ref.set({
              planStatus: planStatus,
              lastActive: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            await subRef.set({ userId: foundUserId }, { merge: true });
            console.log(`Found user by email ${customerEmail}. User ${foundUserId} planStatus updated to ${planStatus}`);
          }
        }
      }
    } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
      const subData = payload.data;
      const subId = subData.id;
      const attributes = subData.attributes;
      const status = attributes.status;

      const subRef = db.collection("subscriptions").doc(String(subId));
      await subRef.set({
        status: status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      if (userId) {
        const userRef = db.collection("users").doc(userId);
        await userRef.set({
          planStatus: "Free",
          lastActive: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`User ${userId} downgraded to Free status due to cancellation.`);
      }
    }

    return res.status(200).json({ success: true, event: eventName });
  } catch (error: any) {
    console.error("Webhook processing failed:", error);
    return res.status(500).json({ error: error.message || "Webhook processing failed" });
  }
}
