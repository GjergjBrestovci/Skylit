import { Request, Response } from 'express';
import { verifyWebhookSignature, handleSuccessfulPayment } from '../services/stripe';

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
          
          // Update user credits in database
          await handleSuccessfulPayment(paymentIntent.id);
        }
        break;
        
      case 'customer.subscription.created':
        {
          const subscription = event.data.object;
          console.log('Subscription created:', subscription.id);
          
          // Handle new subscription
          const { userId, planId, credits } = subscription.metadata;
          console.log(`New subscription for user ${userId}, plan ${planId}, credits ${credits}`);
          
          // TODO: Update user's subscription status in database
        }
        break;
        
      case 'customer.subscription.updated':
        {
          const subscription = event.data.object;
          console.log('Subscription updated:', subscription.id);
          
          // Handle subscription updates (upgrades, downgrades, etc.)
          const { userId } = subscription.metadata;
          console.log(`Subscription updated for user ${userId}`);
          
          // TODO: Update user's subscription in database
        }
        break;
        
      case 'customer.subscription.deleted':
        {
          const subscription = event.data.object;
          console.log('Subscription cancelled:', subscription.id);
          
          // Handle subscription cancellation
          const { userId } = subscription.metadata;
          console.log(`Subscription cancelled for user ${userId}`);
          
          // TODO: Update user's subscription status in database
        }
        break;
        
      case 'invoice.payment_succeeded':
        {
          const invoice = event.data.object as any;
          console.log('Invoice payment succeeded:', invoice.id);
          
          // Handle recurring payment success
          if (invoice.subscription) {
            // TODO: Add credits to user account for recurring billing
            console.log('Recurring payment processed, adding credits to user account');
          }
        }
        break;
        
      case 'invoice.payment_failed':
        {
          const invoice = event.data.object;
          console.log('Invoice payment failed:', invoice.id);
          
          // Handle failed payment
          // TODO: Send notification to user, maybe suspend account
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
