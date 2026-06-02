// Adiciona fotos reais a cada academia no Back4App.
// Fotos coletadas de academiarecife.org.br (site oficial) e fontes de mídia.
// Execute: node scripts/update-fotos.js

const https = require('https');

let APP_ID, MASTER_KEY;
try {
  ({ APP_ID, MASTER_KEY } = require('./secrets.local.js'));
} catch (e) {
  console.error('\n[update-fotos] Falta scripts/secrets.local.js. Crie a partir de secrets.example.js.\n');
  process.exit(1);
}

const W = 'https://static.wixstatic.com/media/';

// Fotos mapeadas por polo (nome exato como vem do Back4App)
// Fonte: academiarecife.org.br (site oficial da Prefeitura do Recife)
const FOTOS = {
  'Academia Recife - Polo Hipódromo': [
    W + '4df1d5_f9ae8b5496924c299db9920a88cc2aab~mv2.jpg',
    W + '4df1d5_d334e53edc3047229c5aa141ec08bb03~mv2.jpg',
    W + '4df1d5_d390eaaa2cce482281c81b4f64a0fe51~mv2.jpg',
    'https://midias.diariodepernambuco.com.br/static/app/noticia_127983242361/2015/03/09/565222/20150309215655742392o.jpg',
  ],
  'Academia Recife - Polo Coque': [
    W + '4df1d5_9076af4eb2a94a3e97898366dff308f4~mv2.jpg',
    W + '4df1d5_7b0437c3a1f94b83a6a0c45db23419f2~mv2.jpg',
    W + '4df1d5_6019ba8017074efeb6f6dd6a8c83d4ba~mv2.jpg',
  ],
  'Academia Recife - Polo Ipsep': [
    W + '4df1d5_9b0fca059e1346e4bf7279cdf429e1d9~mv2.jpeg',
    W + '4df1d5_18b352c460e947e6b8a215582e34d6c8~mv2.jpeg',
    W + '4df1d5_3c1aaa9be1f34166b5b058e4601a2179~mv2.jpeg',
    W + '4df1d5_5f8f8113664e4a72865110cf8b9e66cf~mv2.jpeg',
  ],
  'Academia Recife - Polo Ibura': [
    W + '4df1d5_ef9c1b81ce8b4dd7a6e349e16f208470~mv2.jpg',
    W + '4df1d5_171023eddecc40abb029362ede9a9c85~mv2.jpg',
    W + '4df1d5_adf81df7b1c74de38182a7a218052590~mv2.jpg',
    W + '4df1d5_a91e10cc46ee4665a2cee3536ccc01e1~mv2.jpg',
  ],
  'Academia Recife - Polo Jaqueira': [
    W + '4df1d5_e7e190c7883743cb8ca030dc339bb70c~mv2.jpg',
    W + '4df1d5_8dbe12d290bd4ac58556cbcb793ff89c~mv2.jpeg',
    W + '4df1d5_b16a3bcb992b49d3a14857789cd213a7~mv2.jpeg',
    W + '4df1d5_1a9f3a185827499081e9dbbd6104fb8a~mv2.jpg',
    W + '4df1d5_d32d88dd9c97439f9fc5b21a7f5749d1~mv2.jpg',
  ],
  'Academia Recife - Polo Barro': [
    W + '4df1d5_d66bda8812de410f88c80adb9be22444~mv2.jpg',
    W + '4df1d5_44f5de3f09d2467696a3cc475904f2f0~mv2.jpg',
    W + '4df1d5_8bbfcba675494c938c6fb22072680afd~mv2.jpg',
    W + '4df1d5_61585e1cfebc4131b0e915d7079640fd~mv2.jpg',
  ],
  'Academia Recife - Polo Casa Amarela': [
    W + '4df1d5_19086df028a44d2e94534ea62659e8ab~mv2.jpg',
    W + '4df1d5_e0050d9bce114d299820aa50b015036f~mv2.jpg',
    W + '4df1d5_83b0b7ad146f48e49977f6e37777d5ab~mv2.jpg',
  ],
  'Academia Recife - Polo Guabiraba': [
    W + '4df1d5_19086df028a44d2e94534ea62659e8ab~mv2.jpg',
    W + '4df1d5_e0050d9bce114d299820aa50b015036f~mv2.jpg',
  ],
  'Academia Recife - Polo Macaxeira': [
    W + '4df1d5_a31b7c1d3fad4375a1ca81a16e3793c0~mv2.jpg',
    W + '4df1d5_43b425b15580449ca09e9c37b94a2acd~mv2.jpg',
    W + '4df1d5_dd41afec67f54ab18b294178c5063ac3~mv2.jpg',
    W + '4df1d5_ad762b9ae58648a6958f5a040077995a~mv2.jpg',
  ],
  // Polos sem post específico: usam a foto geral de divulgação das Academias Recife
  '_geral': [
    'https://imgs.search.brave.com/EoR7ybhuwX1kadRmLV2-fWLakX1UZlYtTWcFEcaJcEU/rs:fit:860:0:1:0/g:ce/aHR0cHM6Ly9veGVyZWNpZmUuY29tLmJyL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDIyLzA4L2Fnb3N0bzIwMjJhY2FkZW1pYXJlY2lmZWFicmUuanBlZw',
    'https://imgs.search.brave.com/_GCDt5j3wsxFoi_jXbNnz90Yr2YYtbr2ZvtDRMOoToA/rs:fit:860:0:1:0/g:ce/aHR0cHM6Ly9veGVyZWNpZmUuY29tLmJyL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDIyLzA4L2Fnb3N0bzIwMjJhY2FkZW1pYXJlY2lmZS5qcGVn',
    'https://midias.diariodepernambuco.com.br/static/app/noticia_127983242361/2015/03/09/565222/20150309215655742392o.jpg',
  ],
};

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'parseapi.back4app.com',
      path,
      method,
      headers: {
        'X-Parse-Application-Id': APP_ID,
        'X-Parse-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json',
      },
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(opts, (res) => {
      let r = '';
      res.on('data', (c) => (r += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(r ? JSON.parse(r) : {});
        else reject(new Error(`HTTP ${res.statusCode}: ${r.slice(0, 200)}`));
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Buscando academias no banco...');
  const res = await api('GET', '/classes/Academia?keys=objectId,nome&limit=100');
  const academias = res.results || [];
  console.log(`${academias.length} academias encontradas.\n`);

  let ok = 0, generica = 0;
  for (const a of academias) {
    const fotos = FOTOS[a.nome] || FOTOS['_geral'];
    const tipo = FOTOS[a.nome] ? 'específica' : 'geral';
    try {
      await api('PUT', `/classes/Academia/${a.objectId}`, { fotos });
      console.log(`  ✓ ${a.nome} (${tipo}: ${fotos.length} foto${fotos.length > 1 ? 's' : ''})`);
      ok++;
      if (tipo === 'geral') generica++;
    } catch (e) {
      console.error(`  ✗ ${a.nome}: ${e.message}`);
    }
  }

  console.log(`\nConcluído: ${ok}/${academias.length} atualizadas.`);
  if (generica > 0) {
    console.log(`${generica} polo(s) receberam fotos genéricas (sem post específico no site).`);
    console.log('Você pode adicionar fotos específicas depois pelo Back4App > Database > Academia > coluna "fotos".');
  }
}

main().catch((e) => { console.error('Falhou:', e.message); process.exit(1); });
