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

    const basicPriceId = process.env.BASIC_PLAN!
    const proPriceId = process.env.PRO_PLAN!

    const session = await stripe.checkout.sessions.create({
        line_items:[
            {
                price: transaction.plan === 'basic_plan' ? basicPriceId : proPriceId,
                quantity: 1
            }
        ],
        metadata: {
            plan: transaction.plan,
            teamId: transaction.teamId,
            buyerId: user._id.toString
        },
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboardteam/${transaction.teamId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard/team/${transaction.teamId}`
    })

    redirect(session.url!)
}

export async function createTeamPlan(transaction: { plan: string, teamName: string, clerkId?: string, teamThemeColor: string, invitedMembers: string }) {
    await connectToDB();

    const user = await User.findOne({ clerkId: transaction.clerkId });

    if(!user) {
        throw new Error('No user found')
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const basicPriceId = process.env.BASIC_PLAN!
    const proPriceId = process.env.PRO_PLAN!

    const session = await stripe.checkout.sessions.create({
        line_items:[
            {
                price: transaction.plan === 'basic_plan' ? basicPriceId : proPriceId,
                quantity: 1
            }
        ],
        metadata: {
            type: 'create',
            plan: transaction.plan,
            teamName: transaction.teamName,
            buyerId: user._id.toString(),
            teamThemeColor: transaction.teamThemeColor,
            invitedMembers: transaction.invitedMembers
        },
        mode: 'subscription',

        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/dashboard`
    })

    redirect(session.url!)
}

export async function createTransaction(transaction: { stripeId: string, plan: string, teamId: string, buyerId: string, createdAt: Date }) {
  try {
    connectToDB();

    const payingForTeamId = transaction.teamId

    const team = await Team.findByIdAndUpdate(
        payingForTeamId,
        {
            plan: transaction.plan
        },
        { new: true }
    )

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