import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDaegs8ugmDIJ5zLn9SYDU7vKA653TUtKQ",
  authDomain: "observation-templates.firebaseapp.com",
  projectId: "observation-templates",
  storageBucket: "observation-templates.firebasestorage.app",
  messagingSenderId: "3715018818",
  appId: "1:3715018818:web:fd49e4181ecf2ba202fddb",
  measurementId: "G-1KMT8C3Q4E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const liveSyncRef = doc(db, "observation_live", "current");
const statusEl = document.getElementById('firebaseStatus');
const nurseTemplateNameEl = document.getElementById('nurseTemplateName');
const nurseSaveBtn = document.getElementById('nurseSaveBtn');
const nurseTemplatesBtn = document.getElementById('nurseTemplatesBtn');
const EXCLUDED_MEDICATION_NAMES = new Set([
  'ანტიბაქტერიული თერაპია',
  'სედაცია',
  'ბაზისური თერაპია',
  'ვაზოპრესორი',
  'insulini',
  'შაქრის კონტროლი'
]);

const NURSE_ROW_COUNT = 24;
const NURSE_LEFT_ITEMS = [
  'არასტ.ხელთათმანი',
  'შპრიცი 2მლ',
  'შპრიცი 5მლ',
  'შპრიცი 10 მლ',
  'შპრიცი 20მლ',
  'პ.ვ.კ',
  'პვკ ფიქსატორი',
  'სისტემა',
  'სტოპკოკი',
  'ეკგ ქაღალდი',
  'ლიპუჩკა',
  'გლუკ.ჩხირი',
  'სპირტი',
  'ბინტი',
  'პირბადე',
  'ერთ.ზეწარი',
  'ერთ.ქუდი',
  'ბახილები',
  'ე/ტ მილი',
  'კონტური',
  'ფილტრი',
  'ც.ვ.კ 3 არხ',
  'სტ.ხელთათმანი',
  'ბეტადინი'
];
const NURSE_RIGHT_ITEMS = [
  'წყალბ.ზეჟ',
  'კერვა 2.0',
  'ბეტაპადი',
  'შ.ბ.კ',
  'ბეგი',
  'კატეჟელე',
  'ნ/გ ზონდი',
  'პამპერსის საფენი',
  'ჟანე',
  'იანკაუერი',
  '50მლ შპრიცი',
  'სისტემის დამაგრძ.',
  'სანაციის მილი',
  'სტ.ხალათი',
  'სტ.ზეწარი',
  'სკალპელი',
  '', '', '', '', '', '', '', ''
];

function updateSyncStatus(mode) {
  if (!statusEl) return;
  if (mode === 'online') {
    statusEl.textContent = 'Firebase სინქი აქტიურია';
    statusEl.className = 'status-online';
    nurseSaveBtn?.classList.remove('disabled');
    nurseTemplatesBtn?.classList.remove('disabled');
    return;
  }
  if (mode === 'offline') {
    statusEl.textContent = 'Firestore მიუწვდომელია (local სინქი)';
    statusEl.className = 'status-offline';
    nurseSaveBtn?.classList.add('disabled');
    nurseTemplatesBtn?.classList.add('disabled');
    return;
  }
  statusEl.textContent = 'მიმდინარეობს სინქრონიზაცია...';
  statusEl.className = 'status-connecting';
  nurseSaveBtn?.classList.add('disabled');
  nurseTemplatesBtn?.classList.add('disabled');
}

function normalizeMedicationText(raw) {
  return (raw || '').replace(/\s+/g, ' ').trim();
}

function extractMedicationName(raw) {
  const text = normalizeMedicationText(raw);
  if (!text) return '';

  const excludedNormalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  for (const ex of EXCLUDED_MEDICATION_NAMES) {
    if (excludedNormalized === ex.toLowerCase()) return '';
  }

  const m = text.match(/^(sol\.?)\s+([^\s,;()]+)/i);
  if (m) {
    const sol = m[1].toLowerCase().startsWith('sol') ? 'Sol.' : m[1];
    const drug = m[2].replace(/[.;,:]+$/g, '');
    return `${sol} ${drug}.`;
  }

  return text.split(' ').slice(0, 2).join(' ');
}

