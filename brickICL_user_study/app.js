// The questionnaire: instructions -> per question, rank the anonymous candidates from best to worst -> submit.
// Questions come from data/survey.json (written by make_survey.py); answers go to the endpoint in config.json.
import { Viewer, fetchJson } from './viewer.js';

const DATA = 'data/';
const $ = sel => document.querySelector(sel);

const TEXT = {
  zh: {
    langButton: 'English',
    help: '说明',
    welcomeTitle: '问卷说明',
    intro: (n, min, m, parts) => `这份问卷共 ${n} 题，大约需要 ${min} 分钟，${parts.generation ? `分两部分。第一部分 ${parts.completion} 题：` : ''}每一题给你看一个缺了一块的乐高模型、它的标准答案，以及最多 ${m} 个把这一块补上的结果，请你把这些结果从好到差排名。${parts.generation ? `第二部分 ${parts.generation} 题：每一题给你看 ${m} 个从零搭出来的乐高模型，没有标准答案，请你按“像不像一个搭得好的乐高模型”排名。` : ''}`,
    instructions: [
      ['看模型。', '第一行是"输入"（缺了一块的模型）和"标准答案"（蓝色描边的是原本缺的零件）。第二行是几个补全结果，新加的零件用橙色描边，其余零件变淡。拖动旋转，滚轮缩放，右键拖动平移，所有视图会一起转动。'],
      ['比较。', '对照输入和标准答案，看每个结果新加的零件种类、位置和朝向对不对，有没有悬空、穿进别的零件或者放错地方。和标准答案不完全一样但同样合理的补法，也可以给高分。'],
      ['排名。', '先点你认为最好的结果，再点第二好的，依次往下；最后一名会自动填上。点已选的结果可以取消，也可以清空重排，随时能回去修改。如果只分得出前面一个或几个，排好它们以后点“其余并列”，剩下的就算一样、不分先后。如果几个结果都很差、分不出好坏，可以点“都很差”，这道题就不用排名。结果用字母表示，来源不显示；同一个字母在不同的题里不代表同一个来源。'],
    ],
    privacy: '不收集姓名和联系方式。只有在最后点击“提交”时，才会发送你的排名和每题的查看时间；在此之前进度只保存在这个浏览器里。参与是自愿的，可以随时退出。',
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
    paneRef: '标准答案',
    paneRefSub: k => `缺的是这 ${k} 个零件`,
    candidate: letter => `结果 ${letter}`,
    candidateSub: k => (k ? `新加了 ${k} 个零件` : '没有加上任何零件'),
    guide: '对照输入和标准答案，把下面的结果从好到差依次点选，最后一名自动填上。只分得出前几个时点“其余并列”；都很差时点“都很差”。',
    guideGeneration: '这几个模型都是从零搭出来的，彼此无关，也没有标准答案。看它们像不像一个完整、合理、搭得好的乐高模型：零件有没有连在一起、有没有穿进彼此、整体看不看得出是个东西。从好到差依次点选，最后一名自动填上。只分得出前几个时点“其余并列”；都很差时点“都很差”。',
    partLabel: { completion: '第一部分 · 补全', generation: '第二部分 · 从零生成' },
    generatedSub: k => (k ? `共 ${k} 个零件` : '没有生成出能显示的零件'),
    rankPick: n => `选为第 ${n} 名`,
    rankPlace: n => `第 ${n} 名`,
    rankLine: '你的排名（从好到差）：',
    rankNone: '还没有选',
    rankClear: '清空重排',
    tieRest: '其余并列',
    rankTied: '并列',
    allBad: '都很差',
    allBadLine: '你的回答：都很差，不排名',
    hint: '拖动旋转 · 滚轮或双指缩放 · 右键拖动平移 · ← → 换题',
    loading: '正在加载模型…',
    loadError: '模型加载失败，请刷新页面重试。',
    prev: '上一题',
    next: '下一题',
    toFinish: '完成',
    saved: '进度已保存在本浏览器',
    finishTitle: '准备提交',
    finishMissing: k => `还有 ${k} 题没有排完`,
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
    intro: (n, min, m, parts) => `This study has ${n} questions and takes about ${min} minutes${parts.generation ? `, in two parts. Part 1, ${parts.completion} questions:` : '.'} Each question shows a LEGO model with a piece missing, its reference answer, and up to ${m} results that fill the piece in. You rank these results from best to worst.${parts.generation ? ` Part 2, ${parts.generation} questions: each question shows ${m} LEGO models built from nothing, with no reference answer. You rank them by how much each looks like a well-built LEGO model.` : ''}`,
    instructions: [
      ['Inspect the models.', 'The first row shows the Input (the model with a piece missing) and the Reference answer (the missing parts outlined in blue). The second row shows the results, with the added parts outlined in orange and the rest faded. Drag to rotate, scroll to zoom, right-drag to pan. All views move together.'],
      ['Compare.', 'Against the input and the reference, check whether each result adds the right kind of parts in the right place and orientation, and whether anything floats, intersects other parts or sits in the wrong place. A completion that differs from the reference but is just as sensible can still score high.'],
      ['Rank.', 'Click the result you find best first, then the next best, and so on; last place is filled in automatically. Click a chosen result to take it back, or clear the ranking and start over; you can change it at any time. If you can only tell the best one or few apart, rank those and click “Tie the rest”: the others count as equal. If the results are all bad and you cannot tell them apart, click “All bad” and the question needs no ranking. Results are lettered and their source is not shown; a letter does not stand for the same source across questions.'],
    ],
    privacy: 'No name or contact information is requested. Your rankings and the viewing time per question are sent only when you click Submit at the end; until then progress is kept in this browser only. Participation is voluntary and you may leave at any time.',
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
    paneRef: 'Reference answer',
    paneRefSub: k => `the ${k} missing part${k === 1 ? '' : 's'}`,
    candidate: letter => `Result ${letter}`,
    candidateSub: k => (k ? `${k} part${k === 1 ? '' : 's'} added` : 'no part was added'),
    guide: 'Compare with the input and the reference, then click the results below from best to worst; last place is filled in automatically. If only the first few can be told apart, click “Tie the rest”; if all are bad, click “All bad”.',
    guideGeneration: 'These models were each built from nothing. They are unrelated to each other and there is no reference answer. Judge how much each looks like a complete, sensible, well-built LEGO model: are the parts connected, do they pass through each other, can you tell what it is? Click them from best to worst; last place is filled in automatically. If only the first few can be told apart, click “Tie the rest”; if all are bad, click “All bad”.',
    partLabel: { completion: 'Part 1 · Completion', generation: 'Part 2 · From nothing' },
    generatedSub: k => (k ? `${k} part${k === 1 ? '' : 's'}` : 'nothing that can be shown was generated'),
    rankPick: n => `Pick as #${n}`,
    rankPlace: n => `#${n}`,
    rankLine: 'Your ranking, best to worst:',
    rankNone: 'nothing picked yet',
    rankClear: 'Clear',
    tieRest: 'Tie the rest',
    rankTied: 'Tied',
    allBad: 'All bad',
    allBadLine: 'Your answer: all bad, no ranking',
    hint: 'Drag to rotate · scroll or pinch to zoom · right-drag to pan · ← → move',
    loading: 'Loading the model…',
    loadError: 'The model failed to load. Please reload the page.',
    prev: 'Back',
    next: 'Next',
    toFinish: 'Finish',
    saved: 'Progress saved in this browser',
    finishTitle: 'Ready to submit',
    finishMissing: k => `${k} question${k === 1 ? ' is' : 's are'} not fully ranked yet`,
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
  return { schemaVersion: 2, version: survey.version, participantId, startedAt: new Date().toISOString(),
    order: ['completion', 'generation'].flatMap(kind => shuffled(survey.questions.filter(q => q.kind === kind).map(q => q.id), participantId + kind)), current: 0, answers: {}, tied: {}, allBad: {}, seconds: {}, viewed: {}, consent: false };
}
function loadSession() {
  try {
    const s = JSON.parse(store.get(sessionKey()));
    const ids = new Set(survey.questions.map(q => q.id));
    if (s?.schemaVersion === 2 && s.version === survey.version && typeof s.participantId === 'string' &&
        Array.isArray(s.order) && s.order.length === ids.size && s.order.every(id => ids.has(id))) return s;
  } catch { /* fall through */ }
  return newSession();
}
const save = () => store.set(sessionKey(), JSON.stringify(session));
const letters = () => survey.letters;
const meta = id => survey.questions.find(q => q.id === id);
const count = id => meta(id).n;                                         // how many candidates the question shows
const kindOf = id => meta(id).kind;
const nOfKind = kind => survey.questions.filter(q => q.kind === kind).length;
const labelsOf = id => letters().slice(0, count(id));
const isAllBad = id => session.allBad?.[id] === true;                   // answered "all bad" instead of ranking
// "Tie the rest": the candidates picked so far are ranked, the others share the places after them. It needs at
// least one pick and at least two candidates left over (with one left over the ranking is simply complete).
const canTie = id => { const k = (session.answers[id] || []).length; return !isAllBad(id) && k >= 1 && k <= count(id) - 2; };
const isTied = id => session.tied?.[id] === true && canTie(id);
const isDone = id => isAllBad(id) || isTied(id) || (session.answers[id] || []).length === count(id);  // every candidate has a place
// One click on a candidate. The ranking lists letters from best to worst; the last place is filled in
// automatically, a click on a chosen candidate takes it back, a click when all are placed replaces the last pick.
function choose(ranking, label, labels) {
  const n = labels.length;
  if (n > 2 && ranking.length === n && ranking[n - 1] === label) return ranking;
  let picked = ranking.slice(0, n - 1);
  if (picked.includes(label)) picked = picked.filter(x => x !== label);
  else { if (picked.length === n - 1) picked.pop(); picked.push(label); }
  return picked.length === n - 1 ? [...picked, ...labels.filter(x => !picked.includes(x))] : picked;
}
const nAnswered = () => session.order.filter(isDone).length;
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
  $('#intro').textContent = t('intro')(N(), survey.minutes, letters().length, { completion: nOfKind('completion'), generation: nOfKind('generation') });
  $('#instructions').replaceChildren(...instructionItems());
  $('#helpList').replaceChildren(...instructionItems());
  $('#start').textContent = nAnswered() ? t('resume')(nAnswered(), N()) : t('start');
  document.querySelectorAll('#cands figure').forEach(fig => { fig.querySelector('b').textContent = t('candidate')(fig.dataset.letter); });
  $('#dots').replaceChildren(...session.order.map((id, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = i + 1; b.dataset.index = i;
    return b;
  }));
  if (view === 'study') renderQuestion();
  if (view === 'finish') renderFinish();
  if (view === 'done') renderDone();
}
function buildCandidates() {            // once: one view and one rank button per candidate letter
  $('#cands').style.setProperty('--cols', letters().length);
  $('#cands').replaceChildren(...letters().map(letter => {
    const fig = document.createElement('figure');
    fig.dataset.letter = letter;
    const stage = document.createElement('div'); stage.className = 'stage';
    const cap = document.createElement('figcaption'); cap.append(document.createElement('b'), document.createElement('span'));
    const rank = document.createElement('button'); rank.type = 'button'; rank.className = 'rank';
    fig.append(stage, cap, rank);
    return fig;
  }));
}
function renderQuestion() {
  const i = session.current, id = session.order[i], bad = isAllBad(id), tied = isTied(id), ranking = bad ? [] : session.answers[id] || [], labels = labelsOf(id), loaded = question?.id === id;
  const kind = kindOf(id);
  $('#counter').textContent = (nOfKind('generation') ? t('partLabel')[kind] + ' · ' : '') + t('counter')(i + 1, N());
  $('#answered').textContent = t('answered')(nAnswered());
  $('#bar').style.width = 100 * nAnswered() / N() + '%';
  $('#prompt').textContent = survey.question[kind][lang];
  $('#refs').hidden = kind !== 'completion';                 // generation questions have no input and no reference
  $('#guide').textContent = t('guide');
  $('#guideAlone').hidden = kind !== 'generation';
  $('#guideAlone').textContent = t('guideGeneration');
  for (const id2 of ['optHighlight', 'fitAdded']) $('#' + id2).hidden = kind !== 'completion';
  $('#caption').textContent = loaded && question.caption ? t('captionLabel') + ' ' + question.caption : '';
  const sub = (el, tone, text) => { el.replaceChildren(); if (!loaded) return; const sw = document.createElement('i'); sw.className = 'swatch ' + tone; el.append(sw, text); };
  sub($('#paneRefSub'), 'ref', loaded ? t('paneRefSub')(question.reference.length) : '');
  document.querySelectorAll('#cands figure').forEach(fig => {
    const letter = fig.dataset.letter, shown = labels.includes(letter), place = ranking.indexOf(letter) + 1;
    fig.hidden = !shown;
    if (!shown) return;
    const cand = loaded ? question.candidates.find(c => c.label === letter) : null;
    if (kind === 'generation') fig.querySelector('figcaption span').textContent = cand ? t('generatedSub')(cand.added.length) : '';
    else sub(fig.querySelector('figcaption span'), '', cand ? t('candidateSub')(cand.added.length) : '');
    const button = fig.querySelector('.rank');
    button.textContent = place ? t('rankPlace')(place) : tied ? t('rankTied') : t('rankPick')(Math.min(ranking.length + 1, labels.length));
    button.setAttribute('aria-pressed', String(!!place));
    button.classList.toggle('tied', !place && tied);
    fig.classList.toggle('placed', !!place);
  });
  const rest = labels.filter(l => !ranking.includes(l));
  $('#rankLine').textContent = bad ? t('allBadLine') : t('rankLine') + ' ' + (ranking.length ? ranking.join(' > ') + (tied ? ' > ' + rest.join(' = ') : '') : t('rankNone'));
  $('#tieRest').setAttribute('aria-pressed', String(tied));
  $('#tieRest').disabled = !canTie(id);
  $('#tieRest').hidden = labels.length < 3;                  // with two candidates there is nothing left to tie
  $('#rankClear').disabled = !ranking.length;
  $('#allBad').setAttribute('aria-pressed', String(bad));
  $('#cands').classList.toggle('all-bad', bad);
  $('#prev').disabled = i === 0;
  $('#next').textContent = i === N() - 1 ? t('toFinish') : t('next');
  $('#next').disabled = !isDone(id);
  $('#dots').querySelectorAll('button').forEach((b, j) => {
    b.classList.toggle('done', isDone(session.order[j]));
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
  viewer ??= new Viewer([$('#stageInput'), $('#stageRef'), ...document.querySelectorAll('#cands .stage')], DATA);
  try {
    const q = await fetchJson(`${DATA}q/${id}.json?v=${survey.version}`);
    if (session.order[session.current] !== id) return;
    question = q;
    renderQuestion();
    const views = [null, q.reference, ...letters().map(l => q.candidates.find(c => c.label === l)?.added || null)];
    if (await viewer.show({ context: q.context, views, parts: q.parts, separate: kindOf(id) === 'generation' })) { wait(''); session.viewed[id] = true; save(); shownAt = document.hidden ? 0 : performance.now(); }
  } catch (err) {
    console.error(err);
    if (session.order[session.current] === id) wait(t('loadError'));
  }
}
function pick(letter) {
  const id = session.order[session.current], labels = labelsOf(id);
  if (view !== 'study' || !labels.includes(letter)) return;
  if (isAllBad(id)) { delete session.allBad[id]; session.answers[id] = []; }   // ranking takes the "all bad" answer back
  session.answers[id] = choose(session.answers[id] || [], letter, labels);
  if (session.tied?.[id] && !canTie(id)) delete session.tied[id];              // nothing ranked, or nothing left to tie
  save();
  renderQuestion();
}
function clearRanking() {
  const id = session.order[session.current];
  session.answers[id] = [];
  if (session.tied) delete session.tied[id];
  save();
  renderQuestion();
}
function toggleTieRest() {                // the picks so far stay ranked, the other candidates are tied after them
  const id = session.order[session.current];
  session.tied ??= {};
  if (isTied(id)) delete session.tied[id];
  else if (canTie(id)) session.tied[id] = true;
  save();
  renderQuestion();
}
function toggleAllBad() {                 // "all bad" answers the question in place of a ranking; a second click takes it back
  const id = session.order[session.current];
  session.allBad ??= {};
  if (isAllBad(id)) delete session.allBad[id];
  else { session.allBad[id] = true; session.answers[id] = []; if (session.tied) delete session.tied[id]; }
  save();
  renderQuestion();
}
function goNext() {
  if (!isDone(session.order[session.current])) return;
  if (session.current < N() - 1) openQuestion(session.current + 1);
  else { show('finish'); renderFinish(); }
}

// ---------- submission ----------
// A ranking that names fewer letters than the question has candidates means the rest are tied after them.
function payload() {
  return { schemaVersion: 2, version: survey.version, participantId: session.participantId, startedAt: session.startedAt,
    submittedAt: new Date().toISOString(), lang, viewport: [innerWidth, innerHeight], order: session.order,
    answers: session.order.map(id => ({ questionId: id, ...(isAllBad(id) ? { allBad: true } : { ranking: [...session.answers[id]] }),
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
  $('#cands').onclick = e => { const b = e.target.closest('.rank'); if (b) pick(b.closest('figure').dataset.letter); };
  $('#rankClear').onclick = clearRanking;
  $('#tieRest').onclick = toggleTieRest;
  $('#allBad').onclick = toggleAllBad;
  $('#prev').onclick = () => openQuestion(session.current - 1);
  $('#next').onclick = goNext;
  $('#dots').onclick = e => { const b = e.target.closest('button'); if (b) openQuestion(+b.dataset.index); };
  $('#optHighlight').onclick = e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); viewer?.setOption('highlight', on); };
  $('#optEdges').onclick = e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); viewer?.setOption('edges', on); };
  $('#fitAll').onclick = () => viewer?.fit();
  $('#fitAdded').onclick = () => viewer?.fit(true);
  $('#submit').onclick = submit;
  $('#review').onclick = () => openQuestion(Math.max(0, session.order.findIndex(id => !isDone(id))));
  $('#download').onclick = download;
  addEventListener('keydown', e => {
    if (view !== 'study' || e.metaKey || e.ctrlKey || e.altKey || $('#helpDialog').open) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
    else if (e.key === 'ArrowLeft' && session.current > 0) openQuestion(session.current - 1);
  });
  document.addEventListener('visibilitychange', trackTime);
  addEventListener('pagehide', trackTime);

  buildCandidates();
  renderStatic();
  if (session.receipt) { show('done'); renderDone(); }
  else show('welcome');
}
boot();
