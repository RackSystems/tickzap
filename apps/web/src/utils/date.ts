export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    second: '2-digit'
  });
}

// Retorna "dd/MM HH:SS" (SS = segundos). Se quiser minutos, troque second por minute.
export function formatChatDate(dateStr?: string | null): string {
  if (!dateStr) {
    return '';
  }

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return '';
  }

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const MM = String(date.getMinutes()).padStart(2, '0');

  return `${dd}/${mm} ${HH}:${MM}`;
}

// Formata como chat: Hoje => HH:mm, Ontem => "Ontem", semana => dia da semana, senão => dd/MM/yyyy
export function formatChatTimestamp(dateStr?: string | null): string {
  if (!dateStr) return '';

  const d = new Date(dateStr);
  const now = new Date();

  // Normalizar para comparar só a data (zerar horas)
  const startOfDay = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

  const dDay = startOfDay(d).getTime();
  const today = startOfDay(now).getTime();

  const diffDays = Math.floor((today - dDay) / (24 * 60 * 60 * 1000));

  // Hoje
  if (diffDays === 0) {
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  // Ontem
  if (diffDays === 1) {
    return 'Ontem';
  }

  // Últimos 7 dias (2 a 6 dias atrás): nome do dia da semana
  if (diffDays < 7) {
    return d.toLocaleDateString('pt-BR', { weekday: 'long' })
      .replace(/^\w/, (c) => c.toUpperCase()); // capitaliza a primeira letra
  }

  // 7+ dias: data completa
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