function buildNurseExpenseTable(tableId, leftItems, rightItems) {
  let html = `
    <colgroup>
      <col style="width:30%">
      <col style="width:5%"><col style="width:5%"><col style="width:5%"><col style="width:5%">
      <col style="width:30%">
      <col style="width:5%"><col style="width:5%"><col style="width:5%"><col style="width:5%">
    </colgroup>
    <tr>
      <th>დასახელება</th><th colspan="4">რაოდენობა</th>
      <th>დასახელება</th><th colspan="4">რაოდენობა</th>
    </tr>
  `;
  for (let idx = 0; idx < NURSE_ROW_COUNT; idx++) {
    const left = leftItems[idx] || '';
    const right = rightItems[idx] || '';
    html += `
      <tr>
        <td class="n-name"><input class="n-name-input n-left" type="text" value="${left}"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-name"><input class="n-name-input n-right" type="text" value="${right}"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
      </tr>
    `;
  }
  document.getElementById(tableId).innerHTML = html;
}

function renderNurseTables() {
  buildNurseExpenseTable('nurseExpense1', Array(NURSE_ROW_COUNT).fill(''), Array(NURSE_ROW_COUNT).fill(''));
  buildNurseExpenseTable('nurseExpense2', NURSE_LEFT_ITEMS, NURSE_RIGHT_ITEMS);
}
renderNurseTables();

let lastSyncedMeds = [];
let hasObservationMedicationSync = false;

function applyLiveSyncPayload(payload) {
  if (!payload) return;
  const passport = payload.passport || {};
  document.getElementById('nurseHistoryNo').value = passport.hist || '';
  document.getElementById('nurseDiagnosis').value = passport.icd || '';
  document.getElementById('nurseFullName').value = passport.fullName || '';
  document.getElementById('nurseAdmissionDate').value = passport.admission || '';

  const meds = (Array.isArray(payload.medications) ? payload.medications : [])
    .map(extractMedicationName)
    .filter(Boolean);
  const leftInputs = Array.from(document.querySelectorAll('#nurseExpense1 .n-name-input.n-left'));
  const rightInputs = Array.from(document.querySelectorAll('#nurseExpense1 .n-name-input.n-right'));
  const nameInputs = leftInputs.concat(rightInputs);
  nameInputs.forEach((inp, idx) => {
    const current = inp.value.trim();
    const oldSynced = lastSyncedMeds[idx] || '';
    const nextSynced = meds[idx] || '';
    if (!current || current === oldSynced) {
      inp.value = nextSynced;
    }
  });
  lastSyncedMeds = meds.slice(0, nameInputs.length);
  hasObservationMedicationSync = meds.length > 0;
}

async function syncFromObservation() {
  updateSyncStatus('connecting');
  readLocalSync();
  try {
    const snap = await getDoc(liveSyncRef);
    if (snap.exists()) {
      applyLiveSyncPayload(snap.data());
      updateSyncStatus('online');
    } else {
      updateSyncStatus('offline');
    }
  } catch (_) {
    updateSyncStatus('offline');
    readLocalSync();
  }
}
window.syncFromObservation = syncFromObservation;

function getNurseTemplatePayload() {
  const namesPage1 = Array.from(document.querySelectorAll('#nurseExpense1 .n-name-input')).map(el => el.value.trim());
  const namesPage2 = Array.from(document.querySelectorAll('#nurseExpense2 .n-name-input')).map(el => el.value.trim());
  const qtyPage1 = Array.from(document.querySelectorAll('#nurseExpense1 .n-qty input')).map(el => el.value.trim());
  const qtyPage2 = Array.from(document.querySelectorAll('#nurseExpense2 .n-qty input')).map(el => el.value.trim());
  return {
    header: {
      historyNo: document.getElementById('nurseHistoryNo').value.trim(),
      diagnosis: document.getElementById('nurseDiagnosis').value.trim(),
      fullName: document.getElementById('nurseFullName').value.trim(),
      admissionDate: document.getElementById('nurseAdmissionDate').value
    },
    namesPage1,
    namesPage2,
    qtyPage1,
    qtyPage2,
    // legacy fields kept for backward compatibility
    names: namesPage1.concat(namesPage2),
    qty: qtyPage1.concat(qtyPage2)
  };
}

