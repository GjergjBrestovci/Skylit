import { supabase } from '../supabase';

interface UserCredits {
  credits: number;
  plan: string;
  subscriptionStatus: 'active' | 'inactive' | 'none' | 'cancelled' | 'past_due';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Initialize user credits in database if they don't exist
export async function ensureUserCredits(userId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create with default credits
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          credits: 3, // Free tier starts with 3 credits
          plan: 'free',
          subscription_status: 'none'
        });

      if (insertError) {
        console.error('Failed to create user credits:', insertError);
      }
    } else if (error) {
      console.error('Failed to fetch user credits:', error);
    }
  } catch (error) {
    console.error('Error ensuring user credits:', error);
  }
}

export async function getCredits(userId: string): Promise<UserCredits> {
  try {
    await ensureUserCredits(userId);
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch user credits:', error);
      // Return default values on error
      return {
        credits: 0,
        plan: 'free',
        subscriptionStatus: 'none'
      };
    }

    return {
      credits: data.credits,
      plan: data.plan,
      subscriptionStatus: data.subscription_status,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id
    };
  } catch (error) {
    console.error('Error getting user credits:', error);
    return {
      credits: 0,
      plan: 'free',
      subscriptionStatus: 'none'
    };
  }
}

export async function setCredits(userId: string, credits: number): Promise<boolean> {
  try {
    await ensureUserCredits(userId);
    
    const { error } = await supabase
      .from('user_credits')
      .update({ credits: Math.max(0, Math.floor(credits)) })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to set user credits:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error setting user credits:', error);
    return false;
  }
}

export async function addCredits(userId: string, amount: number): Promise<boolean> {
  try {
    await ensureUserCredits(userId);
    
    const currentCredits = await getCredits(userId);
    const newCredits = Math.max(0, currentCredits.credits + Math.floor(amount));
    
    const { error } = await supabase
      .from('user_credits')
      .update({ credits: newCredits })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to add user credits:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error adding user credits:', error);
    return false;
  }
}

export async function consumeCredit(userId: string): Promise<boolean> {
  try {
    await ensureUserCredits(userId);
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error || !data || data.credits <= 0) {
      return false;
    }

    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ credits: data.credits - 1 })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to consume credit:', updateError);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error consuming credit:', error);
    return false;
  }
}

export async function updateSubscription(
  userId: string, 
  plan: string, 
  subscriptionStatus: UserCredits['subscriptionStatus'],
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<boolean> {
  try {
    await ensureUserCredits(userId);
    
    const updateData: any = {
      plan,
      subscription_status: subscriptionStatus
    };

    if (stripeCustomerId) {
      updateData.stripe_customer_id = stripeCustomerId;
    }
    if (stripeSubscriptionId) {
      updateData.stripe_subscription_id = stripeSubscriptionId;
    }

    const { error } = await supabase
      .from('user_credits')
      .update(updateData)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to update subscription:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
}
