import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

// Product type definition
type Product = {
  id: string;
  product_name: string;
  description: string;
  price: number;
  product_image: string | null;
};

const ProductDetails: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const { cartItems, addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      quantity: 1,
    });
    
    // Show a brief success message or animation here
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="items-center justify-center flex-1 p-4">
          <Icon name="alert-circle" size={40} color="#ef4444" />
          <Text className="mt-4 mb-2 text-lg font-medium text-center text-gray-800">Something went wrong</Text>
          <Text className="mb-4 text-center text-gray-500">{error}</Text>
          <TouchableOpacity 
            className="px-4 py-2 bg-gray-100 rounded-lg" 
            onPress={() => router.back()}>
            <Text className="font-medium text-gray-700">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          
          <Link href="/cartview/CartScreen" asChild>
                      <TouchableOpacity className="relative p-2">
                        <Icon name="shopping-cart" size={24} color="#16a34a" />
                        {cartItems.length > 0 && (
                          <View className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
                            <Text className="text-xs font-bold text-white">{cartItems.length}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </Link>
        </View>

        {/* Product Content */}
        <ScrollView className="flex-1">
          {product && (
            <View className="p-4">
              {/* Product Image */}
              <View className="items-center justify-center h-64 mb-6 overflow-hidden bg-gray-100 rounded-lg">
                {product.product_image ? (
                  <Image 
                    source={{ uri: product.product_image }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Icon name="image" size={64} color="#9ca3af" />
                )}
              </View>
              
              {/* Product Info */}
              <View className="mb-6">
                <Text className="mb-1 text-2xl font-bold text-gray-800">{product.product_name}</Text>
                <Text className="mb-4 text-xl font-bold text-green-600">${product.price.toFixed(2)}</Text>
                <Text className="text-gray-700">{product.description}</Text>
              </View>
              
              {/* Product ID */}
              <View className="p-3 mb-6 rounded-lg bg-gray-50">
                <Text className="text-sm text-gray-500">Product ID: {id}</Text>
              </View>
              
              {/* Add to Cart Button */}
              <TouchableOpacity 
                onPress={handleAddToCart}
                className="items-center justify-center py-3 mb-8 bg-green-600 rounded-lg"
              >
                <Text className="text-lg font-bold text-white">Add to Cart</Text>
              </TouchableOpacity>
              
              
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
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
          
              
          <TouchableOpacity className="items-center" onPress={() => setShowAccount(true)}>
            <Icon name="user" size={22} color="#9ca3af" />
            <Text className="mt-1 text-xs text-gray-600">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;