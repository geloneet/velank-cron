import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// ⚠️ IMPORTANTE: necesario para usar process.env correctamente
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-10-28.acacia",
});

export async function POST(req: NextRequest) {
  console.log("🔵 [WEBHOOK] request_received");

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("🔴 [WEBHOOK] Missing signature");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    console.log("🟡 [WEBHOOK] secret_check", {
      hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    });

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    console.log("🟢 [WEBHOOK] signature_verified");
  } catch (err: any) {
    console.error("🔴 [WEBHOOK] signature_failed", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      console.log("🟣 [WEBHOOK] processing_checkout_completed");

      const session = event.data.object as Stripe.Checkout.Session;

      const sessionId = session.id;
      const email = session.customer_details?.email || "";

      console.log("📦 [WEBHOOK] session_data", {
        sessionId,
        email,
      });

      // 🔒 ID único = session.id (idempotencia)
      const orderId = sessionId;

      // 🟢 AQUÍ conectas con Firestore
      // Ejemplo básico (ajusta a tu setup)

      // 🔥 IMPORTANTE: reemplaza esto con tu lógica real
      // Ejemplo:
      /*
      await db.collection("orders").doc(orderId).set({
        orderId,
        email,
        amount: session.amount_total,
        currency: session.currency,
        status: "paid",
        createdAt: new Date(),
        userId: session.metadata?.userId || `guest:${email}`,
        metadata: session.metadata,
      });
      */

      console.log("✅ [WEBHOOK] order_created", { orderId });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("🔴 [WEBHOOK] internal_error", error.message);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
