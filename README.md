<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>პაციენტის დაკვირვების ფურცელი</title>
  <script src="/_sdk/data_sdk.js"></script>
  <script src="/_sdk/element_sdk.js"></script>
  <style>
    body { font-family: 'DejaVu Sans', Arial, sans-serif; margin: 0; padding: 8px; background: #f0f9ff; }
    .container { max-width: 297mm; margin: 0 auto; background: white; box-shadow: 0 8px 25px rgba(0,0,0,0.12); border-radius: 10px; overflow: hidden; }

    /* სათაური - 11pt */
    .header {
      background: linear-gradient(135deg, #1e40af, #2563eb);
      color: white; padding: 6px; text-align: center;
      font-size: 11pt !important; line-height: 1.3;
    }
    .title { font-size: 11pt; font-weight: bold; margin: 0; }
    .hospital { font-size: 11pt; margin: 3px 0 0; }

    /* პაციენტის სახელი - ბეჭდვისას 14pt */
    .patient-header {
      font-size: 14pt; font-weight: bold; color: #1e40af;
      text-align: center; padding: 6px; margin: 4px 0 6px;
      background: #eef2ff; border-bottom: 2px solid #3b82f6;
    }

    .nav { display: flex; flex-wrap: wrap; gap: 10px; padding: 12px; justify-content: center; background: #f1f5f9; font-size: 14px; }
    .btn { padding: 8px 18px; border: none; border-radius: 6px; background: #2563eb; color: white; cursor: pointer; }
    .btn:hover { background: #1d4ed8; }
    .btn-success { background: #059669; }
    .btn.active { background: #1d4ed8; }

    .print-page { display: none; padding: 10px; }
    .print-page.active { display: block; }

    /* საპასპორტე მონაცემები - ძალიან კომპაქტური */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px 10px;
      background: #f9fafb;
      padding: 8px;
      border-radius: 6px;
      font-size: 9pt;
      margin-bottom: 8px;
    }
    .info-grid .input-group {
      display: flex;
      flex-direction: column;
    }
    .info-grid label {
      font-weight: 600; color: #374151; margin-bottom: 2px; font-size: 8.5pt;
    }
    .info-grid input, .info-grid select {
      padding: 4px 6px; border: 1.3px solid #94a3b8; border-radius: 4px; font-size: 9pt;
    }

    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
    th, td { border: 1.2px solid #64748b; padding: 6px 3px; text-align: center; }
    th { background: #dbeafe; font-weight: 700; color: #1e40af; }
    .time-col { writing-mode: vertical-lr; text-orientation: mixed; font-size: 8.5px; min-width: 18px; }
    .param-col { text-align: left !important; background: #f8fafc; font-weight: 600; min-width: 130px; font-size: 9.5pt; }

    .check-cell {
      width: 100%; height: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 19px; font-weight: bold; color: #dc2626; user-select: none;
    }
    .check-cell.marked::after { content: "X"; }

    .signature { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; font-size: 15px; }
    .sig-line { border-bottom: 2px solid #000; height: 55px; }

    /* ==================== ბეჭდვა - 2 გვერდი, მაქსიმალურად კომპაქტური ==================== */
    @media print {
      @page { size: A4 landscape; margin: 5mm !important; }
      body, .container { background: white !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
      .nav, .no-print { display: none !important; }

      .print-page { display: block !important; page-break-after: always; padding: 6px !important; min-height: 185mm; }
      .print-page:last-child { page-break-after: avoid; }

      /* სათაური 11pt */
      .header { padding: 4px !important; font-size: 11pt !important; }
      .title, .hospital { font-size: 11pt !important; }

      /* პაციენტის სახელი 14pt */
      .patient-header { font-size: 14pt !important; padding: 4px !important; margin: 3px 0 !important; }

      /* საპასპორტე - ჩარჩოები არ ჩანს */
      .info-grid { background: transparent !important; padding: 4px !important; gap: 4px 6px !important; font-size: 8.5pt !important; }
      .info-grid input, .info-grid select { border: none !important; background: transparent !important; padding: 0 !important; font-size: 8.5pt !important; }
      .info-grid label { font-size: 8pt !important; }

      tr.med-row:not(.filled) { display: none !important; }
      .check-cell.marked::after { content: "X"; color: black !important; font-size: 16px; }
      input { border: none !important; background: transparent !important; }
      th, td { border: 1.2px solid #000 !important; font-size: 8.8px !important; padding: 5px 2px !important; }
      .time-col { font-size: 7.5px !important; }
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
    <button class="btn btn-success">შენახვა</button>
    <button class="btn" onclick="printForm()">ბეჭდვა</button>
  </div>

  <!-- 1-ლი გვერდი: საპასპორტე + დანიშნულება -->
  <div class="print-page active" id="print-page-1">
    <div class="patient-header" id="printName1">პაციენტის სახელი და გვარი</div>

    <div style="padding: 0 10px;">
      <div class="info-grid">
        <div class="input-group"><label>პაციენტი</label><input type="text" id="patientFullName" oninput="updateName()"></div>
        <div class="input-group"><label>ისტ. №</label><input type="text" id="historyNumber"></div>
        <div class="input-group"><label>სქესი</label><select id="gender"><option>-</option><option>მ</option><option>ქ</option></select></div>
        <div class="input-group"><label>ასაკი</label><input type="number" id="age"></div>
        <div class="input-group"><label>შემოსვლა</label><input type="date" id="admissionDate"></div>
        <div class="input-group"><label>თარიღი</label><input type="date" id="currentDate"></div>
        <div class="input-group"><label>ICD-10</label><input type="text" id="icd10Code"></div>
        <div class="input-group"><label>განყოფილება</label><input type="text"></div>
      </div>

      <div style="margin-top: 6px;">
        <table id="medsTable"></table>
      </div>
    </div>
  </div>

  <!-- 2-რე გვერდი: ფიზიკური მაჩვენებლები -->
  <div class="print-page" id="print-page-2">
    <div class="patient-header" id="printName2">პაციენტის სახელი და გვარი</div>
    <div style="padding: 0 10px;">
      <div style="margin-bottom: 10px;"><table id="vitalsTable"></table></div>
      <div style="margin-bottom: 10px;"><table id="enteralTable"></table></div>
      <div style="margin-bottom: 10px;"><table id="otherTable"></table></div>

      <div class="signature">
        <div style="text-align: center;"><div class="sig-line"></div><p style="margin-top: 8px; font-weight: 600;">ექიმის ხელმოწერა</p></div>
        <div style="text-align: center;"><div class="sig-line"></div><p style="margin-top: 8px; font-weight: 600;">ექთნის ხელმოწერა</p></div>
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
    for (let i = 1; i <= 16; i++) {
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
    const params = ['პულსი','სისტ. წნ.','დიასტ. წნ.','MAP','ტ°','სუნთქვა','CVP','FiO2','SaO2'];
    const table = document.getElementById('vitalsTable');
    let html = `<tr><th class="param-col">პარამეტრი</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
    params.forEach(p => html += `<tr><td class="param-col">${p}</td>${HOURS.map(() => `<td><div class="check-cell" onclick="toggleCheck(event)"></div></td>`).join('')}</tr>`);
    table.innerHTML = html;
  }

  function createEnteralTable() {
    document.getElementById('enteralTable').innerHTML = `<tr><th class="param-col">ენტერალური კვება</th><th>დილა</th><th>შუადღე</th><th>საღამო</th></tr>
      <tr><td class="param-col">მლ</td><td><input></td><td><input></td><td><input></td></tr>`;
  }

  function createOtherTable() {
    const params = ['დიურეზი','დეფეკაცია','ოყნა','დრენაჟი','ბალანსი'];
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
