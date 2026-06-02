import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import AddReviewScreen from './src/screens/AddReviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Lista"
        component={HomeScreen}
        options={{ title: 'Academias ao Ar Livre' }}
      />
      <Stack.Screen name="Detalhes" component={DetailsScreen} />
      <Stack.Screen
        name="Avaliar"
        component={AddReviewScreen}
        options={{ title: 'Avaliar Academia' }}
      />
    </Stack.Navigator>
  );
}

function MapStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Mapa"
        component={MapScreen}
        options={{ title: 'Mapa — Academias ao Ar Livre' }}
      />
      <Stack.Screen name="Detalhes" component={DetailsScreen} />
      <Stack.Screen
        name="Avaliar"
        component={AddReviewScreen}
        options={{ title: 'Avaliar Academia' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#aaa',
          tabBarStyle: {
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: -2 },
          },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Academias: focused ? 'fitness' : 'fitness-outline',
              Mapa: focused ? 'map' : 'map-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Academias" component={HomeStack} />
        <Tab.Screen name="Mapa" component={MapStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
