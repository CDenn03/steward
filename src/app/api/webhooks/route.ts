import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook receiver for external services.
 * Example: M-Pesa confirmation callbacks.
 */
export async function POST(req: NextRequest) {
  const source = req.headers.get("x-webhook-source");

  try {
    const body = await req.json();

    switch (source) {
      case "mpesa": {
        // Process M-Pesa payment confirmation
        // await processMpesaWebhook(body);
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown source" }, { status: 400 });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
