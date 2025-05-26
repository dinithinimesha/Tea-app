// useraccount.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { BarChart } from 'react-native-chart-kit';

const ProfileList = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'quantity' | 'orders'>('quantity');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchTopProducts = async () => {
      const { data, error } = await supabase.rpc('top_selling_products');
      if (error) {
        console.error('Failed to fetch products:', error.message);
        setError(error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };
    fetchTopProducts();
  }, []);

  const prepareChartData = () => {
    const topProducts = products.slice(0, 6);
    return {
      labels: topProducts.map(({ product_name }) =>
        product_name.length > 8 ? `${product_name.slice(0, 8)}...` : product_name
      ),
      datasets: [
        {
          data: topProducts.map(p =>
            chartView === 'quantity' ? p.total_quantity_sold : p.total_orders
          ),
        },
      ],
    };
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f8fafc',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#22c55e',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#d1fae5',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fill: '#22c55e',
    },
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="p-4 pb-8">
      <View>
        <View className="flex-row items-center justify-start mt-5 mb-4">
          <TouchableOpacity
            className="p-2 mr-3 rounded-full bg-gray-50"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={20} color="#333" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Products Analysis</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4B5563" />
        ) : error ? (
          <Text className="text-red-500">{error}</Text>
        ) : (
          <>
            {/* Chart Section */}
            <View className="mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <View className="p-4 border-b border-gray-100">
                <Text className="mb-3 text-lg font-semibold text-gray-800">Top Products Overview</Text>
                <View className="flex-row p-1 bg-gray-100 rounded-lg">
                  {['quantity', 'orders'].map(type => (
                    <TouchableOpacity
                      key={type}
                      className={`flex-1 py-2 px-4 rounded-md ${
                        chartView === type ? 'bg-green-500' : 'bg-transparent'
                      }`}
                      onPress={() => setChartView(type as 'quantity' | 'orders')}
                    >
                      <Text
                        className={`text-center font-medium ${
                          chartView === type ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {type === 'quantity' ? 'Quantity Sold' : 'Total Orders'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {!!products.length && (
                <View className="p-4">
                  <BarChart
                    data={prepareChartData()}
                    width={screenWidth - 64}
                    height={220}
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    showValuesOnTopOfBars
                    withInnerLines
                    style={{ borderRadius: 12 }}
                  />
                  <View className="flex-row items-center justify-center mt-3">
                    <View className="w-3 h-3 mr-2 bg-green-500 rounded" />
                    <Text className="text-sm text-gray-600">
                      {chartView === 'quantity' ? 'Quantity Sold' : 'Total Orders'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Detailed List Section */}
            <View className="mb-4">
              <Text className="mb-3 text-lg font-semibold text-gray-800">Detailed Breakdown</Text>
            </View>

            {products.map((product, index) => (
              <View
                key={index}
                className="p-4 mb-3 bg-white border border-gray-100 shadow-sm rounded-xl"
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="flex-1 mr-2 text-lg font-semibold text-gray-800">
                    {product.product_name}
                  </Text>
                  <View className="px-2 py-1 bg-green-100 rounded-full">
                    <Text className="text-xs font-medium text-green-600">#{index + 1}</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Icon name="package" size={16} color="#6B7280" />
                    <Text className="ml-2 text-sm text-gray-600">
                      Qty: {product.total_quantity_sold.toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Icon name="shopping-cart" size={16} color="#6B7280" />
                    <Text className="ml-2 text-sm text-gray-600">
                      Orders: {product.total_orders.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ProfileList;
