import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardTypeOptions,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

export default function AddProducts() {
  const [formData, setFormData] = useState({
    product_name: '',
    price: '',
    description: '',
    company: '',  
    category: 'Tea',
    quantity: '',
    status: true, // use boolean for status
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigation = useNavigation();

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return Object.values(formData).every(value => value); // Check if all fields are filled
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('products').insert([
      {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        status: formData.status, // Already boolean
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      Alert.alert('Success', 'Product added successfully!');
      setFormData({
        product_name: '',
        price: '',
        description: '',
        company: '',
        category: 'Tea',
        quantity: '',
        status: true, // Reset status to true
      });
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} className="bg-gray-50">
      
      <View className="flex-row items-center mt-5 mb-8">
          <TouchableOpacity
                              className="p-2 mr-3 rounded-full bg-gray-50"
                              onPress={() => navigation.goBack()}
                              accessibilityLabel="Go back"
                            >
                              <Icon name="arrow-left" size={20} color="#333" />
                            </TouchableOpacity>
          <Text className="text-3xl font-bold text-gray-800">Add Product</Text>
        </View>


      <InputField label="Product Name" value={formData.product_name} onChange={value => handleInputChange('product_name', value)} />
      <InputField label="Price" value={formData.price} keyboardType="numeric" onChange={value => handleInputChange('price', value)} />
      <InputField label="Description" value={formData.description} multiline onChange={value => handleInputChange('description', value)} />
      <InputField label="Factory" value={formData.company} onChange={value => handleInputChange('company', value)} />
      <InputField label="Quantity" value={formData.quantity} keyboardType="numeric" onChange={value => handleInputChange('quantity', value)} />

      <Text className="mb-2 text-green-400">Category</Text>
      <PickerField selected={formData.category} onChange={value => handleInputChange('category', value)} options={['Tea', 'Coffee']} />

      <Text className="mb-2 text-green-400">Status</Text>
      <PickerField selected={formData.status ? 'true' : 'false'} onChange={value => handleInputChange('status', value === 'true')} options={['true', 'false']} />

      {message ? <Text className="my-2 text-center text-red-500">{message}</Text> : null}

      <TouchableOpacity className="items-center p-4 mt-4 bg-green-400 rounded-md" onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text className="font-bold text-black">Add Product</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function InputField({ label, value, onChange, multiline = false, keyboardType = 'default' }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; keyboardType?: KeyboardTypeOptions }) {
  return (
    <View className="mb-4">
      <Text className="mb-1 text-gray-800">{label}</Text>
      <TextInput
        className={`bg-neutral-700 text-white px-3 py-2 rounded-md ${multiline ? 'h-20 text-top' : ''}`}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function PickerField({ selected, onChange, options }: { selected: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <View className="flex-row flex-wrap mb-4">
      {options.map(option => (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          className={`px-3 py-2 rounded-md mr-2 mb-2 ${selected === option ? 'bg-green-400' : 'bg-neutral-700'}`}
        >
          <Text className={selected === option ? 'text-black' : 'text-white'}>
            {option === 'true' ? 'Active' : option === 'false' ? 'Inactive' : option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}