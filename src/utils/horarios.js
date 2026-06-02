// Horários oficiais das Academias Recife (Prefeitura do Recife)
// Seg–Sex: 5h30–9h30 e 17h00–21h00
// Sábado:  6h00–10h00
// Domingo: fechado

export const HORARIOS = [
  { dia: 'Seg – Sex', periodos: ['05:30 – 09:30', '17:00 – 21:00'] },
  { dia: 'Sábado',    periodos: ['06:00 – 10:00'] },
  { dia: 'Domingo',   periodos: ['Fechado'] },
];

/**
 * Retorna { aberto: boolean, label: string }
 * Ex.: { aberto: true, label: 'Aberto · fecha às 09:30' }
 */
export function getStatusAgora() {
  const agora = new Date();
  const diaSemana = agora.getDay(); // 0=dom, 1=seg … 6=sab
  const h = agora.getHours();
  const m = agora.getMinutes();
  const minutos = h * 60 + m;

  function intervalo(inicio, fim) {
    const [hi, mi] = inicio.split(':').map(Number);
    const [hf, mf] = fim.split(':').map(Number);
    return { ini: hi * 60 + mi, fim: hf * 60 + mf };
  }

  if (diaSemana === 0) {
    return { aberto: false, label: 'Fechado aos domingos' };
  }

  if (diaSemana === 6) {
    const { ini, fim } = intervalo('06:00', '10:00');
    if (minutos >= ini && minutos < fim)
      return { aberto: true, label: `Aberto · fecha às 10:00` };
    if (minutos < ini)
      return { aberto: false, label: `Abre hoje às 06:00` };
    return { aberto: false, label: 'Fechado hoje' };
  }

  // Seg–Sex
  const manha = intervalo('05:30', '09:30');
  const tarde = intervalo('17:00', '21:00');

  if (minutos >= manha.ini && minutos < manha.fim)
    return { aberto: true, label: `Aberto · fecha às 09:30` };
  if (minutos >= tarde.ini && minutos < tarde.fim)
    return { aberto: true, label: `Aberto · fecha às 21:00` };
  if (minutos < manha.ini)
    return { aberto: false, label: `Abre hoje às 05:30` };
  if (minutos >= manha.fim && minutos < tarde.ini)
    return { aberto: false, label: `Reabre às 17:00` };
  return { aberto: false, label: 'Fechado hoje' };
}
