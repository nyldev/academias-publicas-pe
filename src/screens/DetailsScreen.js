import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { buscarAvaliacoes } from '../services/academias';
import { getFavoritos, toggleFavorito } from '../services/favoritos';
import { HORARIOS, getStatusAgora } from '../utils/horarios';
import { colors, spacing, radius, shadow } from '../theme';

const SCREEN_W = Dimensions.get('window').width;
const HERO_H = 260;

function Estrelas({ valor, tamanho = 16, cor = colors.star }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= valor ? 'star' : 'star-outline'}
          size={tamanho}
          color={cor}
        />
      ))}
    </View>
  );
}

export default function DetailsScreen({ route, navigation }) {
  const { academia } = route.params;
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingAv, setLoadingAv] = useState(true);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [favorito, setFavorito] = useState(false);
  const statusHorario = getStatusAgora();
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setFotoIdx(viewableItems[0].index ?? 0);
  }, []);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  const nome = academia.get('nome') || '';
  const bairro = academia.get('bairro') || '';
  const endereco = academia.get('endereco') || '';
  const descricao = academia.get('descricao') || '';
  const equipamentos = academia.get('equipamentos') || [];
  const mediaAvaliacao = academia.get('mediaAvaliacao') || 0;
  const fotos = academia.get('fotos') || [];

  // Extrai a parte mais curta do nome (remove "Academia Recife - " do início)
  const nomeExibido = nome.replace(/^Academia Recife\s*[-–]\s*/i, '');

  useEffect(() => {
    // Esconde o header padrão — usamos botão flutuante sobre o hero
    navigation.setOptions({ headerShown: false });
    carregarAvaliacoes();
    getFavoritos().then((favs) => setFavorito(favs.includes(academia.id)));
  }, []);

  async function carregarAvaliacoes() {
    try {
      const resultado = await buscarAvaliacoes(academia);
      setAvaliacoes(resultado);
    } catch (e) {
      console.error('Erro ao carregar avaliações:', e);
    } finally {
      setLoadingAv(false);
    }
  }

  const localizacao = academia.get('localizacao');

  function scrollParaFoto(i) {
    flatListRef.current?.scrollToIndex({ index: i, animated: true });
  }

  async function handleFavorito() {
    const novos = await toggleFavorito(academia.id);
    setFavorito(novos.includes(academia.id));
  }

  async function handleCompartilhar() {
    const { latitude, longitude } = localizacao || {};
    const mapsLink = latitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : '';
    try {
      await Share.share({
        message: `🏋️ ${nomeExibido}\n📍 ${bairro}${endereco ? ` — ${endereco}` : ''}\n\nAcademia ao ar livre gratuita da Prefeitura do Recife.\n${mapsLink}`,
        title: nomeExibido,
      });
    } catch (e) {
      console.error('Erro ao compartilhar:', e);
    }
  }

  function abrirRota() {
    if (!localizacao) {
      Alert.alert('Localização indisponível', 'Esta academia não possui coordenadas cadastradas.');
      return;
    }
    const { latitude, longitude } = localizacao;
    const label = encodeURIComponent(nomeExibido);

    // iOS → Apple Maps (abre o app nativo de mapas com rota)
    // Android → Google Maps
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${latitude},${longitude}&dirflg=d`
      : `google.navigation:q=${latitude},${longitude}`;

    // Fallback universal (Google Maps no navegador) caso o app não esteja instalado
    const urlFallback = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${label}&travelmode=walking`;

    Linking.canOpenURL(url)
      .then((supported) => Linking.openURL(supported ? url : urlFallback))
      .catch(() => Linking.openURL(urlFallback));
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO: galeria deslizável ── */}
      <View style={styles.hero}>
        {fotos.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={fotos}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig.current}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.heroImg} resizeMode="cover" />
            )}
          />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="fitness" size={64} color={colors.accent} />
          </View>
        )}

        {/* Gradiente + info (sempre visível sobre as fotos) */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.heroGradient}
          pointerEvents="none"
        >
          <View style={styles.heroSelo}>
            <Ionicons name="shield-checkmark" size={11} color={colors.accent} />
            <Text style={styles.heroSeloText}>Academia Recife · Prefeitura do Recife</Text>
          </View>
          <Text style={styles.heroNome}>{nomeExibido}</Text>
          <View style={styles.heroLocal}>
            <Ionicons name="location" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroLocalText} numberOfLines={1}>
              {bairro}{endereco ? ` · ${endereco}` : ''}
            </Text>
          </View>
          {mediaAvaliacao > 0 && (
            <View style={styles.heroMedia}>
              <Estrelas valor={Math.round(mediaAvaliacao)} tamanho={13} cor={colors.accent} />
              <Text style={styles.heroMediaText}>{mediaAvaliacao.toFixed(1)}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Botão voltar flutuante — sempre visível sobre a foto */}
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Bolinhas — toque para ir direto à foto, deslize para navegar */}
        {fotos.length > 1 && (
          <View style={styles.fotoDots}>
            {fotos.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => scrollParaFoto(i)} hitSlop={8}>
                <View style={[styles.dot, i === fotoIdx && styles.dotAtivo]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Contador "1 / 4" no canto superior direito */}
        {fotos.length > 1 && (
          <View style={styles.fotoContador}>
            <Ionicons name="images-outline" size={11} color="#fff" />
            <Text style={styles.fotoContadorText}>{fotoIdx + 1} / {fotos.length}</Text>
          </View>
        )}
      </View>

      {/* ── AÇÕES ── */}
      <View style={styles.acoes}>
        {/* Como chegar */}
        <TouchableOpacity style={styles.btnRota} onPress={abrirRota} activeOpacity={0.85}>
          <Ionicons name="navigate" size={16} color="#fff" />
          <Text style={styles.btnRotaText}>Como chegar</Text>
        </TouchableOpacity>

        {/* Avaliar */}
        <TouchableOpacity
          style={styles.btnAvaliar}
          onPress={() => navigation.navigate('Avaliar', { academia, onAvaliacaoAdicionada: carregarAvaliacoes })}
          activeOpacity={0.85}
        >
          <Ionicons name="star" size={16} color="#1A1A1A" />
          <Text style={styles.btnAvaliarText}>Avaliar</Text>
        </TouchableOpacity>

        {/* Favoritar */}
        <TouchableOpacity style={styles.btnIcone} onPress={handleFavorito} activeOpacity={0.8}>
          <Ionicons name={favorito ? 'heart' : 'heart-outline'} size={22} color={favorito ? '#EF4444' : colors.textSecondary} />
        </TouchableOpacity>

        {/* Compartilhar */}
        <TouchableOpacity style={styles.btnIcone} onPress={handleCompartilhar} activeOpacity={0.8}>
          <Ionicons name="share-social-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── SOBRE ── */}
      {descricao.length > 0 && (
        <View style={styles.secao}>
          <View style={styles.secaoTituloRow}>
            <View style={styles.secaoIcone}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
            </View>
            <Text style={styles.secaoTitulo}>Sobre</Text>
          </View>
          <Text style={styles.descricao}>{descricao}</Text>
        </View>
      )}

      {/* ── EQUIPAMENTOS ── */}
      {equipamentos.length > 0 && (
        <View style={styles.secao}>
          <View style={styles.secaoTituloRow}>
            <View style={styles.secaoIcone}>
              <Ionicons name="barbell" size={18} color={colors.primary} />
            </View>
            <Text style={styles.secaoTitulo}>Equipamentos</Text>
          </View>
          <View style={styles.equipamentosGrid}>
            {equipamentos.map((eq, idx) => (
              <View key={idx} style={styles.equipamentoBadge}>
                <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                <Text style={styles.equipamentoText}>{eq}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── HORÁRIOS ── */}
      <View style={styles.secao}>
        <View style={styles.secaoTituloRow}>
          <View style={styles.secaoIcone}>
            <Ionicons name="time" size={18} color={colors.primary} />
          </View>
          <Text style={styles.secaoTitulo}>Horários</Text>
          <View style={[styles.statusPill, statusHorario.aberto ? styles.statusAberto : styles.statusFechado]}>
            <View style={[styles.statusDot, { backgroundColor: statusHorario.aberto ? '#22C55E' : '#EF4444' }]} />
            <Text style={[styles.statusPillText, { color: statusHorario.aberto ? '#15803D' : '#B91C1C' }]}>
              {statusHorario.aberto ? 'Aberto agora' : 'Fechado'}
            </Text>
          </View>
        </View>
        <Text style={styles.statusLabelDetalhe}>{statusHorario.label}</Text>
        {HORARIOS.map((h) => (
          <View key={h.dia} style={styles.horarioRow}>
            <Text style={styles.horarioDia}>{h.dia}</Text>
            <Text style={styles.horarioPeriodo}>{h.periodos.join('  |  ')}</Text>
          </View>
        ))}
      </View>

      {/* ── AVALIAÇÕES ── */}
      <View style={styles.secao}>
        <View style={styles.secaoTituloRow}>
          <View style={styles.secaoIcone}>
            <Ionicons name="star" size={18} color={colors.accent} />
          </View>
          <Text style={styles.secaoTitulo}>
            Avaliações{avaliacoes.length > 0 ? ` (${avaliacoes.length})` : ''}
          </Text>
        </View>

        {loadingAv ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
        ) : avaliacoes.length === 0 ? (
          <View style={styles.semAvaliacaoBox}>
            <Ionicons name="star-outline" size={32} color="#D0D8DF" />
            <Text style={styles.semAvaliacaoText}>Seja o primeiro a avaliar!</Text>
          </View>
        ) : (
          avaliacoes.map((av) => (
            <View key={av.id} style={styles.avaliacaoCard}>
              <View style={styles.avaliacaoHeader}>
                <Estrelas valor={av.get('nota')} tamanho={14} />
                <Text style={styles.avaliacaoData}>
                  {av.createdAt?.toLocaleDateString('pt-BR')}
                </Text>
              </View>
              {av.get('comentario') ? (
                <Text style={styles.avaliacaoComentario}>{av.get('comentario')}</Text>
              ) : null}
              {av.get('autor') ? (
                <Text style={styles.avaliacaoAutor}>— {av.get('autor')}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 40 },

  // ── Hero ──
  hero: {
    width: SCREEN_W,
    height: HERO_H,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  heroImg: { width: SCREEN_W, height: HERO_H },
  heroPlaceholder: {
    width: SCREEN_W,
    height: HERO_H,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 60,
  },
  btnVoltar: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fotoContador: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  fotoContadorText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  heroSelo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  heroSeloText: {
    color: colors.accent,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroNome: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 6,
  },
  heroLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  heroLocalText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    flex: 1,
  },
  heroMedia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMediaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  fotoDots: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotAtivo: {
    backgroundColor: colors.accent,
    width: 18,
    borderRadius: 3,
  },

  // ── Ações ──
  acoes: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnRota: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 13,
    gap: 7,
    ...shadow.card,
  },
  btnRotaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnIcone: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.soft,
  },
  btnAvaliar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 13,
    gap: 7,
    ...shadow.card,
  },
  btnAvaliarText: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Seções ──
  secao: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadow.soft,
  },
  secaoTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  secaoIcone: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  descricao: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  equipamentosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipamentoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  equipamentoText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Horários ──
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginLeft: 'auto',
  },
  statusAberto: { backgroundColor: '#F0FDF4' },
  statusFechado: { backgroundColor: '#FEF2F2' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  statusLabelDetalhe: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  horarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  horarioDia: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  horarioPeriodo: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // ── Avaliações ──
  semAvaliacaoBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  semAvaliacaoText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  avaliacaoCard: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  avaliacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  avaliacaoData: {
    color: colors.textMuted,
    fontSize: 12,
  },
  avaliacaoComentario: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  avaliacaoAutor: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
