import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import { CartProvider } from "@/context/CartContext";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey="pk_test_51RBEWGP7K68X3iwBrwXlNeiY1BFrwCoVDmO7lzRFLCD9QIXGryULUcDc5Op9JX7b7IGZq3BHrzggFkWNlm72nZn000FmBeTcXt" // Replace with your Stripe test key
      merchantIdentifier="merchant.identifier" // For Apple Pay
      urlScheme="your-url-scheme" // For 3D Secure / bank redirects
    >
      <CartProvider>
        <StatusBar
          style="dark"
          hidden={false}
          translucent={true}
          backgroundColor="transparent"
        />
        <Stack screenOptions={{ headerShown: false }} />
      </CartProvider>
    </StripeProvider>
  );
}
