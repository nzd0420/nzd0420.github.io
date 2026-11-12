// The questionnaire: instructions -> one rating per question -> submit.
// Questions come from data/survey.json (written by make_survey.py); answers go to the endpoint in config.json.
import { Viewer } from './viewer.js';

const DATA = 'data/';
const $ = sel => document.querySelector(sel);

const TEXT = {
  zh: {
    langButton: 'English',
    help: '说明',
    welcomeTitle: '问卷说明',
    intro: (n, min) => `这份问卷共 ${n} 题，大约需要 ${min} 分钟。每一题给你看一个缺了一块的乐高模型，以及把这一块补上之后的结果，请你判断补上的零件合不合理。`,
    instructions: [
      ['看模型。', '左边是缺了一块的模型，右边是补全后的结果：新加的零件用橙色描边，其余零件变淡。拖动旋转，滚轮缩放，右键拖动平移，两个视图会一起转动。'],
      ['判断新加的零件。', '看它们的种类、位置和朝向像不像这个模型本来该有的样子，有没有悬空、穿进别的零件或者放错地方。'],
      ['打分。', '每题打 1 到 5 分。没有标准答案，按你自己的判断即可，可以随时回去修改。补全的来源不会显示。'],
    ],
    privacy: '不收集姓名和联系方式。只有在最后点击“提交”时，才会发送你的打分和每题的查看时间；在此之前进度只保存在这个浏览器里。参与是自愿的，可以随时退出。',
    consent: '我已阅读说明，同意参与。',
    start: '开始',
    resume: (k, n) => `继续（已答 ${k} / ${n}）`,
    counter: (i, n) => `第 ${i} / ${n} 题`,
    answered: k => `已答 ${k} 题`,
    captionLabel: '这个模型的描述（英文原文）：',
    optHighlight: '高亮新零件',
    optEdges: '棱线',
    fitAll: '看全貌',
    fitAdded: '看新零件',
    paneInput: '输入',
    paneInputSub: '缺了一块的模型',
    paneOutput: '补全后',
    paneOutputSub: k => `新加了 ${k} 个零件`,
    hint: '拖动旋转 · 滚轮或双指缩放 · 右键拖动平移 · 按 1–5 打分，← → 换题',
    loading: '正在加载模型…',
    loadError: '模型加载失败，请刷新页面重试。',
    prev: '上一题',
    next: '下一题',
    toFinish: '完成',
    saved: '进度已保存在本浏览器',
    finishTitle: '准备提交',
    finishMissing: k => `还有 ${k} 题没有打分`,
    finishNote: '点击“提交”发送你的匿名回答。',
    finishMissingNote: '点下面的圆点可以回到没打分的题。',
    submit: '提交',
    submitting: '正在提交…',
    review: '返回检查',
    download: '下载结果文件',
    errSubmit: '提交没有成功，你的回答还保存在这个浏览器里。请检查网络后再点一次“提交”；如果一直不行，可以下载结果文件发给我们。',
    errNoEndpoint: '收集服务暂时没有开启。你的回答还保存在这个浏览器里，可以稍后再提交，或者下载结果文件发给我们。',
    doneTitle: '已提交，谢谢！',
    doneNote: '现在可以关闭这个页面了。',
    receipt: id => `回执编号 ${id}`,
    fatal: '问卷加载失败，请刷新页面重试。',
  },
  en: {
    langButton: '中文',
    help: 'Instructions',
    welcomeTitle: 'Study instructions',
    intro: (n, min) => `This study has ${n} questions and takes about ${min} minutes. Each question shows a LEGO model with a piece missing, and the same model after the missing piece has been filled in. You rate how plausible the added parts are.`,
    instructions: [
      ['Inspect the models.', 'The left view is the incomplete model; the right view is the completed one, with the added parts outlined in orange and the rest faded. Drag to rotate, scroll to zoom, right-drag to pan. The two views move together.'],
      ['Judge the added parts.', 'Consider whether their type, position and orientation look like what this model should have, and whether anything floats, intersects other parts or sits in the wrong place.'],
      ['Rate.', 'Give each question a score from 1 to 5. There is no right answer; use your own judgement. You can go back and change a rating at any time. The source of each completion is not shown.'],
    ],
    privacy: 'No name or contact information is requested. Your ratings and the viewing time per question are sent only when you click Submit at the end; until then progress is kept in this browser only. Participation is voluntary and you may leave at any time.',
    consent: 'I have read the instructions and agree to take part.',
    start: 'Begin',
    resume: (k, n) => `Continue (${k} of ${n} answered)`,
    counter: (i, n) => `Question ${i} of ${n}`,
    answered: k => `${k} answered`,
    captionLabel: 'Description of this model:',
    optHighlight: 'Highlight added parts',
    optEdges: 'Edges',
    fitAll: 'Whole model',
    fitAdded: 'Added parts',
    paneInput: 'Input',
    paneInputSub: 'the model with a piece missing',
    paneOutput: 'Completed',
    paneOutputSub: k => `${k} part${k === 1 ? '' : 's'} added`,
    hint: 'Drag to rotate · scroll or pinch to zoom · right-drag to pan · keys 1–5 rate, ← → move',
    loading: 'Loading the model…',
    loadError: 'The model failed to load. Please reload the page.',
    prev: 'Back',
    next: 'Next',
    toFinish: 'Finish',
    saved: 'Progress saved in this browser',
    finishTitle: 'Ready to submit',
    finishMissing: k => `${k} question${k === 1 ? ' has' : 's have'} no rating yet`,
    finishNote: 'Click Submit to send your anonymous answers.',
    finishMissingNote: 'Use the numbered dots below to go back to them.',
    submit: 'Submit',
    submitting: 'Submitting…',
    review: 'Review answers',
    download: 'Download my answers',
    errSubmit: 'The submission was not confirmed. Your answers are still saved in this browser. Check your connection and click Submit again; if it keeps failing, download your answers and send the file to us.',
    errNoEndpoint: 'The collection service is not available right now. Your answers are still saved in this browser; submit later, or download them and send the file to us.',
    doneTitle: 'Submitted, thank you!',
    doneNote: 'You can close this page now.',
    receipt: id => `Receipt ${id}`,
    fatal: 'The study failed to load. Please reload the page.',
  },
};

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode: keep going without saving */ } },
  del(key) { try { localStorage.removeItem(key); } catch { /* same */ } },
};