function applyNurseTemplatePayload(data, opts = {}) {
  if (!data) return;
  const onlySecondPage = Boolean(opts.onlySecondPage);
  const nameInputsPage1 = Array.from(document.querySelectorAll('#nurseExpense1 .n-name-input'));
  const nameInputsPage2 = Array.from(document.querySelectorAll('#nurseExpense2 .n-name-input'));
  const qtyInputsPage1 = Array.from(document.querySelectorAll('#nurseExpense1 .n-qty input'));
  const qtyInputsPage2 = Array.from(document.querySelectorAll('#nurseExpense2 .n-qty input'));

  const legacyNames = Array.isArray(data.names) ? data.names : [];
  const legacyQty = Array.isArray(data.qty) ? data.qty : [];
  const namesPage1 = Array.isArray(data.namesPage1) ? data.namesPage1 : legacyNames.slice(0, nameInputsPage1.length);
  const namesPage2 = Array.isArray(data.namesPage2) ? data.namesPage2 : legacyNames.slice(nameInputsPage1.length, nameInputsPage1.length + nameInputsPage2.length);
  const qtyPage1 = Array.isArray(data.qtyPage1) ? data.qtyPage1 : legacyQty.slice(0, qtyInputsPage1.length);
  const qtyPage2 = Array.isArray(data.qtyPage2) ? data.qtyPage2 : legacyQty.slice(qtyInputsPage1.length, qtyInputsPage1.length + qtyInputsPage2.length);

  if (!onlySecondPage && data.header) {
    document.getElementById('nurseHistoryNo').value = data.header.historyNo || '';
    document.getElementById('nurseDiagnosis').value = data.header.diagnosis || '';
    document.getElementById('nurseFullName').value = data.header.fullName || '';
    document.getElementById('nurseAdmissionDate').value = data.header.admissionDate || '';
  }

  if (!onlySecondPage) {
    nameInputsPage1.forEach((el, i) => {
      el.value = namesPage1?.[i] || '';
    });
    qtyInputsPage1.forEach((el, i) => {
      el.value = qtyPage1?.[i] || '';
    });
  }

  nameInputsPage2.forEach((el, i) => {
    el.value = namesPage2?.[i] || '';
  });
  qtyInputsPage2.forEach((el, i) => {
    el.value = qtyPage2?.[i] || '';
  });
}

window.openNurseTemplateModal = function() {
  if (nurseTemplatesBtn?.classList.contains('disabled')) {
    alert('ინტერნეტი არ არის — შაბლონები მიუწვდომელია');
    return;
  }
  loadNurseTemplates();
  document.getElementById('nurseTemplateModal').style.display = 'flex';
};

window.closeNurseTemplateModal = function() {
  document.getElementById('nurseTemplateModal').style.display = 'none';
};

async function loadNurseTemplates() {
  const items = document.getElementById('nurseTemplateItems');
  const noTemplates = document.getElementById('nurseNoTemplates');
  items.innerHTML = '';
  try {
    const qRef = query(collection(db, "nurse_templates"), orderBy("createdAt", "desc"));
    const snap = await getDocs(qRef);
    if (snap.empty) {
      noTemplates.style.display = 'block';
      return;
    }
    noTemplates.style.display = 'none';
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement('div');
      div.className = 'template-item';
      div.innerHTML = `
        <strong>${data.name}</strong>
        <div>
          <button class="btn" style="padding:6px 12px; font-size:12px; margin-left:8px;" onclick="loadNurseTemplateById('${docSnap.id}')">ჩატვირთვა</button>
          <button class="btn" style="padding:6px 12px; font-size:12px; background:#991b1b;" onclick="deleteNurseTemplateById('${docSnap.id}', this)">წაშლა</button>
        </div>
      `;
      items.appendChild(div);
    });
  } catch (err) {
    alert('შაბლონების წამოღების შეცდომა: ' + err.message);
  }
}

