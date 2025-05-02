import { type Stripe } from '@stripe/stripe-js';
import type { ThreeDsPayload, ThreeDsResult } from './three-ds.type'

export function threeDs(instance: Stripe) {
  return async ({ payload }: ThreeDsPayload) => {
    return instance
      .confirmCardSetup(payload.client_secret, {
        payment_method: payload.payment_method
      })
      .then((result: ThreeDsResult) => {
        if (
          result?.setupIntent?.status === 'succeeded' ||
          result?.setupIntent?.status === 'requires_confirmation'
        ) {
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
}
