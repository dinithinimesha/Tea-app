'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Link } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

interface UserDashboardProps {
  session: Session;
}

const CategoryButton = ({
  title,
  isActive,
  onPress,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full mr-3 ${isActive ? 'bg-green-600' : 'bg-white border border-gray-200'}`}
  >
    <Text className={`font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>{title}</Text>
  </TouchableOpacity>
);

const SearchBar = ({
  searchQuery,
  handleSearch,
}: {
  searchQuery: string;
  handleSearch: (query: string) => void;
}) => (
  <View className="flex-row items-center p-3 bg-gray-100 border border-gray-200 rounded-lg">
    <Icon name="search" size={18} color="#4b5563" className="mr-2" />
    <TextInput
      className="flex-1 ml-2 text-base"
      placeholder="Search your favorite brew..."
      value={searchQuery}
      onChangeText={handleSearch}
      placeholderTextColor="#9ca3af"
    />
    {searchQuery ? (
      <TouchableOpacity onPress={() => handleSearch('')}>
        <Icon name="x" size={18} color="#4b5563" />
      </TouchableOpacity>
    ) : null}
  </View>
);

export default function UserDashboard({ session }: UserDashboardProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { cartItems, addToCart, clearCartstorage } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error('Error fetching products:', error);
      else {
        setProducts(data);
        setFilteredProducts(data);
      }
    };
    fetchProducts();
  }, []);

  const filterProducts = useCallback(
    (query: string, category: string) => {
      let filtered = products;
      if (query) {
        filtered = filtered.filter((p) =>
          p.product_name.toLowerCase().includes(query.toLowerCase())
        );
      }
      if (category !== 'all') {
        filtered = filtered.filter(
          (p) => p.category?.toLowerCase() === category.toLowerCase()
        );
      }
      setFilteredProducts(filtered);
    },
    [products]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterProducts(query, activeCategory);
  };

  const filterByCategory = (category: string) => {
    setActiveCategory(category);
    filterProducts(searchQuery, category);
  };

  const showAlert = () => {
    Alert.alert('Sign Out', 'Do you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          await clearCartstorage();
          handleSignOut();
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error signing out', error.message);
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View className="px-5 pt-12 pb-4 bg-white shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold tracking-wider text-green-700">AROMA</Text>
          <View className="flex-row items-center space-x-4">
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
            <TouchableOpacity onPress={showAlert} className="p-2">
              <Icon name="log-out" size={22} color="#16a34a" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text className="mt-3 mb-4 text-lg italic font-medium text-center text-gray-600">
        A Perfect Blend of Tea & Coffee
      </Text>

      <View className="px-5">
        <SearchBar searchQuery={searchQuery} handleSearch={handleSearch} />
      </View>

      {/* Categories */}
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="mr-4 text-base font-bold text-gray-700">Categories</Text>
          <Link href="/analysis/test" asChild>
            <TouchableOpacity >
              <Text className="text-xl font-bold text-gray-800 ">Product Overview</Text>
            </TouchableOpacity >
          </Link>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: 'all', title: 'All' },
            { id: 'tea', title: 'Tea' },
            { id: 'coffee', title: 'Coffee' },
          ]}
          renderItem={({ item }) => (
            <CategoryButton
              title={item.title}
              isActive={activeCategory === item.id}
              onPress={() => filterByCategory(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Products */}
      <View className="flex-1 px-5 pt-2">
        <Text className="mt-2 mb-3 text-base font-bold text-gray-700">
          {activeCategory === 'all'
            ? 'All Products'
            : activeCategory === 'tea'
            ? 'Tea Collection'
            : activeCategory === 'coffee'
            ? 'Coffee Selection'
            : 'Special Blends'}
        </Text>

        {filteredProducts.length === 0 ? (
          <View className="items-center justify-center flex-1">
            <Icon name="coffee" size={60} color="#d1d5db" />
            <Text className="mt-4 text-base text-gray-400">No products found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-white rounded-2xl shadow-sm mb-5 w-[48%] overflow-hidden relative">
                <Image
                  source={{ uri: item.product_image }}
                  className="w-full h-44"
                  resizeMode="cover"
                  blurRadius={!item.status ? 5 : 0}
                />
                {!item.status && (
                  <View className="absolute inset-0 items-center justify-center bg-black/50">
                    <Text className="px-2 py-1 text-sm font-bold text-white bg-red-500 rounded">
                      Not Available
                    </Text>
                  </View>
                )}
                <View className="p-3">
                  <Link href={`/products/${item.id}`} asChild>
                    <TouchableOpacity disabled={!item.status}>
                      <Text className="text-base font-bold text-gray-800">{item.product_name}</Text>
                    </TouchableOpacity>
                  </Link>
                  <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
                    {item.description || 'No description'}
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-lg font-bold text-green-700">Rs.{item.price}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (!item.status) return;
                        addToCart(item);
                        Alert.alert('Added to cart', `${item.product_name} added to your cart!`);
                      }}
                      disabled={!item.status}
                      className={`items-center justify-center w-8 h-8 rounded-full ${
                        item.status ? 'bg-green-600' : 'bg-gray-400'
                      }`}
                    >
                      <Icon name="plus" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View className="flex-row items-center justify-around px-5 py-3 bg-white border-t border-gray-100 shadow-lg">
        <Link href="/" asChild>
          <TouchableOpacity className="items-center">
            <Icon name="home" size={22} color="#16a34a" />
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
    </View>
  );
}
