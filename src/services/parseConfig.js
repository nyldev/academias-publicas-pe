import Parse from 'parse/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_ID, CLIENT_KEY, SERVER_URL } from './parseKeys.local';

// As chaves ficam em parseKeys.local.js (fora do git — copie de parseKeys.example.js).
// O Back4App exige a Client Key; como o SDK JS não a envia, o header
// X-Parse-Client-Key é injetado pelo patch em polyfills.js, que lê esta global.
global.__PARSE_CLIENT_KEY__ = CLIENT_KEY;

Parse.setAsyncStorage(AsyncStorage);
Parse.initialize(APP_ID);
Parse.serverURL = SERVER_URL;

// Garante que sempre há uma sessão anônima ativa.
// Sem isso, o Back4App rejeita queries quando as CLPs
// exigem usuário autenticado (erro "unauthorized").
export async function initParse() {
  const current = await Parse.User.currentAsync();
  if (!current) {
    try {
      await Parse.AnonymousUtils.logIn();
    } catch (e) {
      // Sessão anônima pode falhar em offline — ignora
      console.warn('Parse anon login falhou:', e.message);
    }
  }
}

export default Parse;
