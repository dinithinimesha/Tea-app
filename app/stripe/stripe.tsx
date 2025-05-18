import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, Alert, ActivityIndicator, View } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useCart } from '@/context/CartContext';
import useSession from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';

const API_URL = 'https://tea-app-web.vercel.app/api';

const StripeCheckout = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentSheetInitialized, setPaymentSheetInitialized] = useState(false);
  const { cartItems, calculateTotal, clearCart } = useCart();
  const total = calculateTotal();
  const { session } = useSession();

  const fetchPaymentSheetParams = async () => {
    try {
      // Only send essential information - the total amount
      const response = await fetch(`${API_URL}/payment-sheet`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          // Send just the count and minimal info about cart items
          cart_items: cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity
          }))
        }),
      });

      if (!response.ok) {
        console.log(`API response status: ${response.status}`);
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment sheet params:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    if (!cartItems.length) return;
    
    try {
      setLoading(true);
      
      console.log('Initializing payment sheet...');
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();
      
      console.log('Payment intent received, configuring sheet...');
      const { error } = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'Tea App',
        allowsDelayedPaymentMethods: true,
        // Add appearance configuration if desired
        appearance: {
          colors: {
            primary: '#006400', // Dark green
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

      if (error) {
        console.error('Error initializing payment sheet:', error);
        Alert.alert('Error', `Could not initialize payment sheet: ${error.message}`);
        setPaymentSheetInitialized(false);
        return;
      }

      console.log('Payment sheet initialized successfully');
      setPaymentSheetInitialized(true);
    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
      Alert.alert('Error', `Payment initialization failed: ${error.message || 'Unknown error'}`);
      setPaymentSheetInitialized(false);
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
      console.error('Error fetching profile:', error);
      return '';
    } finally {
      setLoading(false);
    }
  };

  const insertOrderWithProducts = async () => {
    if (!session?.user?.id) {
      console.error('No user session found');
      return { success: false, error: 'No user session found' };
    }

    if (!shippingAddress) {
      console.error('No shipping address found');
      return { success: false, error: 'No shipping address found' };
    }

    try {
      const { data: orderData, error: orderError } = await supabase
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

      if (orderError) {
        console.error('Error inserting order:', orderError);
        return { success: false, error: orderError };
      }

      const orderProducts = cartItems.map(item => ({
        order_id: orderData.id,
        product_name: item.product_name,
        product_quantity: item.quantity,
        product_price: item.price,
      }));

      const { error: productError } = await supabase
        .from('order_products')
        .insert(orderProducts);

      if (productError) {
        console.error('Error inserting order products:', productError);
        return { success: false, error: productError };
      }

      return { success: true, orderId: orderData.id };
    } catch (error) {
      console.error('Error in insertOrderWithProducts:', error);
      return { success: false, error };
    }
  };

  const handlePayPress = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checking out.');
      return;
    }

    if (!paymentSheetInitialized) {
      // Try to initialize again if not ready
      await initializePaymentSheet();
      
      if (!paymentSheetInitialized) {
        Alert.alert('Error', 'Payment system is not ready. Please try again later.');
        return;
      }
    }

    try {
      setLoading(true);

      const address = await getProfile();

      if (!address) {
        Alert.alert('Missing Information', 'Please update your profile with a shipping address before checkout.');
        setLoading(false);
        return;
      }

      console.log('Presenting payment sheet...');
      const { error } = await presentPaymentSheet();

      // Handle the result of the payment sheet
      if (error) {
        console.log('Payment sheet error:', JSON.stringify(error));
        
        if (error.code === 'Canceled') {
          console.log('User canceled the payment');
          // Don't show an alert for cancellation, it's a normal user action
          // Just log it and reset loading state
        } else {
          Alert.alert('Payment Failed', error.message || 'There was an issue processing your payment');
          console.error('Payment error details:', error);
        }
      } else {
        console.log('Payment successful, saving order...');
        const result = await insertOrderWithProducts();

        if (result.success) {
          Alert.alert('Success', 'Payment successful! Your order has been placed.', [
            { text: 'OK', onPress: () => clearCart() },
          ]);
        } else {
          Alert.alert('Order Processing Error', 'Payment was successful, but there was an issue saving your order. Please contact support.');
          console.error('Order processing error:', result.error);
        }
      }
    } catch (error) {
      console.error('Error in handlePayPress:', error);
      Alert.alert('Error', `Payment processing failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      getProfile();
    }
  }, [session]);

  useEffect(() => {
    // Initialize payment sheet when cart items change
    if (cartItems.length > 0) {
      initializePaymentSheet();
    }
  }, [cartItems]);

  // For debugging - log when component mounts/unmounts
  useEffect(() => {
    console.log('StripeCheckout component mounted');
    return () => {
      console.log('StripeCheckout component unmounted');
    };
  }, []);

  return (
    <View>
      <TouchableOpacity
        className="w-full py-4 mt-4 bg-green-600 rounded-lg"
        disabled={loading || cartItems.length === 0 || !paymentSheetInitialized}
        onPress={handlePayPress}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
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