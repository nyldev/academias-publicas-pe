# 🏋️ Academias ao Ar Livre — Equipamentos Públicos

App mobile para encontrar **academias públicas ao ar livre** na região do Recife/PE:
veja os equipamentos disponíveis, a distância até você, a localização no mapa e as
avaliações de outros usuários.

> Projeto da disciplina **Programação Web e Mobile** — Universidade Católica de Pernambuco.

---

## ✨ Funcionalidades

- 🔍 **Lista** de academias com busca por nome ou bairro
- 📍 **Distância** até cada academia (via GPS) e **ordenação** por Nome / Proximidade / Melhor avaliadas
- 🗺️ **Mapa** com marcadores, balões informativos e botão "centralizar em mim"
- ⭐ **Avaliações**: nota de 1 a 5 estrelas, comentário e cálculo automático da média
- 🔄 Puxar para atualizar e tratamento de erros com botão "Tentar novamente"

---

## 🧱 Tecnologias

| Camada | Ferramenta |
|---|---|
| App | React Native 0.78 + Expo SDK 54 |
| Navegação | React Navigation 7 (bottom tabs + stack) |
| Backend | Back4App (Parse Server) via `parse/react-native` |
| Mapa | react-native-maps (Apple Maps no iOS) |
| Localização | expo-location |
| Armazenamento local | AsyncStorage |

---

## 🗂️ Estrutura do projeto

```
academias-ar-livre/
├─ App.js                   # navegação: 2 abas (Academias, Mapa) com pilhas
├─ index.js                 # ponto de entrada (carrega os polyfills primeiro)
├─ polyfills.js             # crypto.getRandomValues + injeção da Client Key no header
├─ metro.config.js          # shim do 'ws' p/ o Parse rodar no Expo Go
├─ app.json                 # configuração do Expo
├─ shims/ws.js
├─ scripts/
│  ├─ seed.js               # popula o Back4App com academias
│  └─ secrets.example.js    # modelo de credenciais (copiar p/ secrets.local.js)
└─ src/
   ├─ services/
   │  ├─ parseConfig.js      # inicializa o Parse
   │  └─ academias.js        # camada de acesso a dados (todas as queries)
   ├─ hooks/
   │  └─ useUserLocation.js   # permissão + localização do usuário
   ├─ utils/
   │  └─ geo.js               # cálculo de distância (Haversine)
   └─ screens/
      ├─ HomeScreen.js        # lista + busca + distância + ordenação
      ├─ DetailsScreen.js     # detalhes + avaliações
      ├─ MapScreen.js         # mapa
      └─ AddReviewScreen.js   # formulário de avaliação
```

---

## 🚀 Como rodar

### Pré-requisitos
- **Node.js 18** ou superior
- App **Expo Go** (SDK 54) no celular — iOS ou Android
- Celular e computador na **mesma rede Wi-Fi**

### Passos

```bash
# 1. Instalar as dependências
npm install --legacy-peer-deps

# 2. Configurar as chaves do Back4App (copie o modelo e preencha)
#    Back4App -> App Settings -> Security & Keys
cp src/services/parseKeys.example.js src/services/parseKeys.local.js

# 3. Iniciar o servidor de desenvolvimento
npx expo start
```

> 💡 No Windows, para garantir o CLI do SDK 54 (e não o global):
> `.\node_modules\.bin\expo.cmd start`

Depois é só escanear o **QR Code** que aparece no terminal:
- **iOS** → abra o app **Câmera**, aponte para o QR e toque na notificação
- **Android** → abra o **Expo Go** e use "Scan QR code"

> Em redes que bloqueiam a comunicação entre aparelhos (Wi-Fi de faculdade, por
> exemplo), use o **modo túnel**, que funciona em qualquer rede:
> `npx expo start --tunnel`

---

## 🌱 Popular o banco de dados (seed)

O backend já contém dados de exemplo. Para recriá-los do zero:

```bash
# 1. Crie o arquivo de credenciais a partir do modelo
cp scripts/secrets.example.js scripts/secrets.local.js

# 2. Preencha APP_ID e MASTER_KEY
#    (Back4App → App Settings → Security & Keys)

# 3. Importe as academias oficiais da Prefeitura
#    (dados reais do Portal de Dados Abertos do Recife)
node scripts/import-academias.js
```

> 🔒 O `secrets.local.js` está no `.gitignore`. A **Master Key** (acesso total ao
> backend) **nunca** vai para o repositório.

---

## 🗄️ Modelo de dados (Back4App)

**Academia**
| Campo | Tipo |
|---|---|
| nome | String |
| bairro | String |
| endereco | String |
| descricao | String |
| equipamentos | Array |
| localizacao | GeoPoint |
| mediaAvaliacao | Number |

**Avaliacao**
| Campo | Tipo |
|---|---|
| academia | Pointer → Academia |
| nota | Number (1–5) |
| comentario | String |
| autor | String |

---

## 🛠️ Decisões técnicas

- **Autenticação pela Client Key via header.** O SDK JavaScript do Parse só envia
  App ID, JavaScript Key ou Master Key — nunca a Client Key. Como o Back4App exige
  uma chave de cliente válida e a disponível é a Client Key, ela é injetada no
  header `X-Parse-Client-Key` por um patch em `polyfills.js`.
- **Polyfills para o Expo Go.** `crypto.getRandomValues` (em JS puro) e um shim de
  `ws` no Metro, necessários para o Parse SDK rodar sem módulos nativos extras.
- **Camada de serviço** (`src/services/academias.js`) concentra todas as queries do
  Parse, separando o acesso a dados da interface.

---

## 📄 Licença

Veja o arquivo [LICENSE](LICENSE).
