export const STORAGE_KEY = 'goodsay.v1';
export const TOPICS = ['전체', '마음돌봄', '관계', '쉼', '새로운 시작'];
export function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function koreaDay(date = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year:'numeric',month:'2-digit',day:'2-digit' }).format(date); }
export function dailyLetter(letters, date = new Date()) { const day = koreaDay(date); const ordinal = Math.floor(Date.parse(day+'T00:00:00Z') / 86400000); return letters[((ordinal % letters.length) + letters.length) % letters.length]; }
export function sanitizeState(raw, validIds) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return { saved: [...new Set(Array.isArray(source.saved) ? source.saved.filter(id => validIds.includes(id)) : [])], reflection: source.reflection && typeof source.reflection === 'object' && ['quiet','warm','curious','steady'].includes(source.reflection.type) ? {type: source.reflection.type} : null };
}
export function readState(storage, validIds) { try { return sanitizeState(JSON.parse(storage.getItem(STORAGE_KEY)), validIds); } catch { return sanitizeState(null, validIds); } }
export function writeState(storage, state) { try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; } }
export function reflectionType(answers) {
  if (!Array.isArray(answers) || answers.length !== 4 || answers.some(v => !Number.isInteger(v) || v < 0 || v > 3)) throw new Error('네 가지 질문에 모두 답해주세요.');
  const counts = [0,0,0,0]; answers.forEach(v => counts[v]++);
  const winner = counts.indexOf(Math.max(...counts));
  return ['quiet','warm','curious','steady'][winner];
}
export function toggleSaved(saved, id) { return saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]; }
export function publicShareUrl(base, letterId = null) {
  const url = new URL(base); url.search = ''; url.hash = letterId && /^letter-\d+$/.test(letterId) ? `read/${letterId}` : 'home'; return url.href;
}
