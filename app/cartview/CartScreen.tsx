import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '@/context/CartContext';
import EmptyCart from './EmptyCart';
import { Link } from 'expo-router';
import useSession from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import StripeCheckout from '../stripe/stripe';

interface CartItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  discount?: number;
  discountedTotal?: number;
}

const CartScreen = () => {
  const navigation = useNavigation();
  const { session, loading } = useSession();
  const [address, setAddress] = useState('');

  const {
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    calculateTotal,
    getDetailedCartItems
  } = useCart();

  const typedCartItems = getDetailedCartItems() as CartItem[];
  const total = calculateTotal();

  const fetchProfiles = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id);

      if (error) throw error;
      setAddress(data?.[0]?.address || '');
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  useEffect(() => {
    if (session && !loading) fetchProfiles();
  }, [session, loading]);

  const handleRemove = (id: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', onPress: () => removeFromCart(id), style: 'destructive' },
    ]);
  };

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: clearCart, style: 'destructive' },
    ]);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View className="flex-row items-center p-4 mb-3 bg-white shadow-sm rounded-xl">
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">{item.product_name}</Text>
        <Text className="mt-1 text-sm text-gray-500">Rs.{item.price.toFixed(2)} each</Text>
      </View>
      <View className="flex-row items-center mr-2">
        <TouchableOpacity
          className="items-center justify-center w-8 h-8 bg-gray-100 rounded-full"
          onPress={() => decrementQuantity(item.id)}
        >
          <Text className="text-lg font-medium text-gray-700">-</Text>
        </TouchableOpacity>
        <Text className="w-10 mx-2 text-base font-medium text-center">{item.quantity}</Text>
        <TouchableOpacity
          className="items-center justify-center w-8 h-8 bg-gray-100 rounded-full"
          onPress={() => incrementQuantity(item.id)}
        >
          <Text className="text-lg font-medium text-gray-700">+</Text>
        </TouchableOpacity>
      </View>
      <View className="items-end ml-2">
        {item.discount && item.discount > 0 ? (
          <>
            <Text className="text-sm text-gray-400 line-through">
              Rs.{(item.price * item.quantity).toFixed(2)}
            </Text>
            <Text className="text-sm text-green-700">
              -Rs.{item.discount.toFixed(2)} (10% off)
            </Text>
            <Text className="text-base font-semibold text-gray-800">
              Rs.{item.discountedTotal?.toFixed(2)}
            </Text>
          </>
        ) : (
          <Text className="text-base font-semibold text-gray-800">
            Rs.{(item.price * item.quantity).toFixed(2)}
          </Text>
        )}
        <TouchableOpacity className="p-2" onPress={() => handleRemove(item.id)}>
          <Icon name="trash" size={18} color="#ff4d4f" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-row items-center justify-between px-5 py-4 mt-5 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-800">Shopping Cart</Text>
        {typedCartItems.length > 0 && (
          <TouchableOpacity className="px-3 py-1.5 bg-red-100 rounded-full" onPress={handleClear}>
            <Text className="text-sm font-medium text-red-700">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 px-5 pt-4">
        {typedCartItems.length > 0 ? (
          <>
            <FlatList
              data={typedCartItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCartItem}
              showsVerticalScrollIndicator={false}
              className="mb-4"
            />

            <View className="p-5 mt-auto mb-4 bg-white shadow-sm rounded-xl">
              <View className="flex-row justify-between mb-2">
                <Text className="text-base text-gray-600">Shipping Address</Text>
                <Link href="/cartview/changeaddress">
                  <Text className="text-base font-medium text-green-800">Change</Text>
                </Link>
              </View>
              <Text className="mb-2 text-base text-gray-600">
                {address || "No address set"}
              </Text>

              <View className="my-3 border-t border-gray-200" />

              <View className="flex-row justify-between mb-1">
                <Text className="text-lg font-bold text-gray-800">Total</Text>
                <Text className="text-lg font-bold text-green-600">Rs.{total.toFixed(2)}</Text>
              </View>

              <StripeCheckout />
            </View>
          </>
        ) : (
          <EmptyCart />
        )}
      </View>

      <View className="flex-row items-center justify-around px-5 py-3 bg-white border-t border-gray-100 shadow-lg">
        <Link href="/" asChild>
          <TouchableOpacity className="items-center">
            <Icon name="home" size={22} color="#9ca3af" />
            <Text className="mt-1 text-xs text-gray-600">Home</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/orders/orders" asChild>
          <TouchableOpacity className="items-center">
            <Icon name="package" size={22} color="#9ca3af" />
            <Text className="mt-1 text-xs text-gray-600">Orders</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/profiles/useraccount" asChild>
          <TouchableOpacity className="items-center">
            <Icon name="user" size={22} color="#9ca3af" />
            <Text className="mt-1 text-xs text-gray-600">Profile</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
};

export default CartScreen;