let lang = store.get('brickicl_study_lang') || (navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en');
const t = key => TEXT[lang][key];
let survey, session, viewer, question = null, shownAt = 0, view = 'welcome';

// ---------- session ----------
const sessionKey = () => 'brickicl_study_' + survey.version;
function shuffled(ids, seed) {            // the same order every time this participant reloads
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => { h |= 0; h = h + 0x6D2B79F5 | 0; let x = Math.imul(h ^ h >>> 15, 1 | h); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  const out = [...ids];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
function newSession() {
  const participantId = crypto.randomUUID();
  return { schemaVersion: 1, version: survey.version, participantId, startedAt: new Date().toISOString(),
    order: shuffled(survey.questions.map(q => q.id), participantId), current: 0, answers: {}, seconds: {}, viewed: {}, consent: false };
}
function loadSession() {
  try {
    const s = JSON.parse(store.get(sessionKey()));
    const ids = new Set(survey.questions.map(q => q.id));
    if (s?.schemaVersion === 1 && s.version === survey.version && typeof s.participantId === 'string' &&
        Array.isArray(s.order) && s.order.length === ids.size && s.order.every(id => ids.has(id))) return s;
  } catch { /* fall through */ }
  return newSession();
}
const save = () => store.set(sessionKey(), JSON.stringify(session));
const nAnswered = () => session.order.filter(id => session.answers[id]).length;
const N = () => session.order.length;

function trackTime() {                    // add the time the current question has been on screen
  if (view === 'study' && question && shownAt) {
    session.seconds[question.id] = (session.seconds[question.id] || 0) + (performance.now() - shownAt) / 1000;
    save();
  }
  shownAt = view === 'study' && !document.hidden ? performance.now() : 0;
}

// ---------- rendering ----------
function show(name) {
  trackTime();
  view = name;
  for (const id of ['welcome', 'study', 'finish', 'done']) $('#' + id).hidden = id !== name;
  $('#help').hidden = name === 'welcome' || name === 'done';
  shownAt = name === 'study' ? performance.now() : 0;
  scrollTo(0, 0);
}
function instructionItems() {
  return t('instructions').map(([head, body]) => { const li = document.createElement('li'); const b = document.createElement('strong'); b.textContent = head; li.append(b, ' ' + body); return li; });
}
function renderStatic() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = survey.title[lang];
  $('#lang').textContent = t('langButton');
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = el.dataset.t === 'title' ? survey.title[lang] : t(el.dataset.t); });
  $('#intro').textContent = t('intro')(N(), survey.minutes);
  $('#instructions').replaceChildren(...instructionItems());
  $('#helpList').replaceChildren(...instructionItems());
  $('#start').textContent = nAnswered() ? t('resume')(nAnswered(), N()) : t('start');
  $('#rating').style.setProperty('--n', survey.labels[lang].length);
  $('#rating').replaceChildren(...survey.labels[lang].map((label, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.value = i + 1;
    const num = document.createElement('b'); num.textContent = i + 1;
    const text = document.createElement('span'); text.textContent = label;
    b.append(num, text);
    return b;
  }));
  $('#dots').replaceChildren(...session.order.map((id, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = i + 1; b.dataset.index = i;
    return b;
  }));
  if (view === 'study') renderQuestion();
  if (view === 'finish') renderFinish();
  if (view === 'done') renderDone();
}
function renderQuestion() {
  const i = session.current, id = session.order[i], rating = session.answers[id];
  $('#counter').textContent = t('counter')(i + 1, N());
  $('#answered').textContent = t('answered')(nAnswered());
  $('#bar').style.width = 100 * nAnswered() / N() + '%';
  $('#prompt').textContent = survey.question[lang];
  $('#caption').textContent = question?.id === id && question.caption ? t('captionLabel') + ' ' + question.caption : '';
  const sub = $('#paneOutputSub');
  sub.replaceChildren();
  if (question?.id === id) { const sw = document.createElement('i'); sw.className = 'swatch'; sub.append(sw, t('paneOutputSub')(question.added.length)); }
  $('#rating').querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.value === rating)));
  $('#prev').disabled = i === 0;
  $('#next').textContent = i === N() - 1 ? t('toFinish') : t('next');
  $('#next').disabled = !rating;
  $('#dots').querySelectorAll('button').forEach((b, j) => {
    b.classList.toggle('done', !!session.answers[session.order[j]]);
    b.setAttribute('aria-current', String(j === i));
  });
}
function renderFinish() {
  const missing = N() - nAnswered();
  $('#finishTitle').textContent = missing ? t('finishMissing')(missing) : t('finishTitle');
  $('#finishNote').textContent = missing ? t('finishMissingNote') : t('finishNote');
  $('#submit').disabled = missing > 0;
  $('#submit').textContent = t('submit');
}
function renderDone() { $('#receipt').textContent = session.receipt ? t('receipt')(session.receipt.receiptId) : ''; }

