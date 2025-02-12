// import { createTransaction } from "@/lib/actions/transaction.action";
import { createTeam } from "@/lib/actions/team.actions";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { NextResponse } from "next/server";
import stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();

  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ message: "Webhook error", error: err });
  }

  // Get the ID and type
  const eventType = event.type;

  // CREATE
  if (eventType === "checkout.session.completed") {
    const { id, amount_total, metadata } = event.data.object;

    let teamId = metadata?.teamId || '';

    console.log(metadata);

    if(metadata?.type === "create") {
        console.log(metadata.type)
        const result = await createTeam({
            name: metadata.teamName,
            usersEmails: metadata.invitedMembers.split(", "),
            themeColor: metadata.teamThemeColor,
            adminId: metadata.buyerId,
            plan: metadata.plan as 'basic_plan' | 'pro_plan'
        }, 'json')

        const createdTeam = JSON.parse(result)
        teamId = createdTeam._id
    } 

    const transaction = {
      stripeId: id,
      plan: metadata?.plan || "",
      teamId: teamId,
      buyerId: metadata?.buyerId || "",
      createdAt: new Date(),
    };

    const newTransaction = await createTransaction(transaction);
    
    return NextResponse.json({ message: "OK", transaction: newTransaction });
  }

  return new Response("", { status: 200 });
}