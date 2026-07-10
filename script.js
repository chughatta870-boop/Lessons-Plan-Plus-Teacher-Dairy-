/* ===========================================================
   Lesson Plan & Teacher Diary Generator - GHS 124/NB
   Vanilla JS PWA - localStorage based
   =========================================================== */

const STORAGE = {
  PLANS: 'lp_plans',
  DIARY: 'lp_diary',
  ROLE: 'lp_role'
};
const WATERMARK_TEXT = 'M. Ijaz — GHS 124/NB';

/* ---------- storage helpers ---------- */
function loadArr(key){
  try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; }
}
function saveArr(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }
function uid(){ return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function qs(sel, root){ return (root||document).querySelector(sel); }
function qsa(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }
function esc(str){
  return (str||'').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function toast(msg){
  const t = qs('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._tm);
  toast._tm = setTimeout(()=>{ t.hidden = true; }, 2200);
}

/* ===========================================================
   TEMPLATE BANKS — rule-based auto content generation
   =========================================================== */
const TEMPLATES = {
  mathematics: {
    objectives: t => [
      `Students will be able to define and explain the concept of ${t}.`,
      `Students will be able to solve problems related to ${t} using correct steps.`,
      `Students will be able to apply ${t} in daily-life / real-world situations.`
    ],
    previousKnowledge: t => `Students already have basic knowledge of number operations and previous related concepts that lead into ${t}. Teacher will recall this through quick oral questions.`,
    introduction: t => `Teacher will begin the lesson with a short real-life example or question related to ${t} to capture students' attention and link it with their daily life experience.`,
    presentation: t => [
      `Teacher introduces ${t} on the board with clear definition and key terms.`,
      `Teacher solves 2-3 example problems of ${t} step-by-step, explaining logic at each step.`,
      `Teacher highlights common mistakes students make while solving ${t} and how to avoid them.`,
      `Teacher involves students by asking them to solve one example on the board.`
    ],
    activities: t => [
      `Individual practice: students solve 5 questions of ${t} in notebooks.`,
      `Pair work: students check and correct each other's ${t} solutions.`,
      `Group activity: quick board race - fastest correct answer on ${t} wins.`
    ],
    assessmentQuestions: t => [
      `Define ${t} in your own words.`,
      `Solve one example based on ${t}.`,
      `Write the steps used to solve a problem of ${t}.`,
      `Give one real-life example where ${t} is used.`,
      `Identify the mistake in a given solution of ${t}.`
    ],
    homework: t => `Solve 5 additional questions of ${t} from the exercise given at the end of the chapter.`
  },
  science: {
    objectives: t => [
      `Students will be able to explain the concept of ${t}.`,
      `Students will be able to identify examples of ${t} from their surroundings.`,
      `Students will be able to describe the process/importance of ${t}.`
    ],
    previousKnowledge: t => `Teacher will ask a few questions to recall previous topic which links naturally to ${t}.`,
    introduction: t => `Teacher will show a picture, chart, real object, or short demonstration related to ${t} to create curiosity in students.`,
    presentation: t => [
      `Teacher explains ${t} using chart/diagram/real specimen with simple language.`,
      `Teacher demonstrates a short experiment or example illustrating ${t}, where possible.`,
      `Teacher explains scientific terms related to ${t} with everyday examples.`,
      `Teacher asks guiding questions to check understanding while teaching ${t}.`
    ],
    activities: t => [
      `Observation activity: students observe a chart/picture/specimen related to ${t} and note down 3 points.`,
      `Group discussion on real-life applications of ${t}.`,
      `Labelling / diagram activity related to ${t} in notebooks.`
    ],
    assessmentQuestions: t => [
      `What is ${t}? Explain briefly.`,
      `Give two examples of ${t} from daily life.`,
      `Draw and label a diagram related to ${t}.`,
      `Why is ${t} important? Explain in 2-3 lines.`,
      `Fill in the blank / short question based on ${t}.`
    ],
    homework: t => `Write a short note (5-6 lines) on ${t} and bring one real-life example from home.`
  },
  english: {
    objectives: t => [
      `Students will be able to read and understand the topic "${t}" with correct pronunciation.`,
      `Students will be able to use new vocabulary from ${t} in sentences.`,
      `Students will be able to answer comprehension/grammar questions related to ${t}.`
    ],
    previousKnowledge: t => `Teacher will revise previously learnt vocabulary/grammar rules connected to ${t} through quick Q&A.`,
    introduction: t => `Teacher introduces ${t} through a short discussion, picture, or question to build interest and set the context.`,
    presentation: t => [
      `Teacher reads/explains ${t} aloud with correct pronunciation and intonation; students repeat.`,
      `Teacher explains difficult/new words from ${t} with meanings and example sentences.`,
      `Teacher explains grammar rule / structure related to ${t} on the board with examples.`,
      `Teacher asks students to read ${t} individually/in pairs.`
    ],
    activities: t => [
      `Vocabulary activity: students use 3 new words from ${t} in their own sentences.`,
      `Pair reading: students take turns reading ${t} aloud.`,
      `Written activity: students answer short questions based on ${t}.`
    ],
    assessmentQuestions: t => [
      `Answer in one sentence: What is ${t} about?`,
      `Use two new words from ${t} in your own sentences.`,
      `Write a short answer question based on ${t}.`,
      `Identify the main idea / grammar rule of ${t}.`,
      `Fill in the blanks based on ${t}.`
    ],
    homework: t => `Read ${t} again at home and write 3 sentences using new words/structures learnt.`
  },
  urdu: {
    objectives: t => [
      `طلبہ ${t} کو صحیح تلفظ کے ساتھ پڑھ سکیں گے۔`,
      `طلبہ ${t} سے متعلق نئے الفاظ کے معنی سمجھ سکیں گے۔`,
      `طلبہ ${t} سے متعلقہ سوالات کے جوابات دے سکیں گے۔`
    ],
    previousKnowledge: t => `استاد گزشتہ سبق سے متعلق سوالات پوچھ کر طلبہ کی معلومات کو ${t} سے جوڑیں گے۔`,
    introduction: t => `استاد ${t} کا تعارف ایک مختصر سوال، تصویر یا مثال کے ذریعے کروائیں گے۔`,
    presentation: t => [
      `استاد ${t} کو تختہ سیاہ پر لکھ کر صحیح تلفظ کے ساتھ پڑھائیں گے۔`,
      `استاد مشکل الفاظ کے معنی اور استعمال مثالوں سے سمجھائیں گے۔`,
      `استاد ${t} سے متعلق قواعد یا خیال کی وضاحت کریں گے۔`,
      `طلبہ سے باری باری ${t} پڑھوایا جائے گا۔`
    ],
    activities: t => [
      `طلبہ ${t} سے تین نئے الفاظ لے کر جملے بنائیں گے۔`,
      `جوڑوں میں پڑھائی کی سرگرمی۔`,
      `${t} سے متعلق مختصر سوالات کے تحریری جوابات۔`
    ],
    assessmentQuestions: t => [
      `${t} کا خلاصہ اپنے الفاظ میں بیان کریں۔`,
      `${t} سے دو نئے الفاظ کے معنی لکھیں۔`,
      `${t} سے متعلق ایک سوال کا جواب دیں۔`,
      `${t} میں مرکزی خیال کیا ہے؟`,
      `خالی جگہ پر کریں: ${t} سے متعلق جملہ۔`
    ],
    homework: t => `${t} کو دوبارہ پڑھیں اور تین نئے جملے بنا کر لکھیں۔`
  },
  islamiat: {
    objectives: t => [
      `Students will be able to explain the teachings related to ${t}.`,
      `Students will be able to recall key facts/references related to ${t}.`,
      `Students will be able to apply the lesson of ${t} in their daily life.`
    ],
    previousKnowledge: t => `Teacher will recall previous related Islamic teaching before connecting it to ${t}.`,
    introduction: t => `Teacher begins with a short Hadith, verse, or moral story related to ${t} to gain attention.`,
    presentation: t => [
      `Teacher explains ${t} with reference and simple explanation suitable for students' level.`,
      `Teacher relates ${t} to good moral values and daily life practice.`,
      `Teacher asks students to share their understanding/examples related to ${t}.`
    ],
    activities: t => [
      `Students recite/write the key reference related to ${t}.`,
      `Group discussion: how to practice the teaching of ${t} in daily life.`,
      `Short written activity based on ${t}.`
    ],
    assessmentQuestions: t => [
      `What does ${t} teach us?`,
      `Write one lesson we learn from ${t}.`,
      `How can we practice ${t} in our daily life?`,
      `Fill in the blank based on ${t}.`,
      `Short question based on ${t}.`
    ],
    homework: t => `Write 3-4 lines about what you learnt from ${t} and how you will practice it.`
  },
  'social studies': {
    objectives: t => [
      `Students will be able to explain ${t} with relevant facts.`,
      `Students will be able to identify the importance/impact of ${t}.`,
      `Students will be able to relate ${t} to present day situations.`
    ],
    previousKnowledge: t => `Teacher recalls previous related topic before introducing ${t}.`,
    introduction: t => `Teacher introduces ${t} through a map, picture, timeline, or short question.`,
    presentation: t => [
      `Teacher explains ${t} using map/chart/timeline with key facts and dates.`,
      `Teacher discusses causes/effects or importance of ${t}.`,
      `Teacher connects ${t} with current situations for better understanding.`
    ],
    activities: t => [
      `Map/timeline activity related to ${t}.`,
      `Group discussion on importance of ${t}.`,
      `Short written activity based on key facts of ${t}.`
    ],
    assessmentQuestions: t => [
      `Explain ${t} briefly.`,
      `What is the importance of ${t}?`,
      `Give one fact/date related to ${t}.`,
      `How does ${t} relate to today?`,
      `Short question based on ${t}.`
    ],
    homework: t => `Write a short paragraph (5-6 lines) about ${t}.`
  },
  'computer science': {
    objectives: t => [
      `Students will be able to define ${t}.`,
      `Students will be able to explain the working/use of ${t}.`,
      `Students will be able to practically identify/use ${t} where applicable.`
    ],
    previousKnowledge: t => `Teacher recalls previously learnt computer concepts related to ${t}.`,
    introduction: t => `Teacher introduces ${t} with a real device/software example or picture.`,
    presentation: t => [
      `Teacher explains ${t} step-by-step using board/chart or demonstration.`,
      `Teacher shows practical example/use of ${t} where possible.`,
      `Teacher clarifies technical terms related to ${t}.`
    ],
    activities: t => [
      `Students note down key points of ${t} in notebooks.`,
      `Group discussion on uses of ${t} in daily life.`,
      `Simple diagram/labelling activity related to ${t}.`
    ],
    assessmentQuestions: t => [
      `Define ${t}.`,
      `Give one use/example of ${t}.`,
      `Explain briefly how ${t} works.`,
      `List two advantages related to ${t}.`,
      `Short question based on ${t}.`
    ],
    homework: t => `Write short notes on ${t} and one example of its use.`
  }
};

const GENERIC_TEMPLATE = {
  objectives: t => [
    `Students will be able to understand and explain ${t}.`,
    `Students will be able to identify key points related to ${t}.`,
    `Students will be able to apply the concept of ${t} in exercises/daily life.`
  ],
  previousKnowledge: t => `Teacher will recall previous related lesson through oral questions before linking it to ${t}.`,
  introduction: t => `Teacher will introduce ${t} through a short question, example, or real-life connection to gain students' attention.`,
  presentation: t => [
    `Teacher explains ${t} on the board step-by-step in simple language.`,
    `Teacher gives examples related to ${t} for better understanding.`,
    `Teacher involves students by asking questions during the explanation of ${t}.`,
    `Teacher clarifies difficult points related to ${t}.`
  ],
  activities: t => [
    `Individual activity: students write key points of ${t} in notebooks.`,
    `Pair/group discussion on ${t}.`,
    `Short practice exercise related to ${t}.`
  ],
  assessmentQuestions: t => [
    `Explain ${t} in your own words.`,
    `Give one example related to ${t}.`,
    `Answer a short question based on ${t}.`,
    `What did you learn from ${t}?`,
    `Fill in the blank / short question related to ${t}.`
  ],
  homework: t => `Revise ${t} and write a short summary in your notebook.`
};

function getTemplate(subject){
  const key = (subject||'').trim().toLowerCase();
  if(TEMPLATES[key]) return TEMPLATES[key];
  // partial match e.g. "General Science" -> science
  for(const k in TEMPLATES){
    if(key.includes(k) || k.includes(key)) return TEMPLATES[k];
  }
  return GENERIC_TEMPLATE;
}

function generateLessonContent(subject, topic, className){
  const tpl = getTemplate(subject);
  const t = topic.trim();
  return {
    objectives: tpl.objectives(t),
    previousKnowledge: tpl.previousKnowledge(t),
    introduction: tpl.introduction(t),
    presentation: tpl.presentation(t),
    activities: tpl.activities(t),
    assessmentQuestions: tpl.assessmentQuestions(t),
    homework: tpl.homework(t)
  };
}

/* ===========================================================
   PLAN CREATION (auto-generates plan + auto-creates diary entry)
   =========================================================== */
function createLessonPlan(data){
  const content = generateLessonContent(data.subject, data.topic, data.className);
  const plan = {
    id: uid(),
    teacherName: data.teacherName,
    subject: data.subject,
    className: data.className,
    date: data.date,
    month: data.month,
    year: data.year,
    topic: data.topic,
    avAids: data.avAids,
    teacherNotes: data.teacherNotes || '',
    ...content,
    remark: null,        // { type: 'Excellent'|'Good'|'Average', comment, by, at }
    createdAt: new Date().toISOString()
  };
  const plans = loadArr(STORAGE.PLANS);
  plans.unshift(plan);
  saveArr(STORAGE.PLANS, plans);

  // auto-create matching diary entry for that day's work
  const diary = loadArr(STORAGE.DIARY);
  const entry = {
    id: uid(),
    linkedPlanId: plan.id,
    teacherName: plan.teacherName,
    subject: plan.subject,
    className: plan.className,
    date: plan.date,
    month: plan.month,
    year: plan.year,
    topic: plan.topic,
    workDone: `Taught "${plan.topic}" (${plan.subject}) to ${plan.className}. Activities conducted: ${content.activities.join('; ')}. Assessment done through formative questions on ${plan.topic}.`,
    remark: null,
    createdAt: new Date().toISOString()
  };
  diary.unshift(entry);
  saveArr(STORAGE.DIARY, diary);

  return plan;
}

/* ===========================================================
   RENDER: Lesson Plans List
   =========================================================== */
function planCardHTML(p){
  const badge = p.remark ? `<span class="badge ${p.remark.type.toLowerCase()}">${p.remark.type}</span>` : `<span class="badge pending">Pending Review</span>`;
  return `
  <div class="item-card" data-id="${p.id}" data-kind="plan">
    <h3>${esc(p.topic)} ${badge}</h3>
    <div class="item-meta">
      👤 ${esc(p.teacherName)} &nbsp;|&nbsp; 📘 ${esc(p.subject)} &nbsp;|&nbsp; 🏫 ${esc(p.className)}<br>
      📅 ${esc(p.date)} (${esc(p.month)} ${esc(p.year)})
    </div>
    <div class="item-actions">
      <button data-act="view">👁 View</button>
      <button data-act="edit">✏️ Edit</button>
      <button data-act="print">🖨️ Download</button>
      <button data-act="share">🔗 Share</button>
      <button data-act="delete">🗑️ Delete</button>
    </div>
  </div>`;
}
function renderPlansList(filter){
  const plans = loadArr(STORAGE.PLANS);
  const f = (filter||'').toLowerCase();
  const filtered = plans.filter(p => !f || [p.topic,p.subject,p.className,p.date,p.teacherName].join(' ').toLowerCase().includes(f));
  const el = qs('#plansListContainer');
  el.innerHTML = filtered.length ? filtered.map(planCardHTML).join('') : `<p class="item-meta">No lesson plans yet. Create one from "New Lesson Plan" tab.</p>`;
}

/* ===========================================================
   RENDER: Teacher Diary
   =========================================================== */
function diaryCardHTML(d){
  const badge = d.remark ? `<span class="badge ${d.remark.type.toLowerCase()}">${d.remark.type}</span>` : `<span class="badge pending">Pending Review</span>`;
  return `
  <div class="item-card" data-id="${d.id}" data-kind="diary">
    <h3>${esc(d.date)} — ${esc(d.subject)} ${badge}</h3>
    <div class="item-meta">
      👤 ${esc(d.teacherName)} &nbsp;|&nbsp; 🏫 ${esc(d.className)} &nbsp;|&nbsp; 📖 ${esc(d.topic)}
    </div>
    <div class="item-actions">
      <button data-act="view">👁 View</button>
      <button data-act="edit">✏️ Edit</button>
      <button data-act="print">🖨️ Download</button>
      <button data-act="share">🔗 Share</button>
      <button data-act="delete">🗑️ Delete</button>
    </div>
  </div>`;
}
function renderDiaryList(filter){
  const diary = loadArr(STORAGE.DIARY);
  const f = (filter||'').toLowerCase();
  const filtered = diary.filter(d => !f || [d.topic,d.subject,d.className,d.date,d.teacherName].join(' ').toLowerCase().includes(f));
  const el = qs('#diaryContainer');
  el.innerHTML = filtered.length ? filtered.map(diaryCardHTML).join('') : `<p class="item-meta">No diary entries yet. They are auto-created when you generate a lesson plan.</p>`;
}

/* ===========================================================
   RENDER: Head Teacher Review (both plans + diary, unreviewed first)
   =========================================================== */
function renderReviewList(filter){
  const plans = loadArr(STORAGE.PLANS).map(p => ({...p, kind:'plan'}));
  const diary = loadArr(STORAGE.DIARY).map(d => ({...d, kind:'diary'}));
  let all = [...plans, ...diary];
  const f = (filter||'').toLowerCase();
  if(f) all = all.filter(x => [x.topic,x.subject,x.className,x.date,x.teacherName].join(' ').toLowerCase().includes(f));
  all.sort((a,b) => (a.remark?1:0) - (b.remark?1:0));
  const el = qs('#reviewContainer');
  if(!all.length){ el.innerHTML = `<p class="item-meta">Nothing to review yet.</p>`; return; }
  el.innerHTML = all.map(x => {
    const badge = x.remark ? `<span class="badge ${x.remark.type.toLowerCase()}">${x.remark.type}</span>` : `<span class="badge pending">Pending</span>`;
    const label = x.kind === 'plan' ? 'Lesson Plan' : 'Diary Entry';
    return `
    <div class="item-card" data-id="${x.id}" data-kind="${x.kind}">
      <h3>[${label}] ${esc(x.topic)} ${badge}</h3>
      <div class="item-meta">
        👤 ${esc(x.teacherName)} &nbsp;|&nbsp; 📘 ${esc(x.subject)} &nbsp;|&nbsp; 🏫 ${esc(x.className)} &nbsp;|&nbsp; 📅 ${esc(x.date)}
      </div>
      <div class="item-actions">
        <button data-act="view">👁 View</button>
        <button data-act="remark">🏷️ Give Remark</button>
      </div>
    </div>`;
  }).join('');
}

/* ===========================================================
   MODALS: View / Print (with watermark)
   =========================================================== */
let currentItem = null; // {kind, id}

function findItem(kind, id){
  const arr = loadArr(kind === 'plan' ? STORAGE.PLANS : STORAGE.DIARY);
  return arr.find(x => x.id === id);
}
function updateItem(kind, id, updater){
  const key = kind === 'plan' ? STORAGE.PLANS : STORAGE.DIARY;
  const arr = loadArr(key);
  const idx = arr.findIndex(x => x.id === id);
  if(idx === -1) return null;
  arr[idx] = updater(arr[idx]);
  saveArr(key, arr);
  return arr[idx];
}
function deleteItem(kind, id){
  const key = kind === 'plan' ? STORAGE.PLANS : STORAGE.DIARY;
  const arr = loadArr(key).filter(x => x.id !== id);
  saveArr(key, arr);
}

function remarkHTML(remark){
  if(!remark) return '';
  return `<div class="remark-box"><strong>Head Teacher Remark:</strong> <span class="badge ${remark.type.toLowerCase()}">${remark.type}</span><br>${remark.comment ? esc(remark.comment) : ''}</div>`;
}

function planPrintHTML(p){
  return `
  <div class="print-header"><h2>Lesson Plan</h2><span>GHS 124/NB</span></div>
  <table class="print-meta-table">
    <tr><td class="label">Teacher Name</td><td>${esc(p.teacherName)}</td><td class="label">Subject</td><td>${esc(p.subject)}</td></tr>
    <tr><td class="label">Class</td><td>${esc(p.className)}</td><td class="label">Date</td><td>${esc(p.date)}</td></tr>
    <tr><td class="label">Month</td><td>${esc(p.month)}</td><td class="label">Year</td><td>${esc(p.year)}</td></tr>
    <tr><td class="label">Topic</td><td colspan="3">${esc(p.topic)}</td></tr>
    <tr><td class="label">AV Aids</td><td colspan="3">${esc(p.avAids || '-')}</td></tr>
  </table>
  <div class="plan-section"><h4>Learning Objectives</h4><ul>${p.objectives.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div>
  <div class="plan-section"><h4>Previous Knowledge</h4><p>${esc(p.previousKnowledge)}</p></div>
  <div class="plan-section"><h4>Introduction</h4><p>${esc(p.introduction)}</p></div>
  <div class="plan-section"><h4>Presentation / Teaching Points</h4><ul>${p.presentation.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div>
  <div class="plan-section"><h4>Activities</h4><ul>${p.activities.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div>
  <div class="plan-section"><h4>End Assessment Questions</h4><ul>${p.assessmentQuestions.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div>
  <div class="plan-section"><h4>Homework</h4><p>${esc(p.homework)}</p></div>
  ${p.teacherNotes ? `<div class="plan-section"><h4>Teacher Notes</h4><p>${esc(p.teacherNotes)}</p></div>` : ''}
  ${remarkHTML(p.remark)}
  <div class="watermark">${WATERMARK_TEXT}</div>`;
}

function diaryPrintHTML(d){
  return `
  <div class="print-header"><h2>Teacher Diary</h2><span>GHS 124/NB</span></div>
  <table class="print-meta-table">
    <tr><td class="label">Teacher Name</td><td>${esc(d.teacherName)}</td><td class="label">Subject</td><td>${esc(d.subject)}</td></tr>
    <tr><td class="label">Class</td><td>${esc(d.className)}</td><td class="label">Date</td><td>${esc(d.date)}</td></tr>
    <tr><td class="label">Month</td><td>${esc(d.month)}</td><td class="label">Year</td><td>${esc(d.year)}</td></tr>
    <tr><td class="label">Topic</td><td colspan="3">${esc(d.topic)}</td></tr>
  </table>
  <div class="plan-section"><h4>Day's Work Done</h4><p>${esc(d.workDone)}</p></div>
  ${remarkHTML(d.remark)}
  <div class="watermark">${WATERMARK_TEXT}</div>`;
}

function openViewModal(kind, id){
  const item = findItem(kind, id);
  if(!item) return;
  currentItem = { kind, id };
  qs('#modalBody').innerHTML = kind === 'plan' ? planPrintHTML(item) : diaryPrintHTML(item);
  qs('#viewModal').hidden = false;
  qs('#btnEdit').style.display = 'inline-block';
  qs('#btnDelete').style.display = 'inline-block';
}
function closeViewModal(){ qs('#viewModal').hidden = true; currentItem = null; }

/* ===========================================================
   EDIT MODAL
   =========================================================== */
function openEditModal(kind, id){
  const item = findItem(kind, id);
  if(!item) return;
  currentItem = { kind, id };
  let html = '';
  if(kind === 'plan'){
    html = `
    <label>Topic<input type="text" id="e_topic" value="${esc(item.topic)}"></label>
    <label>Subject<input type="text" id="e_subject" value="${esc(item.subject)}"></label>
    <label>Class<input type="text" id="e_class" value="${esc(item.className)}"></label>
    <label>AV Aids<input type="text" id="e_av" value="${esc(item.avAids||'')}"></label>
    <label>Objectives (one per line)<textarea id="e_objectives" rows="3">${esc(item.objectives.join('\n'))}</textarea></label>
    <label>Previous Knowledge<textarea id="e_prev" rows="2">${esc(item.previousKnowledge)}</textarea></label>
    <label>Introduction<textarea id="e_intro" rows="2">${esc(item.introduction)}</textarea></label>
    <label>Presentation (one per line)<textarea id="e_present" rows="4">${esc(item.presentation.join('\n'))}</textarea></label>
    <label>Activities (one per line)<textarea id="e_activities" rows="3">${esc(item.activities.join('\n'))}</textarea></label>
    <label>Assessment Questions (one per line)<textarea id="e_assess" rows="4">${esc(item.assessmentQuestions.join('\n'))}</textarea></label>
    <label>Homework<textarea id="e_hw" rows="2">${esc(item.homework)}</textarea></label>`;
  } else {
    html = `
    <label>Topic<input type="text" id="e_topic" value="${esc(item.topic)}"></label>
    <label>Subject<input type="text" id="e_subject" value="${esc(item.subject)}"></label>
    <label>Class<input type="text" id="e_class" value="${esc(item.className)}"></label>
    <label>Work Done<textarea id="e_work" rows="5">${esc(item.workDone)}</textarea></label>`;
  }
  qs('#editBody').innerHTML = html;
  qs('#editModal').hidden = false;
}
function closeEditModal(){ qs('#editModal').hidden = true; }

function saveEdit(){
  if(!currentItem) return;
  const { kind, id } = currentItem;
  if(kind === 'plan'){
    updateItem(kind, id, item => ({
      ...item,
      topic: qs('#e_topic').value,
      subject: qs('#e_subject').value,
      className: qs('#e_class').value,
      avAids: qs('#e_av').value,
      objectives: qs('#e_objectives').value.split('\n').filter(Boolean),
      previousKnowledge: qs('#e_prev').value,
      introduction: qs('#e_intro').value,
      presentation: qs('#e_present').value.split('\n').filter(Boolean),
      activities: qs('#e_activities').value.split('\n').filter(Boolean),
      assessmentQuestions: qs('#e_assess').value.split('\n').filter(Boolean),
      homework: qs('#e_hw').value
    }));
  } else {
    updateItem(kind, id, item => ({
      ...item,
      topic: qs('#e_topic').value,
      subject: qs('#e_subject').value,
      className: qs('#e_class').value,
      workDone: qs('#e_work').value
    }));
  }
  closeEditModal();
  refreshAll();
  toast('✅ Saved successfully');
}

/* ===========================================================
   SHARE / PRINT
   =========================================================== */
function shareItem(kind, id){
  const item = findItem(kind, id);
  if(!item) return;
  const text = kind === 'plan'
    ? `Lesson Plan\nTeacher: ${item.teacherName}\nSubject: ${item.subject}\nClass: ${item.className}\nDate: ${item.date}\nTopic: ${item.topic}\n\n${WATERMARK_TEXT}`
    : `Teacher Diary\nTeacher: ${item.teacherName}\nDate: ${item.date}\nSubject: ${item.subject}\nClass: ${item.className}\nTopic: ${item.topic}\nWork: ${item.workDone}\n\n${WATERMARK_TEXT}`;
  if(navigator.share){
    navigator.share({ title: kind === 'plan' ? 'Lesson Plan' : 'Teacher Diary', text }).catch(()=>{});
  } else if(navigator.clipboard){
    navigator.clipboard.writeText(text).then(()=> toast('📋 Copied to clipboard (share not supported on this browser)'));
  } else {
    toast('Sharing not supported on this browser');
  }
}

function printItem(kind, id){
  openViewModal(kind, id);
  setTimeout(()=> window.print(), 200);
}

/* ===========================================================
   REMARKS (Head Teacher)
   =========================================================== */
let selectedRemarkType = null;
function openRemarkModal(kind, id){
  currentItem = { kind, id };
  selectedRemarkType = null;
  qsa('.remark-btn').forEach(b => b.classList.remove('selected'));
  qs('#htComment').value = '';
  qs('#remarkModal').hidden = false;
}
function closeRemarkModal(){ qs('#remarkModal').hidden = true; }
function saveRemark(){
  if(!currentItem || !selectedRemarkType){ toast('Please select a remark type'); return; }
  const { kind, id } = currentItem;
  updateItem(kind, id, item => ({
    ...item,
    remark: {
      type: selectedRemarkType,
      comment: qs('#htComment').value,
      by: 'Head Teacher',
      at: new Date().toISOString()
    }
  }));
  closeRemarkModal();
  refreshAll();
  toast('✅ Remark submitted');
}

/* ===========================================================
   TABS & ROLE
   =========================================================== */
function switchTab(tabId){
  qsa('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  qsa('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tabId));
  refreshAll();
}
function applyRole(role){
  localStorage.setItem(STORAGE.ROLE, role);
  const headOnly = qsa('.head-only');
  headOnly.forEach(el => el.hidden = role !== 'head');
  const newPlanTab = qs('[data-tab="newPlan"]');
  if(role === 'head'){
    switchTab('review');
  } else {
    newPlanTab.hidden = false;
    switchTab('newPlan');
  }
}

function refreshAll(){
  renderPlansList(qs('#planSearch') ? qs('#planSearch').value : '');
  renderDiaryList(qs('#diarySearch') ? qs('#diarySearch').value : '');
  renderReviewList(qs('#reviewSearch') ? qs('#reviewSearch').value : '');
}

/* ===========================================================
   INIT / EVENT WIRING
   =========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // default date fields
  const today = new Date();
  qs('#planDate').value = today.toISOString().slice(0,10);
  qs('#planMonth').value = today.toLocaleString('en-US',{month:'long'});
  qs('#planYear').value = today.getFullYear();

  // role
  const savedRole = localStorage.getItem(STORAGE.ROLE) || 'teacher';
  qs('#roleSelect').value = savedRole;
  applyRole(savedRole);

  qs('#roleSelect').addEventListener('change', e => applyRole(e.target.value));

  qsa('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  // form submit
  qs('#planForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      teacherName: qs('#teacherName').value.trim(),
      subject: qs('#subject').value.trim(),
      className: qs('#className').value,
      date: qs('#planDate').value,
      month: qs('#planMonth').value,
      year: qs('#planYear').value,
      topic: qs('#topic').value.trim(),
      avAids: qs('#avAids').value.trim(),
      teacherNotes: qs('#teacherNotes').value.trim()
    };
    if(!data.teacherName || !data.subject || !data.className || !data.topic){
      toast('Please fill all required fields');
      return;
    }
    const plan = createLessonPlan(data);
    toast('✅ Lesson Plan & Diary entry generated');
    e.target.reset();
    qs('#planDate').value = today.toISOString().slice(0,10);
    qs('#planMonth').value = today.toLocaleString('en-US',{month:'long'});
    qs('#planYear').value = today.getFullYear();
    refreshAll();
    openViewModal('plan', plan.id);
  });

  // search
  qs('#planSearch').addEventListener('input', e => renderPlansList(e.target.value));
  qs('#diarySearch').addEventListener('input', e => renderDiaryList(e.target.value));
  qs('#reviewSearch').addEventListener('input', e => renderReviewList(e.target.value));

  // delegated clicks on list containers
  ['#plansListContainer','#diaryContainer','#reviewContainer'].forEach(sel => {
    qs(sel).addEventListener('click', e => {
      const btn = e.target.closest('button[data-act]');
      if(!btn) return;
      const card = e.target.closest('.item-card');
      const kind = card.dataset.kind;
      const id = card.dataset.id;
      const act = btn.dataset.act;
      if(act === 'view') openViewModal(kind, id);
      else if(act === 'edit') openEditModal(kind, id);
      else if(act === 'print') printItem(kind, id);
      else if(act === 'share') shareItem(kind, id);
      else if(act === 'delete'){
        if(confirm('Delete this item permanently?')){
          deleteItem(kind, id);
          refreshAll();
          toast('🗑️ Deleted');
        }
      } else if(act === 'remark') openRemarkModal(kind, id);
    });
  });

  // view modal actions
  qs('#modalClose').addEventListener('click', closeViewModal);
  qs('#btnPrint').addEventListener('click', () => window.print());
  qs('#btnShare').addEventListener('click', () => currentItem && shareItem(currentItem.kind, currentItem.id));
  qs('#btnEdit').addEventListener('click', () => { if(currentItem){ closeViewModal(); openEditModal(currentItem.kind, currentItem.id); } });
  qs('#btnDelete').addEventListener('click', () => {
    if(currentItem && confirm('Delete this item permanently?')){
      deleteItem(currentItem.kind, currentItem.id);
      closeViewModal();
      refreshAll();
      toast('🗑️ Deleted');
    }
  });

  // edit modal
  qs('#editModalClose').addEventListener('click', closeEditModal);
  qs('#btnSaveEdit').addEventListener('click', saveEdit);

  // remark modal
  qs('#remarkModalClose').addEventListener('click', closeRemarkModal);
  qs('#remarkOptions').addEventListener('click', e => {
    const btn = e.target.closest('.remark-btn');
    if(!btn) return;
    qsa('.remark-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedRemarkType = btn.dataset.remark;
  });
  qs('#btnSaveRemark').addEventListener('click', saveRemark);

  refreshAll();

  // register service worker
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    });
  }
});