// ---------- questions ----------
function wait(message) {
  document.querySelectorAll('.stage .wait').forEach(el => el.remove());
  if (!message) return;
  for (const stage of document.querySelectorAll('.stage')) { const d = document.createElement('div'); d.className = 'wait'; d.textContent = message; stage.append(d); }
}
async function openQuestion(index) {
  trackTime();
  session.current = Math.max(0, Math.min(N() - 1, index));
  save();
  const id = session.order[session.current];
  question = null;
  if (view !== 'study') show('study');
  renderQuestion();
  wait(t('loading'));
  viewer ??= new Viewer([$('#stage0'), $('#stage1')], DATA);
  try {
    const q = await fetch(`${DATA}q/${id}.json?v=${survey.version}`).then(r => { if (!r.ok) throw Error(r.status); return r.json(); });
    if (session.order[session.current] !== id) return;
    question = q;
    renderQuestion();
    if (await viewer.show(q)) { wait(''); session.viewed[id] = true; save(); shownAt = document.hidden ? 0 : performance.now(); }
  } catch (err) {
    console.error(err);
    if (session.order[session.current] === id) wait(t('loadError'));
  }
}
function rate(value) {
  if (view !== 'study' || !(value >= 1 && value <= survey.labels[lang].length)) return;
  session.answers[session.order[session.current]] = value;
  save();
  renderQuestion();
}
function goNext() {
  if (!session.answers[session.order[session.current]]) return;
  if (session.current < N() - 1) openQuestion(session.current + 1);
  else { show('finish'); renderFinish(); }
}

