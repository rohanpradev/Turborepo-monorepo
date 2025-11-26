"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import useCartStore from "@/stores/cartStore";
import CheckoutForm from "./CheckoutForm";

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface ShippingFormInputs {
  email: string;
  name: string;
  address: string;
  city: string;
  country?: string;
}

const StripePaymentForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const { getToken } = useAuth();
  const { cart } = useCartStore();
  const [token, setToken] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken().then((token) => setToken(token));
  }, [getToken]);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        if (!token) {
          throw new Error("Authentication required");
        }

        if (!cart || cart.length === 0) {
          throw new Error("Cart is empty");
        }

        // Calculate total amount from cart
        const totalAmount = cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        const requestBody = {
          cart,
          totalAmount,
          shippingInfo: {
            email: shippingForm.email,
            name: shippingForm.name,
            address: {
              line1: shippingForm.address,
              city: shippingForm.city,
              country: shippingForm.country || "US",
            },
          },
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/api/session/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          },
        );

        if (!response.ok) {
          let errorMessage = "Failed to create checkout session";
          try {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            errorMessage = JSON.stringify(errorData, null, 2);
          } catch (parseError) {
            console.error("Could not parse error response");
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Success response:", data);

        if (!data.success) {
          throw new Error(data.message || "Failed to create checkout session");
        }

        setClientSecret(data.data.clientSecret);
      } catch (err: any) {
        console.error("fetchClientSecret error:", err);
        setError(err.message);
      }
    };

    if (token && cart && cart.length > 0) {
      fetchClientSecret();
    }
  }, [cart, token, shippingForm]);

  if (!token) {
    return <div className="p-4">Loading...</div>;
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="text-gray-500 p-4">
        <p>Your cart is empty. Please add items to proceed with checkout.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return <div className="p-4">Preparing checkout...</div>;
  }

  const options = {
    clientSecret,
  };

  return (
    <div id="checkout">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm shippingForm={shippingForm} />
      </Elements>
    </div>
  );
};

export default StripePaymentForm;
