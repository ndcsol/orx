import { loadStripe, type RadarSessionPayload, type Stripe } from '@stripe/stripe-js';
import type { ThreeDsOptions, ThreeDsPayload, ThreeDsResult } from './three-ds.type'

export async function threeDs({ payload }: ThreeDsPayload, options?: ThreeDsOptions) {
  const instance = await loadStripe(payload.publishable_key, {
    locale: options?.locale ?? 'auto'
  });

  if (!instance) {
    return {
      gateway: 'stripe',
      status: 'error',
      error: new Error('Failed to load Stripe.js')
    }
  }

  return Promise.all([
    instance
      .confirmCardSetup(payload.client_secret, {
        payment_method: payload.payment_method
      }),
    createRadarSession(instance)
  ]).then(([result, session]: [ThreeDsResult, RadarSessionPayload]) => {
    if (
      result?.setupIntent?.status === 'succeeded' ||
      result?.setupIntent?.status === 'requires_confirmation'
    ) {
      if (
        session?.radarSession?.id
      ) {
        result.session = session.radarSession.id;
      }
      return {
        gateway: 'stripe',
        payload: result,
        status: 'success'
      };
    } else {
      return {
        gateway: 'stripe',
        status: 'error',
        message: result.error!.message,
        error: result.error
      };
    }
  })
    .catch((error) => ({
      gateway: 'stripe',
      status: 'error',
      error
    }));
}

async function createRadarSession(instance: Stripe) {
  try {
    return await instance.createRadarSession()
  } catch (e) {
    return null;
  }
}
