<html lang="ka">
<head>
<meta charset="UTF-8">
<title>დაკვირვების ფურცელი</title>

<!-- FAVICON – priscription.png უნდა იდოს ამ ფაილთან იმავე საქაღალდეში -->
<link rel="icon" type="image/png" href="priscription.png">
<link rel="shortcut icon" type="image/png" href="priscription.png">

<style>
  body { font-family: Arial, sans-serif; margin:0; padding:4px; background:#f0f9ff; position:relative; }
  .c { max-width:297mm; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1); }
  .header { background:#1e40af; color:white; padding:3px; text-align:center; font-size:9pt; line-height:1.2; }
  .header b { font-size:10pt; }

  .pname { font-size:12pt; font-weight:bold; color:#1e40af; text-align:center; padding:3პx; background:#eef2ff; border-bottom:2px solid #3b82f6; margin:2px 0; }

  .nav {
    padding:6px;
    text-align:center;
    background:#f1f5f9;
    font-size:13px;
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    justify-content:center;
    align-items:center;
  }
  .btn { padding:5px 12px; border:none; background:#2563eb; color:white; border-radius:4px; cursor:pointer; font-size:12px; }
  .btn.print { background:#059669; }
  .btn.clear { background:#dc2626; }
  .btn.delete { background:#991b1b; }
  .btn.active { background:#1e40af; }
  .btn.disabled { background:#94a3b8 !important; cursor:not-allowed !important; opacity:0.7; }

  .page { display:none; padding:4px 6px; }
  .page.active { display:block; }

  /* Info ბლოკი – 4 სვეტი, თითო უჯრაში label და value ერთ ხაზზე */
  .info {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:3px 6px;
    font-size:7.5pt;
    margin-bottom:4px;
  }
  .info div {
    display:flex;
    flex-direction:row;
    align-items:center;
    gap:3px;
  }
  .info label {
    font-weight:600;
    margin-bottom:0;
    white-space:nowrap;
  }
  .info input,
  .info select {
    padding:2px 4px;
    border:1px solid #999;
    border-radius:3px;
    font-size:7.5pt;
    flex:1;
  }

  table { width:100%; border-collapse:collapse; font-size:7.3pt; margin-top:4px; table-layout:fixed; }
  th, td { border:1px solid #555; padding:2px 1px; text-align:center; }
  th { background:#dbeafe; font-weight:700; color:#1e40af; }

  /* დრო – ჰორიზონტალური ციფრები */
  .time {
    font-size:7pt;
    width:20px;
    writing-mode:horizontal-tb;
    text-orientation:mixed;
  }

  .num { width:24px !important; background:#e0e7ff; font-weight:bold; color:#1e40af; font-size:7.3pt; }
  .drug { width:108px !important; text-align:left !important; background:#f8fafc; padding-left:5px; font-size:7.2pt; }
  .drug input {
    width:100% !important;
    border:none !important;
    background:transparent !important;
    font-size:7.2pt;
    padding:1px 3px;
    box-sizing:border-box;
  }
  .dose input {
    width:100% !important;
    border:none !important;
    text-align:center;
    font-size:7.3pt;
    padding:0;
  }

  .sign { margin-top:20px; display:grid; grid-template-columns:1fr 1fr; gap:60px; font-size:11pt; }
  .line { border-bottom:2px solid #000; height:40px; }

  /* პატარა ექიმის ხელმოწერა პირველი გვერდის ბოლოს */
  .sign-small { margin-top:10px; display:flex; justify-content:flex-end; font-size:9pt; }
  .line-small { width:160px; border-bottom:1px solid #000; height:14px; margin-bottom:2px; }

  #templateName { width:150px; padding:5px; font-size:12px; }

  #firebaseStatus {
    position:fixed; top:10px; left:10px; z-index:99999;
    padding:8px 14px; border-radius:8px; font-size:13px; font-weight:bold;
    color:white; box-shadow:0 4px 15px rgba(0,0,0,0.2); transition:all 0.4s;
  }
  .status-online { background:#16a34a; }
  .status-offline { background:#dc2626; }
  .status-connecting { background:#ea580c; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }

  #templateModal {
    display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:9999;
    justify-content:center; align-items:center; padding:20px; box-sizing:border-box;
  }
  #templateModal > div {
    background:white; width:90%; max-width:520px; border-radius:12px; overflow:hidden; box-shadow:0 15px 40px rgba(0,0,0,0.4);
  }
  #templateModal .head { background:#1e40af; color:white; padding:14px 20px; font-size:17px; font-weight:bold; }
  #templateModal .close { float:right; cursor:pointer; font-size:20px; }
  #templateModal .body { padding:20px; max-height:65vh; overflow-y:auto; }
  .template-item {
    padding:14px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;
    background:#fafafa; margin-bottom:8px; border-radius:6px;
  }
  #noTemplates { text-align:center; color:#888; padding:30px; font-size:15px; }

  /* მონიშნული უჯრედები (Excel სტილში) */
  input.selected-cell {
    background:#fee2e2 !important;
  }

  @media print {
    @page { size: A4 landscape; margin:5mm !important; }
    body, .c { margin:0 !important; padding:0 !important; background:white !important; }
    .nav, #templateModal, #firebaseStatus { display:none !important; }
    .page { display:block !important; page-break-after:always; padding:5mm !important; }
    input, select { border:none !important; background:transparent !important; }

    /* select-ის ისრების მოცილება საბეჭდზე */
    select {
      -webkit-appearance:none !important;
      -moz-appearance:none !important;
      appearance:none !important;
      background-image:none !important;
      padding-right:0 !important;
    }

    th, td { border:1px solid black !important; font-size:6.4pt !important; padding:1px !important; }
    .time { font-size:6pt !important; }
    .drug input, .dose input { font-size:6.3pt !important; }
  }
</style>
</head>
<body>

<div id="firebaseStatus" class="status-connecting">მიმდინარეობს Firebase-თან დაკავშირება...</div>

<div class="c">
  <div class="header"><b>პაციენტის დაკვირვების ფურცელი</b><br>თსსუ და ინგოროყვას კლინიკა</div>
  
  <div class="nav">
    <button class="btn active" data-page="1">1</button>
    <button class="btn" data-page="2">2</button>
    <button class="btn print" onclick="window.print()">ბეჭდვა</button>
    
    <input type="text" id="templateName" placeholder="შაბლონის სახელი">
    <button class="btn" id="saveBtn" onclick="saveTemplate()">შენახვა</button>
    
    <button class="btn" id="templatesBtn" onclick="openTemplateModal()" style="background:#7c3aed;">შაბლონები</button>
    
    <button class="btn clear" onclick="clearAll()">გასუფთავება</button>
  </div>

  <!-- გვერდი 1 -->
  <div class="page active" id="p1">
    <!-- აქ აღარ არის pname ზედა სათაური, როგორც სთხოვე -->
    <div class="info">
      <div>
        <label>პაციენტი:</label>
        <input type="text" id="fullName" oninput="updName()">
      </div>
      <div>
        <label>ისტ.№:</label>
        <input type="text" id="hist">
      </div>
      <div>
        <label>სქესი:</label>
        <select id="gender">
          <option>-</option>
          <option>მამრ.</option>
          <option>მდედრ.</option>
        </select>
      </div>
      <div>
        <label>ასაკი:</label>
        <input type="number" id="age">
      </div>
      <div>
        <label>შემოსვლა:</label>
        <input type="date" id="admission">
      </div>
      <div>
        <label>თარიღი:</label>
        <input type="date" id="today">
      </div>
      <div>
        <label>ICD-10:</label>
        <input type="text" id="icd">
      </div>
      <div>
        <label>განყ.:</label>
        <input type="text" id="dept">
      </div>
      <div>
        <label>ჯგ./რეზუსი:</label>
        <select id="blood">
          <option value="">-</option>
          <option value="O(I) Rh+">O(I) Rh+</option>
          <option value="O(I) Rh-">O(I) Rh-</option>
          <option value="A(II) Rh+">A(II) Rh+</option>
          <option value="A(II) Rh-">A(II) Rh-</option>
          <option value="B(III) Rh+">B(III) Rh+</option>
          <option value="B(III) Rh-">B(III) Rh-</option>
          <option value="AB(IV) Rh+">AB(IV) Rh+</option>
          <option value="AB(IV) Rh-">AB(IV) Rh-</option>
        </select>
      </div>
      <div>
        <label>პალატის №:</label>
        <input type="text" id="room">
      </div>
      <div>
        <label>ალერგია:</label>
        <input type="text" id="allergy">
      </div>
    </div>

    <table id="meds"></table>

    <!-- ექიმის პატარა ხელმოწერა პირველი გვერდის ბოლოს -->
    <div class="sign-small">
      <div>
        <div class="line-small"></div>
        <div>ექიმის ხელმოწერა</div>
      </div>
    </div>
  </div>

  <!-- გვერდი 2 -->
  <div class="page" id="p2">
    <div class="pname" id="name2">პაციენტის სახელი და გვარი</div>
    <table id="vitals"></table>
    <table id="enteral" style="margin:6px 0;"></table>
    <table id="other"></table>
    <div class="sign">
      <div style="text-align:center"><div class="line"></div><br>ექიმი</div>
      <div style="text-align:center"><div class="line"></div><br>ექთანი</div>
    </div>
  </div>
</div>

<!-- შაბლონების მოდალი -->
<div id="templateModal">
  <div>
    <div class="head">შაბლონები <span class="close" onclick="closeModal()">X</span></div>
    <div class="body">
      <div id="templateItems"></div>
      <div id="noTemplates">შაბლონები არ მოიძებნა</div>
    </div>
    <div style="padding:15px; background:#f8fafc; text-align:center;">
      <button class="btn" style="background:#dc2626;" onclick="closeModal()">დახურვა</button>
    </div>
  </div>
</div>

<script type="module">
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

  function clearSelection() {
    selectedInputs.forEach(inp => inp.classList.remove('selected-cell'));
    selectedInputs.clear();
  }

  function addToSelection(input) {
    selectedInputs.add(input);
    input.classList.add('selected-cell');
  }

  function startSelection(e) {
    if (e.button !== 0) return; // მხოლოდ მარცხენა კლიკი
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
      inp.addEventListener('mousedown', startSelection);
      inp.addEventListener('mouseenter', mouseEnterDuringSelection);
    });
  }

  document.addEventListener('mouseup', () => {
    isSelecting = false;
  });

  // კლავიატურის ნავიგაცია + Delete/Backspace ჯგუფური გასუფთავებისთვის
  document.addEventListener('keydown', function(e) {
    const el = e.target;
    const isInput = el instanceof HTMLInputElement;

    // Delete / Backspace – გაწმინდე მონიშნული უჯრები ერთდროულად
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedInputs.size > 0) {
      e.preventDefault();
      selectedInputs.forEach(inp => inp.value = '');
      clearSelection();
      return;
    }

    if (!isInput) return;
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.key)) return;

    const cell = el.closest('td,th');
    const table = cell?.closest('table');

    // info ბლოკში – სტანდარტული ქცევა, მხოლოდ ცხრილებში ვაკონტროლებთ
    if (!cell || !table) return;

    const key = e.key;

    const inputsInTable = Array.from(
      table.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]')
    );
    const idx = inputsInTable.indexOf(el);

    if (key === 'ArrowRight' || key === 'Enter') {
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

    return {
      info: {
        fullName: document.getElementById('fullName').value,
        hist: document.getElementById('hist').value,
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value,
        admission: document.getElementById('admission').value,
        today: document.getElementById('today').value,
        icd: document.getElementById('icd').value,
        dept: document.getElementById('dept').value,
        blood: document.getElementById('blood').value,
        room: document.getElementById('room').value,
        allergy: document.getElementById('allergy').value
      },
      meds,
      vitals,
      enteral,
      other
    };
  }

  function applyFormData(data) {
    // info
    document.getElementById('fullName').value = data.info?.fullName || '';
    document.getElementById('hist').value = data.info?.hist || '';
    document.getElementById('gender').value = data.info?.gender || '-';
    document.getElementById('age').value = data.info?.age || '';
    document.getElementById('admission').value = data.info?.admission || '';
    document.getElementById('today').value = data.info?.today || '';
    document.getElementById('icd').value = data.info?.icd || '';
    document.getElementById('dept').value = data.info?.dept || '';
    document.getElementById('blood').value = data.info?.blood || '';
    document.getElementById('room').value = data.info?.room || '';
    document.getElementById('allergy').value = data.info?.allergy || '';
    updName();

    // meds
    document.querySelectorAll('#meds tr:not(:first-child)').forEach((row, i) => {
      const m = data.meds?.[i];
      row.cells[1].querySelector('input').value = m?.drug || '';
      row.querySelectorAll('.dose input').forEach((inp, j) => {
        inp.value = m?.doses?.[j] || '';
      });
    });

    // vitals – ვუჭერთ მხარს როგორც ახალ, ისე ძველ ფორმატს
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

    clearSelection();
    updName();
  };
</script>
</body>
</html>
