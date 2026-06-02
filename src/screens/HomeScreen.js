import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listarAcademias } from '../services/academias';
import useUserLocation from '../hooks/useUserLocation';
import { calcularDistanciaKm, formatarDistancia } from '../utils/geo';

const ORDENACOES = [
  { id: 'nome', label: 'Nome', icon: 'text-outline' },
  { id: 'distancia', label: 'Perto de mim', icon: 'navigate-outline' },
  { id: 'avaliacao', label: 'Melhores', icon: 'star-outline' },
];

export default function HomeScreen({ navigation }) {
  const [academias, setAcademias] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);
  const [ordenacao, setOrdenacao] = useState('nome');

  const { location, status: locStatus } = useUserLocation();

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const resultado = await listarAcademias();
      setAcademias(resultado);
    } catch (e) {
      console.error('Erro ao carregar academias:', e);
      setErro('Não foi possível carregar as academias. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function onRefresh() {
    setRefreshing(true);
    carregar();
  }

  function tentarNovamente() {
    setLoading(true);
    carregar();
  }

  // Aplica distância (se houver localização), busca e ordenação.
  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    let itens = academias.map((academia) => {
      const loc = academia.get('localizacao');
      let distanciaKm = null;
      if (location && loc) {
        distanciaKm = calcularDistanciaKm(
          location.latitude,
          location.longitude,
          loc.latitude,
          loc.longitude
        );
      }
      return { academia, distanciaKm };
    });

    if (termo) {
      itens = itens.filter(
        ({ academia }) =>
          academia.get('nome').toLowerCase().includes(termo) ||
          (academia.get('bairro') || '').toLowerCase().includes(termo)
      );
    }

    itens.sort((a, b) => {
      if (ordenacao === 'avaliacao') {
        return (b.academia.get('mediaAvaliacao') || 0) - (a.academia.get('mediaAvaliacao') || 0);
      }
      if (ordenacao === 'distancia') {
        if (a.distanciaKm == null) return 1;
        if (b.distanciaKm == null) return -1;
        return a.distanciaKm - b.distanciaKm;
      }
      return a.academia.get('nome').localeCompare(b.academia.get('nome'));
    });

    return itens;
  }, [academias, busca, ordenacao, location]);

  function renderItem({ item }) {
    const { academia, distanciaKm } = item;
    const equipamentos = academia.get('equipamentos') || [];
    const avaliacao = academia.get('mediaAvaliacao') || 0;
    const distanciaTexto = formatarDistancia(distanciaKm);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Detalhes', { academia })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="fitness" size={28} color="#2E7D32" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardNome}>{academia.get('nome')}</Text>
            <View style={styles.localRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.cardBairro}>{academia.get('bairro')}</Text>
              {distanciaTexto && (
                <View style={styles.distanciaBadge}>
                  <Ionicons name="navigate" size={11} color="#2E7D32" />
                  <Text style={styles.distanciaText}>{distanciaTexto}</Text>
                </View>
              )}
            </View>
          </View>
          {avaliacao > 0 && (
            <View style={styles.avaliacaoContainer}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={styles.avaliacaoText}>{avaliacao.toFixed(1)}</Text>
            </View>
          )}
        </View>
        {equipamentos.length > 0 && (
          <View style={styles.equipamentosRow}>
            <Ionicons name="barbell-outline" size={13} color="#888" />
            <Text style={styles.equipamentosText} numberOfLines={1}>
              {equipamentos.join(' · ')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando academias...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={60} color="#ccc" />
        <Text style={styles.erroText}>{erro}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={tentarNovamente} activeOpacity={0.85}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou bairro..."
          placeholderTextColor="#aaa"
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.ordenacaoRow}>
        {ORDENACOES.map((opt) => {
          const ativo = ordenacao === opt.id;
          const desabilitado = opt.id === 'distancia' && !location;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, ativo && styles.chipAtivo, desabilitado && styles.chipDesabilitado]}
              onPress={() => !desabilitado && setOrdenacao(opt.id)}
              disabled={desabilitado}
              activeOpacity={0.8}
            >
              <Ionicons
                name={opt.icon}
                size={13}
                color={ativo ? '#fff' : desabilitado ? '#ccc' : '#2E7D32'}
              />
              <Text
                style={[
                  styles.chipText,
                  ativo && styles.chipTextAtivo,
                  desabilitado && styles.chipTextDesabilitado,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.contador}>
        {lista.length} academia{lista.length !== 1 ? 's' : ''} encontrada{lista.length !== 1 ? 's' : ''}
        {ordenacao === 'distancia' && locStatus === 'denied' ? ' · localização desativada' : ''}
      </Text>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.academia.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="fitness-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma academia encontrada</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 12,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#333',
  },
  ordenacaoRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D7EAD9',
  },
  chipAtivo: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  chipDesabilitado: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E8E8E8',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  chipTextAtivo: {
    color: '#fff',
  },
  chipTextDesabilitado: {
    color: '#bbb',
  },
  contador: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    color: '#888',
    fontSize: 13,
  },
  lista: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardBairro: {
    fontSize: 13,
    color: '#666',
    marginLeft: 2,
  },
  distanciaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  distanciaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  avaliacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  avaliacaoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F57F17',
    marginLeft: 3,
  },
  equipamentosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  equipamentosText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 5,
    flex: 1,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
    marginTop: 12,
  },
});
