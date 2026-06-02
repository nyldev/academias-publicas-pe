// Polyfill de crypto.getRandomValues para o Parse SDK funcionar no Expo Go.
// Importado antes de tudo no index.js para garantir que esteja disponivel
// quando o Parse for carregado.
if (typeof global.crypto !== 'object') {
  global.crypto = {};
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = (array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// O Back4App exige uma chave de cliente válida, mas o SDK JS do Parse só envia
// App ID / JavaScript Key / Master Key — nunca a Client Key. A única chave de
// cliente válida que temos é a Client Key, então injetamos o header
// X-Parse-Client-Key em toda requisição ao Back4App. Precisa rodar antes de o
// Parse capturar a referência de XMLHttpRequest (por isso fica aqui, no topo).
if (typeof global.XMLHttpRequest !== 'undefined') {
  const originalOpen = global.XMLHttpRequest.prototype.open;
  global.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    const result = originalOpen.call(this, method, url, ...rest);
    if (typeof url === 'string' && url.includes('back4app.com') && global.__PARSE_CLIENT_KEY__) {
      try {
        this.setRequestHeader('X-Parse-Client-Key', global.__PARSE_CLIENT_KEY__);
      } catch (e) {
        // ignora se setRequestHeader for chamado fora de hora
      }
    }
    return result;
  };
}