// ---------- submission ----------
function payload() {
  return { schemaVersion: 1, version: survey.version, participantId: session.participantId, startedAt: session.startedAt,
    submittedAt: new Date().toISOString(), lang, viewport: [innerWidth, innerHeight], order: session.order,
    answers: session.order.map(id => ({ questionId: id, rating: session.answers[id],
      activeSeconds: Math.round(session.seconds[id] || 0), loaded3D: !!session.viewed[id] })) };
}
async function submit() {
  const button = $('#submit'), error = $('#finishError');
  button.disabled = true; button.textContent = t('submitting'); error.hidden = true;
  const body = payload();
  try {
    const { endpoint } = await fetch('config.json?t=' + Date.now()).then(r => r.json()).catch(() => ({}));
    if (!endpoint) throw Error('errNoEndpoint');
    const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      credentials: 'omit', referrerPolicy: 'no-referrer', body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    const receipt = r.ok ? await r.json() : null;
    if (receipt?.status !== 'saved' || receipt.participantId !== body.participantId || typeof receipt.receiptId !== 'string') throw Error('errSubmit');
    session.receipt = { receiptId: receipt.receiptId, receivedAt: receipt.receivedAt };
    save();
    show('done'); renderDone();
  } catch (err) {
    error.textContent = t(err.message === 'errNoEndpoint' ? 'errNoEndpoint' : 'errSubmit');
    error.hidden = false;
    $('#download').hidden = false;
    renderFinish();
  }
}
function download() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload(), null, 1)], { type: 'application/json' }));
  a.download = `brickicl_study_${session.participantId.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- start ----------
async function boot() {
  try {
    survey = await fetch(DATA + 'survey.json?t=' + Date.now()).then(r => { if (!r.ok) throw Error(r.status); return r.json(); });
  } catch (err) {
    console.error(err);
    $('#fatal').textContent = TEXT[lang].fatal; $('#fatal').hidden = false;
    return;
  }
  if (new URLSearchParams(location.search).has('reset')) { store.del(sessionKey()); history.replaceState(null, '', location.pathname); }
  session = loadSession();

  $('#lang').onclick = () => { lang = lang === 'zh' ? 'en' : 'zh'; store.set('brickicl_study_lang', lang); renderStatic(); };
  $('#help').onclick = () => $('#helpDialog').showModal();
  $('#helpDialog .close').onclick = () => $('#helpDialog').close();
  $('#consent').onchange = e => { $('#start').disabled = !e.target.checked; };
  $('#start').onclick = () => { session.consent = true; save(); openQuestion(session.current); };
  $('#rating').onclick = e => { const b = e.target.closest('button'); if (b) rate(+b.dataset.value); };
  $('#prev').onclick = () => openQuestion(session.current - 1);
  $('#next').onclick = goNext;
  $('#dots').onclick = e => { const b = e.target.closest('button'); if (b) openQuestion(+b.dataset.index); };
  $('#optHighlight').onclick = e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); viewer?.setOption('highlight', on); };
  $('#optEdges').onclick = e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); viewer?.setOption('edges', on); };
  $('#fitAll').onclick = () => viewer?.fit();
  $('#fitAdded').onclick = () => viewer?.fit(true);
  $('#submit').onclick = submit;
  $('#review').onclick = () => openQuestion(Math.max(0, session.order.findIndex(id => !session.answers[id])));
  $('#download').onclick = download;
  addEventListener('keydown', e => {
    if (view !== 'study' || e.metaKey || e.ctrlKey || e.altKey || $('#helpDialog').open) return;
    if (/^[1-9]$/.test(e.key)) rate(+e.key);
    else if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
    else if (e.key === 'ArrowLeft' && session.current > 0) openQuestion(session.current - 1);
  });
  document.addEventListener('visibilitychange', trackTime);
  addEventListener('pagehide', trackTime);

  renderStatic();
  if (session.receipt) { show('done'); renderDone(); }
  else show('welcome');
}
boot();
