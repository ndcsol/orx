import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { threeDs } from './three-ds';
import { createRadarSession } from './create-session';
import type { LoadOptions, LoadPayload } from './load.type'

export async function load({ payload }: LoadPayload, options?: LoadOptions) {
  const stripe = await loadStripe(payload.publishable_key, {
    locale: options?.locale ?? 'auto'
  });

  if (!stripe) {
    return {
      gateway: 'stripe',
      status: 'error',
      error: new Error('Failed to load Stripe.js')
    }
  }

  return {
    gateway: 'stripe',
    status: 'success',
    instance: createOrxInstance(stripe!)
  }
}

function createOrxInstance(stripe: Stripe) {
  return {
    threeDs: threeDs(stripe),
    createSession: createRadarSession(stripe)
  }
}
