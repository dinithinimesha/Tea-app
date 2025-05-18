import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Link } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';

interface Product {
  id: number;
  product_name: string;
  company: string;
  price: number;
  category: string;
  quantity: number;
  status: boolean;
}

const ProductsTable = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const productsPerPage = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleRemove = (id: number) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => handleDelete(id),
          style: 'destructive',
        },
      ]
    );
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting:', error);
    } else {
      setProducts((prev) => prev.filter((product) => product.id !== id));
    }
  };

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View className="mb-4 overflow-hidden bg-white shadow rounded-xl">
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">
              {item.product_name}
            </Text>
            <Text className="text-gray-500">{item.company}</Text>
          </View>
          <View>
            <Text className="text-xl font-bold text-indigo-600">
              Rs {item.price}
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row mb-2">
          <View className="flex-1">
            <Text className="text-xs text-gray-500">Category</Text>
            <Text className="font-medium text-gray-800">{item.category}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500">Quantity</Text>
            <Text className="font-medium text-gray-800">{item.quantity}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500">Status</Text>
            <View
              className={`px-2 py-1 mt-1 rounded-full ${getStatusColor(
                item.status
              )}`}
            >
              <Text className="text-xs font-medium">
                {item.status ? 'Available' : 'Out of Stock'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row p-4 bg-gray-50">
        <Link href={`/manageproducts/editproductstatus/${item.id}`} className="flex-row items-center justify-center flex-1 px-3 py-2 mr-2 bg-indigo-200 rounded-lg">
        <Text className="font-medium text-indigo-600">Edit</Text>
        </Link>
      

        <TouchableOpacity
          onPress={() => handleRemove(item.id)}
          className="flex-row items-center justify-center flex-1 px-3 py-2 ml-2 bg-red-200 rounded-lg"
        >
          <Text className="font-medium text-red-600">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyListComponent = () => (
    <View className="items-center justify-center py-12">
      <Text className="mb-2 text-lg font-medium text-gray-500">
        No products found
      </Text>
    </View>
  );

  return (
    <View className="flex-1 px-4 pt-6 pb-4 mt-5 bg-gray-50">
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
                    className="p-2 mr-3 rounded-full bg-gray-50"
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Go back"
                  >
                    <Icon name="arrow-left" size={20} color="#333" />
                  </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">
          Product Inventory
        </Text>
        <Link href="/manageproducts/addproducts" className="p-2 bg-green-400 rounded-xl">
          
            <Text className="font-medium ">+ Add Product</Text>
          
        </Link>
      </View>

      {/* Search Bar */}
      <TextInput
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          setCurrentPage(1);
        }}
        className="px-4 py-2 mb-4 bg-white border border-gray-200 rounded-lg"
      />

      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={EmptyListComponent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />

          {filteredProducts.length > 0 && (
            <View className="flex-row items-center justify-between pt-4 mt-2 border-t border-gray-200">
              <TouchableOpacity
                disabled={currentPage === 1}
                onPress={() => setCurrentPage((prev) => prev - 1)}
                className={`flex-row items-center p-2 rounded-lg ${
                  currentPage === 1 ? 'opacity-50' : ''
                }`}
              >
                <Text className="font-medium text-indigo-600">Previous</Text>
              </TouchableOpacity>

              <Text className="font-medium text-gray-600">{`Page ${currentPage} of ${Math.ceil(
                filteredProducts.length / productsPerPage
              )}`}</Text>

              <TouchableOpacity
                disabled={currentPage * productsPerPage >= filteredProducts.length}
                onPress={() => setCurrentPage((prev) => prev + 1)}
                className={`flex-row items-center p-2 rounded-lg ${
                  currentPage * productsPerPage >= filteredProducts.length
                    ? 'opacity-50'
                    : ''
                }`}
              >
                <Text className="font-medium text-indigo-600">Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default ProductsTable;