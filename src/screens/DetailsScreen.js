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
import { buscarAvaliacoes } from '../services/academias';

const SCREEN_W = Dimensions.get('window').width;

function Estrelas({ valor, tamanho = 20 }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= valor ? 'star' : 'star-outline'}
          size={tamanho}
          color="#FFC107"
        />
      ))}
    </View>
  );
}

export default function DetailsScreen({ route, navigation }) {
  const { academia } = route.params;
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const nome = academia.get('nome');
  const bairro = academia.get('bairro');
  const endereco = academia.get('endereco') || '';
  const descricao = academia.get('descricao') || '';
  const equipamentos = academia.get('equipamentos') || [];
  const mediaAvaliacao = academia.get('mediaAvaliacao') || 0;
  const fotos = academia.get('fotos') || [];

  useEffect(() => {
    navigation.setOptions({ title: nome });
    carregarAvaliacoes();
  }, []);

  async function carregarAvaliacoes() {
    try {
      const resultado = await buscarAvaliacoes(academia);
      setAvaliacoes(resultado);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Galeria de fotos do local */}
      {fotos.length > 0 && (
        <View style={styles.galeria}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {fotos.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={styles.foto} resizeMode="cover" />
            ))}
          </ScrollView>
          {fotos.length > 1 && (
            <View style={styles.galeriaSelo}>
              <Ionicons name="images" size={12} color="#fff" />
              <Text style={styles.galeriaSeloText}>{fotos.length} fotos</Text>
            </View>
          )}
        </View>
      )}

      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="fitness" size={40} color="#0064B0" />
        </View>
        <Text style={styles.nome}>{nome}</Text>
        <View style={styles.localRow}>
          <Ionicons name="location" size={16} color="#0064B0" />
          <Text style={styles.localText}>
            {bairro}{endereco ? ` — ${endereco}` : ''}
          </Text>
        </View>
        {mediaAvaliacao > 0 && (
          <View style={styles.mediaRow}>
            <Estrelas valor={Math.round(mediaAvaliacao)} tamanho={18} />
            <Text style={styles.mediaText}>{mediaAvaliacao.toFixed(1)} / 5</Text>
          </View>
        )}
      </View>

      {/* Descrição */}
      {descricao.length > 0 && (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Sobre</Text>
          <Text style={styles.descricao}>{descricao}</Text>
        </View>
      )}

      {/* Equipamentos */}
      {equipamentos.length > 0 && (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Equipamentos disponíveis</Text>
          <View style={styles.equipamentosGrid}>
            {equipamentos.map((eq, idx) => (
              <View key={idx} style={styles.equipamentoBadge}>
                <Ionicons name="barbell-outline" size={14} color="#0064B0" />
                <Text style={styles.equipamentoText}>{eq}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Botão avaliar */}
      <TouchableOpacity
        style={styles.btnAvaliar}
        onPress={() => navigation.navigate('Avaliar', { academia, onAvaliacaoAdicionada: carregarAvaliacoes })}
        activeOpacity={0.85}
      >
        <Ionicons name="star-outline" size={18} color="#fff" />
        <Text style={styles.btnAvaliarText}>Avaliar esta academia</Text>
      </TouchableOpacity>

      {/* Avaliações */}
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>
          Avaliações {avaliacoes.length > 0 ? `(${avaliacoes.length})` : ''}
        </Text>
        {loading ? (
          <ActivityIndicator color="#0064B0" style={{ marginTop: 12 }} />
        ) : avaliacoes.length === 0 ? (
          <Text style={styles.semAvaliacao}>Seja o primeiro a avaliar!</Text>
        ) : (
          avaliacoes.map((av) => (
            <View key={av.id} style={styles.avaliacaoCard}>
              <View style={styles.avaliacaoHeader}>
                <Estrelas valor={av.get('nota')} tamanho={15} />
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
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: 32 },
  galeria: { position: 'relative', marginBottom: 12 },
  foto: { width: SCREEN_W, height: 230, backgroundColor: '#E4F0FA' },
  galeriaSelo: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  galeriaSeloText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 12,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#E4F0FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1B1B',
    textAlign: 'center',
    marginBottom: 6,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  localText: { color: '#555', fontSize: 14 },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  mediaText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  secao: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },
  descricao: { color: '#555', fontSize: 14, lineHeight: 22 },
  equipamentosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipamentoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4F0FA',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  equipamentoText: { color: '#0064B0', fontSize: 13, fontWeight: '500' },
  btnAvaliar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0064B0',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    elevation: 3,
  },
  btnAvaliarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  semAvaliacao: { color: '#aaa', fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  avaliacaoCard: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    marginTop: 10,
  },
  avaliacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  avaliacaoData: { color: '#aaa', fontSize: 12 },
  avaliacaoComentario: { color: '#444', fontSize: 14, lineHeight: 20, marginTop: 4 },
  avaliacaoAutor: { color: '#888', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
});