window.loadNurseTemplateById = async function(id) {
  try {
    const snap = await getDoc(doc(db, "nurse_templates", id));
    if (snap.exists()) {
      applyNurseTemplatePayload(snap.data().payload, { onlySecondPage: hasObservationMedicationSync });
      alert(`შაბლონი „${snap.data().name}“ ჩაიტვირთა!`);
      window.closeNurseTemplateModal();
    }
  } catch (err) {
    alert('ჩატვირთვის შეცდომა: ' + err.message);
  }
};

window.deleteNurseTemplateById = async function(id, btn) {
  if (!confirm('დარწმუნებული ხართ?')) return;
  try {
    await deleteDoc(doc(db, "nurse_templates", id));
    btn.closest('.template-item')?.remove();
    if (!document.getElementById('nurseTemplateItems').hasChildNodes()) {
      document.getElementById('nurseNoTemplates').style.display = 'block';
    }
  } catch (err) {
    alert('წაშლის შეცდომა: ' + err.message);
  }
};

window.saveNurseTemplate = async function() {
  if (nurseSaveBtn?.classList.contains('disabled')) {
    alert('ინტერნეტი არ არის — შენახვა შეუძლებელია');
    return;
  }
  const name = nurseTemplateNameEl?.value.trim();
  if (!name) {
    alert('შეიყვანეთ შაბლონის სახელი!');
    return;
  }
  try {
    await addDoc(collection(db, "nurse_templates"), {
      name,
      payload: getNurseTemplatePayload(),
      createdAt: serverTimestamp()
    });
    if (nurseTemplateNameEl) nurseTemplateNameEl.value = '';
    alert(`შაბლონი „${name}“ წარმატებით შენახულია!`);
  } catch (err) {
    alert('შენახვის შეცდომა: ' + err.message);
  }
};

window.clearNurseAll = function() {
  if (!confirm('გსურთ ექთნის ფურცლის სრულად გასუფთავება?')) return;
  document.getElementById('nurseHistoryNo').value = '';
  document.getElementById('nurseDiagnosis').value = '';
  document.getElementById('nurseFullName').value = '';
  document.getElementById('nurseAdmissionDate').value = '';
  renderNurseTables();
  clearSelection();
  lastSyncedMeds = [];
  hasObservationMedicationSync = false;
  attachSelectionHandlers();
  document.querySelectorAll('[data-page]').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-page=\"1\"]')?.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('p1')?.classList.add('active');
};

function readLocalSync() {
  try {
    const raw = localStorage.getItem('observation_live_sync');
    if (!raw) return;
    applyLiveSyncPayload(JSON.parse(raw));
  } catch (_) {}
}

