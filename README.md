<!DOCTYPE html>
<html lang="ka">
<head>
<meta charset="UTF-8">
<title>პაციენტის დაკვირვების ფურცელი</title>
<style>
    body{font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;color:#333;}
    .container{max-width:210mm;margin:0 auto;background:white;padding:20px;border-radius:10px;box-shadow:0 0 20px rgba(0,0,0,0.1);}
    .header{text-align:center;border-bottom:3px solid #2563eb;padding-bottom:15px;margin-bottom:20px;}
    .page-title{font-size:26px;margin:0;color:#1e40af;}
    .hospital-name{color:#64748b;margin:8px 0 0;}
    .navigation{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:20px 0;}
    .nav-btn,.save-btn{padding:12px 20px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;color:white;}
    .nav-btn{background:#2563eb;}
    .nav-btn.active,.nav-btn:hover{background:#1e40af;}
    .save-btn{background:#059669;}
    .page{display:none;}
    .page.active{display:block;}
    .section-title{background:#dbeafe;padding:10px;border-radius:6px;color:#1e40af;font-size:18px;margin:25px 0 10px;}
    .patient-info-horizontal{display:flex;flex-wrap:wrap;gap:15px;margin-bottom:20px;}
    .form-group{display:flex;align-items:center;gap:8px;min-width:140px;}
    .form-group label{white-space:nowrap;font-weight:500;}
    .form-group input,.form-group select{padding:8px 12px;border:1px solid #ccc;border-radius:4px;}
    table{width:100%;border-collapse:collapse;margin:15px 0;font-size:11px;}
    th,td{border:1px solid #999;padding:4px;text-align:center;}
    th{background:#eff6ff;font-weight:bold;}
    .time-header{writing-mode:vertical-lr;text-orientation:mixed;height:90px;font-size:10px;}
    .med-name{background:#f0f7ff !important;text-align:left !important;padding-left:8px !important;}
    input[type=text],input[type=number]{width:100%;border:none;padding:2px;font-size:10px;text-align:center;}
    .signatures{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:50px;padding-top:30px;border-top:2px solid #333;}
    .signature-line{border-bottom:2px solid #000;height:50px;margin-bottom:10px;}
    .message{position:fixed;top:20px;right:20px;padding:15px 25px;border-radius:8px;color:white;z-index:9999;font-weight:bold;}
    .success{background:#059669;}
    .error{background:#dc2626;}
    @media print{
        body,.container{margin:0;padding:10mm;background:white;box-shadow:none;}
        .navigation,.save-btn{display:none !important;}
        .page{display:block !important;page-break-after:always;}
        input{border:1px solid #000 !important;background:white !important;}
    }
</style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1 class="page-title">პაციენტის დაკვირვების ფურცელი</h1>
        <p class="hospital-name">თბილისის სახელმწიფო სამედიცინო უნივერსიტეტის კლინიკა</p>
    </div>

    <div class="navigation">
        <button class="nav-btn active" onclick="showPage(1)">გვერდი 1</button>
        <button class="nav-btn" onclick="showPage(2)">გვერდი 2</button>
        <button class="nav-btn" onclick="showPage(3)">ჩანაწერები</button>
        <button class="save-btn" onclick="saveRecord()">შენახვა</button>
        <button class="nav-btn" onclick="createTemplate()">შაბლონი +</button>
        <button class="nav-btn" onclick="loadTemplate()">შაბლონი ←</button>
        <button class="nav-btn" onclick="printForm()">ბეჭდვა</button>
    </div>

    <!-- გვერდი 1 -->
    <div class="page active" id="page1">
        <h2 class="section-title">პაციენტის მონაცემები</h2>
        <div class="patient-info-horizontal">
            <div class="form-group"><label>სახელი:</label><input type="text" id="patientName"></div>
            <div class="form-group"><label>გვარი:</label><input type="text" id="patientSurname"></div>
            <div class="form-group"><label>ისტ. №:</label><input type="text" id="historyNumber"></div>
            <div class="form-group"><label>სქესი:</label><select id="gender"><option value="">-</option><option>მამრობითი</option><option>მდედრობითი</option></select></div>
            <div class="form-group"><label>ასაკი:</label><input type="number" id="age"></div>
            <div class="form-group"><label>შემოსვლა:</label><input type="date" id="admissionDate"></div>
            <div class="form-group"><label>თარიღი:</label><input type="date" id="currentDate"></div>
            <div class="form-group"><label>ICD-10:</label><input type="text" id="icd10Code"></div>
        </div>

        <h2 class="section-title">მედიკამენტები (24 საათი)</h2>
        <div id="medicationsTable"></div>
    </div>

    <!-- გვერდი 2 -->
    <div class="page" id="page2">
        <h2 class="section-title">სასიცოცხლო მაჩვენებლები</h2>
        <div id="vitalsTable"></div>

        <h2 class="section-title">ენტერალური კვება</h2>
        <div id="enteralTable"></div>

        <h2 class="section-title">სხვა პარამეტრები</h2>
        <div id="otherParamsTable"></div>

        <div class="signatures">
            <div><div class="signature-line"></div><strong>ექიმის ხელმოწერა</strong></div>
            <div><div class="signature-line"></div><strong>ექთნის ხელმოწერა</strong></div>
        </div>
    </div>

    <!-- გვერდი 3 -->
    <div class="page" id="page3">
        <h2 class="section-title">შენახული ჩანაწერები <button class="nav-btn" style="padding:8px 15px;font-size:12px;" onclick="loadAllRecords()">განახლება</button></h2>
        <table><thead><tr><th>თარიღი</th><th>პაციენტი</th><th>ისტ.№</th><th>ასაკი</th><th>შემოსვლა</th><th>ქმედება</th></tr></thead><tbody id="recordsBody"></tbody></table>
    </div>
</div>

<script>
// 24-საათიანი ციკლი: 9 → 24 → 1 → 8
const hours = [];
for(let i=9;i<=24;i++) hours.push(i);
for(let i=1;i<=8;i++) hours.push(i);

let records = JSON.parse(localStorage.getItem('patientRecords') || '[]');

// ცხრილების გენერაცია
function generateMedicationsTable() {
    let html = '<table>';
    html += '<tr><th class="med-name">მედიკამენტი</th>' + hours.map(h => `<th class="time-header">${h}</th>`).join('') + '</tr>';
    for(let i=1;i<=15;i++) {
        html += `<tr>
           r            <td class="med-name"><input type="text" placeholder="მედიკამენტი ${i}" style="width:100%;border:none;background:transparent;"></td>`;
        hours.forEach(() => html += '<td><input type="text"></td>');
        html += '</tr>';
    }
    html += '</table>';
    document.getElementById('medicationsTable').innerHTML = html;
}

function generateVitalsTable() {
    const params = ['პულსი','სისტოლური','დიასტოლური','MAP','ტემპერატურა','სუნთქვა','CVP','FiO2','SaO2'];
    let html = '<table><tr><th>პარამეტრი</th>' + hours.map(h => `<th class="time-header">${h}</th>`).join('') + '</tr>';
    params.forEach(p => {
        html += `<tr><td style="background:#f0f7ff;text-align:left;padding-left:8px;">${p}</td>` + hours.map(() => '<td><input type="text"></td>').join('') + '</tr>';
    });
    html += '</table>';
    document.getElementById('vitalsTable').innerHTML = html;
}

function generateEnteralTable() {
    document.getElementById('enteralTable').innerHTML = `
        <table>
            <tr><th style="background:#f0f7ff;">ენტერალური კვება</th><th>დილა</th><th>შუადღე</th><th>საღამო</th></tr>
            <tr><td style="background:#f0f7ff;">რაოდენობა</td>
                <td><input type="text"></td><td><input type="text"></td><td><input type="text"></td>
            </tr>
        </table>`;
}

function generateOtherParamsTable() {
    const params = ['დიურეზი','დეფეკაცია','ოყნა','დრენა','ბალანსი'];
    let html = '<table><tr><th>პარამეტრი</th>' + hours.map(h => `<th class="time-header">${h}</th>`).join('') + '</tr>';
    params.forEach(p => {
        html += `<tr><td style="background:#f0f7ff;text-align:left;padding-left:8px;">${p}</td>` + hours.map(() => '<td><input type="text"></td>').join('') + '</tr>';
    });
    html += '</table>';
    document.getElementById('otherParamsTable').innerHTML = html;
}

function setToday() {
    document.getElementById('currentDate').value = new Date().toISOString().split('T')[0];
}

function showPage(n) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page'+n).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach((b,i) => b.classList.toggle('active', i===n-1));
    if(n===3) loadAllRecords();
}

// შენახვა
function saveRecord() {
    const data = {
        id: Date.now(),
        patientName: document.getElementById('patientName').value.trim(),
        patientSurname: document.getElementById('patientSurname').value.trim(),
        historyNumber: document.getElementById('historyNumber').value.trim(),
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value,
        admissionDate: document.getElementById('admissionDate').value,
        currentDate: document.getElementById('currentDate').value,
        icd10Code: document.getElementById('icd10Code').value.trim(),
        page1HTML: document.getElementById('page1').innerHTML,
        page2HTML: document.getElementById('page2').innerHTML,
        createdAt: new Date().toISOString()
    };
    records.push(data);
    localStorage.setItem('patientRecords', JSON.stringify(records));
    showMessage('ჩანაწერი შეინახა!', 'success');
    loadAllRecords();
}

// ჩანაწერების ჩვენება
function loadAllRecords() {
    const tbody = document.getElementById('recordsBody');
    if(records.length===0){ tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:#888;">ჩანაწერები არ არის</td></tr>'; return; }
    tbody.innerHTML='';
    records.slice().reverse().forEach(r => {
        const name = r.patientName ? `${r.patientSurname} ${r.patientName}`.trim() : 'უცნობი';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(r.currentDate || r.createdAt).toLocaleDateString('ka-GE')}</td>
            <td>${name}</td>
            <td>${r.historyNumber||'-'}</td>
            <td>${r.age||'-'}</td>
            <td>${r.admissionDate?new Date(r.admissionDate).toLocaleDateString('ka-GE'):'-'}</td>
            <td>
                <button onclick="loadRecord(${r.id})" style="background:#2563eb;color:white;border:none;padding:4px 8px;border-radius:4px;font-size:11px;margin:2px;">ჩატვირთვა</button>
                <button onclick="deleteRecord(${r.id})" style="background:#dc2626;color:white;border:none;padding:4px 8px;border-radius:4px;font-size:11px;margin:2px;">წაშლა</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

function loadRecord(id) {
    const r = records.find(x=>x.id===id);
    if(!r) return;
    document.getElementById('page1').innerHTML = r.page1HTML;
    document.getElementById('page2').innerHTML = r.page2HTML;
    showMessage('ჩაიტვირთა!', 'success');
    showPage(1);
}

function deleteRecord(id) {
    if(confirm('ნამდვილად წავშალოთ?')){
        records = records.filter(x=>x.id!==id);
        localStorage.setItem('patientRecords', JSON.stringify(records));
        loadAllRecords();
        showMessage('წაიშალა','success');
    }
}

function createTemplate() {
    const name = prompt('შაბლონის სახელი:');
    if(!name) return;
    records.push({id:'tpl_'+Date.now(), patientName:'შაბლონი: '+name, page1HTML:document.getElementById('page1').innerHTML, page2HTML:document.getElementById('page2').innerHTML});
    localStorage.setItem('patientRecords', JSON.stringify(records));
    showMessage('შაბლონი შეინახა','success');
}

function loadTemplate() {
    const templates = records.filter(r=>r.patientName?.startsWith('შაბლონი:'));
    if(templates.length===0) return showMessage('შაბლონები არ არის','error');
    const list = templates.map((t,i)=>`${i+1}. ${t.patientName.replace('შაბლონი: ','')}`).join('\n');
    const num = prompt('აირჩიეთ შაბლონი ნომრით:\n\n'+list);
    const idx = parseInt(num)-1;
    if(templates[idx]){
        document.getElementById('page1').innerHTML = templates[idx].page1HTML;
        document.getElementById('page2').innerHTML = templates[idx].page2HTML;
        showMessage('შაბლონი ჩაიტვირთა','success');
        showPage(1);
    }
}

function printForm() {
    const win = window.open('','_blank');
    win.document.write(`
        <!DOCTYPE html><html><head><meta charset="UTF-8"><title>ბეჭდვა</title>
        <style>
            body{font-family:Arial;margin:15mm;}
            table{border-collapse:collapse;width:100%;font-size:9pt;}
            th,td{border:1px solid #000;padding:4px;text-align:center;}
            th{background:#eff6ff;}
            .header{text-align:center;border-bottom:3px solid #2563eb;padding-bottom:15px;margin-bottom:20px;}
            input{border:none !important;background:transparent !important;}
            @page{size:A4 portrait;margin:10mm;}
        </style></head><body>
        <div class="header">
            <h1 style="margin:0;font-size:22pt;color:#1e40af;">პაციენტის დაკვირვების ფურცელი</h1>
            <p style="margin:8px 0 0;color:#64748b;">თბილისის სახელმწიფო სამედიცინო უნივერსიტეტის კლინიკა</p>
        </div>
        ${document.getElementById('page1').innerHTML}
        ${document.getElementById('page2').innerHTML}
        <script>window.print();setTimeout(()=>window.close(),1000);</script>
        </body></html>`);
    win.document.close();
}

function showMessage(txt,type){
    const div=document.createElement('div');
    div.textContent=txt;
    div.className='message '+type;
    document.body.appendChild(div);
    setTimeout(()=>div.remove(),3000);
}

// ინიციალიზაცია
generateMedicationsTable();
generateVitalsTable();
generateEnteralTable();
generateOtherParamsTable();
setToday();
loadAllRecords();
</script>
</body>
</html>
