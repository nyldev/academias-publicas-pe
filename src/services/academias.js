// Camada de acesso a dados do Back4App.
// Concentra todas as queries do Parse num lugar só, para as telas não
// repetirem a montagem de query/try-catch e para garantir initParse() sempre.
import Parse, { initParse } from './parseConfig';

export async function listarAcademias() {
  await initParse();
  const query = new Parse.Query('Academia');
  query.ascending('nome');
  return query.find();
}

export async function listarAcademiasComLocalizacao() {
  await initParse();
  const query = new Parse.Query('Academia');
  query.exists('localizacao');
  return query.find();
}

export async function buscarAvaliacoes(academia) {
  await initParse();
  const query = new Parse.Query('Avaliacao');
  query.equalTo('academia', academia);
  query.descending('createdAt');
  query.limit(50);
  return query.find();
}

// Salva uma avaliação e recalcula a média da academia. Retorna a nova média.
export async function salvarAvaliacao({ academia, nota, comentario, autor }) {
  await initParse();

  const Avaliacao = Parse.Object.extend('Avaliacao');
  const avaliacao = new Avaliacao();
  avaliacao.set('academia', academia);
  avaliacao.set('nota', nota);
  avaliacao.set('comentario', (comentario || '').trim());
  avaliacao.set('autor', (autor || '').trim() || 'Anônimo');
  await avaliacao.save();

  const todas = await buscarAvaliacoes(academia);
  const media = todas.length
    ? todas.reduce((acc, a) => acc + a.get('nota'), 0) / todas.length
    : nota;
  academia.set('mediaAvaliacao', media);
  await academia.save();

  return media;
}
