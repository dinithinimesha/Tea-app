import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import useSession from '@/hooks/useSession';
import { Session } from '@supabase/supabase-js';
import FlashDealBanner from '@/components/Flashdeal';

type Product = {
  id: string;
  product_name: string;
  description: string;
  price: number;
  product_image: string | null;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

const ProductDetails: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedRating, setSelectedRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { cartItems, addToCart } = useCart();
  const { session, loading: sessionLoading } = useSession() as {
    session: Session | null;
    loading: boolean;
  };

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) setError(error.message);
      else setProduct(data);

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error.message);
        setReviews([]);
      } else {
        setReviews(data as Review[]);
      }
    };

    fetchReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      quantity: 1,
    });

    Alert.alert('Added to Cart', `${product.product_name} has been added.`);
  };

  const handleAddReview = async () => {
    if (!session?.user.id) {
      Alert.alert('Sign In Required', 'Please sign in to leave a review.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Empty Comment', 'Please enter a comment before submitting.');
      return;
    }

    setSubmittingReview(true);

    try {
      const { error } = await supabase.from('reviews').insert([
        {
          profile_id: session.user.id,
          product_id: id,
          rating: selectedRating,
          comment: comment.trim(),
        },
      ]);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Review Submitted', 'Thank you for your feedback!');
        setComment('');
        setSelectedRating(5);
        
        // Refresh reviews
        const { data } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('product_id', id)
          .order('created_at', { ascending: false });
        
        if (data) setReviews(data as Review[]);
      }
    } catch (err: any) {
      Alert.alert('Unexpected Error', err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false, onPress?: (rating: number) => void) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onPress?.(star)}
            disabled={!interactive}
            className={interactive ? "p-1" : ""}
          >
            <Icon
              name="star"
              size={size}
              color={star <= rating ? "#fbbf24" : "#d1d5db"}
              style={{ 
                ...(star <= rating && { fill: "#fbbf24" })
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
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
          <Text className="mt-4 text-lg font-medium text-center text-gray-800">
            Something went wrong
          </Text>
          <Text className="mb-4 text-center text-gray-500">{error}</Text>
          <TouchableOpacity
            className="px-4 py-2 bg-gray-100 rounded-lg"
            onPress={() => router.back()}
          >
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
                <View className="absolute top-0 right-0 items-center justify-center w-5 h-5 bg-red-500 rounded-full">
                  <Text className="text-xs font-bold text-white">{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView className="flex-1">
          {product && (
            <View className="p-4">
              {/* Image */}
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

              {/* Info */}
              <View className="mb-6">
                <Text className="mb-1 text-2xl font-bold text-gray-800">
                  {product.product_name}
                </Text>
                <Text className="mb-4 text-xl font-bold text-green-600">
                  Rs.{product.price.toFixed(2)}
                </Text>
                <Text className="text-gray-700">{product.description}</Text>
              </View>
              
              {/* Discount Flash deal */}
              <FlashDealBanner />

              
              {/* Add to Cart */}
              <TouchableOpacity
                onPress={handleAddToCart}
                className="items-center justify-center py-3 mb-8 bg-green-600 rounded-lg"
              >
                <Text className="text-lg font-bold text-white">Add to Cart</Text>
              </TouchableOpacity>

              {/* Reviews Section */}
              <View className="mb-6">
                {/* Reviews Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-gray-800">Reviews</Text>
                  {reviews.length > 0 && (
                    <View className="flex-row items-center">
                      {renderStars(parseFloat(getAverageRating()))}
                      <Text className="ml-2 text-sm font-medium text-gray-600">
                        {getAverageRating()} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </Text>
                    </View>
                  )}
                </View>

                {/* Add Review Form */}
                {session?.user.id && (
                  <View className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
                    <Text className="mb-3 text-base font-medium text-gray-800">
                      Write a Review
                    </Text>
                    
                    {/* Rating Selection */}
                    <View className="mb-3">
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Your Rating
                      </Text>
                      {renderStars(selectedRating, 24, true, setSelectedRating)}
                    </View>

                    {/* Comment Input */}
                    <View className="mb-3">
                      <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Share your thoughts about this product..."
                        multiline
                        numberOfLines={3}
                        className="p-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg"
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      onPress={handleAddReview}
                      disabled={submittingReview || !comment.trim()}
                      className={`items-center justify-center py-3 rounded-lg ${
                        submittingReview || !comment.trim()
                          ? 'bg-gray-300'
                          : 'bg-blue-600'
                      }`}
                    >
                      {submittingReview ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text className="font-medium text-white">
                          Submit Review
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <View>
                    {reviews.map((review, index) => (
                      <View
                        key={review.id}
                        className={`p-4 ${
                          index !== reviews.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        {/* Review Header */}
                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-row items-center flex-1">
                            {/* Avatar */}
                            <View className="items-center justify-center w-10 h-10 mr-3 bg-gray-200 rounded-full">
                              {review.profiles.avatar_url ? (
                                <Image
                                  source={{ uri: review.profiles.avatar_url }}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <Icon name="user" size={18} color="#6b7280" />
                              )}
                            </View>
                            
                            {/* User Info */}
                            <View className="flex-1">
                              <Text className="font-medium text-gray-800">
                                {review.profiles.username || 'Anonymous'}
                              </Text>
                              <View className="flex-row items-center mt-1">
                                {renderStars(review.rating, 14)}
                                <Text className="ml-2 text-xs text-gray-500">
                                  {formatDate(review.created_at)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        {/* Review Comment */}
                        <Text className="leading-5 text-gray-700">
                          {review.comment}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <Icon name="message-circle" size={48} color="#d1d5db" />
                    <Text className="mt-3 text-base font-medium text-gray-500">
                      No reviews yet
                    </Text>
                    <Text className="mt-1 text-sm text-center text-gray-400">
                      Be the first to share your thoughts about this product
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;