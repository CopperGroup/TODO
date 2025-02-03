import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.mode";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  console.log("Webhook received");

  const rawBody = await req.text(); // Get raw request body
  console.log("Raw body:", rawBody);

  try {
    const event: WebhookEvent = JSON.parse(rawBody);
    console.log("Parsed event:", event);

    if (event.type === "user.created") {
      console.log("User created event received");

      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      await connectToDB();

      // Check if user already exists
      const existingUser = await User.findOne({ email: email_addresses[0].email_address });
      if (existingUser) {
        console.log("User already exists in the database");
        return new NextResponse("User already exists", { status: 200 });
      }

      // Create new user
      const newUser = await User.create({
        name: `${first_name} ${last_name}`,
        email: email_addresses[0].email_address,
        profilePicture: image_url,
        online: false,
      });

      console.log("User saved:", newUser);
    }

    return new NextResponse("User created successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Webhook handling error", { status: 500 });
  }
}
