import type { Stripe } from '@stripe/stripe-js';

export function createRadarSession(stripe: Stripe) {
  return async () => {
    const payload = await stripe.createRadarSession();
    return {
      gateway: 'stripe',
      status: 'success',
      payload
    };
  }
}
