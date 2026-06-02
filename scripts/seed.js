// Script para popular o Back4App com dados iniciais
// Execute: node scripts/seed.js

const https = require('https');

// A Master Key dá acesso TOTAL de admin ao Back4App, então não fica no código.
// Ela mora em scripts/secrets.local.js (ignorado pelo git).
// Para usar: copie scripts/secrets.example.js -> scripts/secrets.local.js e preencha.
let APP_ID, MASTER_KEY;
try {
  ({ APP_ID, MASTER_KEY } = require('./secrets.local.js'));
} catch (e) {
  console.error('\n[seed] Falta scripts/secrets.local.js com APP_ID e MASTER_KEY.');
  console.error('[seed] Crie a partir de scripts/secrets.example.js (nunca comite a Master Key).\n');
  process.exit(1);
}

const academias = [
  {
    nome: 'Academia do Parque 13 de Maio',
    bairro: 'Santo Amaro',
    endereco: 'Parque 13 de Maio, Centro',
    descricao: 'Academia ao ar livre localizada no tradicional Parque 13 de Maio, no coração do Recife. Equipamentos modernos e área arborizada.',
    equipamentos: ['Barra fixa', 'Paralelas', 'Leg press', 'Cadeira romana', 'Elíptico'],
    localizacao: { __type: 'GeoPoint', latitude: -8.0584, longitude: -34.8867 },
    mediaAvaliacao: 4.5,
  },
  {
    nome: 'Academia da Orla de Boa Viagem',
    bairro: 'Boa Viagem',
    endereco: 'Av. Boa Viagem, próx. ao posto 7',
    descricao: 'Equipamentos ao ar livre na orla de Boa Viagem, com vista para o mar. Ideal para treinar com brisa marítima.',
    equipamentos: ['Barra fixa', 'Supino', 'Remada', 'Abdominal', 'Alongamento'],
    localizacao: { __type: 'GeoPoint', latitude: -8.1180, longitude: -34.8950 },
    mediaAvaliacao: 4.2,
  },
  {
    nome: 'Academia do Parque da Jaqueira',
    bairro: 'Jaqueira',
    endereco: 'Av. Dezessete de Agosto, 1386',
    descricao: 'Área de exercícios dentro do Parque da Jaqueira, um dos mais bonitos do Recife, com muito verde e ar puro.',
    equipamentos: ['Barra fixa', 'Paralelas', 'Elíptico', 'Bicicleta ergométrica', 'Alongamento'],
    localizacao: { __type: 'GeoPoint', latitude: -8.0362, longitude: -34.9045 },
    mediaAvaliacao: 4.8,
  },
  {
    nome: 'Academia Pública de Casa Forte',
    bairro: 'Casa Forte',
    endereco: 'Praça de Casa Forte',
    descricao: 'Academia ao ar livre na praça central de Casa Forte, bairro nobre do Recife.',
    equipamentos: ['Barra fixa', 'Abdominal', 'Leg press', 'Supino'],
    localizacao: { __type: 'GeoPoint', latitude: -8.0295, longitude: -34.9100 },
    mediaAvaliacao: 3.9,
  },
  {
    nome: 'Academia do Parque de Santana',
    bairro: 'Santana',
    endereco: 'Parque de Santana, Caruaru',
    descricao: 'Espaço de atividade física no Parque de Santana com equipamentos diversificados.',
    equipamentos: ['Barra fixa', 'Paralelas', 'Cadeira romana', 'Elíptico'],
    localizacao: { __type: 'GeoPoint', latitude: -8.2760, longitude: -35.9756 },
    mediaAvaliacao: 4.0,
  },
  {
    nome: 'Academia da Orla de Piedade',
    bairro: 'Piedade',
    endereco: 'Orla de Piedade, Jaboatão dos Guararapes',
    descricao: 'Academia ao ar livre na bela orla de Piedade, com vista para o mar.',
    equipamentos: ['Barra fixa', 'Remada', 'Supino', 'Leg press', 'Abdominal'],
    localizacao: { __type: 'GeoPoint', latitude: -8.1715, longitude: -34.9020 },
    mediaAvaliacao: 4.3,
  },
];

function postAcademia(data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: 'parseapi.back4app.com',
      path: '/classes/Academia',
      method: 'POST',
      headers: {
        'X-Parse-Application-Id': APP_ID,
        'X-Parse-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function seed() {
  console.log('Iniciando seed do Back4App...\n');

  for (const academia of academias) {
    try {
      const result = await postAcademia(academia);
      console.log(`Criada: ${academia.nome} (objectId: ${result.objectId})`);
    } catch (error) {
      console.error(`Erro ao criar ${academia.nome}:`, error.message);
    }
  }

  console.log('\nSeed concluido!');
}

seed();
