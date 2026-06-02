import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listarAcademias } from '../services/academias';
import { getFavoritos, toggleFavorito } from '../services/favoritos';
import useUserLocation from '../hooks/useUserLocation';
import { calcularDistanciaKm, formatarDistancia } from '../utils/geo';
import { getStatusAgora } from '../utils/horarios';
import { colors, spacing, radius, shadow } from '../theme';

const ORDENACOES = [
  { id: 'nome',      label: 'Nome',        icon: 'text-outline' },
  { id: 'distancia', label: 'Perto de mim', icon: 'navigate-outline' },
  { id: 'avaliacao', label: 'Melhores',    icon: 'star-outline' },
  { id: 'favoritos', label: 'Favoritos',   icon: 'heart-outline' },
];

const statusHorario = getStatusAgora();

export default function HomeScreen({ navigation }) {
  const [academias, setAcademias] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);
  const [ordenacao, setOrdenacao] = useState('nome');

  const { location, status: locStatus } = useUserLocation();

  useEffect(() => { getFavoritos().then(setFavoritos); }, []);

  async function handleToggleFavorito(e, id) {
    e.stopPropagation();
    const novos = await toggleFavorito(id);
    setFavoritos(novos);
  }

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
          location.latitude, location.longitude,
          loc.latitude, loc.longitude
        );
      }
      return { academia, distanciaKm };
    });

    if (termo) {
      itens = itens.filter(({ academia }) =>
        academia.get('nome').toLowerCase().includes(termo) ||
        (academia.get('bairro') || '').toLowerCase().includes(termo)
      );
    }

    if (ordenacao === 'favoritos') {
      itens = itens.filter(({ academia }) => favoritos.includes(academia.id));
    }

    itens.sort((a, b) => {
      if (ordenacao === 'avaliacao')
        return (b.academia.get('mediaAvaliacao') || 0) - (a.academia.get('mediaAvaliacao') || 0);
      if (ordenacao === 'distancia') {
        if (a.distanciaKm == null) return 1;
        if (b.distanciaKm == null) return -1;
        return a.distanciaKm - b.distanciaKm;
      }
      return a.academia.get('nome').localeCompare(b.academia.get('nome'));
    });

    return itens;
  }, [academias, busca, ordenacao, location, favoritos]);

  function renderItem({ item }) {
    const { academia, distanciaKm } = item;
    const avaliacao = academia.get('mediaAvaliacao') || 0;
    const distanciaTexto = formatarDistancia(distanciaKm);
    const ehFavorito = favoritos.includes(academia.id);
    const tipo = academia.get('tipo') || 'academia-recife';
    const ehADC = tipo === 'academia-da-cidade';
    const nomeExibido = (academia.get('nome') || '')
      .replace(/^Academia Recife\s*[-–]\s*/i, '')
      .replace(/^Academia da Cidade\s+/i, '');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Detalhes', { academia })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, ehADC && styles.iconContainerADC]}>
            <Ionicons name={ehADC ? 'people' : 'fitness'} size={26} color={ehADC ? colors.primary : '#FFC20E'} />
          </View>
          <View style={styles.cardInfo}>
            {/* Badge do programa */}
            <View style={[styles.tipoBadge, ehADC ? styles.tipoBadgeADC : styles.tipoBadgeAR]}>
              <Text style={[styles.tipoBadgeText, ehADC ? styles.tipoBadgeTextADC : styles.tipoBadgeTextAR]}>
                {ehADC ? 'Academia da Cidade' : 'Academia Recife'}
              </Text>
            </View>
            <Text style={styles.cardNome}>{nomeExibido}</Text>
            <View style={styles.localRow}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.cardBairro}>{academia.get('bairro')}</Text>
              {distanciaTexto && (
                <View style={styles.distanciaBadge}>
                  <Ionicons name="navigate" size={11} color={colors.primary} />
                  <Text style={styles.distanciaText}>{distanciaTexto}</Text>
                </View>
              )}
            </View>
            {/* Badge Aberto / Fechado */}
            <View style={[styles.statusBadge, statusHorario.aberto ? styles.statusAberto : styles.statusFechado]}>
              <View style={[styles.statusDot, { backgroundColor: statusHorario.aberto ? '#22C55E' : '#EF4444' }]} />
              <Text style={[styles.statusText, { color: statusHorario.aberto ? '#15803D' : '#B91C1C' }]}>
                {statusHorario.label}
              </Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            {avaliacao > 0 && (
              <View style={styles.avaliacaoContainer}>
                <Ionicons name="star" size={13} color={colors.star} />
                <Text style={styles.avaliacaoText}>{avaliacao.toFixed(1)}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={(e) => handleToggleFavorito(e, academia.id)}
              hitSlop={8}
              style={styles.favBtn}
            >
              <Ionicons
                name={ehFavorito ? 'heart' : 'heart-outline'}
                size={22}
                color={ehFavorito ? '#EF4444' : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0064B0" />
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
      {/* Faixa de marca: logo + slogan */}
      <View style={styles.brandBar}>
        <View style={styles.brandLeft}>
          <Image source={require('../../assets/recife-logo.png')} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.brandNome}>Recife <Text style={styles.brandPlus}>+</Text></Text>
            <Text style={styles.brandSlogan}>POR VOCÊ, TRABALHANDO SEM PARAR</Text>
          </View>
        </View>
      </View>
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
                color={ativo ? '#1A1A1A' : desabilitado ? '#ccc' : colors.primary}
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
        {lista.length} espaço{lista.length !== 1 ? 's' : ''} encontrado{lista.length !== 1 ? 's' : ''}
        {ordenacao === 'distancia' && locStatus === 'denied' ? ' · localização desativada' : ''}
      </Text>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.academia.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0064B0']} />
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
    backgroundColor: colors.bg,
  },
  brandBar: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 20,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  brandNome: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  brandPlus: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '900',
  },
  brandSlogan: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 14,
    color: colors.textSecondary,
    fontSize: 15,
  },
  erroText: {
    marginTop: 14,
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginTop: 22,
    gap: 8,
    ...shadow.card,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    ...shadow.soft,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: colors.textPrimary,
  },
  ordenacaoRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  chipAtivo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipDesabilitado: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E8E8E8',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  chipTextAtivo: {
    color: '#1A1A1A',
  },
  chipTextDesabilitado: {
    color: '#bbb',
  },
  contador: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 6,
    color: colors.textMuted,
    fontSize: 13,
  },
  lista: {
    paddingHorizontal: spacing.md,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerADC: {
    backgroundColor: colors.primarySoft,
  },
  tipoBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 3,
  },
  tipoBadgeAR: { backgroundColor: colors.accentSoft },
  tipoBadgeADC: { backgroundColor: colors.primarySoft },
  tipoBadgeText: { fontSize: 10, fontWeight: '700' },
  tipoBadgeTextAR: { color: colors.accentText },
  tipoBadgeTextADC: { color: colors.primary },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
  },
  cardBairro: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  distanciaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  distanciaText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  avaliacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.starSoft,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  avaliacaoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.starText,
    marginLeft: 3,
  },
  favBtn: {
    padding: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  statusAberto: { backgroundColor: '#F0FDF4' },
  statusFechado: { backgroundColor: '#FEF2F2' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 12,
  },
});
