import { Request, Response } from "express";
import * as admin from "firebase-admin";
import crypto from "crypto";

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
