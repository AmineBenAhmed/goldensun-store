import { Request, Response } from "express";
import { getEnv } from "../lib/env";
import { verifyWebhook } from "@clerk/backend/webhooks";
import { parseRole } from "../lib/roles";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

//This method will be called once a user create, deleted or updated
export async function clerkWebhookHandler(req: Request, res: Response) {
  const env = getEnv();

  try {
    //Webhook verification needs a shared secret; without it we cannot trust incoming requests
    console.log("webhook", env.CLERK_WEBHOOK_SECRET)
    if (env.CLERK_WEBHOOK_SECRET) {
      res.status(503).send("Webhook secret not provided");
      return;
    };

    //Clerk's verifier expects a web request with the raw body; Express my give a buffer or string
    const payload = req.body instanceof Buffer ? req.body.toString("utf8") : String(req.body);
    console.log('payload', payload)

    const request = new Request("http://internal/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers as HeadersInit),
      body: payload
    });

    //Throws if signature is wrong or body tampered with; only then we trust event
    const event = await verifyWebhook(request, { signingSecret: env.CLERK_WEBHOOK_SECRET });
    console.log('event', event)
    if (event.type === "user.created" || event.type === "user.updated") {
      const u = event.data;

      const email =
        u.email_addresses.find(e => e.id === u.primary_email_address_id)?.email_address ??
        u.email_addresses?.[0]?.email_address;

      const displayName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || null;

      const role = parseRole(u.public_metadata?.role)
      console.log({ role, displayName, email })

      await db.insert(users).values({
        clerkUserId: u.id,
        email,
        displayName,
        role,
      }).onConflictDoUpdate({
        //If a user already exists create it another time with the clerk's information
        target: users.clerkUserId,
        set: { email, displayName, role, updatedAt: new Date() }
      });
    }

    if (event.type === "user.deleted") {
      const id = event.data.id;

      if (id) {
        await db.delete(users).where(eq(users.clerkUserId, id))
      }
    }

    res.json({ success: true })

  } catch (error) {
    //Bad signature, malformed payload, or db error - do not leak details to the client 
    console.error("cerk webhook error", error);
    res.status(400).json({ error: "Invalid webhook" });

  }
}
