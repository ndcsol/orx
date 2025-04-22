
const address = {
  line1: "1234 Main Street",
  city: "San Francisco",
  state: "CA",
  postal_code: "94111",
  country: "US",
};

const customer = {
  name: "John Doe",
  email: "test@johndoe.com",
}

const paymentMethod = {
  type: 'card',
  card: {
    number: "4000000000003220",
    exp_month: new Date().getMonth(),
    exp_year: new Date().getFullYear() + 1,
    cvc: "123",
  },
};

async function createStripeCustomer() {
  const body = new URLSearchParams();
  body.append('name', customer.name);
  body.append('email', customer.email);
  const fetchResponse = await fetch("https://api.stripe.com/v1/customers", {
    method: "POST",
    body,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  });
  return await fetchResponse.json();
}

async function deleteStripeCustomer(customerId) {
  const fetchResponse = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET}`,
    },
  });
  return await fetchResponse.json();
}

async function createPaymentMethod() {
  const body = new URLSearchParams();
  body.append('type', paymentMethod.type);
  body.append('card[number]', paymentMethod.card.number);
  body.append('card[exp_month]', paymentMethod.card.exp_month);
  body.append('card[exp_year]', paymentMethod.card.exp_year);
  body.append('card[cvc]', paymentMethod.card.cvc);
  body.append('billing_details[name]', customer.name);
  body.append('billing_details[email]', customer.email);
  body.append('billing_details[address][line1]', address.line1);
  body.append('billing_details[address][city]', address.city);
  body.append('billing_details[address][state]', address.state);
  body.append('billing_details[address][postal_code]', address.postal_code);
  body.append('billing_details[address][country]', address.country);

  const fetchResponse = await fetch("https://api.stripe.com/v1/payment_methods", {
    method: "POST",
    body,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  });
  return await fetchResponse.json();
}

async function deletePaymentMethod(paymentMethodId) {
  const fetchResponse = await fetch(`https://api.stripe.com/v1/payment_methods/${paymentMethodId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET}`,
    },
  });
  return await fetchResponse.json();
}

async function createSetupIntent(customer, payment) {
  const body = new URLSearchParams();
  body.append('customer', customer.id);
  body.append('payment_method', payment.id);
  body.append('confirm', true);
  body.append('metadata[agent]', '@ndcsol/orx');
  body.append('metadata[test]', true);
  body.append('payment_method_types[]', 'card');
  body.append('usage', 'off_session');
  body.append('payment_method_options[card][request_three_d_secure]', 'challenge');

  const fetchResponse = await fetch("https://api.stripe.com/v1/setup_intents", {
    method: "POST",
    body: body,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  });

  return await fetchResponse.json();
}

export async function deleteSetupIntent(setupIntentId) {
  const fetchResponse = await fetch(`https://api.stripe.com/v1/setup_intents/${setupIntentId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET}`,
    },
  });
  return await fetchResponse.json();
}

export async function createThreeDsRespnse() {
  const customer = await createStripeCustomer();
  const payment = await createPaymentMethod();
  const setupIntent = await createSetupIntent(customer, payment);
  return {
    threeDsPayload: {
      action: 'three_d_s',
      gateway: 'stripe',
      payload: {
        client_secret: setupIntent.client_secret,
        payment_method: setupIntent.payment_method,
      },
      customer,
      payment,
      setupIntent

    },
    loadPayload: {
      action: 'load',
      gateway: 'stripe',
      payload: {
        publishable_key: process.env.STRIPE_PUBLISHABLE,
      }
    }
  }
}


export async function deleteThreeDsResponse({
  customer,
  payment,
  setupIntent
}) {
  await Promise.all([
    deleteSetupIntent(setupIntent.id),
    deletePaymentMethod(payment.id),
    deleteStripeCustomer(customer.id)
  ]);
}




