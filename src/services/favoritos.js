// Gerencia academias favoritas no armazenamento local do dispositivo.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@recife_plus:favoritos';

export async function getFavoritos() {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorito(id) {
  const atual = await getFavoritos();
  const novos = atual.includes(id)
    ? atual.filter((x) => x !== id)
    : [...atual, id];
  await AsyncStorage.setItem(KEY, JSON.stringify(novos));
  return novos;
}

export async function isFavorito(id) {
  const atual = await getFavoritos();
  return atual.includes(id);
}
