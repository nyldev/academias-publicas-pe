import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { salvarAvaliacao } from '../services/academias';

export default function AddReviewScreen({ route, navigation }) {
  const { academia, onAvaliacaoAdicionada } = route.params;
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [autor, setAutor] = useState('');
  const [loading, setLoading] = useState(false);

  async function enviarAvaliacao() {
    if (nota === 0) {
      Alert.alert('Avaliação necessária', 'Selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    setLoading(true);
    try {
      await salvarAvaliacao({ academia, nota, comentario, autor });

      Alert.alert('Obrigado!', 'Sua avaliação foi registrada com sucesso.', [
        {
          text: 'OK',
          onPress: () => {
            onAvaliacaoAdicionada?.();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível salvar sua avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.academiaInfo}>
          <Ionicons name="fitness" size={24} color="#2E7D32" />
          <Text style={styles.academiaNome}>{academia.get('nome')}</Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.label}>Sua nota *</Text>
          <View style={styles.estrelasRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setNota(i)} style={styles.estrelaBotao}>
                <Ionicons
                  name={i <= nota ? 'star' : 'star-outline'}
                  size={40}
                  color="#FFC107"
                />
              </TouchableOpacity>
            ))}
          </View>
          {nota > 0 && (
            <Text style={styles.notaLabel}>
              {['', 'Péssima', 'Ruim', 'Regular', 'Boa', 'Excelente'][nota]}
            </Text>
          )}
        </View>

        <View style={styles.secao}>
          <Text style={styles.label}>Seu nome (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Maria Silva"
            placeholderTextColor="#bbb"
            value={autor}
            onChangeText={setAutor}
            maxLength={50}
          />
        </View>

        <View style={styles.secao}>
          <Text style={styles.label}>Comentário (opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultilinha]}
            placeholder="Descreva sua experiência nesta academia..."
            placeholderTextColor="#bbb"
            value={comentario}
            onChangeText={setComentario}
            multiline
            numberOfLines={4}
            maxLength={300}
            textAlignVertical="top"
          />
          <Text style={styles.contador}>{comentario.length}/300</Text>
        </View>

        <TouchableOpacity
          style={[styles.btnSalvar, loading && styles.btnDesabilitado]}
          onPress={enviarAvaliacao}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.btnSalvarText}>Enviar avaliação</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 40 },
  academiaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  academiaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
  },
  secao: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  estrelasRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  estrelaBotao: { padding: 4 },
  notaLabel: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFA000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  inputMultilinha: {
    height: 100,
    paddingTop: 10,
  },
  contador: {
    textAlign: 'right',
    color: '#bbb',
    fontSize: 12,
    marginTop: 4,
  },
  btnSalvar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    elevation: 3,
  },
  btnDesabilitado: { backgroundColor: '#A5D6A7' },
  btnSalvarText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
