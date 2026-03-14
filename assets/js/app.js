  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDocsFromServer,
    doc,
    setDoc,
    deleteDoc,
    orderBy,
    query,
    limit,
    serverTimestamp,
    getDoc
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

  const clinicFirebaseConfig = {
    apiKey: "AIzaSyCDze1tz15HdKZVSPOPW_-7t-9ag4AiZYs",
    authDomain: "clinic-inpatient.firebaseapp.com",
    projectId: "clinic-inpatient",
    storageBucket: "clinic-inpatient.firebasestorage.app",
    messagingSenderId: "586729386322",
    appId: "1:586729386322:web:17a92324784c2c988a4a8b"
  };

  const app = initializeApp(firebaseConfig);
  const clinicApp = initializeApp(clinicFirebaseConfig, 'clinic-inpatient-observation');
  const db = getFirestore(app);
  const clinicDb = getFirestore(clinicApp);

  const params = new URLSearchParams(window.location.search);
  const decodeParam = key => decodeURIComponent(params.get(key) || '');
  const normalizeRoomCollection = value => {
    const normalized = String(value || '').trim();
    if (!normalized) return '';
    if (normalized === 'observation') return 'observation_room';
    if (normalized === 'shock') return 'shock_room';
    return normalized;
  };
  const padDatePart = value => String(value || '').padStart(2, '0');
  const formatTypedDate = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      return `${padDatePart(isoMatch[3])}.${padDatePart(isoMatch[2])}.${isoMatch[1]}`;
    }
    const yearFirstMatch = raw.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if (yearFirstMatch) {
      return `${padDatePart(yearFirstMatch[3])}.${padDatePart(yearFirstMatch[2])}.${yearFirstMatch[1]}`;
    }

    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (!digits) return '';
    if (digits.length === 8 && /^(19|20)\d{6}$/.test(digits)) {
      return `${digits.slice(6, 8)}.${digits.slice(4, 6)}.${digits.slice(0, 4)}`;
    }
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  };
  const normalizeDisplayDate = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const [datePart = ''] = raw.split('T');
    const normalized = datePart.trim();
    if (!normalized) return '';

    const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      return `${padDatePart(isoMatch[3])}.${padDatePart(isoMatch[2])}.${isoMatch[1]}`;
    }
    const yearFirstMatch = normalized.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if (yearFirstMatch) {
      return `${padDatePart(yearFirstMatch[3])}.${padDatePart(yearFirstMatch[2])}.${yearFirstMatch[1]}`;
    }

    const partsMatch = normalized.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (partsMatch) {
      const year = partsMatch[3].length === 2 ? `20${partsMatch[3]}` : partsMatch[3];
      return `${padDatePart(partsMatch[1])}.${padDatePart(partsMatch[2])}.${year}`;
    }

    const digits = normalized.replace(/\D/g, '');
    if (digits.length === 8) {
      if (/^(19|20)\d{6}$/.test(digits)) {
        return `${digits.slice(6, 8)}.${digits.slice(4, 6)}.${digits.slice(0, 4)}`;
      }
      return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
    }

    return formatTypedDate(normalized);
  };
  const todayDisplay = () => {
    const now = new Date();
    return `${padDatePart(now.getDate())}.${padDatePart(now.getMonth() + 1)}.${now.getFullYear()}`;
  };
  const initializeDateFields = () => {
    document.querySelectorAll('.date-field').forEach(el => {
      if (!(el instanceof HTMLInputElement) || el.dataset.dateBound === '1') return;
      el.value = normalizeDisplayDate(el.value);
      el.addEventListener('input', () => {
        const nextValue = formatTypedDate(el.value);
        if (nextValue !== el.value) el.value = nextValue;
      });
      el.addEventListener('blur', () => {
        const nextValue = normalizeDisplayDate(el.value);
        if (nextValue !== el.value) el.value = nextValue;
      });
      el.dataset.dateBound = '1';
    });
  };
  const parseAdmitDate = value => normalizeDisplayDate(value);
  const calcAge = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const dob = new Date(raw);
    if (Number.isNaN(dob.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 0 ? String(age) : '';
  };

  const patientContext = {
    pid: params.get('pid') || '',
    roomCollection: normalizeRoomCollection(params.get('room')),
    fullName: decodeParam('name'),
    bed: decodeParam('bed'),
    history: decodeParam('history'),
    personalId: decodeParam('personal_id'),
    dob: decodeParam('dob'),
    address: decodeParam('address'),
    admitDate: parseAdmitDate(decodeParam('admit_dt')),
    doctor: decodeParam('doctor'),
    icd: decodeParam('icd10_code') || decodeParam('icd'),
    department: decodeParam('dept') || 'ER'
  };
  const patientDocId = patientContext.pid && patientContext.roomCollection
    ? `${patientContext.roomCollection}_${patientContext.pid}`
    : '';
  const patientDocRef = patientContext.pid && patientContext.roomCollection
    ? doc(clinicDb, 'observation_sheets', patientDocId)
    : null;

  const statusEl = document.getElementById('firebaseStatus');
  const templatesBtn = document.getElementById('templatesBtn');
  const templateSaveBtn = document.getElementById('templateSaveBtn');
  const patientSaveBtn = document.getElementById('patientSaveBtn');
  const LIVE_SYNC_STORAGE_KEY = 'observation_live_sync';
  const PASSPORT_IDS = ['fullName', 'hist', 'gender', 'age', 'admission', 'today', 'icd', 'dept', 'blood', 'room', 'allergy'];
  const DATE_FIELD_IDS = new Set(['admission', 'today']);
  const EXCLUDED_MEDICATION_NAMES = new Set([
    'ანტიბაქტერიული თერაპია',
    'სედაცია',
    'ბაზისური თერაპია',
    'ვაზოპრესორი',
    'insulini',
    'შაქრის კონტროლი'
  ]);
  let liveSyncTimer = null;
  let patientSaveTimer = null;
  let historyLookupTimer = null;
  let patientSheetReady = !patientDocRef;
  let applyingPatientSheet = false;
  let lastLoadedHistoryNumber = String(patientContext.history || '').trim();
  let patientSaveFeedbackTimer = null;

  function updateFirebaseStatus(connected) {
    if (connected) {
      statusEl.textContent = "Firebase ხელმისაწვდომია - შაბლონები მუშაობს";
      statusEl.className = "status-online";
      templatesBtn.classList.remove('disabled');
      templateSaveBtn.classList.remove('disabled');
    } else {
      statusEl.textContent = "ოფლაინ რეჟიმი - შაბლონები მიუწვდომელია, local გადატანა მუშაობს";
      statusEl.className = "status-offline";
      templatesBtn.classList.add('disabled');
      templateSaveBtn.classList.add('disabled');
    }
  }

  function resetPatientSaveButton() {
    if (!patientSaveBtn) return;
    patientSaveBtn.textContent = 'სეივი';
  }

  function flashPatientSaveFeedback(text) {
    if (!patientSaveBtn) return;
    patientSaveBtn.textContent = text;
    if (patientSaveFeedbackTimer) clearTimeout(patientSaveFeedbackTimer);
    patientSaveFeedbackTimer = setTimeout(resetPatientSaveButton, 1800);
  }

  async function checkFirebaseConnection() {
    try {
      await getDocsFromServer(query(collection(db, "observation_templates"), limit(1)));
      updateFirebaseStatus(true);
    } catch (err) {
      updateFirebaseStatus(false);
    }
  }

  window.addEventListener('online', () => {
    statusEl.textContent = "ხელახლა დაკავშირება...";
    statusEl.className = "status-connecting";
    setTimeout(checkFirebaseConnection, 1000);
  });
  window.addEventListener('offline', () => updateFirebaseStatus(false));
  checkFirebaseConnection();

  // საათობრივი ბადე
  const HOURS = [...Array(16).keys()].map(i => i + 9).concat([...Array(9).keys()].map(i => i + 1));

  function updName() {
    const name = document.getElementById('fullName').value.trim() || 'პაციენტის სახელი და გვარი';
    const n2 = document.getElementById('name2');
    if (n2) n2.textContent = name;
  }
  window.updName = updName;

  function getPassportData() {
    const passport = {};
    PASSPORT_IDS.forEach(id => {
      const el = document.getElementById(id);
      const rawValue = el ? (el.value ?? '').toString().trim() : '';
      passport[id] = DATE_FIELD_IDS.has(id) ? normalizeDisplayDate(rawValue) : rawValue;
    });
    return passport;
  }

  function setPassportData(data, opts = {}) {
    const preserveExisting = Boolean(opts.preserveExisting);
    PASSPORT_IDS.forEach(id => {
      if (!(id in (data || {}))) return;
      const el = document.getElementById(id);
      if (!el) return;
      const currentValue = (el.value ?? '').toString().trim();
      const rawNextValue = (data?.[id] ?? '').toString();
      const nextValue = DATE_FIELD_IDS.has(id) ? normalizeDisplayDate(rawNextValue) : rawNextValue;
      if (preserveExisting && currentValue) return;
      el.value = nextValue;
    });
    updName();
  }

  function applyPatientDefaults(opts = {}) {
    const preserveExisting = Boolean(opts.preserveExisting);
    const defaults = {
      fullName: patientContext.fullName,
      hist: patientContext.history,
      age: calcAge(patientContext.dob),
      admission: patientContext.admitDate,
      icd: patientContext.icd,
      dept: patientContext.department || 'ER',
      room: patientContext.bed
    };
    if (!preserveExisting) {
      defaults.today = todayDisplay();
    }
    setPassportData(defaults, { preserveExisting });
    const deptEl = document.getElementById('dept');
    if (deptEl && !deptEl.value.trim()) deptEl.value = 'ER';
    const todayEl = document.getElementById('today');
    if (todayEl && !todayEl.value) todayEl.value = todayDisplay();
  }

  function normalizeHistoryNumber(value) {
    return String(value || '').trim();
  }

  function getCurrentHistoryNumber() {
    const histEl = document.getElementById('hist');
    return normalizeHistoryNumber(histEl ? histEl.value : patientContext.history);
  }

  function buildHistoryDocId(historyNumber) {
    const normalized = normalizeHistoryNumber(historyNumber);
    return normalized ? `history_${encodeURIComponent(normalized)}` : '';
  }

  function getHistoryDocRef(historyNumber = getCurrentHistoryNumber()) {
    const docId = buildHistoryDocId(historyNumber);
    return docId ? doc(clinicDb, 'observation_sheets', docId) : null;
  }

  function getPatientDraftStorageKey(historyNumber = getCurrentHistoryNumber()) {
    if (patientDocRef) return `observation_patient_sheet_${patientDocId}`;
    const normalized = normalizeHistoryNumber(historyNumber);
    return normalized ? `observation_history_sheet_${encodeURIComponent(normalized)}` : '';
  }

  function hasMeaningfulObservationData() {
    const passport = getPassportData();
    const headerKeys = ['fullName', 'gender', 'age', 'admission', 'icd', 'blood', 'room', 'allergy'];
    if (headerKeys.some(key => Boolean(passport[key]))) return true;

    const hasMedicationName = Array.from(document.querySelectorAll('#meds tr:not(:first-child) .drug input'))
      .some(inp => {
        const value = inp.value.trim();
        return value && !EXCLUDED_MEDICATION_NAMES.has(value);
      });
    if (hasMedicationName) return true;

    const hasMedicationDose = Array.from(document.querySelectorAll('#meds .dose input'))
      .some(inp => inp.value.trim());
    if (hasMedicationDose) return true;

    return Array.from(document.querySelectorAll('#vitals input, #enteral input, #other input'))
      .some(inp => inp.value.trim());
  }

  function getPatientSheetPayload() {
    const currentHistory = getCurrentHistoryNumber() || patientContext.history;
    return {
      header: getPassportData(),
      form: getFormData(),
      historyNumber: currentHistory,
      patientContext: {
        pid: patientContext.pid,
        roomCollection: patientContext.roomCollection,
        fullName: patientContext.fullName,
        bed: patientContext.bed,
        history: currentHistory,
        personalId: patientContext.personalId,
        dob: patientContext.dob,
        address: patientContext.address,
        admitDate: patientContext.admitDate,
        doctor: patientContext.doctor,
        icd: patientContext.icd,
        department: patientContext.department || 'ER'
      },
      updatedAtMs: Date.now()
    };
  }

  function applyPatientSheetPayload(data) {
    if (!data) return;
    applyingPatientSheet = true;
    if (data.header) setPassportData(data.header);
    applyFormData(data.form || data.payload || {});
    applyPatientDefaults({ preserveExisting: true });
    lastLoadedHistoryNumber = normalizeHistoryNumber(data.historyNumber || data.header?.hist || '');
    applyingPatientSheet = false;
  }

  function readPatientDraft(historyNumber = getCurrentHistoryNumber()) {
    const storageKey = getPatientDraftStorageKey(historyNumber);
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writePatientDraft(payload, historyNumber = getCurrentHistoryNumber()) {
    const storageKey = getPatientDraftStorageKey(historyNumber);
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (_) {}
  }

  async function loadHistorySheetPayload(historyNumber = getCurrentHistoryNumber()) {
    const historyDocRef = getHistoryDocRef(historyNumber);
    if (!historyDocRef) return null;
    try {
      const snap = await getDoc(historyDocRef);
      return snap.exists() ? (snap.data()?.observation_sheet || null) : null;
    } catch (_) {
      return null;
    }
  }

  async function savePatientSheetNow(opts = {}) {
    if (applyingPatientSheet || !patientSheetReady) {
      return { ok: false, reason: 'not-ready' };
    }
    const payload = getPatientSheetPayload();
    if (!patientDocRef && !normalizeHistoryNumber(payload.historyNumber)) {
      return { ok: false, reason: 'missing-history' };
    }
    lastLoadedHistoryNumber = normalizeHistoryNumber(payload.historyNumber);
    writePatientDraft(payload, payload.historyNumber);
    const writes = [];

    if (patientDocRef) {
      writes.push(setDoc(patientDocRef, {
        observation_sheet: {
          ...payload,
          sheetType: 'patient',
          updatedAt: serverTimestamp()
        },
        observation_sheet_updated_at: serverTimestamp()
      }, { merge: true }));
    }

    const historyDocRef = getHistoryDocRef(payload.historyNumber);
    if (historyDocRef) {
      writes.push(setDoc(historyDocRef, {
        observation_sheet: {
          ...payload,
          sheetType: 'history',
          linkedPatientDocId: patientDocId || null,
          updatedAt: serverTimestamp()
        },
        observation_sheet_updated_at: serverTimestamp()
      }, { merge: true }));
    }

    if (!writes.length) {
      return { ok: true, localOnly: true, reason: 'local-only' };
    }
    try {
      await Promise.all(writes);
      return { ok: true, localOnly: false };
    } catch (err) {
      console.warn('Observation sheet save failed:', err);
      return { ok: true, localOnly: true, reason: 'offline' };
    }
  }

  function schedulePatientSheetSave() {
    if (applyingPatientSheet || !patientSheetReady) return;
    if (!patientDocRef && !getCurrentHistoryNumber()) return;
    if (patientSaveTimer) clearTimeout(patientSaveTimer);
    patientSaveTimer = setTimeout(() => {
      savePatientSheetNow();
    }, 450);
  }

  async function hydrateByHistoryNumber(historyNumber, opts = {}) {
    const normalized = normalizeHistoryNumber(historyNumber);
    if (!normalized) return false;
    if (!opts.force && normalized === lastLoadedHistoryNumber) return false;
    if (!opts.force && hasMeaningfulObservationData()) return false;

    const payload = await loadHistorySheetPayload(normalized) || readPatientDraft(normalized);
    lastLoadedHistoryNumber = normalized;
    if (!payload) return false;

    applyPatientSheetPayload(payload);
    return true;
  }

  function scheduleHistoryLookup() {
    if (patientDocRef || applyingPatientSheet || !patientSheetReady) return;
    if (historyLookupTimer) clearTimeout(historyLookupTimer);
    historyLookupTimer = setTimeout(() => {
      hydrateByHistoryNumber(getCurrentHistoryNumber());
    }, 420);
  }

  window.savePatientSheet = async function(manual = false) {
    if (patientSaveTimer) {
      clearTimeout(patientSaveTimer);
      patientSaveTimer = null;
    }
    const result = await savePatientSheetNow({ manual });
    if (!manual) return result;

    if (!result.ok && result.reason === 'missing-history') {
      flashPatientSaveFeedback('ისტორია?');
      alert('შეიყვანეთ ისტორიის ნომერი ან გახსენით ფურცელი პაციენტიდან.');
      return result;
    }
    if (!result.ok) {
      flashPatientSaveFeedback('ვერ შეინახა');
      alert('შენახვა ვერ შესრულდა. სცადეთ თავიდან.');
      return result;
    }

    flashPatientSaveFeedback(result.localOnly ? 'ლოკალურად შეინახა' : 'შენახულია');
    if (result.localOnly) {
      alert('ინფორმაცია ლოკალურად შეინახა. ინტერნეტის აღდგენის შემდეგ ხელახლა დააჭირეთ სეივს.');
    }
    return result;
  };

  async function initializePatientSheet() {
    applyPatientDefaults({ preserveExisting: false });
    const initialHistory = getCurrentHistoryNumber() || patientContext.history;
    const draftPayload = readPatientDraft(initialHistory);
    let loadedPayload = null;

    try {
      if (patientDocRef) {
        const snap = await getDoc(patientDocRef);
        loadedPayload = snap.exists() ? (snap.data()?.observation_sheet || null) : null;
      }
      if (!loadedPayload) loadedPayload = await loadHistorySheetPayload(initialHistory);
      if (!loadedPayload) loadedPayload = draftPayload;
    } catch (err) {
      console.warn('Observation sheet load failed:', err);
      loadedPayload = loadedPayload || draftPayload;
    }

    if (loadedPayload) {
      applyPatientSheetPayload(loadedPayload);
    } else {
      applyPatientDefaults({ preserveExisting: true });
    }

    patientSheetReady = true;
    scheduleLiveSync();
    if (loadedPayload && patientDocRef) schedulePatientSheetSave();
  }

  // მედიკაციების ცხრილი
  let medsHTML = `<tr><th class="num">№</th><th class="drug">ინფუზიური-ტრანსფ.თერაპია</th>${HOURS.map(h => `<th class="time">${h}</th>`).join('')}</tr>`;
  for (let i = 1; i <= 34; i++) {
    let drugText = '';
    if (i === 6)  drugText = 'ანტიბაქტერიული თერაპია';
    if (i === 12) drugText = 'სედაცია';
    if (i === 18) drugText = 'ბაზისური თერაპია';
    if (i === 28) drugText = 'ვაზოპრესორი';
    if (i === 33) drugText = 'insulini';
    if (i === 34) drugText = 'შაქრის კონტროლი';

    medsHTML += `<tr>
      <td class="num">${i}.</td>
      <td class="drug"><input type="text" value="${drugText}"></td>
      ${HOURS.map(() => `<td class="dose"><input type="text"></td>`).join('')}
    </tr>`;
  }
  document.getElementById('meds').innerHTML = medsHTML;


  // vitals
  const vit = ['პულსი','სისტ.','დიასტ.','MAP','ტ°','სუნთქვა','CVP','FiO2','SaO2'];
  let vitHTML = `<tr><th class="drug">პარამეტრი</th>${HOURS.map(h => `<th class="time">${h}</th>`).join('')}</tr>`;
  vit.forEach(p => {
    vitHTML += `<tr><td class="drug">${p}</td>${HOURS.map(() => `<td><input type="text"></td>`).join('')}</tr>`;
  });
  document.getElementById('vitals').innerHTML = vitHTML;

  // enteral
  document.getElementById('enteral').innerHTML = `
    <tr><th class="drug">ენტერალური კვება</th><th>დილა</th><th>შუადღე</th><th>საღამო</th></tr>
    <tr><td class="drug">მლ</td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td></tr>
  `;

  // other
  const oth = ['დიურეზი','დეფეკაცია','ოყნა','დრენაჟი','ბალანსი'];
  let othHTML = `<tr><th class="drug">პარამეტრი</th>${HOURS.map(h => `<th class="time">${h}</th>`).join('')}</tr>`;
  oth.forEach(p => {
    othHTML += `<tr><td class="drug">${p}</td>${HOURS.map(() => `<td><input type="text"></td>`).join('')}</tr>`;
  });
  document.getElementById('other').innerHTML = othHTML;

  function collectLiveSyncPayload() {
    const medications = Array.from(document.querySelectorAll('#meds tr:not(:first-child) .drug input'))
      .map(inp => inp.value.trim())
      .filter(name => name && !EXCLUDED_MEDICATION_NAMES.has(name));

    return {
      passport: getPassportData(),
      medications,
      updatedAtMs: Date.now()
    };
  }

  async function pushLiveSyncNow() {
    const payload = collectLiveSyncPayload();
    try {
      localStorage.setItem(LIVE_SYNC_STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {}
  }

  function scheduleLiveSync() {
    if (liveSyncTimer) clearTimeout(liveSyncTimer);
    liveSyncTimer = setTimeout(pushLiveSyncNow, 300);
  }

  PASSPORT_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      scheduleLiveSync();
      if (id === 'hist' && !patientDocRef) {
        if (hasMeaningfulObservationData()) {
          schedulePatientSheetSave();
        } else {
          scheduleHistoryLookup();
        }
        return;
      }
      schedulePatientSheetSave();
    });
    el.addEventListener('change', () => {
      scheduleLiveSync();
      if (id === 'hist' && !patientDocRef) {
        if (hasMeaningfulObservationData()) {
          schedulePatientSheetSave();
        } else {
          scheduleHistoryLookup();
        }
        return;
      }
      schedulePatientSheetSave();
    });
  });
  document.getElementById('meds').addEventListener('input', (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    scheduleLiveSync();
    schedulePatientSheetSave();
  });
  document.getElementById('vitals').addEventListener('input', schedulePatientSheetSave);
  document.getElementById('enteral').addEventListener('input', schedulePatientSheetSave);
  document.getElementById('other').addEventListener('input', schedulePatientSheetSave);

  // გვერდების გადართვა
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('p' + btn.dataset.page).classList.add('active');
      document.querySelectorAll('[data-page]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ---- მრავალუჯრედიანი მონიშვნა (Excel სტილი) ----
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
    if (!fromPos || !toPos) return;
    if (fromPos.table !== toPos.table) return;

    const table = fromPos.table;
    const rows = Array.from(table.rows);

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
    if (e.button !== 0) return; // მხოლოდ მარცხენა კლიკი

    // Ctrl/Cmd+Click -> toggle ერთი უჯრა
    if (e.ctrlKey || e.metaKey) {
      toggleSelection(this);
      return;
    }

    // Shift+Click -> დიაპაზონი lastFocusedInput-დან აქამდე
    if (e.shiftKey && lastFocusedInput && lastFocusedInput.isConnected) {
      selectRange(lastFocusedInput, this);
      return;
    }

    // ჩვეულებრივი click + drag – ახალი მონიშვნა
    clearSelection();
    isSelecting = true;
    addToSelection(this);
  }

  function mouseEnterDuringSelection() {
    if (!isSelecting) return;
    addToSelection(this);
  }

  function attachSelectionHandlers() {
    document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]').forEach(inp => {
      if (inp.dataset.selectionBound === '1') return;
      inp.addEventListener('mousedown', startSelection);
      inp.addEventListener('mouseenter', mouseEnterDuringSelection);
      inp.addEventListener('focus', () => {
        lastFocusedInput = inp;
      });
      inp.dataset.selectionBound = '1';
    });
  }

  document.addEventListener('mouseup', () => {
    isSelecting = false;
  });

  // რამდენიმე უჯრის ერთად დაკოპირება
  function copySelectedToClipboard() {
    if (selectedInputs.size === 0) return;
    const arr = Array.from(selectedInputs).filter(inp => inp.isConnected);
    if (arr.length === 0) return;

    const firstPos = getCellPosition(arr[0]);
    if (!firstPos) return;

    // მხოლოდ იგივე ცხრილიდან
    const positions = arr
      .map(inp => {
        const pos = getCellPosition(inp);
        return pos && pos.table === firstPos.table ? { input: inp, ...pos } : null;
      })
      .filter(Boolean);

    if (!positions.length) return;

    const minRow = Math.min(...positions.map(p => p.rowIndex));
    const maxRow = Math.max(...positions.map(p => p.rowIndex));
    const minCol = Math.min(...positions.map(p => p.cellIndex));
    const maxCol = Math.max(...positions.map(p => p.cellIndex));

    const rowsOut = [];
    for (let r = minRow; r <= maxRow; r++) {
      const colsOut = [];
      for (let c = minCol; c <= maxCol; c++) {
        const match = positions.find(p => p.rowIndex === r && p.cellIndex === c);
        colsOut.push(match ? match.input.value : '');
      }
      rowsOut.push(colsOut.join('\t'));
    }
    const text = rowsOut.join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  // რამდენიმე უჯრაში ჩაფეისთება
  function pasteTextGrid(text, startInput) {
    const pos = getCellPosition(startInput);
    if (!pos) {
      startInput.value = text;
      return;
    }
    const { table, rowIndex, cellIndex } = pos;
    const tblRows = Array.from(table.rows);
    const lines = text.replace(/\r/g, '').split('\n');

    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      const targetRowIndex = rowIndex + i;
      if (targetRowIndex >= tblRows.length) break;
      const row = tblRows[targetRowIndex];
      for (let j = 0; j < cols.length; j++) {
        const targetCellIndex = cellIndex + j;
        if (targetCellIndex >= row.cells.length) break;
        const cell = row.cells[targetCellIndex];
        const inp = cell.querySelector('input');
        if (inp) inp.value = cols[j];
      }
    }
  }

  // Ctrl/Cmd + V – თუ ტექსტი შეიცავს \n ან \t, ჩავთვალოთ, რომ grid-ს ვყრით
  document.addEventListener('paste', function(e) {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!e.clipboardData) return;

    const text = e.clipboardData.getData('text');
    if (text.includes('\n') || text.includes('\t')) {
      e.preventDefault();
      pasteTextGrid(text, target);
    }
  });

  // კლავიატურის ნავიგაცია + Shortcut-ები
  document.addEventListener('keydown', function(e) {
    const el = e.target;
    const isInput = el instanceof HTMLInputElement;

    // Cmd/Ctrl + C – თუ გვაქვს მონიშნული უჯრები, დავაკოპიროთ ისინი (Excel სტილში)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      if (selectedInputs.size > 0) {
        e.preventDefault();
        copySelectedToClipboard();
      }
      return;
    }

    // Cmd/Ctrl + A – მონიშნოს მთელი ცხრილი
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && isInput) {
      const cell = el.closest('td,th');
      const table = cell?.closest('table');
      if (table) {
        e.preventDefault();
        clearSelection();
        const inputs = table.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]');
        inputs.forEach(inp => addToSelection(inp));
      }
      return;
    }

    // Delete – ჯგუფური გასუფთავება მხოლოდ მონიშნულ უჯრებზე (მონიშვნა რჩება)
    if (e.key === 'Delete' && selectedInputs.size > 0) {
      e.preventDefault();
      selectedInputs.forEach(inp => inp.value = '');
      return;
    }

    // Backspace ნორმალურად მუშაობს, არაფერს ვუზღუდავთ

    if (!isInput) return;
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.key)) return;

    const cell = el.closest('td,th');
    const table = cell?.closest('table');
    if (!cell || !table) return;

    const key = e.key;

    const inputsInTable = Array.from(
      table.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]')
    );
    const idx = inputsInTable.indexOf(el);

    // Enter → ქვემოთ (ArrowDown-ის სტილში)
    if (key === 'Enter') {
      e.preventDefault();
      const row = cell.parentElement;
      const rows = Array.from(table.rows);
      const rowIndex = rows.indexOf(row);
      const cells = Array.from(row.cells);
      const cellIndex = cells.indexOf(cell);

      if (rowIndex < rows.length - 1) {
        const nextRow = rows[rowIndex + 1];
        const targetCell = nextRow.cells[cellIndex] || nextRow.cells[nextRow.cells.length - 1];
        const targetInput = targetCell.querySelector('input');
        if (targetInput) targetInput.focus();
      }
      return;
    }

    if (key === 'ArrowRight') {
      e.preventDefault();
      if (idx < inputsInTable.length - 1) {
        inputsInTable[idx + 1].focus();
      }
      return;
    }

    if (key === 'ArrowLeft') {
      e.preventDefault();
      if (idx > 0) {
        inputsInTable[idx - 1].focus();
      }
      return;
    }

    const row = cell.parentElement;
    const rows = Array.from(table.rows);
    const rowIndex = rows.indexOf(row);
    const cells = Array.from(row.cells);
    const cellIndex = cells.indexOf(cell);

    if (key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < rows.length - 1) {
        const nextRow = rows[rowIndex + 1];
        const targetCell = nextRow.cells[cellIndex] || nextRow.cells[nextRow.cells.length - 1];
        const targetInput = targetCell.querySelector('input');
        if (targetInput) targetInput.focus();
      }
      return;
    }

    if (key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        const prevRow = rows[rowIndex - 1];
        const targetCell = prevRow.cells[cellIndex] || prevRow.cells[prevRow.cells.length - 1];
        const targetInput = targetCell.querySelector('input');
        if (targetInput) targetInput.focus();
      }
      return;
    }
  });

  // ჰენდლერების მიერთება (ცხრილების აგების შემდეგ!)
  attachSelectionHandlers();

  // --- შაბლონები Firebase-დან ---
  function openTemplateModal() {
    if (templatesBtn.classList.contains('disabled')) {
      alert("ინტერნეტი არ არის — შაბლონები მიუწვდომელია");
      return;
    }
    loadTemplatesFromFirebase();
    document.getElementById('templateModal').style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('templateModal').style.display = 'none';
  }

  window.openTemplateModal = openTemplateModal;
  window.closeModal = closeModal;

  async function loadTemplatesFromFirebase() {
    const itemsDiv = document.getElementById('templateItems');
    const noTemplates = document.getElementById('noTemplates');
    itemsDiv.innerHTML = '';
    try {
      const q = query(collection(db, "observation_templates"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        noTemplates.style.display = 'block';
        return;
      }
      noTemplates.style.display = 'none';
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const div = document.createElement('div');
        div.className = 'template-item';
        div.innerHTML = `
          <strong>${data.name}</strong>
          <div>
            <button class="btn" style="padding:6px 12px; font-size:12px; margin-left:8px;" onclick="loadTemplateById('${docSnap.id}')">ჩატვირთვა</button>
            <button class="btn delete" style="padding:6px 12px; font-size:12px;" onclick="deleteTemplateById('${docSnap.id}', this)">წაშლა</button>
          </div>
        `;
        itemsDiv.appendChild(div);
      });
    } catch (err) {
      alert("შეცდომა: " + err.message);
    }
  }

  window.loadTemplateById = async function(id) {
    try {
      const snap = await getDoc(doc(db, "observation_templates", id));
      if (snap.exists()) {
        applyFormData(snap.data().payload);
        alert(`შაბლონი „${snap.data().name}“ ჩაიტვირთა!`);
        closeModal();
      }
    } catch (err) {
      alert("ჩატვირთვის შეცდომა: " + err.message);
    }
  };

  window.deleteTemplateById = async function(id, btn) {
    if (!confirm("დარწმუნებული ხართ?")) return;
    try {
      await deleteDoc(doc(db, "observation_templates", id));
      btn.closest('.template-item').remove();
      if (!document.getElementById('templateItems').hasChildNodes()) {
        document.getElementById('noTemplates').style.display = 'block';
      }
    } catch (err) {
      alert("წაშლის შეცდომა: " + err.message);
    }
  };

  window.saveTemplate = async function() {
    if (templateSaveBtn.classList.contains('disabled')) {
      alert("ინტერნეტი არ არის — შენახვა შეუძლებელია");
      return;
    }
    const name = document.getElementById('templateName').value.trim();
    if (!name) {
      alert('შეიყვანეთ შაბლონის სახელი!');
      return;
    }

    const payload = getFormData();

    try {
      await addDoc(collection(db, "observation_templates"), {
        name: name,
        payload: payload,
        createdAt: serverTimestamp()
      });
      document.getElementById('templateName').value = '';
      alert(`შაბლონი „${name}“ წარმატებით შენახულია!`);
    } catch (err) {
      alert("შენახვის შეცდომა: " + err.message);
    }
  };

  function getFormData() {
    // meds
    const rows = document.querySelectorAll('#meds tr:not(:first-child)');
    const meds = [];
    rows.forEach(row => {
      const drug = row.cells[1].querySelector('input').value.trim();
      const doses = [];
      row.querySelectorAll('.dose input').forEach(inp => doses.push(inp.value.trim()));
      meds.push({ drug, doses });
    });

    // vitals
    const vitals = Array.from(document.querySelectorAll('#vitals tr:not(:first-child)')).map(row => ({
      values: Array.from(row.querySelectorAll('input')).map(i => i.value.trim())
    }));

    // enteral
    const enteral = Array.from(document.querySelectorAll('#enteral input')).map(i => i.value.trim());

    // other
    const other = Array.from(document.querySelectorAll('#other tr:not(:first-child)')).map(row => ({
      values: Array.from(row.querySelectorAll('input')).map(i => i.value.trim())
    }));

    return {
      meds,
      vitals,
      enteral,
      other
    };
  }

  function applyFormData(data) {
    // meds
    document.querySelectorAll('#meds tr:not(:first-child)').forEach((row, i) => {
      const m = data.meds?.[i];
      row.cells[1].querySelector('input').value = m?.drug || '';
      row.querySelectorAll('.dose input').forEach((inp, j) => {
        inp.value = m?.doses?.[j] || '';
      });
    });

    // vitals – ვუჭერთ მხარს როგორც ახალ, ისე ძველ ფორმატს (array ან {values:[]})
    document.querySelectorAll('#vitals tr:not(:first-child)').forEach((row, i) => {
      const rowData = data.vitals?.[i];
      const vals = Array.isArray(rowData) ? rowData : rowData?.values;
      row.querySelectorAll('input').forEach((inp, j) => {
        inp.value = vals?.[j] || '';
      });
    });

    // enteral
    document.querySelectorAll('#enteral input').forEach((inp, i) => {
      inp.value = data.enteral?.[i] || '';
    });

    // other
    document.querySelectorAll('#other tr:not(:first-child)').forEach((row, i) => {
      const rowData = data.other?.[i];
      const vals = Array.isArray(rowData) ? rowData : rowData?.values;
      row.querySelectorAll('input').forEach((inp, j) => {
        inp.value = vals?.[j] || '';
      });
    });

    attachSelectionHandlers();
    scheduleLiveSync();
    schedulePatientSheetSave();
  }

  window.clearAll = function() {
    if (!confirm('გსურთ ყველაფრის გასუფთავება?')) return;
    document.querySelectorAll('input[type=text], input[type=number], input[type=date]').forEach(el => el.value = '');
    document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);

    const rows = document.querySelectorAll('#meds tr:not(:first-child)');
    rows[5].querySelector('.drug input').value = 'ანტიბაქტერიული თერაპია';
    rows[11].querySelector('.drug input').value = 'სედაცია';
    rows[17].querySelector('.drug input').value = 'ბაზისური თერაპია';
    rows[27].querySelector('.drug input').value = 'ვაზოპრესორი';
    rows[32].querySelector('.drug input').value = 'insulini';
    rows[33].querySelector('.drug input').value = 'შაქრის კონტროლი';

    clearSelection();
    applyPatientDefaults({ preserveExisting: false });
    updName();
    scheduleLiveSync();
    schedulePatientSheetSave();
  };

  initializeDateFields();
  initializePatientSheet();
