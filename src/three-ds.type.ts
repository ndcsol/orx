import type { SetupIntentResult } from '@stripe/stripe-js';

export interface ThreeDsPayload {
  gateway: 'stripe';
  action: 'three_d_s';
  payload: {
    client_secret: string;
    payment_method: string;
  };
}

export type ThreeDsResult = SetupIntentResult & {
  session?: string;
}
