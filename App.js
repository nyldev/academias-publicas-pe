import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import AddReviewScreen from './src/screens/AddReviewScreen';
import { colors } from './src/theme';
import EntradaScreen from './src/screens/EntradaScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Opções compartilhadas dos cabeçalhos das pilhas (evita duplicação).
const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
  headerShadowVisible: false,
  cardStyle: { backgroundColor: colors.bg },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Lista"
        component={HomeScreen}
        options={{ title: 'Recife +' }}
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
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Mapa"
        component={MapScreen}
        options={{ title: 'Recife + · Mapa' }}
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
  const [entradaFim, setEntradaFim] = useState(false);

  if (!entradaFim) {
    return <EntradaScreen onFim={() => setEntradaFim(true)} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarStyle: {
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 6,
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
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
