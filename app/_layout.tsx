import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import { CartProvider } from "@/context/CartContext";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey="pk_test_51RQ8BLGCoDtsBtXJ95TiWp3EMxHpEBrdss7SO1plJCZZeXylXedxylvmobKFZml1gcgwFdInq0DsDF4xlU5Sn9dv00BJIpJsho" // Replace with your Stripe test key
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
