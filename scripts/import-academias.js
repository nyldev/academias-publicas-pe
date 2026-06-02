// Importa as Academias Recife (academias ao ar livre da Prefeitura) direto do
// Portal de Dados Abertos da Cidade do Recife e popula a classe Academia no Back4App.
// Substitui os dados existentes pelos oficiais.
//
// Fonte: https://dados.recife.pe.gov.br  (dataset "Academia Recife")
// Execute: node scripts/import-academias.js
const https = require('https');

let APP_ID, MASTER_KEY;
try {
  ({ APP_ID, MASTER_KEY } = require('./secrets.local.js'));
} catch (e) {
  console.error('\n[import] Falta scripts/secrets.local.js com APP_ID e MASTER_KEY.');
  console.error('[import] Crie a partir de scripts/secrets.example.js.\n');
  process.exit(1);
}

const CSV_URL =
  'https://dados.recife.pe.gov.br/dataset/0119c2c6-60c0-4b41-86ff-2fd419dc9c91/resource/db9cfac3-a78b-43d5-9f5e-0fb26220364e/download/academias-recife.csv';

function getText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('redirecionamentos demais'));
    https
      .get(url, (res) => {
        // Segue redirecionamentos (o portal redireciona o download do CSV)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(getText(new URL(res.headers.location, url).toString(), redirects + 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} ao baixar o CSV`));
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const split = (l) => l.split(';').map((x) => x.replace(/"/g, '').trim());
  const header = split(lines[0]);
  return lines.slice(1).map((l) => {
    const cols = split(l);
    const o = {};
    header.forEach((h, i) => (o[h] = cols[i]));
    return o;
  });
}

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'parseapi.back4app.com',
      path,
      method,
      headers: {
        'X-Parse-Application-Id': APP_ID,
        'X-Parse-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json',
      },
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(options, (res) => {
      let r = '';
      res.on('data', (c) => (r += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(r ? JSON.parse(r) : {});
        else reject(new Error(`HTTP ${res.statusCode}: ${r}`));
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function formatarData(s) {
  const m = (s || '').match(/(\d{4})\/(\d{2})\/(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

async function main() {
  console.log('Baixando do Portal de Dados Abertos do Recife...');
  const recs = parseCSV(await getText(CSV_URL));
  console.log(`${recs.length} academias na fonte oficial.\n`);

  // Trava de segurança: não mexe no banco se a fonte vier com poucos dados/inesperada
  if (recs.length < 15 || !recs[0] || !recs[0].polo) {
    console.error('Dados inesperados da fonte (poucos registros ou sem coluna "polo"). Abortando para não apagar o banco.');
    process.exit(1);
  }

  // 1) Remove as academias existentes (limpa as fictícias)
  console.log('Removendo academias antigas...');
  let apagadas = 0;
  const antigas = await api('GET', '/classes/Academia?keys=objectId&limit=1000');
  for (const obj of antigas.results || []) {
    await api('DELETE', `/classes/Academia/${obj.objectId}`);
    apagadas++;
  }
  console.log(`${apagadas} removidas.\n`);

  // 2) Insere as reais
  console.log('Importando academias oficiais...');
  let criadas = 0;
  for (const r of recs) {
    const lat = parseFloat(String(r.latitude).trim());
    const lng = parseFloat(String(r.longitude).trim());
    const dataInaug = formatarData(r.datainauguracao);
    const endereco = [r.logradouro, r.observacao].filter(Boolean).join(' — ');
    const descricao =
      `Academia Recife ao ar livre da Prefeitura, no bairro ${r.bairro}. ` +
      'Espaço público e gratuito, com equipamentos de musculação em aço inox ' +
      'resistentes a sol e chuva, e acompanhamento de profissionais.' +
      (dataInaug ? ` Inaugurada em ${dataInaug}.` : '');

    const academia = {
      nome: r.polo,
      bairro: r.bairro,
      endereco,
      descricao,
      equipamentos: ['Musculação (19 estações em aço inox)'],
    };
    if (!isNaN(lat) && !isNaN(lng)) {
      academia.localizacao = { __type: 'GeoPoint', latitude: lat, longitude: lng };
    }

    try {
      await api('POST', '/classes/Academia', academia);
      criadas++;
      console.log(`  + ${r.polo}`);
    } catch (e) {
      console.error(`  ! erro em ${r.polo}: ${e.message}`);
    }
  }
  console.log(`\nConcluído: ${criadas}/${recs.length} academias importadas.`);
}

main().catch((e) => {
  console.error('Falhou:', e.message);
  process.exit(1);
});
