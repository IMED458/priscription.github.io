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
    .header { background: linear-gradient(135deg, #1e40af, #2563eb); color: white; padding: 18px; text-align: center; }
    .title { font-size: 28px; font-weight: bold; margin: 0; }
    .hospital { font-size: 18px; margin: 8px 0 0; opacity: 0.95; }
    .patient-name-print { font-size: 26px; font-weight: bold; color: #1e40af; text-align: center; margin: 15px 0; padding: 10px; background: #f0f8ff; border-bottom: 3px solid #3b82f6; display: none; }

    .nav { display: flex; flex-wrap: wrap; gap: 12px; padding: 20px; justify-content: center; background: #f1f5f9; }
    .btn { padding: 11px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; background: #2563eb; color: white; transition: 0.2s; }
    .btn:hover { background: #1d4ed8; }
    .btn-success { background: #059669; }
    .btn.active { background: #1d4ed8; box-shadow: inset 0 3px 8px rgba(0,0,0,0.3); }

    .page { display: none; padding: 20px; }
    .page.active { display: block; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 19px; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 6px; display: inline-block; }

    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 20px 0; background: #f8f9fa; padding: 16px; border-radius: 8px; }
    .input-group label { font-weight: 600; color: #1f2937; margin-bottom: 6px; font-size: 14px; }
    .input-group input, .input-group select { padding: 10px; border: 1.5px solid #94a3b8; border-radius: 6px; font-size: 15px; }

    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 10.5px; }
    th, td { border: 1.3px solid #64748b; padding: 7px 4px; text-align: center; position: relative; }
    th { background: #dbeafe; font-weight: 700; color: #1e40af; }
    .time-col { writing-mode: vertical-lr; text-orientation: mixed; font-size: 9px; min-width: 20px; }
    .param-col { text-align: left !important; background: #f8fafc; font-weight: 600; min-width: 140px; }

    /* X მონიშვნა */
    .check-cell {
      width: 100%; height: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: bold; color: #dc2626; user-select: none;
    }
    .check-cell.marked {
      background: #fee2e2; color: #dc2626;
    }
    .check-cell.marked::after { content: "X"; }

    .signature { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 100px; font-size: 16px; }
    .sig-line { border-bottom: 2px solid #000; height: 60px; }

    /* ბეჭდვა */
    @media print {
      @page { size: A4 landscape; margin: 8mm !important; }
      body, .container { background: white !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
      .nav, .no-print { display: none !important; }
      .page { display: block !important; page-break-after: always; padding: 10px !important; min-height: 190mm; }
      .patient-name-print { display: block !important; page-break-after: avoid; }
      tr.med-row:not(.filled) { display: none !important; }
      .check-cell { background: transparent !important; border: none !important; }
      .check-cell.marked::after { content: "X"; font-size: 16px; color: black !important; }
      input { border: 1px solid #000 !important; background: white !important; }
      th, td { border: 1.3px solid #000 !important; font-size: 9px !important; }
    }
  </style>
</head>
<body>

<div class="container">
  <div class="header">
    <h1 class="title">პაციენტის დაკვირვების ფურცელი</h1>
    <p class="hospital">თბილისის სახელმწიფო სამედიცინო უნივერსიტეტისა და ინგოროყვას კლინიკა</p>
  </div>

  <div class="patient-name-print" id="printPatientFullName">პაციენტის სახელი და გვარი</div>

  <div class="nav no-print">
    <button class="btn active" data-page="1">გვერდი 1</button>
    <button class="btn" data-page="2">გვერდი 2</button>
    <button class="btn btn-success" id="saveBtn">შენახვა</button>
    <button class="btn" id="createTemplateBtn">შაბლონი +</button>
    <button class="btn" id="loadTemplateBtn">შაბლონები</button>
    <button class="btn" onclick="printForm()">ბეჭდვა</button>
  </div>

  <!-- გვერდი 1 -->
  <div class="page active" id="page-1">
    <div class="section">
      <div class="info-grid">
        <div class="input-group">
          <label>პაციენტი (სახელი და გვარი)</label>
          <input type="text" id="patientFullName" placeholder="მაგ: ივანე ივანიშვილი" oninput="updatePrintName()">
        </div>
        <div class="input-group"><label>ისტორიის №</label><input type="text" id="historyNumber"></div>
        <div class="input-group"><label>სქესი</label>
          <select id="gender"><option value="">-</option><option>მამრობითი</option><option>მდედრობითი</option></select>
        </div>
        <div class="input-group"><label>ასაკი</label><input type="number" id="age"></div>
        <div class="input-group"><label>შემოსვლა</label><input type="date" id="admissionDate"></div>
        <div class="input-group"><label>თარიღი</label><input type="date" id="currentDate"></div>
        <div class="input-group"><label>ICD-10</label><input type="text" id="icd10Code"></div>
      </div>
    </div>

    <div class="section">
      <h2>მედიკამენტები (24-სთ)</h2>
      <table id="medsTable"></table>
    </div>
  </div>

  <!-- გვერდი 2 -->
  <div class="page" id="page-2">
    <div class="patient-name-print" id="printPatientFullName2">პაციენტის სახელი და გვარი</div>
    <div class="section"><h2>სასიცოცხლო მაჩვენებლები</h2><table id="vitalsTable"></table></div>
    <div class="section"><h2>ენტერალური კვება</h2><table id="enteralTable"></table></div>
    <div class="section"><h2>სხვა პარამეტრები</h2><table id="otherTable"></table></div>

    <div class="signature">
      <div style="text-align: center;"><div class="sig-line"></div><p style="margin-top: 10px; font-weight: 600;">ექიმის ხელმოწერა</p></div>
      <div style="text-align: center;"><div class="sig-line"></div><p style="margin-top: 10px; font-weight: 600;">ექთნის ხელმოწერა</p></div>
    </div>
  </div>
</div>

<script>
  const HOURS = Array.from({length: 16}, (_, i) => i + 9).concat(Array.from({length: 9}, (_, i) => i + 1));

  function updatePrintName() {
    const name = document.getElementById('patientFullName').value.trim() || 'პაციენტის სახელი და გვარი';
    document.getElementById('printPatientFullName').textContent = name;
    document.getElementById('printPatientFullName2').textContent = name;
  }

  // X მონიშვნა
  function toggleCheck(e) {
    if (e.target.classList.contains('check-cell')) {
      e.target.classList.toggle('marked');
    }
  }

  // მედიკამენტები
  function createMedsTable() {
    const table = document.getElementById('medsTable');
    let html = `<tr><th class="param-col">მედიკამენტი / დოზა</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
    for (let i = 1; i <= 14; i++) {
      html += `<tr class="med-row" data-row="${i}">
        <td class="param-col"><input type="text" placeholder="მედიკამენტი ${i}" class="med-name" oninput="checkMedRow(${i})"></td>
        ${HOURS.map(h => `<td><div class="check-cell" onclick="toggleCheck(event)"></div></td>`).join('')}
      </tr>`;
    }
    table.innerHTML = html;
    table.onclick = toggleCheck;
  }

  function checkMedRow(rowNum) {
    const row = document.querySelector(`tr[data-row="${rowNum}"]`);
    const hasName = row.querySelector('.med-name').value.trim();
    const hasCheck = row.querySelector('.check-cell.marked');
    row.classList.toggle('filled', hasName || hasCheck);
  }

  // სასიცოცხლო მაჩვენებლები
  function createVitalsTable() {
    const params = ['პულსი', 'სისტ. წნ.', 'დიასტ. წნ.', 'MAP', 'ტემპერატურა', 'სუნთქვა', 'CVP', 'FiO2', 'SaO2'];
    const table = document.getElementById('vitalsTable');
    let html = `<tr><th class="param-col">პარამეტრი</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
    params.forEach(p => {
      html += `<tr><td class="param-col">${p}</td>${HOURS.map(() => `<td><div class="check-cell" onclick="toggleCheck(event)"></div></td>`).join('')}</tr>`;
    });
    table.innerHTML = html;
    table.onclick = toggleCheck;
  }

  function createEnteralTable() {
    document.getElementById('enteralTable').innerHTML = `
      <tr><th class="param-col">ენტერალური კვება</th><th>დილა</th><th>შუადღე</th><th>საღამო</th></tr>
      <tr><td class="param-col">რაოდენობა (მლ)</td><td><input></td><td><input></td><td><input></td></tr>`;
  }

  function createOtherTable() {
    const params = ['დიურეზი (მლ)', 'დეფეკაცია', 'ოყნა', 'დრენაჟი', 'ბალანსი'];
    const table = document.getElementById('otherTable');
    let html = `<tr><th class="param-col">პარამეტრი</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
    params.forEach(p => {
      html += `<tr><td class="param-col">${p}</td>${HOURS.map(() => `<td><input></td>`).join('')}</tr>`;
    });
    table.innerHTML = html;
  }

  function printForm() {
    updatePrintName();
    document.querySelectorAll('.med-row').forEach(row => {
      const hasName = row.querySelector('.med-name')?.value.trim();
      const hasCheck = row.querySelector('.check-cell.marked');
      row.classList.toggle('filled', hasName || hasCheck);
    });
    window.print();
  }

  // ინიციალიზაცია
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentDate').value = new Date().toISOString().split('T')[0];
    updatePrintName();

    createMedsTable();
    createVitalsTable();
    createEnteralTable();
    createOtherTable();

    // გვერდების გადართვა
    document.querySelectorAll('[data-page]').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + btn.dataset.page).classList.add('active');
        document.querySelectorAll('[data-page]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });
  });
</script>
</body>
</html>
