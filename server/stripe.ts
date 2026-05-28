/**
 * Stripe service for subscription management.
 * Handles checkout sessions, billing portal, and webhook processing.
 */
import Stripe from 'stripe';
import type { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export function setPrisma(prisma: PrismaClient) {
  prismaInstance = prisma;
}

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    throw new Error('[Stripe] Prisma client not initialized — call setPrisma() first');
  }
  return prismaInstance;
}

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey || stripeKey.includes('placeholder')) {
  console.warn('[Stripe] STRIPE_SECRET_KEY not configured — checkout and webhook endpoints will fail');
}

const stripe = new Stripe(stripeKey || 'sk_test_placeholder', {
  apiVersion: '2025-01-27.clover' as any,
});

const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  counselor: process.env.STRIPE_COUNSELOR_PRICE_ID || '',
};

const ROLE_MAP: Record<string, string> = {
  pro: 'PRO',
  counselor: 'COUNSELOR',
};

export async function createCheckoutSession(
  userId: string,
  email: string,
  planType: 'pro' | 'counselor',
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const customer = await getOrCreateCustomer(userId, email);
  const priceId = PRICE_IDS[planType];
  if (!priceId) throw new Error(`No price ID configured for plan: ${planType}`);

  const session = await stripe.checkout.sessions.create({
    customer,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, planType },
  });

  return session.url!;
}

export async function createBillingPortalSession(stripeCustomerId: string): Promise<string> {
  const portal = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: process.env.FRONTEND_URL || 'http://localhost:38030',
  });
  return portal.url;
}

export async function handleWebhookEvent(rawBody: Buffer, signature: string): Promise<void> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
  }
}

async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const prisma = getPrisma();
  const existing = await prisma.stripeSubscription.findUnique({ where: { userId } });
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.stripeSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customer.id,
      planType: 'pro',
      status: 'incomplete',
    },
    update: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType;
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

  if (!userId || !planType) return;

  const prisma = getPrisma();
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    await prisma.stripeSubscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscriptionId,
        planType,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
      },
      update: {
        stripeSubscriptionId: subscriptionId,
        planType,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
      },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: ROLE_MAP[planType] || 'PRO',
      subscriptionStatus: 'active',
    },
  });

  await prisma.subscriptionHistory.create({
    data: {
      userId,
      changedBy: 'stripe_webhook',
      field: 'subscription',
      oldValue: 'none',
      newValue: planType,
      reason: `checkout.session.completed: ${session.id}`,
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subscriptionId) return;

  const prisma = getPrisma();
  const sub = await prisma.stripeSubscription.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
  if (!sub) return;

  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.user.update({
    where: { id: sub.userId },
    data: { subscriptionStatus: 'active' },
  });

  await prisma.stripeSubscription.update({
    where: { id: sub.id },
    data: {
      status: stripeSub.status,
      currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subscriptionId) return;

  const prisma = getPrisma();
  const sub = await prisma.stripeSubscription.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
  if (!sub) return;

  await prisma.user.update({
    where: { id: sub.userId },
    data: { subscriptionStatus: 'past_due' },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const prisma = getPrisma();
  const sub = await prisma.stripeSubscription.findUnique({ where: { stripeSubscriptionId: subscription.id } });
  if (!sub) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: sub.userId },
      data: { role: 'FREE', subscriptionStatus: 'canceled', subscriptionEndsAt: new Date() },
    }),
    prisma.stripeSubscription.update({
      where: { id: sub.id },
      data: { status: 'canceled' },
    }),
  ]);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const prisma = getPrisma();
  const sub = await prisma.stripeSubscription.findUnique({ where: { stripeSubscriptionId: subscription.id } });
  if (!sub) return;

  await prisma.stripeSubscription.update({
    where: { id: sub.id },
    data: {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
    },
  });

  if (subscription.status === 'active' || subscription.status === 'trialing') {
    await prisma.user.update({
      where: { id: sub.userId },
      data: { subscriptionStatus: subscription.status },
    });
  }
}
