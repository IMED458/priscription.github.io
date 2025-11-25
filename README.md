<html lang="ka">
<head>
<meta charset="UTF-8">
<title>დაკვირვების ფურცელი</title>
<style>
  body { font-family: Arial, sans-serif; margin:0; padding:4px; background:#f0f9ff; }
  .c { max-width:297mm; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1); }
  .header { background:#1e40af; color:white; padding:3px; text-align:center; font-size:9pt; line-height:1.2; }
  .header b { font-size:10pt; }
  .pname { font-size:12pt; font-weight:bold; color:#1e40af; text-align:center; padding:3px; background:#eef2ff; border-bottom:2px solid #3b82f6; margin:2px 0; }
  .nav { padding:6px; text-align:center; background:#f1f5f9; font-size:13px; display:flex; flex-wrap:wrap; gap:6px; justify-content:center; align-items:center; }
  .btn { padding:5px 12px; border:none; background:#2563eb; color:white; border-radius:4px; cursor:pointer; font-size:12px; }
  .btn.print { background:#059669; }
  .btn.clear { background:#dc2626; }
  .btn.delete { background:#991b1b; }
  .btn.active { background:#1e40af; }
  .page { display:none; padding:4px 6px; }
  .page.active { display:block; }
  .info { display:grid; grid-template-columns:repeat(4,1fr); gap:3px 6px; font-size:7.5pt; margin-bottom:4px; }
  .info div { display:flex; flex-direction:column; }
  .info label { font-weight:600; margin-bottom:1px; }
  .info input, .info select { padding:2px 4px; border:1px solid #999; border-radius:3px; font-size:7.5pt; }
  table { width:100%; border-collapse:collapse; font-size:7.8pt; margin-top:4px; table-layout:fixed; }
  th, td { border:1px solid #555; padding:3px 2px; text-align:center; }
  th { background:#dbeafe; font-weight:700; color:#1e40af; }
  .time { writing-mode:vertical-lr; text-orientation:mixed; font-size:7pt; width:18px; }
  .num { width:28px !important; background:#e0e7ff; font-weight:bold; color:#1e40af; }
  /* მედიკამენტის გრაფა — მნიშვნელოვნად დაპატარავებული */
  .drug { width:120px !important; text-align:left !important; background:#f8fafc; padding-left:6px; font-size:7.5pt; }
  .drug input { width:100% !important; border:none !important; background:transparent !important; font-size:7.5pt; padding:2px 4px; box-sizing:border-box; }
  .dose input { width:100% !important; border:none !important; text-align:center; font-size:7.8pt; }
  .sign { margin-top:20px; display:grid; grid-template-columns:1fr 1fr; gap:60px; font-size:11pt; }
  .line { border-bottom:2px solid #000; height:40px; }
  #templateName { width:150px; padding:5px; font-size:12px; }
  #templateList { width:200px; padding:5px; font-size:12px; }

  @media print {
    @page { size: A4 landscape; margin:5mm !important; }
    body, .c { margin:0 !important; padding:0 !important; background:white !important; box-shadow:none !important; }
    .nav { display:none !important; }
    .page { display:block !important; page-break-after:always; padding:5mm !important; }
    .page:last-child { page-break-after:avoid; }
    input, select { border:none !important; background:transparent !important; }
    th, td { border:1px solid black !important; font-size:7pt !important; }
    .time { font-size:6.5pt !important; }
    .num { background:#e0e7ff !important; color:#1e40af !important; }
    .drug { width:110px !important; font-size:6.8pt !important; }
    .drug input { font-size:6.8pt !important; }
  }
</style>
</head>
<body>

<div class="c">
  <div class="header"><b>პაციენტის დაკვირვების ფურცელი</b><br>თსსუ და ინგოროყვას კლინიკა</div>

  <div class="nav">
    <button class="btn active" data-page="1">1</button>
    <button class="btn" data-page="2">2</button>
    <button class="btn print" onclick="window.print()">ბეჭდვა</button>
    
    <input type="text" id="templateName" placeholder="შაბლონის სახელი">
    <button class="btn" onclick="saveTemplate()">შენახვა</button>
    
    <select id="templateList"><option value="">— აირჩიე შაბლონი —</option></select>
    <button class="btn" onclick="loadTemplate()">ჩატვირთვა</button>
    <button class="btn delete" onclick="deleteTemplate()">წაშლა</button>
    
    <button class="btn clear" onclick="clearAll()">გასუფთავება</button>
  </div>

  <!-- გვერდი 1 -->
  <div class="page active" id="p1">
    <div class="pname" id="name1">პაციენტის სახელი და გვარი</div>
    <div class="info">
      <div><label>პაციენტი</label><input type="text" id="fullName" oninput="updName()"></div>
      <div><label>ისტ.№</label><input type="text" id="hist"></div>
      <div><label>სქესი</label><select id="gender"><option>-</option><option>მ</option><option>ქ</option></select></div>
      <div><label>ასაკი</label><input type="number" id="age"></div>
      <div><label>შემოსვლა</label><input type="date" id="admission"></div>
      <div><label>თარიღი</label><input type="date" id="today"></div>
      <div><label>ICD-10</label><input type="text" id="icd"></div>
      <div><label>განყ.</label><input type="text" id="dept"></div>
    </div>
    <table id="meds"></table>
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

<script>
  const HOURS = [...Array(16).keys()].map(i => i + 9).concat([...Array(9).keys()].map(i => i + 1));

  function updName() {
    const name = document.getElementById('fullName').value.trim() || 'პაციენტის სახელი და გვარი';
    document.getElementById('name1').textContent = name;
    document.getElementById('name2').textContent = name;
  }

  // მედიკამენტები — ვიწრო გრაფა
  let medsHTML = `<tr><th class="num">№</th><th class="drug">მედ/დოზა</th>${HOURS.map(h => `<th class="time">${h}</th>`).join('')}</tr>`;
  for (let i = 1; i <= 18; i++) {
    medsHTML += `<tr>
      <td class="num">${i}.</td>
      <td class="drug"><input type="text"></td>
      ${HOURS.map(() => `<td class="dose"><input type="text"></td>`).join('')}
    </tr>`;
  }
  document.getElementById('meds').innerHTML = medsHTML;

  // დანარჩენი ცხრილები
  const vit = ['პულსი','სისტ.','დიასტ.','MAP','ტ°','სუნთქვა','CVP','FiO2','SaO2'];
  let vitHTML = `<tr><th class="drug">პარამეტრი</th>${HOURS.map(h => `<th class="time">${h}</th>`).join('')}</tr>`;
  vit.forEach(p => vitHTML += `<tr><td class="drug">${p}</td>${HOURS.map(() => `<td><input type="text"></td>`).join('')}</tr>`);
  document.getElementById('vitals').innerHTML = vitHTML;

  document.getElementById('enteral').innerHTML = `<tr><th class="drug">ენტერალური კვება</th><th>დილა</th><th>შუადღე</th><th>საღამო</th></tr>
    <tr><td class="drug">მლ</td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td></tr>`;

  const oth = ['დიურეზი','დეფეკაცია','ოყნა','დრენაჟი','ბალანსი'];
  let othHTML = `<tr><th class="drug">პარამეტრი</th>${HOURS.map(h => `<th class="time">${h}</th>`).join('')}</tr>`;
  oth.forEach(p => othHTML += `<tr><td class="drug">${p}</td>${HOURS.map(() => `<td><input type="text"></td>`).join('')}</tr>`);
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

  // შაბლონები — 100% მუშაობს
  function refreshTemplateList() {
    const list = document.getElementById('templateList');
    list.innerHTML = '<option value="">— აირჩიე შაბლონი —</option>';
    const templates = JSON.parse(localStorage.getItem('obs_templates') || '{}');
    Object.keys(templates).sort().forEach(name => list.add(new Option(name, name)));
  }

  function saveTemplate() {
    const name = document.getElementById('templateName').value.trim();
    if (!name) return alert('შეიყვანეთ შაბლონის სახელი!');
    const data = getFormData();
    const templates = JSON.parse(localStorage.getItem('obs_templates') || '{}');
    templates[name] = data;
    localStorage.setItem('obs_templates', JSON.stringify(templates));
    document.getElementById('templateName').value = '';
    refreshTemplateList();
    alert(`შაბლონი "${name}" შენახულია!`);
  }

  function loadTemplate() {
    const name = document.getElementById('templateList').value;
    if (!name) return alert('აირჩიეთ შაბლონი!');
    const templates = JSON.parse(localStorage.getItem('obs_templates') || '{}');
    if (templates[name]) applyFormData(templates[name]);
    alert(`შაბლონი "${name}" ჩაიტვირთა!`);
  }

  function deleteTemplate() {
    const name = document.getElementById('templateList').value;
    if (!name) return alert('აირჩიეთ შაბლონი წასაშლელად!');
    if (!confirm(`დარწმუნებული ხართ? წაიშალოს "${name}"?`)) return;
    const templates = JSON.parse(localStorage.getItem('obs_templates') || '{}');
    delete templates[name];
    localStorage.setItem('obs_templates', JSON.stringify(templates));
    refreshTemplateList();
    alert(`შაბლონი "${name}" წაიშალა!`);
  }

  function clearAll() {
    if (!confirm('გსურთ ყველაფრის გასუფთავება?')) return;
    document.querySelectorAll('input[type=text], input[type=number], input[type=date]').forEach(el => el.value = '');
    document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    document.getElementById('today').value = new Date().toISOString().split('T')[0];
    updName();
  }

  function getFormData() {
    return {
      info: {
        fullName: document.getElementById('fullName').value,
        hist: document.getElementById('hist').value,
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value,
        admission: document.getElementById('admission').value,
        today: document.getElementById('today').value,
        icd: document.getElementById('icd').value,
        dept: document.getElementById('dept').value
      },
      meds: Array.from(document.querySelectorAll('#meds tr:not(:first-child)')).map(row => ({
        drug: row.cells[1].querySelector('input').value,
        doses: Array.from(row.querySelectorAll('.dose input')).map(i => i.value)
      })),
      vitals: Array.from(document.querySelectorAll('#vitals tr:not(:first-child)')).map(row =>
        Array.from(row.querySelectorAll('input')).map(i => i.value)
      ),
      enteral: Array.from(document.querySelectorAll('#enteral input')).map(i => i.value),
      other: Array.from(document.querySelectorAll('#other tr:not(:first-child)')).map(row =>
        Array.from(row.querySelectorAll('input')).map(i => i.value)
      )
    };
  }

  function applyFormData(data) {
    document.getElementById('fullName').value = data.info.fullName || '';
    document.getElementById('hist').value = data.info.hist || '';
    document.getElementById('gender').value = data.info.gender || '-';
    document.getElementById('age').value = data.info.age || '';
    document.getElementById('admission').value = data.info.admission || '';
    document.getElementById('today').value = data.info.today || '';
    document.getElementById('icd').value = data.info.icd || '';
    document.getElementById('dept').value = data.info.dept || '';
    updName();

    document.querySelectorAll('#meds tr:not(:first-child)').forEach((row, i) => {
      if (data.meds[i]) {
        row.cells[1].querySelector('input').value = data.meds[i].drug || '';
        row.querySelectorAll('.dose input').forEach((inp, j) => inp.value = data.meds[i].doses[j] || '');
      }
    });

    document.querySelectorAll('#vitals tr:not(:first-child)').forEach((row, i) => {
      if (data.vitals[i]) row.querySelectorAll('input').forEach((inp, j) => inp.value = data.vitals[i][j] || '');
    });

    document.querySelectorAll('#enteral input').forEach((inp, i) => inp.value = data.enteral[i] || '');
    document.querySelectorAll('#other tr:not(:first-child)').forEach((row, i) => {
      if (data.other[i]) row.querySelectorAll('input').forEach((inp, j) => inp.value = data.other[i][j] || '');
    });
  }

  refreshTemplateList();
</script>
</body>
</html>
