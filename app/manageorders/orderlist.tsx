import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '@/lib/supabase';
import { Link } from 'expo-router';

interface Order {
  id: number;
  created_at: string;
  order_status: string;
}

interface OrderProduct {
  id: number;
  order_id: number;
  product_name: string;
  product_price: number;
  product_quantity: number;
}

const OrdersTable = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const ordersPerPage = 5;

  useEffect(() => {
    fetchOrders();
    fetchAllOrderProducts();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*');
    if (error) console.error('Error fetching orders:', error);
    else setOrders(data || []);
    setLoading(false);
  };

  const fetchAllOrderProducts = async () => {
    const { data, error } = await supabase.from('order_products').select('*');
    if (error) console.error('Error fetching order products:', error);
    else setOrderProducts(data || []);
  };

  const handleRemove = (id: number) => {
    Alert.alert('Remove Order', 'Are you sure you want to remove this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', onPress: () => handleDelete(id), style: 'destructive' },
    ]);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) console.error('Error deleting order:', error);
    else {
      setOrders((prev) => prev.filter((order) => order.id !== id));
      setOrderProducts((prev) => prev.filter((p) => p.order_id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      accepted: { bg: 'bg-green-100', text: 'text-green-800' },
      pending: { bg: 'bg-yellow-700', text: 'text-yellow-800' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    };
    return map[status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  const calculateOrderTotal = (products: OrderProduct[]) =>
    products
      .reduce((sum, p) => sum + p.product_price * p.product_quantity, 0)
      .toFixed(2);

  const filteredOrders = orders.filter((order) =>
    order.id.toString().includes(searchQuery)
  );

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const renderItem = ({ item }: { item: Order }) => {
    const products = orderProducts.filter((p) => p.order_id === item.id);

    return (
      <View className="mb-4 overflow-hidden bg-white shadow-md rounded-xl">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="items-center justify-center w-10 h-10 mr-3 bg-indigo-100 rounded-full">
              <Icon name="shopping-bag" size={16} color="#4F46E5" />
            </View>
            <Text className="text-lg font-bold text-gray-800">Order #{item.id}</Text>
          </View>
        </View>

        <View className="p-4">
          <Text className="mb-2 text-xs font-medium text-gray-500">PRODUCTS</Text>
          {products.map((p) => (
            <View key={p.id} className="flex-row justify-between py-2 border-b border-gray-100">
              <View className="flex-1">
                <Text className="font-medium text-gray-800">{p.product_name}</Text>
                <Text className="text-xs text-gray-500">
                  Qty: {p.product_quantity} × ${p.product_price}
                </Text>
              </View>
              <Text className="font-semibold text-gray-800">
                ${(p.product_price * p.product_quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View className="flex-row justify-between pt-3 mt-3 border-t border-gray-200">
            <Text className="font-semibold text-gray-600">Total</Text>
            <Text className="font-bold text-indigo-600">
              ${calculateOrderTotal(products)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50">
          <View>
            <Text className="text-xs text-gray-500">ORDER DATE</Text>
            <Text className="text-sm font-medium text-gray-700">
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text className="font-medium text-green-600">{item.order_status}</Text>
          <Link href={`/manageorders/editorderstatus/${item.id}`} className="px-3 py-2 bg-indigo-200 rounded-lg">
            <Text className="font-medium text-indigo-600 ">Edit</Text>
          </Link>
          <TouchableOpacity
            onPress={() => handleRemove(item.id)}
            className="px-3 py-2 bg-red-200 rounded-lg"
          >
            <Text className="font-medium text-red-600">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 px-4 pt-6 bg-gray-50">
      <View className="flex-row items-center justify-between mt-5 mb-6">
        <TouchableOpacity
          className="p-2 bg-indigo-500 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Orders</Text>
      </View>

      <FlatList
        data={paginatedOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {filteredOrders.length > ordersPerPage && (
        <View className="flex-row items-center justify-center px-2 py-4 my-2">
          <View className="flex-row items-center">
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage((prev) => prev - 1)}
              className={`p-2 mx-1 ${
                currentPage === 1 ? 'opacity-50' : ''
              }`}
            >
              <Icon name="chevron-left" size={16} color="#4F46E5" />
            </TouchableOpacity>

            {[...Array(totalPages)].map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentPage(index + 1)}
                className={`w-8 h-8 mx-1 items-center justify-center rounded-full ${
                  currentPage === index + 1 ? 'bg-indigo-100' : ''
                }`}
              >
                <Text 
                  className={`font-medium ${
                    currentPage === index + 1 ? 'text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              disabled={currentPage >= totalPages}
              onPress={() => setCurrentPage((prev) => prev + 1)}
              className={`p-2 mx-1 ${
                currentPage >= totalPages ? 'opacity-50' : ''
              }`}
            >
              <Icon name="chevron-right" size={16} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrdersTable;