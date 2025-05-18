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
import useSession from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

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
  const { session, loading: sessionLoading } = useSession() as { session: Session | null; loading: boolean };
  const ordersPerPage = 5;

  useEffect(() => {
    if (session) {
      fetchOrders();
      fetchAllOrderProducts();
    }
  }, [session]);

  const fetchOrders = async () => {
    if (!session || !session.user) {
      console.error('Session is not available');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').eq('profiles_id', session.user.id);
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
      Accepted: { bg: 'bg-green-100', text: 'text-green-800' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
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

  const renderItem = ({ item }: { item: Order }) => {
    const products = orderProducts.filter((p) => p.order_id === item.id);
    const statusStyle = getStatusColor(item.order_status);

    return (
      <View className="mb-4 overflow-hidden bg-white shadow-md rounded-xl">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="items-center justify-center w-10 h-10 mr-3 bg-indigo-100 rounded-full">
              <Icon name="shopping-bag" size={16} color="#4F46E5" />
            </View>
            <Text className="text-lg font-bold text-gray-800">Order #{item.id}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
            <Text className={`text-xs font-medium ${statusStyle.text}`}>
              {item.order_status}
            </Text>
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
          <Text className="font-medium text-green-800">{item.order_status}</Text>
          <TouchableOpacity
            onPress={() => handleRemove(item.id)}
            className="px-3 py-2 rounded-lg bg-red-50"
          >
            <Text className="font-medium text-red-600">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (sessionLoading) {
    return (
      <View className="items-center justify-center flex-1">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-6 bg-gray-50">
      <View className="flex-row items-center justify-between mt-5 mb-6">
      <TouchableOpacity
                    className="p-2 mr-3 rounded-full bg-gray-50"
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Go back"
                  >
                    <Icon name="arrow-left" size={20} color="#333" />
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
        <View className="flex-row items-center justify-between px-2 py-4 my-2 bg-white rounded-lg shadow-sm">
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((prev) => prev - 1)}
            className={`p-2 rounded-lg flex-row items-center ${currentPage === 1 ? 'opacity-50' : ''}`}
          >
            <Icon name="chevron-left" size={16} color="#4F46E5" style={{ marginRight: 4 }} />
            <Text className="font-medium text-indigo-600">Previous</Text>
          </TouchableOpacity>

          <Text className="font-medium text-gray-600">
            Page {currentPage} of {Math.ceil(filteredOrders.length / ordersPerPage)}
          </Text>

          <TouchableOpacity
            disabled={currentPage * ordersPerPage >= filteredOrders.length}
            onPress={() => setCurrentPage((prev) => prev + 1)}
            className={`p-2 rounded-lg flex-row items-center ${
              currentPage * ordersPerPage >= filteredOrders.length ? 'opacity-50' : ''
            }`}
          >
            <Text className="font-medium text-indigo-600">Next</Text>
            <Icon name="chevron-right" size={16} color="#4F46E5" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OrdersTable;