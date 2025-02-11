'use server';

import { redirect } from "next/navigation";
import Stripe from "stripe";
import Transaction, { TransactionType } from "../models/transaction.model";
import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import Team from "../models/team.model";
import { revalidatePath } from "next/cache";

export async function checkoutPlan(transaction: { plan: string, teamId: string, clerkId?: string }) {
    await connectToDB();

    const user = await User.findOne({ clerkId: transaction.clerkId });

    if(!user) {
        throw new Error('No user found')
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const basicPriceId = "price_1QrOVxGLst1zxpx0SyvIv0iL"
    const proPriceId = "price_1QrRtgGLst1zxpx0jR1atoSO"

    const session = await stripe.checkout.sessions.create({
        line_items:[
            {
                price: proPriceId,
                quantity: 1
            }
        ],
        metadata: {
            plan: transaction.plan,
            teamId: transaction.teamId,
            buyerId: user._id.toString
        },
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard/team/${transaction.teamId}`
    })

    redirect(session.url!)
}

export async function createTransaction(transaction: { stripeId: string, amount: number, plan: string, teamId: string, buyerId: string, createdAt: Date }) {
  try {
    connectToDB();

    console.log(transaction)
    const payingForTeamId = transaction.teamId

    console.log(transaction.plan)
    const team = await Team.findByIdAndUpdate(
        payingForTeamId,
        {
            plan: transaction.plan
        },
        { new: true }
    )

    console.log(team)
    const newTransaction = await Transaction.create(transaction)

    const payingUserId = transaction.buyerId;

    if(newTransaction) {
        await User.findByIdAndUpdate(
            payingUserId,
            {
                $push: { transactions: newTransaction._id}
            }
        )
    }

    revalidatePath(`/dashboard/team/${payingForTeamId}`)
    revalidatePath(`/dashboard/team/${payingForTeamId}/plan`)
  } catch (error: any) {
    throw new Error(`Erorr creating transaction and updating team plan: ${error.message}`)
  }
}