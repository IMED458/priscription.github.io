<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>პაციენტის დაკვირვების ფურცელი</title>
  <script src="/_sdk/data_sdk.js"></script>
  <script src="/_sdk/element_sdk.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    body { font-family: 'DejaVu Sans', Arial, sans-serif; margin: 0; padding: 15px; background: #f9fafb; }
    .container { max-width: 297mm; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e40af, #2563eb); color: white; padding: 20px; text-align: center; }
    .page-title { font-size: 28px; font-weight: bold; margin: 0; }
    .hospital-name { font-size: 17px; opacity: 0.95; margin-top: 8px; }
    .patient-header-print { display: none; font-size: 24px; font-weight: bold; text-align: center; margin: 15px 0; color: #1e40af; }
    .nav { display: flex; flex-wrap: wrap; gap: 12px; padding: 20px; justify-content: center; background: #f1f5f9; }
    .btn { padding: 11px 22px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-success { background: #059669; color: white; }
    .btn.active { background: #1d4ed8; box-shadow: inset 0 3px 6px rgba(0,0,0,0.2); }
    .page { display: none; padding: 25px; }
    .page.active { display: block; }
    .section { margin-bottom: 35px; }
    .section h2 { font-size: 19px; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 8px; display: inline-block; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
    .input-group label { font-weight: 600; color: #374151; margin-bottom: 5px; font-size: 14px; }
    .input-group input, .input-group select { padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 14px; }

    table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 12px; }
    th, td { border: 1.2px solid #94a3b8; padding: 6px 4px; text-align: center; }
    th { background: #eff6ff; font-weight: 700; color: #1e40af; }
    .time-col { writing-mode: vertical-lr; text-orientation: mixed; font-size: 9px; padding: 8px 2px !important; }
    .param-col { text-align: left; background: #f8fafc; font-weight: 600; min-width: 130px; }
    input { border: none; width: 100%; text-align: center; font-size: 10px; padding: 2px; background: transparent; }

    /* === საბეჭდი სტილი - LANDSCAPE === */
    @media print {
      @page {
        size: A4 landscape;
        margin: 8mm !important;
      }
      body, .container { background: white !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
      .nav, .no-print { display: none !important; }
      .page { display: block !important; page-break-after: always; padding: 10px !important; }
      .patient-header-print { 
        display: block !important; 
        page-break-after: avoid;
        margin-bottom: 10px !important;
      }
      /* მხოლოდ შევსებული მედიკამენტების რიგები */
      tr.med-row:empty, tr.med-row:not(.filled) { display: none !important; }
      .med-row.filled { display: table-row !important; }
      input { border: 1px solid #000 !important; background: white !important; }
      th, td { border: 1.2px solid #000 !important; font-size: 9px !important; }
      .time-col { font-size: 8px !important; }
      table { font-size: 9px !important; }
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <h1 class="page-title">პაციენტის დაკვირვების ფურცელი</h1>
      <p class="hospital-name">თბილისის სახელმწიფო სამედიცინო უნივერსიტეტისა და ინგოროყვას კლინიკა</p>
    </div>

    <!-- საბეჭდი ჰედერი - პაციენტის სახელი და გვარი -->
    <div class="patient-header-print" id="printPatientName"></div>

    <div class="nav no-print">
      <button class="btn btn-primary active" data-page="1">გვერდი 1</button>
      <button class="btn btn-primary" data-page="2">გვერდი 2</button>
      <button class="btn btn-success" id="saveBtn">შენახვა</button>
      <button class="btn btn-primary" id="templateCreate">შაბლონი +</button>
      <button class="btn btn-primary" id="templateLoad">შაბლონი ↓</button>
      <button class="btn btn-primary" onclick="printForm()">ბეჭდვა</button>
    </div>

    <!-- === გვერდი 1 === -->
    <div class="page active" id="page-1">
      <div class="section">
        <h2>პაციენტის ინფორმაცია</h2>
        <div class="info-grid">
          <div class="input-group"><label>სახელი</label><input type="text" id="patientName" oninput="updatePrintHeader()"></div>
          <div class="input-group"><label>გვარი</label><input type="text" id="patientSurname" oninput="updatePrintHeader()"></div>
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
        <h2>მედიკამენტები (24 სთ)</h2>
        <table id="medsTable"></table>
      </div>
    </div>

    <!-- === გვერდი 2 === -->
    <div class="page" id="page-2">
      <div class="section"><h2>სასიცოცხლო მაჩვენებლები</h2><table id="vitalsTable"></table></div>
      <div class="section"><h2>ენტერალური კვება</h2><table id="enteralTable"></table></div>
      <div class="section"><h2>სხვა პარამეტრები</h2><table id="otherTable"></table></div>

      <div style="margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; font-size: 15px;">
        <div style="text-align: center;">
          <div style="border-bottom: 2px solid #000; height: 60px;"></div>
          <p style="margin-top: 8px;">ექიმის ხელმოწერა</p>
        </div>
        <div style="text-align: center;">
          <div style="border-bottom: 2px solid #000; height: 60px;"></div>
          <p style="margin-top: 8px;">ექთნის ხელმოწერა</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    const HOURS = Array.from({length: 16}, (_, i) => i + 9).concat(Array.from({length: 9}, (_, i) => i + 1));

    function updatePrintHeader() {
      const name = document.getElementById('patientName').value.trim();
      const surname = document.getElementById('patientSurname').value.trim();
      document.getElementById('printPatientName').textContent = 
        name || surname ? `${name} ${surname}`.trim() : 'პაციენტის სახელი და გვარი';
    }

    function createMedsTable() {
      const table = document.getElementById('medsTable');
      let html = `<tr><th class="param-col">მედიკამენტი / დოზა</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
      for (let i = 1; i <= 12; i++) {
        html += `<tr class="med-row" data-row="${i}">
          <td class="param-col"><input type="text" placeholder="მედიკამენტი ${i}" class="med-name" data-row="${i}" oninput="checkMedRow(${i})"></td>
          ${HOURS.map(h => `<td><input type="text" data-row="${i}" data-hour="${h}"></td>`).join('')}
        </tr>`;
      }
      table.innerHTML = html;
    }

    function checkMedRow(rowNum) {
      const row = document.querySelector(`tr.med-row[data-row="${rowNum}"]`);
      const name = row.querySelector('.med-name').value.trim();
      const hasValue = name || Array.from(row.querySelectorAll('input[data-hour]')).some(i => i.value.trim());
      row.classList.toggle('filled', hasValue);
    }

    // სხვა ცხრილები
    function createVitalsTable() {
      const params = ['პულსი', 'სისტ. წნ.', 'დიასტ. წნ.', 'MAP', 'ტ°', 'სუნთქვა', 'CVP', 'FiO2', 'SaO2'];
      const table = document.getElementById('vitalsTable');
      let html = `<tr><th class="param-col">პარამეტრი</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
      params.forEach(p => {
        html += `<tr><td class="param-col">${p}</td>${HOURS.map(h => `<td><input></td>`).join('')}</tr>`;
      });
      table.innerHTML = html;
    }

    function createEnteralTable() {
      const table = document.getElementById('enteralTable');
      table.innerHTML = `<tr><th class="param-col">ენტერალური კვება</th><th>დილა</th><th>შუადღე</th><th>საღამო</th></tr>
        <tr><td class="param-col">რაოდენობა (მლ)</td><td><input></td><td><input></td><td><input></td></tr>`;
    }

    function createOtherTable() {
      const params = ['დიურეზი (მლ)', 'დეფეკაცია', 'ოყნა', 'დრენაჟი', 'ბალანსი'];
      const table = document.getElementById('otherTable');
      let html = `<tr><th class="param-col">პარამეტრი</th>${HOURS.map(h => `<th class="time-col">${h}</th>`).join('')}</tr>`;
      params.forEach(p => {
        html += `<tr><td class="param-col">${p}</td>${HOURS.map(h => `<td><input></td>`).join('')}</tr>`;
      });
      table.innerHTML = html;
    }

    function printForm() {
      // განაახლებს სახელს ბეჭდვამდე
      updatePrintHeader();
      // მონიშნავს შევსებულ მედ. რიგებს
      document.querySelectorAll('.med-row').forEach(row => {
        const hasContent = row.querySelector('.med-name')?.value.trim() || 
          Array.from(row.querySelectorAll('input[data-hour]')).some(i => i.value.trim());
        row.classList.toggle('filled', hasContent);
      });
      window.print();
    }

    // ინიციალიზაცია
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('currentDate').value = new Date().toISOString().split('T')[0];
      updatePrintHeader();

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

      // შენახვა (შენი dataSdk-ით)
      document.getElementById('saveBtn').onclick = async () => {
        // შენი შენახვის ლოგიკა...
        alert('შენახულია!');
      };
    });
  </script>
</body>
</html>
