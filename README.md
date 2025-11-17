<!DOCTYPE html>
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
  .check.marked::after { content:"X"; }

  .sign { margin-top:20px; display:grid; grid-template-columns:1fr 1fr; gap:60px; font-size:11pt; }
  .line { border-bottom:2px solid #000; height:40px; }

  @media print {
    @page { size: A4 landscape; margin:4mm !important; }
    body, .c { margin:0 !important; padding:0 !important; background:white !important; box-shadow:none !important; }
    .nav { display:none !important; }
    .page { display:block !important; page-break-after:always; padding:3mm !important; }
    .page:last-child { page-break-after:avoid; }

    .header { font-size:9pt !important; padding:2px !important; }
    .pname { font-size:12pt !important; padding:2px !important; margin:1px 0 !important; }

    .info input, .info select { border:none !important; padding:0 !important; background:transparent !important; font-size:7pt !important; }
    .info label { font-size:6.5pt !important; }

    tr:not(.filled) { display:none !important; }
    .check.marked::after { content:"X"; color:black !important; font-size:14px; }
    input { border:none !important; background:transparent !important; }
    th, td { border:1px solid black !important; padding:2px 1px !important; font-size:7.2pt !important; }
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
    <button class="btn print" onclick="doPrint()">ბეჭდვა</button>
  </div>

  <!-- გვერდი 1 -->
  <div class="page active" id="p1">
    <div class="pname" id="name1">პაციენტის სახელი და გვარი</div>
    <div class="info">
      <div><label>პაციენტი</label><input type="text" id="fullName" oninput="updName()"></div>
      <div><label>ისტ.№</label><input type="text"></div>
      <div><label>სქესი</label><select><option>-</option><option>მ</option><option>ქ</option></select></div>
      <div><label>ასაკი</label><input type="number"></div>
      <div><label>შემოსვლა</label><input type="date"></div>
      <div><label>თარიღი</label><input type="date" id="today"></div>
      <div><label>ICD-10</label><input type="text"></div>
      <div><label>განყ.</label><input type="text"></div>
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
  const HOURS = [...Array(16).keys()].map(i=>i+9).concat([...Array(9).keys()].map(i=>i+1));

  function updName() {
    const n = document.getElementById('fullName').value.trim() || 'პაციენტის სახელი და გვარი';
    document.getElementById('name1').textContent = n;
    document.getElementById('name2').textContent = n;
  }

  // X მონიშვნა
  function toggleMark(e) {
    if (e.target.classList.contains('check')) {
      e.target.classList.toggle('marked');
      // გავაახლოთ რიგის filled სტატუსი
      const row = e.target.closest('tr');
      if (row) checkRowFilled(row);
    }
  }

  function checkRowFilled(row) {
    const hasName = row.querySelector('input[type=text]')?.value.trim();
    const hasMark = row.querySelector('.check.marked');
    row.classList.toggle('filled', !!(hasName || hasMark));
  }

  // მედიკამენტები
  let html = `<tr><th class="drug">მედ/დოზა</th>${HOURS.map(h=>`<th class="time">${h}</th>`).join('')}</tr>`;
  for(let i=1;i<=18;i++){
    html += `<tr class="medrow">
      <td class="drug"><input type="text" placeholder="${i}" oninput="checkRowFilled(this.closest('tr'))"></td>
      ${HOURS.map(()=>`<td><div class="check" onclick="toggleMark(event)"></div></td>`).join('')}
    </tr>`;
  }
  document.getElementById('meds').innerHTML = html;

  // ვიტალები
  const vit = ['პულსი','სისტ.','დიასტ.','MAP','ტ°','სუნთქვა','CVP','FiO2','SaO2'];
  let vhtml = `<tr><th class="drug">პარამეტრი</th>${HOURS.map(h=>`<th class="time">${h}</th>`).join('')}</tr>`;
  vit.forEach(p=> vhtml += `<tr><td class="drug">${p}</td>${HOURS.map(()=>`<td><div class="check" onclick="toggleMark(event)"></div></td>`).join('')}</tr>`);
  document.getElementById('vitals').innerHTML = vhtml;

  // ენტერალური
  document.getElementById('enteral').innerHTML = `<tr><th class="drug">ენტერალური კვება</th><th>დილა</th><th>შუადღე</th><th>საღამო</th></tr>
    <tr><td class="drug">მლ</td><td><input></td><td><input></td><td><input></td></tr>`;

  // სხვა
  const oth = ['დიურეზი','დეფეკაცია','ოყნა','დრენაჟი','ბალანსი'];
  let ohtml = `<tr><th class="drug">პარამეტრი</th>${HOURS.map(h=>`<th class="time">${h}</th>`).join('')}</tr>`;
  oth.forEach(p=> ohtml += `<tr><td class="drug">${p}</td>${HOURS.map(()=>`<td><input></td>`).join('')}</tr>`);
  document.getElementById('other').innerHTML = ohtml;

  // ინიციალიზაცია
  document.getElementById('today').value = new Date().toISOString().split('T')[0];
  updName();

  // გვერდების გადართვა
  document.querySelectorAll('[data-page]').forEach(b=>{
    b.onclick = ()=>{
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      document.getElementById('p'+b.dataset.page).classList.add('active');
      document.querySelectorAll('[data-page]').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
    };
  });

  // ბეჭდვა
  function doPrint() {
    // ყველა რიგის განახლება
    document.querySelectorAll('.medrow').forEach(row => checkRowFilled(row));
    window.print();
  }
</script>
</body>
</html>
