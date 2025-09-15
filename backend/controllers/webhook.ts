import { Request, Response } from 'express';
import { verifyWebhookSignature, handleSuccessfulPayment } from '../services/stripe';
import { addCredits, updateSubscription, getCredits } from '../services/credits';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const payload = req.body;

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(payload, signature);
    
    console.log('Stripe webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        {
          const paymentIntent = event.data.object;
          console.log('Payment succeeded:', paymentIntent.id);
          
          // Extract metadata
          const { userId, planId, credits } = paymentIntent.metadata;
          
          if (userId && credits) {
            // Add credits to user account for one-time purchase
            const creditsToAdd = parseInt(credits);
            const success = await addCredits(userId, creditsToAdd);
            
            if (success) {
              console.log(`Added ${creditsToAdd} credits to user ${userId}`);
            } else {
              console.error(`Failed to add credits to user ${userId}`);
            }
          }
        }
        break;
        
      case 'customer.subscription.created':
        {
          const subscription = event.data.object;
          console.log('Subscription created:', subscription.id);
          
          // Handle new subscription
          const { userId, planId } = subscription.metadata;
          
          if (userId && planId) {
            const success = await updateSubscription(
              userId,
              planId,
              'active',
              subscription.customer as string,
              subscription.id
            );
            
            if (success) {
              console.log(`Subscription activated for user ${userId}, plan ${planId}`);
            }
          }
        }
        break;
        
      case 'customer.subscription.updated':
        {
          const subscription = event.data.object;
          console.log('Subscription updated:', subscription.id);
          
          // Handle subscription updates
          const { userId } = subscription.metadata;
          
          if (userId) {
            const status = subscription.status === 'active' ? 'active' : 
                          subscription.status === 'canceled' ? 'cancelled' :
                          subscription.status === 'past_due' ? 'past_due' : 'inactive';
            
            const success = await updateSubscription(
              userId,
              subscription.metadata.planId || 'basic',
              status,
              subscription.customer as string,
              subscription.id
            );
            
            if (success) {
              console.log(`Subscription updated for user ${userId}, status: ${status}`);
            }
          }
        }
        break;
        
      case 'customer.subscription.deleted':
        {
          const subscription = event.data.object;
          console.log('Subscription cancelled:', subscription.id);
          
          // Handle subscription cancellation
          const { userId } = subscription.metadata;
          
          if (userId) {
            const success = await updateSubscription(
              userId,
              'free',
              'cancelled'
            );
            
            if (success) {
              console.log(`Subscription cancelled for user ${userId}`);
            }
          }
        }
        break;
        
      case 'invoice.payment_succeeded':
        {
          const invoice = event.data.object as any;
          console.log('Invoice payment succeeded:', invoice.id);
          
          // Handle recurring payment success for subscriptions
          if (invoice.subscription && invoice.metadata?.userId) {
            const userId = invoice.metadata.userId;
            const planId = invoice.metadata.planId || 'basic';
            
            // Get plan details and add monthly credits
            const planCreditsMap: Record<string, number> = {
              'basic': 10,
              'pro': 50,
              'enterprise': 500
            };
            const planCredits = planCreditsMap[planId] || 10;
            
            const success = await addCredits(userId, planCredits);
            
            if (success) {
              console.log(`Added ${planCredits} monthly credits to user ${userId} for ${planId} plan`);
            }
          }
        }
        break;
        
      case 'invoice.payment_failed':
        {
          const invoice = event.data.object as any;
          console.log('Invoice payment failed:', invoice.id);
          
          // Handle failed payment - mark subscription as past_due
          if (invoice.subscription && invoice.metadata?.userId) {
            const userId = invoice.metadata.userId;
            
            const success = await updateSubscription(
              userId,
              'basic', // Keep current plan
              'past_due'
            );
            
            if (success) {
              console.log(`Marked subscription as past_due for user ${userId}`);
            }
          }
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
};
