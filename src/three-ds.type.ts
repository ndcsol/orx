import type { SetupIntentResult } from '@stripe/stripe-js';

export interface ThreeDsPayload {
  gateway: 'stripe';
  action: 'three_d_s';
  payload: {
    client_secret: string;
    payment_method: string;
    publishable_key: string;
  };
}

export interface ThreeDsOptions {
  locale?: 'en' | 'en-AU' | 'en-CA' | 'en-NZ' | 'en-GB' | 'fr' | 'fr-CA' | 'fr-FR';
}

export type ThreeDsResult = SetupIntentResult & {
  session?: string;
}
