export interface ThreeDsPayload {
  gateway: 'stripe';
  action: 'three_d_s';
  payload: {
    client_secret: string;
    payment_method: string;
    publishable_key: string;
  };
}
