import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { listarAcademiasComLocalizacao } from '../services/academias';
import useUserLocation from '../hooks/useUserLocation';

const RECIFE_REGION = {
  latitude: -8.0476,
  longitude: -34.877,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function MapScreen({ navigation }) {
  const [academias, setAcademias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const mapRef = useRef(null);

  const { location: userLocation } = useUserLocation();

  const carregarDados = useCallback(async () => {
    try {
      setErro(null);
      const resultado = await listarAcademiasComLocalizacao();
      setAcademias(resultado);
    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
      setErro('Não foi possível carregar o mapa. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function centralizarUsuario() {
    if (!userLocation) {
      Alert.alert('Localização indisponível', 'Permita o acesso à localização nas configurações.');
      return;
    }
    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={60} color="#ccc" />
        <Text style={styles.erroText}>{erro}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setLoading(true);
            carregarDados();
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={RECIFE_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {academias.map((academia) => {
          const loc = academia.get('localizacao');
          if (!loc) return null;
          return (
            <Marker
              key={academia.id}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              pinColor="#2E7D32"
            >
              <Callout onPress={() => navigation.navigate('Detalhes', { academia })}>
                <View style={styles.callout}>
                  <Text style={styles.calloutNome}>{academia.get('nome')}</Text>
                  <Text style={styles.calloutBairro}>{academia.get('bairro')}</Text>
                  <Text style={styles.calloutVer}>Toque para ver detalhes →</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity style={styles.locationBtn} onPress={centralizarUsuario}>
        <Ionicons name="locate" size={22} color="#2E7D32" />
      </TouchableOpacity>

      <View style={styles.contador}>
        <Ionicons name="fitness" size={14} color="#fff" />
        <Text style={styles.contadorText}>{academias.length} academias no mapa</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 15,
  },
  erroText: {
    marginTop: 12,
    color: '#666',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  map: { flex: 1 },
  callout: {
    width: 180,
    padding: 4,
  },
  calloutNome: {
    fontWeight: '700',
    fontSize: 14,
    color: '#222',
    marginBottom: 2,
  },
  calloutBairro: {
    color: '#555',
    fontSize: 12,
    marginBottom: 4,
  },
  calloutVer: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '600',
  },
  locationBtn: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 28,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  contador: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 4,
  },
  contadorText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
