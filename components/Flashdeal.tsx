import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const FlashDealBanner = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade in on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Single pulse animation loop
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Animated.View 
      style={{
        opacity: fadeAnim,
        transform: [{ scale: pulseAnim }]
      }}
      className="relative mx-4 mb-6 overflow-hidden rounded-xl"
    >
      {/* Main content */}
      <View className="relative px-4 py-3 shadow-lg bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
        
        {/* Flash icon */}
        <View className="absolute top-2 right-2">
          <Icon name="zap" size={20} color="#fff" />
        </View>

        {/* Flash Deal Badge */}
        <View className="flex-row items-center mb-2">
          <View className="px-2 py-1 mr-2 bg-yellow-400 rounded-full">
            <Text className="text-xs font-bold text-red-800">Discount</Text>
          </View>
          <View className="flex-1 h-px bg-red-600 opacity-30" />
        </View>

        {/* Main offer text */}
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-lg font-bold text-red-500">
              Buy 3 items at once
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-2xl font-extrabold text-red-500">
                10% OFF
              </Text>
              <View className="px-2 py-1 ml-2 bg-yellow-400 rounded-full bg-opacity-20">
                <Text className="text-xs font-bold ">LIMITED TIME</Text>
              </View>
            </View>
          </View>
          
          
        </View>
      </View>
    </Animated.View>
  );
};

export default FlashDealBanner;