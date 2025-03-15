import { 
    lemonSqueezySetup, 
    createCheckout as lsCreateCheckout, 
    NewCheckout, 
    getSubscription as lsGetSubscription 
  } from '@lemonsqueezy/lemonsqueezy.js';
  
  // Ensure environment variables are defined
  const API_KEY = process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY;
  const STORE_ID = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!API_KEY || !STORE_ID || !APP_URL) {
    throw new Error("Missing required environment variables for Lemon Squeezy integration.");
  }
  
  // Initialize Lemon Squeezy
  const ls = lemonSqueezySetup({ 
    apiKey: API_KEY, 
    onError: (error) => console.error("LemonSqueezy Error:", error) 
  });
  
  export const createCheckout = async (variantId: string, userId: string) => {
    try {
      const newCheckout: NewCheckout = {
        checkoutData: {
          custom: { user_id: userId },
        },
        productOptions: {
          redirectUrl: `${APP_URL}/dashboard/billing?success=true`, // Used instead of successUrl
        },
      };
  
      const checkout = await lsCreateCheckout(STORE_ID, variantId, newCheckout);
      
      console.log(checkout.data);
      if (!checkout?.data?.attributes?.url) {
        throw new Error("Checkout URL not found in response.");
      }
  
      window.location.href = checkout.data.attributes.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };
  
  export const getSubscription = async (subscriptionId: string) => {
    try {
      const subscription = await lsGetSubscription(subscriptionId);
      
      if (!subscription?.data) {
        throw new Error("Invalid subscription data received.");
      }
  
      return subscription.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  };
  