document.querySelectorAll('[data-page]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('p' + btn.dataset.page).classList.add('active');
    document.querySelectorAll('[data-page]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

let isSelecting = false;
let selectedInputs = new Set();
let lastFocusedInput = null;

function clearSelection() {
  selectedInputs.forEach(inp => inp.classList.remove('selected-cell'));
  selectedInputs.clear();
}

function addToSelection(input) {
  selectedInputs.add(input);
  input.classList.add('selected-cell');
}

function removeFromSelection(input) {
  selectedInputs.delete(input);
  input.classList.remove('selected-cell');
}

function toggleSelection(input) {
  if (selectedInputs.has(input)) {
    removeFromSelection(input);
  } else {
    addToSelection(input);
  }
}

function getCellPosition(input) {
  const cell = input.closest('td,th');
  const row = cell?.parentElement;
  const table = row?.closest('table');
  if (!cell || !row || !table) return null;
  const rows = Array.from(table.rows);
  const rowIndex = rows.indexOf(row);
  const cells = Array.from(row.cells);
  const cellIndex = cells.indexOf(cell);
  return { table, rowIndex, cellIndex };
}

function selectRange(fromInput, toInput) {
  const fromPos = getCellPosition(fromInput);
  const toPos = getCellPosition(toInput);
  if (!fromPos || !toPos || fromPos.table !== toPos.table) return;

  const rows = Array.from(fromPos.table.rows);
  const minRow = Math.min(fromPos.rowIndex, toPos.rowIndex);
  const maxRow = Math.max(fromPos.rowIndex, toPos.rowIndex);
  const minCol = Math.min(fromPos.cellIndex, toPos.cellIndex);
  const maxCol = Math.max(fromPos.cellIndex, toPos.cellIndex);

  clearSelection();
  for (let r = minRow; r <= maxRow; r++) {
    const row = rows[r];
    for (let c = minCol; c <= maxCol; c++) {
      const cell = row.cells[c];
      if (!cell) continue;
      const inp = cell.querySelector('input');
      if (inp) addToSelection(inp);
    }
  }
}

function startSelection(e) {
  if (e.button !== 0) return;
  if (e.ctrlKey || e.metaKey) {
    toggleSelection(this);
    return;
  }
  if (e.shiftKey && lastFocusedInput && lastFocusedInput.isConnected) {
    selectRange(lastFocusedInput, this);
    return;
  }
  clearSelection();
  isSelecting = true;
  addToSelection(this);
}

function mouseEnterDuringSelection() {
  if (isSelecting) addToSelection(this);
}

function attachSelectionHandlers() {
  document.querySelectorAll('input[type="text"], input[type="date"]').forEach(inp => {
    if (inp.dataset.selectionBound === '1') return;
    inp.addEventListener('mousedown', startSelection);
    inp.addEventListener('mouseenter', mouseEnterDuringSelection);
    inp.addEventListener('focus', () => { lastFocusedInput = inp; });
    inp.dataset.selectionBound = '1';
  });
}

document.addEventListener('mouseup', () => { isSelecting = false; });
attachSelectionHandlers();

document.addEventListener('keydown', function(e) {
  const el = e.target;
  if (!(el instanceof HTMLInputElement)) return;
  if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.key)) return;

  const cell = el.closest('td,th');
  const table = cell?.closest('table');
  if (!cell || !table) return;

  const inputsInTable = Array.from(table.querySelectorAll('input[type="text"], input[type="date"]'));
  const idx = inputsInTable.indexOf(el);

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (idx < inputsInTable.length - 1) inputsInTable[idx + 1].focus();
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (idx > 0) inputsInTable[idx - 1].focus();
    return;
  }

  const row = cell.parentElement;
  const rows = Array.from(table.rows);
  const rowIndex = rows.indexOf(row);
  const cells = Array.from(row.cells);
  const cellIndex = cells.indexOf(cell);

  const moveVertical = (delta) => {
    const targetRowIndex = rowIndex + delta;
    if (targetRowIndex < 0 || targetRowIndex >= rows.length) return;
    const targetRow = rows[targetRowIndex];
    const targetCell = targetRow.cells[cellIndex] || targetRow.cells[targetRow.cells.length - 1];
    const targetInput = targetCell?.querySelector('input');
    if (targetInput) targetInput.focus();
  };

  if (e.key === 'Enter' || e.key === 'ArrowDown') {
    e.preventDefault();
    moveVertical(1);
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    moveVertical(-1);
  }
});

updateSyncStatus('connecting');
readLocalSync();
syncFromObservation();
window.addEventListener('storage', (e) => {
  if (e.key !== 'observation_live_sync' || !e.newValue) return;
  try {
    applyLiveSyncPayload(JSON.parse(e.newValue));
  } catch (_) {}
});

onSnapshot(liveSyncRef, (snap) => {
  updateSyncStatus('online');
  if (snap.exists()) {
    applyLiveSyncPayload(snap.data());
  } else {
    readLocalSync();
  }
}, async () => {
  updateSyncStatus('offline');
  try {
    const fallback = await getDoc(liveSyncRef);
    if (fallback.exists()) applyLiveSyncPayload(fallback.data());
  } catch (_) {}
  readLocalSync();
});
