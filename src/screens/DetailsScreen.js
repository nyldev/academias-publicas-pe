import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { buscarAvaliacoes } from '../services/academias';
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
    navigation.setOptions({ title: '' }); // usa o hero como título visual
    carregarAvaliacoes();
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

  const heroUri = fotos[fotoIdx] || null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO ── */}
      <View style={styles.hero}>
        {heroUri ? (
          <Image source={{ uri: heroUri }} style={styles.heroImg} resizeMode="cover" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="fitness" size={64} color={colors.accent} />
          </View>
        )}

        {/* Gradiente escuro na base — sobreposição do nome */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.72)']}
          style={styles.heroGradient}
        >
          {/* Selo "Academia Recife" */}
          <View style={styles.heroSelo}>
            <Ionicons name="shield-checkmark" size={11} color={colors.accent} />
            <Text style={styles.heroSeloText}>Academia Recife · Prefeitura do Recife</Text>
          </View>

          {/* Nome do polo */}
          <Text style={styles.heroNome}>{nomeExibido}</Text>

          {/* Localização */}
          <View style={styles.heroLocal}>
            <Ionicons name="location" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroLocalText} numberOfLines={1}>
              {bairro}{endereco ? ` · ${endereco}` : ''}
            </Text>
          </View>

          {/* Média de avaliação */}
          {mediaAvaliacao > 0 && (
            <View style={styles.heroMedia}>
              <Estrelas valor={Math.round(mediaAvaliacao)} tamanho={13} cor={colors.accent} />
              <Text style={styles.heroMediaText}>{mediaAvaliacao.toFixed(1)}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Seletor de fotos (bolinhas) */}
        {fotos.length > 1 && (
          <View style={styles.fotoDots}>
            {fotos.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setFotoIdx(i)}>
                <View style={[styles.dot, i === fotoIdx && styles.dotAtivo]} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── BOTÃO AVALIAR (em destaque logo abaixo do hero) ── */}
      <View style={styles.acoes}>
        <TouchableOpacity
          style={styles.btnAvaliar}
          onPress={() =>
            navigation.navigate('Avaliar', {
              academia,
              onAvaliacaoAdicionada: carregarAvaliacoes,
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="star" size={16} color="#1A1A1A" />
          <Text style={styles.btnAvaliarText}>Avaliar academia</Text>
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
  hero: { width: SCREEN_W, height: HERO_H, backgroundColor: colors.primarySoft },
  heroImg: { width: SCREEN_W, height: HERO_H, position: 'absolute' },
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
