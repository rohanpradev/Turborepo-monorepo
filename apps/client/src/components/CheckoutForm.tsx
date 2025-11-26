"use client";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState, FormEvent } from "react";

interface ShippingFormInputs {
  email: string;
  name: string;
  address: string;
  city: string;
  country?: string;
}

const CheckoutForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL where the customer will be redirected after payment
        return_url: `${window.location.origin}/return`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An unexpected error occurred.");
      } else {
        setMessage("An unexpected error occurred.");
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Shipping Information</h2>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="text-sm">
            <span className="font-medium">Email:</span> {shippingForm.email}
          </p>
          <p className="text-sm">
            <span className="font-medium">Name:</span> {shippingForm.name}
          </p>
          <p className="text-sm">
            <span className="font-medium">Address:</span> {shippingForm.address}
          </p>
          <p className="text-sm">
            <span className="font-medium">City:</span> {shippingForm.city}
          </p>
          {shippingForm.country && (
            <p className="text-sm">
              <span className="font-medium">Country:</span>{" "}
              {shippingForm.country}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Payment Details</h2>
        <PaymentElement />
      </div>

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium 
                   hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition-colors"
      >
        <span id="button-text">{isLoading ? "Processing..." : "Pay now"}</span>
      </button>

      {/* Show any error or success messages */}
      {message && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{message}</p>
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
