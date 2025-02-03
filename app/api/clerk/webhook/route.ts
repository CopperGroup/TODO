import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent, UserJSON } from "@clerk/nextjs/server"; // Make sure UserJSON is imported
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.mode";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  console.log("Webhook received");

  const rawBody = await req.text(); // Get raw request body
  try {
    const event: WebhookEvent = JSON.parse(rawBody);
    console.log("Parsed event:", event);

    // Make sure it's a user event
    if (event.data && (event.data as UserJSON).email_addresses) {
      const userData = event.data as UserJSON;
      const { id, first_name, last_name, email_addresses, image_url } = userData;

      const email = email_addresses?.[0]?.email_address;

      await connectToDB(); // Ensure MongoDB is connected

      switch (event.type) {
        case "user.created":
          console.log("Creating user...");
          await User.create({
            clerkId: id,
            name: `${first_name} ${last_name}`,
            email,
            profilePicture: image_url,
            online: false,
          });
          console.log("User created successfully");
          break;

        case "user.updated":
          console.log("Updating user...");
          await User.findOneAndUpdate(
            { clerkId: id },
            {
              name: `${first_name} ${last_name}`,
              email,
              profilePicture: image_url,
            }
          );
          console.log("User updated successfully");
          break;

        case "user.deleted":
          console.log("Deleting user...");
          await User.findOneAndDelete({ clerkId: id });
          console.log("User deleted successfully");
          break;

        default:
          console.log("Unhandled event type:", event.type);
      }
    } else {
      console.log("Invalid event data, not a user event");
    }

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Webhook handling error", { status: 500 });
  }
}
