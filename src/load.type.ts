export interface LoadPayload {
  gateway: 'stripe';
  payload: {
    publishable_key: string;
  };
}

export interface LoadOptions {
  locale?: 'en' | 'en-AU' | 'en-CA' | 'en-NZ' | 'en-GB' | 'fr' | 'fr-CA' | 'fr-FR';
}
