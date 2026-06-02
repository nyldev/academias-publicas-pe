import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// O react-native-maps é um módulo NATIVO e não roda no navegador.
// O Metro escolhe este arquivo (.web.js) automaticamente na web, evitando
// que o import do mapa quebre o app. No celular, usa-se o MapScreen.js normal.
export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={72} color="#A6CCE8" />
      <Text style={styles.titulo}>Mapa disponível no celular</Text>
      <Text style={styles.texto}>
        O mapa interativo usa recursos nativos e funciona no app pelo Expo Go
        (iOS/Android). Aqui na versão web, veja todas as academias na aba
        “Academias”.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
  },
  titulo: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0064B0',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  texto: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 420,
  },
});
