import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
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
    return;
  }
  if (mode === 'offline') {
    statusEl.textContent = 'Firestore მიუწვდომელია (local სინქი)';
    statusEl.className = 'status-offline';
    return;
  }
  statusEl.textContent = 'მიმდინარეობს სინქრონიზაცია...';
  statusEl.className = 'status-connecting';
}

function extractMedicationName(raw) {
  const text = (raw || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';

  const stopToken = /(\d|mg|ml|mcg|iu|g\/|%|x\b|i\/v|i\.v|i\/m|i\.m|p\/o|p\.o)/i;
  const tokens = text.split(' ');
  const out = [];
  for (const t of tokens) {
    if (out.length > 0 && stopToken.test(t)) break;
    out.push(t);
    if (out.length >= 5) break;
  }
  let name = out.join(' ').trim();
  if (!name) name = text;
  if (/^sol\.?/i.test(name) && !/[.!?]$/.test(name)) name += '.';
  return name;
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
        <td class="n-name"><input class="n-name-input" type="text" value="${left}"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-name"><input class="n-name-input" type="text" value="${right}"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
        <td class="n-qty"><input type="text"></td>
      </tr>
    `;
  }
  document.getElementById(tableId).innerHTML = html;
}

buildNurseExpenseTable('nurseExpense1', Array(NURSE_ROW_COUNT).fill(''), Array(NURSE_ROW_COUNT).fill(''));
buildNurseExpenseTable('nurseExpense2', NURSE_LEFT_ITEMS, NURSE_RIGHT_ITEMS);

let lastSyncedMeds = [];

function applyLiveSyncPayload(payload) {
  if (!payload) return;
  const passport = payload.passport || {};
  document.getElementById('nurseHistoryNo').value = passport.hist || '';
  document.getElementById('nurseDiagnosis').value = passport.icd || '';
  document.getElementById('nurseFullName').value = passport.fullName || '';
  document.getElementById('nurseAdmissionDate').value = passport.admission || '';

  const meds = (Array.isArray(payload.medications) ? payload.medications : [])
    .map(extractMedicationName)
    .filter(name => name && !EXCLUDED_MEDICATION_NAMES.has(name));
  const nameInputs = Array.from(document.querySelectorAll('#nurseExpense1 .n-name-input'));
  nameInputs.forEach((inp, idx) => {
    const current = inp.value.trim();
    const oldSynced = lastSyncedMeds[idx] || '';
    const nextSynced = meds[idx] || '';
    if (!current || current === oldSynced) {
      inp.value = nextSynced;
    }
  });
  lastSyncedMeds = meds.slice(0, nameInputs.length);
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
