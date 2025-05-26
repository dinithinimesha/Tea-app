import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useCart } from '@/context/CartContext';
import useSession from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';

const API_URL = 'https://tea-app-web.vercel.app/api';

const StripeCheckout = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { cartItems, calculateTotal, clearCart } = useCart();
  const { session } = useSession();

  const [loading, setLoading] = useState(false);
  const [paymentSheetInitialized, setPaymentSheetInitialized] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const total = calculateTotal();

  const fetchPaymentSheetParams = async () => {
    try {
      const response = await fetch(`${API_URL}/payment-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          cart_items: cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Payment Sheet Params Error:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    if (!cartItems.length) return;

    try {
      setLoading(true);
      const { paymentIntent, ephemeralKey, customer } =
        await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'Tea App',
        allowsDelayedPaymentMethods: true,
        appearance: {
          colors: {
            primary: '#006400',
            background: '#ffffff',
            componentBackground: '#f3f3f3',
            componentBorder: '#e0e0e0',
            componentDivider: '#e0e0e0',
            primaryText: '#000000',
            secondaryText: '#646464',
            componentText: '#000000',
            placeholderText: '#8d8d8d',
          },
        },
      });

      setPaymentSheetInitialized(!error);
      if (error) Alert.alert('Stripe Init Error', error.message);
    } catch (error) {
      Alert.alert('Initialization Failed', error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('address')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setShippingAddress(data.address);
      return data.address;
    } catch (error) {
      console.error('Profile Fetch Error:', error);
      return '';
    } finally {
      setLoading(false);
    }
  };

  const insertOrderWithProducts = async () => {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_status: 'Pending',
            profiles_id: session.user.id,
            shipping_address: shippingAddress,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderProducts = cartItems.map(item => ({
        order_id: order.id,
        product_name: item.product_name,
        product_quantity: item.quantity,
        product_price: item.quantity >= 3 ? item.price * 0.9 : item.price,
      }));

      const { error: productsError } = await supabase
        .from('order_products')
        .insert(orderProducts);

      if (productsError) throw productsError;

      return { success: true };
    } catch (error) {
      console.error('Order Insert Error:', error);
      return { success: false, error };
    }
  };

  const handlePayPress = async () => {
    if (!cartItems.length) {
      Alert.alert('Cart Empty', 'Add items before checking out.');
      return;
    }

    if (!paymentSheetInitialized) {
      await initializePaymentSheet();
      if (!paymentSheetInitialized) {
        Alert.alert('Payment Not Ready', 'Try again in a moment.');
        return;
      }
    }

    try {
      setLoading(true);

      const address = await getProfile();
      if (!address) {
        Alert.alert(
          'Address Required',
          'Please add a shipping address in your profile.'
        );
        return;
      }

      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code !== 'Canceled') {
          Alert.alert('Payment Failed', error.message);
        }
      } else {
        const result = await insertOrderWithProducts();

        if (result.success) {
          Alert.alert('Order Placed', 'Your order was successful.', [
            { text: 'OK', onPress: clearCart },
          ]);
        } else {
          Alert.alert(
            'Order Save Failed',
            'Payment succeeded, but saving order failed.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Payment Error', error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) getProfile();
  }, [session]);

  useEffect(() => {
    if (cartItems.length) initializePaymentSheet();
  }, [cartItems]);

  return (
    <View>
      <TouchableOpacity
        className="w-full py-4 mt-4 bg-green-600 rounded-lg"
        onPress={handlePayPress}
        disabled={loading || !paymentSheetInitialized}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-bold text-center text-white">
            Checkout (Rs.{total.toFixed(2)})
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default StripeCheckout;
