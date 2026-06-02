// Importa as 42 unidades da Academia da Cidade da Prefeitura do Recife
// a partir do Portal de Dados Abertos. NÃO apaga as Academia Recife já existentes.
// Execute: node scripts/import-academia-da-cidade.js

const https = require('https');

let APP_ID, MASTER_KEY;
try {
  ({ APP_ID, MASTER_KEY } = require('./secrets.local.js'));
} catch (e) {
  console.error('\n[import] Falta scripts/secrets.local.js.\n');
  process.exit(1);
}

const CSV_URL =
  'https://dados.recife.pe.gov.br/dataset/807bd4a4-aba8-413e-8f6a-abfce82eaba3/resource/07a588bf-c199-474e-8f51-cf18cb46b708/download/academia-da-cidade.csv';

function getText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('redirecionamentos demais'));
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(getText(new URL(res.headers.location, url).toString(), redirects + 1));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const split = (l) => l.split(';').map((x) => x.replace(/"/g, '').trim());
  const header = split(lines[0]);
  return lines.slice(1).map((l) => {
    const cols = split(l);
    const o = {};
    header.forEach((h, i) => (o[h] = cols[i] || ''));
    return o;
  });
}

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'parseapi.back4app.com',
      path, method,
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
        if (res.statusCode < 300) resolve(r ? JSON.parse(r) : {});
        else reject(new Error(`HTTP ${res.statusCode}: ${r.slice(0, 150)}`));
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Limpa o nome: remove "US XXX " do início
function limparNome(nome) {
  return nome.replace(/^US\s+\d+\s+/i, '').trim();
}

// Capitaliza corretamente (CSV está em MAIÚSCULAS)
function capitalizar(s) {
  const minusculas = new Set(['de','da','do','das','dos','e','a','o','em','no','na','nos','nas','ao','aos']);
  return s.toLowerCase().split(' ').map((w, i) =>
    (i === 0 || !minusculas.has(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w
  ).join(' ');
}

async function main() {
  console.log('Baixando Academia da Cidade do Portal de Dados Abertos...');
  const recs = parseCSV(await getText(CSV_URL));
  console.log(`${recs.length} unidades na fonte oficial.\n`);

  if (recs.length < 30 || !recs[0]?.nome_oficial) {
    console.error('Dados inesperados — abortando.');
    process.exit(1);
  }

  // Remove apenas as unidades da Academia da Cidade já importadas (tipo = 'academia-da-cidade')
  const antigas = await api('GET', '/classes/Academia?where={"tipo":"academia-da-cidade"}&limit=200&keys=objectId');
  let apagadas = 0;
  for (const obj of (antigas.results || [])) {
    await api('DELETE', `/classes/Academia/${obj.objectId}`);
    apagadas++;
  }
  if (apagadas) console.log(`${apagadas} unidades antigas removidas.\n`);

  console.log('Importando unidades da Academia da Cidade...');
  let criadas = 0;
  for (const r of recs) {
    const lat = parseFloat(r.latitude);
    const lng = parseFloat(r.longitude);
    const nome = limparNome(r.nome_oficial);
    const bairro = capitalizar(r['bairro'] || '');
    const endereco = capitalizar((r['endereço'] || '').replace(/,\s*$/, ''));

    const obj = {
      tipo: 'academia-da-cidade',
      nome,
      bairro,
      endereco,
      telefone: (r.fone || '').trim(),
      descricao:
        `Academia da Cidade da Prefeitura do Recife no bairro ${bairro}. ` +
        'Oferece prática de atividades físicas, lazer e orientação para hábitos saudáveis, ' +
        'com acesso gratuito e sem necessidade de agendamento prévio.',
      equipamentos: ['Musculação', 'Ginástica', 'Atividades supervisionadas'],
      fotos: [],
    };

    if (!isNaN(lat) && !isNaN(lng)) {
      obj.localizacao = { __type: 'GeoPoint', latitude: lat, longitude: lng };
    }

    try {
      await api('POST', '/classes/Academia', obj);
      criadas++;
      process.stdout.write(`  + ${nome}\n`);
    } catch (e) {
      console.error(`  ! erro em ${nome}: ${e.message}`);
    }
  }

  console.log(`\nConcluído: ${criadas}/${recs.length} unidades importadas.`);
  console.log('Use scripts/update-fotos.js para adicionar fotos depois.');
}

main().catch((e) => { console.error('Falhou:', e.message); process.exit(1); });
