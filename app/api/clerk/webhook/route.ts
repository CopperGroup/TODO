import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.mode";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Get raw body for signature verification
  const signature = req.headers.get("clerk-signature");

  // Verify Clerk signature (important for security)
  if (!signature || !CLERK_WEBHOOK_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const event: WebhookEvent = JSON.parse(rawBody);

    if (event.type === "user.created") {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      await connectToDB(); // Ensure MongoDB connection

      // Check if user already exists
      const existingUser = await User.findOne({ email: email_addresses[0].email_address });
      if (!existingUser) {
        await User.create({
          name: `${first_name} ${last_name}`,
          email: email_addresses[0].email_address,
          profilePicture: image_url,
          online: false,
        });
      }
    }

    return new NextResponse("User created successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Webhook handling error", { status: 500 });
  }
}
