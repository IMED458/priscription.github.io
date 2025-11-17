<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>პაციენტის დაკვირვების ფურცელი</title>
  <script src="/_sdk/data_sdk.js"></script>
  <script src="/_sdk/element_sdk.js"></script>
  <style>
    body { font-family: 'DejaVu Sans', Arial, sans-serif; margin: 0; padding: 10px; background: #f0f9ff; }
    .container { max-width: 297mm; margin: 0 auto; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 12px; overflow: hidden; }

    /* სათაური მაქსიმალურად შემცირებული - 11pt */
    .header {
      background: linear-gradient(135deg, #1e40af, #2563eb);
      color: white;
      padding: 8px 20px;           /* მინიმალური პედინგი */
      text-align: center;
      font-size: 11pt !important; /* ზუსტად 11pt */
      line-height: 1.2;
    }
    .title { font-size: 11pt; font-weight: bold; margin: 0; }
    .hospital { font-size: 11pt; margin: 4px 0 0; opacity: 0.95; }

    .patient-header { font-size: 24px; font-weight: bold; color: #1e40af; text-align: center; padding: 10px; background: #f0f8ff; border-bottom: 4px double #3b82f6; margin-bottom: 10px; }

    .nav { display: flex; flex-wrap: wrap; gap: 12px; padding: 15px; justify-content: center; background: #f1f5f9; }
    .btn { padding: 10px 22px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; background: #2563eb; color: white; font-size: 14px; }
    .btn:hover { background: #1d4ed8; }
    .btn-success { background: #059669; }
    .btn.active { background: #1d4ed8; }

    .print-page { display: none; padding: 15px; }
    .print-page.active { display: block; }
    .section { margin-bottom: 25px; }
    .section h2 { font-size: 18px; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 6px; display: inline-block; }

    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; background: #f8f9fa; padding: 14px; border-radius: 8px; margin-bottom: 20px; }
    .input-group label { font-weight: 600; margin-bottom: 5px; font-size: 14px; }
    .input-group input, .input-group select { padding: 9px; border: 1.6px solid #94a3b8; border-radius: 6px; font-size: 14px; }

    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5px; }
    th, td { border: 1.3px solid #64748b; padding: 7px 3px; text-align: center; }
    th { background: #dbeafe; font-weight: 700; color: #1e40af; }
    .time-col { writing-mode: vertical-lr; text-orientation: mixed; font-size: 9px; min-width: 20px; }
    .param-col { text-align: left !important; background: #f8fafc; font-weight: 600; min-width: 140px; }

    .check-cell {
      width: 100%; height: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: bold; color: #dc2626; user-select: none;
    }
    .check-cell.marked::after { content: "X"; }

    .signature { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 100px; font-size: 16px; }
    .sig-line { border-bottom: 2.5px solid #000; height: 65px; }

    /* საბეჭდი ვერსია */
    @media print {
      @page { size: A4 landscape; margin: 6mm !important; }
      body, .container { background: white !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
      .nav, .no-print { display: none !important; }
      .print-page { display: block !important; page-break-after: always; padding: 8px !important; min-height: 190mm; }
      .print-page:last-child { page-break-after: avoid; }

      /* სათაური ბეჭდვისასაც 11pt */
      .header { padding: 6px !important; font-size: 11pt !important; }
      .title, .hospital { font-size: 11pt !important; }

      .patient-header { display: block !important; font-size: 24px; padding: 8px; margin-bottom: 8px; }
      tr.med-row:not(.filled) { display: none !important; }
      .check-cell.marked::after { content: "X"; color: black !important; font-size: 18px; }
      input { border: 1.2px solid #000 !important; background: white !important; }
      th, td { border: 1.3px solid #000 !important; font-size: 9.2px !important; }
      .time-col { font-size: 8px !important; }
    }
  </style>
</head>
<body>

<div class="container">
  <!-- მინიმალური სათაური 11pt -->
  <div class="header">
    <h1 class="title">პაციენტის დაკვირვების ფურცელი</h1>
    <p class="hospital">თბილისის სახელმწიფო სამედიცინო უნივერსიტეტისა და ინგოროყვას კლინიკა</p>
  </div>

  <div class="nav no-print">
    <button class="btn active" data-page="1">გვერდი 1</button>
    <button class="btn" data-page="2">გვერდი 2</button>
    <button class="btn btn-success" id="saveBtn">შენახვა</button>
    <button class="btn" onclick="printForm()">ბეჭდვა</button>
  </div>

  <!-- 1-ლი გვერდი -->
  <div class="print-page active" id="print-page-1">
    <div class="patient-header" id="printName1">პაციენტის სახელი და გვარი</div>
    <div style="padding: 0 15px;">
      <div class="info-grid">
        <div class="input-group"><label>პაციენტი</label><input type="text" id="patientFullName" oninput="updateName()"></div>
        <div class="input-group"><label>ისტორიის №</label><input type="text" id="historyNumber"></div>
        <div class="input-group"><label>სქესი</label><select id="gender"><option>-</option><option>მამრობითი</option><option>მდედრობითი</option></select></div>
        <div class="input-group"><label>ასაკი</label><input type="number" id="age"></div>
        <div class="input-group"><label>შემოსვლა</label><input type="date" id="admissionDate"></div>
        <div class="input-group"><label>თარიღი</label><input type="date" id="currentDate"></div>
        <div class="input-group"><label>ICD-10</label><input type="text" id="icd10Code"></div>
      </div>
      <div class="section"><h2>მედიკამენტები</h2><table id="medsTable"></table></div>
    </div>
  </div>

  <!-- 2-რე გვერდი -->
  <div class="print-page" id="print-page-2">
    <div class="patient-header" id="printName2">პაციენტის სახელი და გვარი</div>
    <div style="padding: 0 15px;">
      <div class="section"><h2>სასიცოცხლო მაჩვენებლები</h2><table id="vitalsTable"></table></div>
      <div class="section"><h2>ენტერალური კვება</h2><table id="enteralTable"></table></div>
      <div class="section"><h2>სხვა პარამეტრები</h2><table id="otherTable"></table></div>
      <div class="signature">
        <div style="text-align: center;"><div class="sig-line"></div><p style="margin-top: 10px;">ექიმის ხელმოწერა</p></div>
        <div style="text-align: center;"><div class="sig-line"></div><p style="margin-top: 10px;">ექთნის ხელმოწერა</p></div>
      </div>
    </div>
  </div>
</div>

<script>
  const HOURS = Array.from({length: 16}, (_, i) => i + 9).concat(Array.from({length: 9}, (_, i) => i + 1));

  function updateName() {
    const name = document.getElementById('patientFullName').value.trim() || 'პაციენტის სახელი და გვარი';
    document.getElementById('printName1').textContent = name;
    document.getElementById('printName2').textContent = name;
  }

  function toggleCheck(e) {
    if (e.target.classList.contains('check-cell')) e.target.classList.toggle('marked');
  }

  function createMedsTable() {
    const table = document.getElementById('medsTable');
    let html = `<tr><th class="param-col">მედიკამენტი / დოზა</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
    for (let i = 1; i <= 15; i++) {
      html += `<tr class="med-row" data-row="${i}">
        <td class="param-col"><input type="text" placeholder="მედ. ${i}" class="med-name" oninput="checkRow(${i})"></td>
        ${HOURS.map(() => `<td><div class="check-cell" onclick="toggleCheck(event); checkRow(${i})"></div></td>`).join('')}
      </tr>`;
    }
    table.innerHTML = html;
  }

  function checkRow(n) {
    const row = document.querySelector(`tr.med-row[data-row="${n}"]`);
    const filled = row.querySelector('.med-name').value.trim() || row.querySelector('.check-cell.marked');
    row.classList.toggle('filled', !!filled);
  }

  function createVitalsTable() {
    const params = ['პულსი','სისტ. წნ.','დიასტ. წნ.','MAP','ტემპერატურა','სუნთქვა','CVP','FiO2','SaO2'];
    const table = document.getElementById('vitalsTable');
    let html = `<tr><th class="param-col">პარამეტრი</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
    params.forEach(p => html += `<tr><td class="param-col">${p}</td>${HOURS.map(() => `<td><div class="check-cell" onclick="toggleCheck(event)"></div></td>`).join('')}</tr>`);
    table.innerHTML = html;
  }

  function createEnteralTable() {
    document.getElementById('enteralTable').innerHTML = `<tr><th class="param-col">ენტერალური კვება</th><th>დილა</th><th>შუადღე</th><th>საღამო</th></tr>
      <tr><td class="param-col">რაოდენობა (მლ)</td><td><input></td><td><input></td><td><input></td></tr>`;
  }

  function createOtherTable() {
    const params = ['დიურეზი (მლ)','დეფეკაცია','ოყნა','დრენაჟი','ბალანსი'];
    const table = document.getElementById('otherTable');
    let html = `<tr><th class="param-col">პარამეტრი</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
    params.forEach(p => html += `<tr><td class="param-col">${p}</td>${HOURS.map(() => `<td><input></td>`).join('')}</tr>`);
    table.innerHTML = html;
  }

  function printForm() {
    updateName();
    document.querySelectorAll('.med-row').forEach(r => checkRow(r.dataset.row));
    window.print();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentDate').value = new Date().toISOString().split('T')[0];
    updateName();
    createMedsTable(); createVitalsTable(); createEnteralTable(); createOtherTable();

    document.querySelectorAll('[data-page]').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.print-page').forEach(p => p.classList.remove('active'));
        document.getElementById('print-page-' + b.dataset.page).classList.add('active');
        document.querySelectorAll('[data-page]').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      };
    });
  });
</script>
</body>
</html>
