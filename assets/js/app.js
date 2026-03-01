  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    orderBy,
    query,
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

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const statusEl = document.getElementById('firebaseStatus');
  const templatesBtn = document.getElementById('templatesBtn');
  const saveBtn = document.getElementById('saveBtn');

  function updateFirebaseStatus(connected) {
    if (connected) {
      statusEl.textContent = "დაუკავშირდა Firebase-ს";
      statusEl.className = "status-online";
      templatesBtn.classList.remove('disabled');
      saveBtn.classList.remove('disabled');
    } else {
      statusEl.textContent = "ოფლაინ რეჟიმი (ინტერნეტი არ არის)";
      statusEl.className = "status-offline";
      templatesBtn.classList.add('disabled');
      saveBtn.classList.add('disabled');
    }
  }

  async function checkFirebaseConnection() {
    try {
      await getDocs(query(collection(db, "observation_templates"), orderBy("createdAt")));
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
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ];

  function updName() {
    const name = document.getElementById('fullName').value.trim() || 'პაციენტის სახელი და გვარი';
    const n2 = document.getElementById('name2');
    if (n2) n2.textContent = name;
  }
  window.updName = updName;

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
          <td class="n-name">${left}</td>
          <td class="n-qty"><input class="n-exp-input" type="text" data-nurse-expense="${tableId}-${idx}-l1"></td>
          <td class="n-qty"><input class="n-exp-input" type="text" data-nurse-expense="${tableId}-${idx}-l2"></td>
          <td class="n-qty"><input class="n-exp-input" type="text" data-nurse-expense="${tableId}-${idx}-l3"></td>
          <td class="n-qty"><input class="n-exp-input" type="text" data-nurse-expense="${tableId}-${idx}-l4"></td>
          <td class="n-name">${right}</td>
          <td class="n-qty"><input class="n-exp-input" type="text" data-nurse-expense="${tableId}-${idx}-r1"></td>
          <td class="n-qty"><input class="n-exp-input" type="text" data-nurse-expense="${tableId}-${idx}-r2"></td>
          <td class="n-qty"><input class="n-exp-input" type="text" data-nurse-expense="${tableId}-${idx}-r3"></td>
          <td class="n-qty"><input class="n-exp-input" type="text" data-nurse-expense="${tableId}-${idx}-r4"></td>
        </tr>
      `;
    }
    document.getElementById(tableId).innerHTML = html;
  }
  buildNurseExpenseTable('nurseExpense1', Array(NURSE_ROW_COUNT).fill(''), Array(NURSE_ROW_COUNT).fill(''));
  buildNurseExpenseTable('nurseExpense2', NURSE_LEFT_ITEMS, NURSE_RIGHT_ITEMS);

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

  function syncNurseFromObservation() {
    document.getElementById('nurseHistoryNo').value = document.getElementById('hist').value.trim();
    document.getElementById('nurseAdmissionDate').value = document.getElementById('admission').value;
  }
  window.syncNurseFromObservation = syncNurseFromObservation;

  document.getElementById('today').value = new Date().toISOString().split('T')[0];
  updName();

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
    if (saveBtn.classList.contains('disabled')) {
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

    const nurseMeta = {
      historyNo: document.getElementById('nurseHistoryNo').value.trim(),
      diagnosis: document.getElementById('nurseDiagnosis').value.trim(),
      dischargeDate: document.getElementById('nurseDischargeDate').value,
      admissionDate: document.getElementById('nurseAdmissionDate').value
    };

    const nurseExpenseQty = Array.from(document.querySelectorAll('.n-exp-input')).map(i => i.value.trim());

    return {
      meds,
      vitals,
      enteral,
      other,
      nurse: {
        meta: nurseMeta,
        expenseQty: nurseExpenseQty
      }
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

    if (data.nurse?.meta) {
      document.getElementById('nurseHistoryNo').value = data.nurse.meta.historyNo || '';
      document.getElementById('nurseDiagnosis').value = data.nurse.meta.diagnosis || '';
      document.getElementById('nurseDischargeDate').value = data.nurse.meta.dischargeDate || '';
      document.getElementById('nurseAdmissionDate').value = data.nurse.meta.admissionDate || '';
    }

    document.querySelectorAll('.n-exp-input').forEach((inp, i) => {
      inp.value = data.nurse?.expenseQty?.[i] || '';
    });

    attachSelectionHandlers();
  }

  window.clearAll = function() {
    if (!confirm('გსურთ ყველაფრის გასუფთავება?')) return;
    document.querySelectorAll('input[type=text], input[type=number], input[type=date]').forEach(el => el.value = '');
    document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    document.getElementById('today').value = new Date().toISOString().split('T')[0];

    const rows = document.querySelectorAll('#meds tr:not(:first-child)');
    rows[5].querySelector('.drug input').value = 'ანტიბაქტერიული თერაპია';
    rows[11].querySelector('.drug input').value = 'სედაცია';
    rows[17].querySelector('.drug input').value = 'ბაზისური თერაპია';
    rows[27].querySelector('.drug input').value = 'ვაზოპრესორი';
    rows[32].querySelector('.drug input').value = 'insulini';
    rows[33].querySelector('.drug input').value = 'შაქრის კონტროლი';

    document.getElementById('nurseHistoryNo').value = '';
    document.getElementById('nurseDiagnosis').value = '';
    document.getElementById('nurseDischargeDate').value = '';
    document.getElementById('nurseAdmissionDate').value = '';
    document.querySelectorAll('.n-exp-input').forEach(inp => inp.value = '');

    clearSelection();
    updName();
  };
</script>
