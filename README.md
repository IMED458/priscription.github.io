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
  .nav { padding:6px; text-align:center; background:#f1f5f9; font-size:13px; }
  .btn { padding:5px 12px; margin:0 3px; border:none; background:#2563eb; color:white; border-radius:4px; cursor:pointer; }
  .btn.print { background:#059669; }
  .btn.clear { background:#dc2626; }
  .btn.active { background:#1e40af; }
  .page { display:none; padding:4px 6px; }
  .page.active { display:block; }
  .info { display:grid; grid-template-columns:repeat(4,1fr); gap:3px 6px; font-size:7.5pt; margin-bottom:4px; }
  .info div { display:flex; flex-direction:column; }
  .info label { font-weight:600; margin-bottom:1px; }
  .info input, .info select { padding:2px 4px; border:1px solid #999; border-radius:3px; font-size:7.5pt; }
  table { width:100%; border-collapse:collapse; font-size:7.8pt; margin-top:4px; }
  th, td { border:1px solid #555; padding:3px 2px; text-align:center; }
  th { background:#dbeafe; font-weight:700; color:#1e40af; }
  .time { writing-mode:vertical-lr; text-orientation:mixed; font-size:7pt; min-width:14px; }
  .drug { text-align:left !important; background:#f8fafc; font-weight:600; font-size:7.5pt; min-width:100px; }
  .check { width:100%; height:100%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; color:#c00; user-select:none; }
  .check.marked::after { content:"X"; font-weight:bold; }
  .sign { margin-top:20px; display:grid; grid-template-columns:1fr 1fr; gap:60px; font-size:11pt; }
  .line { border-bottom:2px solid #000; height:40px; }

  @media print {
    @page { size: A4 landscape; margin:5mm !important; }
    body, .c { margin:0 !important; padding:0 !important; background:white !important; box-shadow:none !important; }
    .nav { display:none !important; }
    .page { display:block !important; page-break-after:always; padding:5mm !important; }
    .page:last-child { page-break-after:avoid; }
    .check.marked::after { content:"X"; color:black !important; font-size:14px; }
    input, select { border:none !important; background:transparent !important; }
    th, td { border:1px solid black !important; font-size:7.2pt !important; }
    .time { font-size:6.5pt !important; }
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
    <button class="btn" onclick="saveTemplate()">შაბლონის შენახვა</button>
    <button class="btn" onclick="loadTemplate()">შაბლონის ჩატვირთვა</button>
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
    const n = document.getElementById('fullName').value.trim() || 'პაციენტის სახელი და გვარი';
    document.getElementById('name1').textContent = n;
    document.getElementById('name2').textContent = n;
  }

  // X-ების დაკლიკვა
  function toggleMark(e) {
    if (e.target.classList.contains('check')) {
      e.target.classList.toggle('marked');
    }
  }

  // === ცხრილების შექმნა ===
  // მედიკამენტები
  let html = `<tr><th class="drug">მედ/დოზა</th>${HOURS.map(h => `<th class="time">${h}</th>`).join('')}</tr>`;
  for (let i = 1; i <= 18; i++) {
    html += `<tr>
      <td class="drug"><input type="text" placeholder="${i}" style="width:95%;border:none;background:transparent;"></td>
      ${HOURS.map(() => `<td><div class="check"></div></td>`).join('')}
    </tr>`;
  }
  document.getElementById('meds').innerHTML = html;

  // ვიტალები
  const vit = ['პულსი','სისტ.','დიასტ.','MAP','ტ°','სუნთქვა','CVP','FiO2','SaO2'];
  let vhtml = `<tr><th class="drug">პარამეტრი</th>${HOURS.map(h => `<th class="time">${h}</th>`).join('')}</tr>`;
  vit.forEach(p => vhtml += `<tr><td class="drug">${p}</td>${HOURS.map(() => `<td><input type="text" style="width:100%;border:none;text-align:center;"></td>`).join('')}</tr>`);
  document.getElementById('vitals').innerHTML = vhtml;

  // ენტერალური
  document.getElementById('enteral').innerHTML = `<tr><th class="drug">ენტერალური კვება</th><th>დილა</th><th>შუადღე</th><th>საღამო</th></tr>
    <tr><td class="drug">მლ</td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td></tr>`;

  // სხვა
  const oth = ['დიურეზი','დეფეკაცია','ოყნა','დრენაჟი','ბალანსი'];
  let ohtml = `<tr><th class="drug">პარამეტრი</th>${HOURS.map(h => `<th class="time">${h}</th>`).join('')}</tr>`;
  oth.forEach(p => ohtml += `<tr><td class="drug">${p}</td>${HOURS.map(() => `<td><input type="text" style="width:100%;border:none;text-align:center;"></td>`).join('')}</tr>`);
  document.getElementById('other').innerHTML = ohtml;

  // თარიღი
  document.getElementById('today').value = new Date().toISOString().split('T')[0];
  updName();

  // გვერდების გადართვა
  document.querySelectorAll('[data-page]').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('p' + b.dataset.page).classList.add('active');
      document.querySelectorAll('[data-page]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    };
  });

  // X-ების აქტივაცია
  document.addEventListener('click', toggleMark);

  // შაბლონის შენახვა
  function saveTemplate() {
    const data = {
      fullName: document.getElementById('fullName').value,
      hist: document.getElementById('hist').value,
      gender: document.getElementById('gender').value,
      age: document.getElementById('age').value,
      admission: document.getElementById('admission').value,
      today: document.getElementById('today').value,
      icd: document.getElementById('icd').value,
      dept: document.getElementById('dept').value,
      meds: [],
      vitals: [],
      enteral: [],
      other: []
    };

    // მედიკამენტები
    document.querySelectorAll('#meds tr:not(:first-child)').forEach(row => {
      data.meds.push({
        drug: row.querySelector('input').value,
        marks: Array.from(row.querySelectorAll('.check')).map(c => c.classList.contains('marked'))
      });
    });

    // ვიტალები
    document.querySelectorAll('#vitals tr:not(:first-child)').forEach(row => {
      data.vitals.push(Array.from(row.querySelectorAll('input')).map(i => i.value));
    });

    // ენტერალური
    data.enteral = Array.from(document.querySelectorAll('#enteral input')).map(i => i.value);

    // სხვა
    document.querySelectorAll('#other tr:not(:first-child)').forEach(row => {
      data.other.push(Array.from(row.querySelectorAll('input')).map(i => i.value));
    });

    localStorage.setItem('obs_template_v3', JSON.stringify(data));
    alert('შაბლონი წარმატებით შეინახა!');
  }

  // შაბლონის ჩატვირთვა
  function loadTemplate() {
    const saved = localStorage.getItem('obs_template_v3');
    if (!saved) {
      alert('შენახული შაბლონი არ მოიძებნა!');
      return;
    }
    const data = JSON.parse(saved);

    document.getElementById('fullName').value = data.fullName || '';
    document.getElementById('hist').value = data.hist || '';
    document.getElementById('gender').value = data.gender || '-';
    document.getElementById('age').value = data.age || '';
    document.getElementById('admission').value = data.admission || '';
    document.getElementById('today').value = data.today || '';
    document.getElementById('icd').value = data.icd || '';
    document.getElementById('dept').value = data.dept || '';
    updName();

    // მედიკამენტები
    document.querySelectorAll('#meds tr:not(:first-child)').forEach((row, i) => {
      if (data.meds[i]) {
        row.querySelector('input').value = data.meds[i].drug || '';
        row.querySelectorAll('.check').forEach((c, j) => {
          c.classList.toggle('marked', data.meds[i].marks[j]);
        });
      }
    });

    // ვიტალები
    document.querySelectorAll('#vitals tr:not(:first-child)').forEach((row, i) => {
      if (data.vitals[i]) {
        row.querySelectorAll('input').forEach((inp, j) => {
          inp.value = data.vitals[i][j] || '';
        });
      }
    });

    // ენტერალური
    document.querySelectorAll('#enteral input').forEach((inp, i) => {
      inp.value = data.enteral[i] || '';
    });

    // სხვა
    document.querySelectorAll('#other tr:not(:first-child)').forEach((row, i) => {
      if (data.other[i]) {
        row.querySelectorAll('input').forEach((inp, j) => {
          inp.value = data.other[i][j] || '';
        });
      }
    });

    alert('შაბლონი წარმატებით ჩაიტვირთა!');
  }

  // გასუფთავება
  function clearAll() {
    if (!confirm('დარწმუნებული ხართ, რომ გსურთ ყველაფრის გასუფთავება?')) return;

    document.querySelectorAll('input, select').forEach(el => {
      if (el.type === 'text' || el.type === 'number' || el.type === 'date') el.value = '';
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
    });
    document.querySelectorAll('.check').forEach(c => c.classList.remove('marked'));
    document.getElementById('today').value = new Date().toISOString().split('T')[0];
    updName();
    alert('ყველაფერი გასუფთავდა!');
  }
</script>
</body>
</html>
