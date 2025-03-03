import { loadStripe } from '@stripe/stripe-js';
import type { ThreeDsOptions, ThreeDsPayload } from './three-ds.type'

export async function threeDs({ payload }: ThreeDsPayload, options?: ThreeDsOptions) {
  const instance = await loadStripe(payload.publishable_key, {
    locale: options?.locale ?? 'auto'
  });

  return instance
    .confirmCardSetup(payload.client_secret, {
      payment_method: payload.payment_method
    }).then((result) => {
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
