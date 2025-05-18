// EmptyCart.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const EmptyCart: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View className="items-center justify-center flex-1 ">
      <Feather name="shopping-cart" size={80} color="#ccc" />
      <Text className="mt-4 mb-6 text-lg font-medium text-gray-500">
        Your cart is empty
      </Text>
      <TouchableOpacity  onPress={() => navigation.goBack()} className="items-center px-5 py-4 mt-5 bg-green-600 rounded-lg">
      <Text className="text-base font-bold text-white">Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyCart;
