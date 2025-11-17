<!doctype html>
<html lang="ka">
 <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>პაციენტის დაკვირვების ფურცელი</title>
  <script src="/_sdk/data_sdk.js"></script>
  <script src="/_sdk/element_sdk.js"></script>
  <style>
        body {
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            color: #333333;
            line-height: 1.4;
        }
        
        .container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
        }
        
        .page-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin: 0;
        }
        
        .hospital-name {
            font-size: 16px;
            color: #64748b;
            margin: 5px 0 0 0;
        }
        
        .page {
            display: none;
            min-height: 250mm;
        }
        
        .page.active {
            display: block;
        }
        
        .navigation {
            text-align: center;
            margin: 20px 0;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        
        .nav-btn {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }
        
        .nav-btn:hover {
            background-color: #1d4ed8;
        }
        
        .nav-btn:disabled {
            background-color: #94a3b8;
            cursor: not-allowed;
        }
        
        .form-section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .patient-info-horizontal {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
            align-items: end;
        }
        
        .patient-info-horizontal .form-group {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            min-width: 120px;
        }
        
        .patient-info-horizontal .form-group label {
            font-weight: 500;
            color: #374151;
            white-space: nowrap;
            font-size: 13px;
        }
        
        .patient-info-horizontal .form-group input,
        .patient-info-horizontal .form-group select {
            padding: 6px 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 13px;
            min-width: 80px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
        }
        
        .form-group label {
            font-weight: 500;
            margin-bottom: 5px;
            color: #374151;
        }
        
        .form-group input, .form-group select {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .medications-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 10px;
        }
        
        .medication-input {
            padding: 6px 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 13px;
        }
        
        .vitals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
        }
        
        .vitals-table th, .vitals-table td {
            border: 1px solid #d1d5db;
            padding: 4px;
            text-align: center;
        }
        
        .vitals-table th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        
        .time-header {
            writing-mode: vertical-lr;
            text-orientation: mixed;
            min-width: 25px;
            font-size: 10px;
        }
        
        .parameter-label {
            text-align: left;
            font-weight: 500;
            background-color: #f1f5f9;
            min-width: 120px;
        }
        
        .vital-input {
            width: 100%;
            border: none;
            padding: 2px;
            font-size: 10px;
            text-align: center;
        }
        
        .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        
        .signature-field {
            text-align: center;
        }
        
        .signature-line {
            border-bottom: 1px solid #374151;
            height: 40px;
            margin-bottom: 5px;
        }
        
        .save-btn {
            background-color: #059669;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin: 20px 0;
        }
        
        .save-btn:hover {
            background-color: #047857;
        }
        
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
        
        @media print {
            @page {
                size: A4 portrait;
                margin: 15mm;
            }
            
            .navigation, .save-btn {
                display: none !important;
            }
            
            .container {
                max-width: none;
                padding: 0;
                margin: 0;
            }
            
            .page {
                display: block !important;
                page-break-after: always;
                min-height: auto;
                margin-bottom: 20px;
            }
            
            .page:last-child {
                page-break-after: auto;
            }
            
            .header {
                margin-bottom: 15px;
                padding-bottom: 10px;
            }
            
            .page-title {
                font-size: 20px;
            }
            
            .hospital-name {
                font-size: 14px;
                line-height: 1.3;
            }
            
            .vitals-table {
                font-size: 8px;
            }
            
            .vitals-table th, .vitals-table td {
                padding: 1px;
            }
            
            .patient-info-horizontal {
                margin-bottom: 15px;
            }
            
            .patient-info-horizontal .form-group input,
            .patient-info-horizontal .form-group select {
                border: 1px solid #000 !important;
                background: white !important;
            }
            
            .vital-input {
                border: 1px solid #000 !important;
                background: white !important;
            }
        }
    </style>
  <style>@view-transition { navigation: auto; }</style>
  <script src="https://cdn.tailwindcss.com" type="text/javascript"></script>
 </head>
 <body>
  <div class="container">
   <div class="header">
    <h1 class="page-title" id="formTitle">პაციენტის დაკვირვების ფურცელი</h1>
    <p class="hospital-name" id="hospitalName">თბილისის სახელმწიფო სამედიცინო უნივერსტიტეტისა და ინგოროყვას მაღალი სამედიცინო ტექნოლოგიების საუნივერსიტეტო კლინიკა</p>
   </div>
   <div class="navigation"><button class="nav-btn" id="page1Btn" onclick="showPage(1)">გვერდი 1 - პაციენტის ინფორმაცია</button> <button class="nav-btn" id="page2Btn" onclick="showPage(2)">გვერდი 2 - ფიზიკური მონაცემები</button> <button class="save-btn" onclick="saveRecord()">შენახვა</button> <button class="nav-btn" onclick="createTemplate()">შაბლონის შექმნა</button> <button class="nav-btn" onclick="loadTemplate()">შაბლონის ჩასმა</button> <button class="nav-btn" onclick="printForm()">ბეჭდვა</button>
   </div><!-- Page 1: Patient Information -->
   <div class="page active" id="page1">
    <div class="form-section">
     <h2 class="section-title">პაციენტის ძირითადი მონაცემები</h2>
     <div class="patient-info-horizontal">
      <div class="form-group"><label for="patientName">სახელი:</label> <input type="text" id="patientName" name="patientName">
      </div>
      <div class="form-group"><label for="patientSurname">გვარი:</label> <input type="text" id="patientSurname" name="patientSurname">
      </div>
      <div class="form-group"><label for="historyNumber">ისტორიის №:</label> <input type="text" id="historyNumber" name="historyNumber">
      </div>
      <div class="form-group"><label for="gender">სქესი:</label> <select id="gender" name="gender"> <option value="">აირჩიეთ</option> <option value="მამრობითი">მ</option> <option value="მდედრობითი">ქ</option> </select>
      </div>
      <div class="form-group"><label for="age">ასაკი:</label> <input type="number" id="age" name="age">
      </div>
      <div class="form-group"><label for="admissionDate">შემოსვლა:</label> <input type="date" id="admissionDate" name="admissionDate">
      </div>
      <div class="form-group"><label for="currentDate">თარიღი:</label> <input type="date" id="currentDate" name="currentDate">
      </div>
      <div class="form-group"><label for="icd10Code">ICD-10:</label> <input type="text" id="icd10Code" name="icd10Code">
      </div>
     </div>
    </div>
    <div class="form-section">
     <h2 class="section-title">მედიკამენტების დანიშვნა (24-საათიანი ციკლი)</h2>
     <table class="vitals-table" id="medicationsTable"><!-- Medications table will be generated here -->
     </table>
    </div>
   </div><!-- Page 2: Physical Parameters -->
   <div class="page" id="page2">
    <div class="form-section">
     <h2 class="section-title">ფიზიკური პარამეტრების აღრიცხვა (24-საათიანი ციკლი)</h2>
     <table class="vitals-table" id="vitalsTable"><!-- Table will be generated here -->
     </table>
    </div>
    <div class="form-section">
     <h2 class="section-title">ენტერალური კვება</h2>
     <table class="vitals-table" id="enteralTable"><!-- Enteral feeding table will be generated here -->
     </table>
    </div>
    <div class="form-section">
     <h2 class="section-title">სხვა პარამეტრები</h2>
     <table class="vitals-table" id="otherParamsTable"><!-- Other parameters table will be generated here -->
     </table>
    </div>
    <div class="signatures">
     <div class="signature-field">
      <div class="signature-line"></div><label>ექიმის ხელმოწერა</label>
     </div>
     <div class="signature-field">
      <div class="signature-line"></div><label>ექთნის ხელმოწერა</label>
     </div>
    </div>
   </div>
  </div>
  <script>
        let currentRecords = [];
        let currentPage = 1;

        const defaultConfig = {
            form_title: "პაციენტის დაკვირვების ფურცელი",
            hospital_name: "თბილისის სახელმწიფო სამედიცინო უნივერსტიტეტისა და ინგოროყვას მაღალი სამედიცინო ტექნოლოგიების საუნივერსიტეტო კლინიკა"
        };

        const dataHandler = {
            onDataChanged(data) {
                currentRecords = data;
                // Update UI if needed
            }
        };

        async function initializeApp() {
            // Initialize Data SDK
            const initResult = await window.dataSdk.init(dataHandler);
            if (!initResult.isOk) {
                console.error("Failed to initialize data SDK");
            }

            // Initialize Element SDK
            if (window.elementSdk) {
                window.elementSdk.init({
                    defaultConfig,
                    onConfigChange: async (config) => {
                        const formTitle = config.form_title || defaultConfig.form_title;
                        const hospitalName = config.hospital_name || defaultConfig.hospital_name;
                        
                        document.getElementById('formTitle').textContent = formTitle;
                        document.getElementById('hospitalName').textContent = hospitalName;
                    },
                    mapToCapabilities: (config) => ({
                        recolorables: [
                            {
                                get: () => config.primary_color || "#2563eb",
                                set: (value) => {
                                    config.primary_color = value;
                                    window.elementSdk.setConfig({ primary_color: value });
                                }
                            }
                        ],
                        borderables: [],
                        fontEditable: undefined,
                        fontSizeable: undefined
                    }),
                    mapToEditPanelValues: (config) => new Map([
                        ["form_title", config.form_title || defaultConfig.form_title],
                        ["hospital_name", config.hospital_name || defaultConfig.hospital_name]
                    ])
                });
            }

            generateMedicationInputs();
            generateVitalsTable();
            generateEnteralTable();
            generateOtherParamsTable();
            setCurrentDate();
        }

        function generateMedicationInputs() {
            const table = document.getElementById('medicationsTable');
            const hours = [];
            
            // Generate 24-hour cycle: 9,10,11...23,24,1,2...9
            for (let i = 9; i <= 24; i++) hours.push(i);
            for (let i = 1; i <= 9; i++) hours.push(i);

            // Create header row
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = '<th class="parameter-label">მედიკამენტი</th>';
            hours.forEach(hour => {
                headerRow.innerHTML += `<th class="time-header">${hour}</th>`;
            });
            table.appendChild(headerRow);

            // Create medication rows (15 rows for medications)
            for (let i = 1; i <= 15; i++) {
                const row = document.createElement('tr');
                row.innerHTML = `<td class="parameter-label"><input type="text" placeholder="მედიკამენტი ${i}" name="med_name_${i}" style="width: 100%; border: none; background: transparent; font-size: 11px;"></td>`;
                hours.forEach(hour => {
                    row.innerHTML += `<td><input type="text" class="vital-input" name="med_${i}_${hour}"></td>`;
                });
                table.appendChild(row);
            }
        }

        function generateVitalsTable() {
            const table = document.getElementById('vitalsTable');
            const hours = [];
            
            // Generate 24-hour cycle: 9,10,11...23,24,1,2...9
            for (let i = 9; i <= 24; i++) hours.push(i);
            for (let i = 1; i <= 9; i++) hours.push(i);

            const parameters = [
                'პულსი',
                'სისტოლური წნევა',
                'დიასტოლური წნევა',
                'საშუალო არტერიული წნევა (MAP)',
                'ტემპერატურა',
                'სუნთქვის სიხშირე',
                'ცენტრალური ვენური წნევა (CVP)',
                'FiO2',
                'SaO2'
            ];

            // Create header row
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = '<th class="parameter-label">პარამეტრი</th>';
            hours.forEach(hour => {
                headerRow.innerHTML += `<th class="time-header">${hour}</th>`;
            });
            table.appendChild(headerRow);

            // Create parameter rows
            parameters.forEach(param => {
                const row = document.createElement('tr');
                row.innerHTML = `<td class="parameter-label">${param}</td>`;
                hours.forEach(hour => {
                    row.innerHTML += `<td><input type="text" class="vital-input" name="${param}_${hour}"></td>`;
                });
                table.appendChild(row);
            });
        }

        function generateEnteralTable() {
            const table = document.getElementById('enteralTable');
            const times = ['დილა', 'შუადღე', 'საღამო'];

            const headerRow = document.createElement('tr');
            headerRow.innerHTML = '<th class="parameter-label">ენტერალური კვება</th>';
            times.forEach(time => {
                headerRow.innerHTML += `<th>${time}</th>`;
            });
            table.appendChild(headerRow);

            const row = document.createElement('tr');
            row.innerHTML = '<td class="parameter-label">რაოდენობა</td>';
            times.forEach(time => {
                row.innerHTML += `<td><input type="text" class="vital-input" name="enteral_${time}"></td>`;
            });
            table.appendChild(row);
        }

        function generateOtherParamsTable() {
            const table = document.getElementById('otherParamsTable');
            const hours = [];
            
            // Generate 24-hour cycle
            for (let i = 9; i <= 24; i++) hours.push(i);
            for (let i = 1; i <= 9; i++) hours.push(i);

            const parameters = ['დიურეზი', 'დეფეკაცია', 'ოყნა', 'დრენა', 'ბალანსი'];

            // Create header row
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = '<th class="parameter-label">პარამეტრი</th>';
            hours.forEach(hour => {
                headerRow.innerHTML += `<th class="time-header">${hour}</th>`;
            });
            table.appendChild(headerRow);

            // Create parameter rows
            parameters.forEach(param => {
                const row = document.createElement('tr');
                row.innerHTML = `<td class="parameter-label">${param}</td>`;
                hours.forEach(hour => {
                    row.innerHTML += `<td><input type="text" class="vital-input" name="${param}_${hour}"></td>`;
                });
                table.appendChild(row);
            });
        }

        function setCurrentDate() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('currentDate').value = today;
        }

        function showPage(pageNum) {
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById(`page${pageNum}`).classList.add('active');
            
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`page${pageNum}Btn`).style.backgroundColor = '#1d4ed8';
            
            currentPage = pageNum;
        }

        async function saveRecord() {
            if (currentRecords.length >= 999) {
                alert("მაქსიმალური ლიმიტი 999 ჩანაწერი მიღწეულია. გთხოვთ, წაშალოთ ზოგიერთი ჩანაწერი.");
                return;
            }

            const saveBtn = document.querySelector('.save-btn');
            saveBtn.classList.add('loading');
            saveBtn.textContent = 'შენახვა...';

            // Collect all form data
            const formData = {
                patient_name: document.getElementById('patientName').value,
                patient_surname: document.getElementById('patientSurname').value,
                history_number: document.getElementById('historyNumber').value,
                gender: document.getElementById('gender').value,
                age: document.getElementById('age').value,
                admission_date: document.getElementById('admissionDate').value,
                current_date: document.getElementById('currentDate').value,
                icd10_code: document.getElementById('icd10Code').value,
                medications: collectMedications(),
                vital_signs: collectVitalSigns(),
                enteral_feeding: collectEnteralFeeding(),
                other_parameters: collectOtherParameters(),
                doctor_signature: '',
                nurse_signature: '',
                created_at: new Date().toISOString()
            };

            const result = await window.dataSdk.create(formData);
            
            saveBtn.classList.remove('loading');
            saveBtn.textContent = 'შენახვა';

            if (result.isOk) {
                showMessage('ჩანაწერი წარმატებით შეინახა!', 'success');
                clearForm();
            } else {
                showMessage('შეცდომა ჩანაწერის შენახვისას. გთხოვთ, სცადოთ ხელახლა.', 'error');
            }
        }

        function collectMedications() {
            const medications = {};
            // Collect medication names and schedules
            for (let i = 1; i <= 15; i++) {
                const nameInput = document.querySelector(`input[name="med_name_${i}"]`);
                if (nameInput && nameInput.value.trim()) {
                    medications[`med_name_${i}`] = nameInput.value.trim();
                    
                    // Collect schedule for this medication
                    const hours = [];
                    for (let h = 9; h <= 24; h++) hours.push(h);
                    for (let h = 1; h <= 9; h++) hours.push(h);
                    
                    hours.forEach(hour => {
                        const scheduleInput = document.querySelector(`input[name="med_${i}_${hour}"]`);
                        if (scheduleInput && scheduleInput.value.trim()) {
                            medications[`med_${i}_${hour}`] = scheduleInput.value.trim();
                        }
                    });
                }
            }
            return JSON.stringify(medications);
        }

        async function createTemplate() {
            if (currentRecords.length >= 999) {
                showMessage("მაქსიმალური ლიმიტი 999 ჩანაწერი მიღწეულია. გთხოვთ, წაშალოთ ზოგიერთი ჩანაწერი.", "error");
                return;
            }

            // Create modal for template name input
            const modal = document.createElement('div');
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 8px; max-width: 400px; width: 90%;';
            
            modalContent.innerHTML = `
                <h3 style="margin-top: 0; color: #1e40af;">შაბლონის სახელი</h3>
                <input type="text" id="templateName" placeholder="შეიყვანეთ შაბლონის სახელი" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; margin-bottom: 20px; font-size: 14px;">
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="closeModal()" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer;">გაუქმება</button>
                    <button onclick="saveTemplate()" style="padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer;">შენახვა</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            document.getElementById('templateName').focus();
            
            window.closeModal = () => modal.remove();
            
            window.saveTemplate = async () => {
                const templateName = document.getElementById('templateName').value.trim();
                if (!templateName) {
                    showMessage('გთხოვთ, შეიყვანოთ შაბლონის სახელი', 'error');
                    return;
                }

                const templateData = {
                    patient_name: `შაბლონი: ${templateName}`,
                    patient_surname: "",
                    history_number: "",
                    gender: "",
                    age: "",
                    admission_date: "",
                    current_date: new Date().toISOString().split('T')[0],
                    icd10_code: "",
                    medications: collectCurrentMedications(),
                    vital_signs: "{}",
                    enteral_feeding: "{}",
                    other_parameters: "{}",
                    doctor_signature: '',
                    nurse_signature: '',
                    created_at: new Date().toISOString()
                };

                const result = await window.dataSdk.create(templateData);
                
                if (result.isOk) {
                    showMessage(`შაბლონი "${templateName}" შეინახა!`, 'success');
                    modal.remove();
                } else {
                    showMessage('შეცდომა შაბლონის შექმნისას.', 'error');
                }
            };
        }

        async function loadTemplate() {
            // Get all templates (records that start with "შაბლონი:")
            const templates = currentRecords.filter(record => 
                record.patient_name && record.patient_name.startsWith('შაბლონი:')
            );

            if (templates.length === 0) {
                showMessage('შაბლონები არ მოიძებნა', 'error');
                return;
            }

            // Create modal for template selection
            const modal = document.createElement('div');
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 70%; overflow-y: auto;';
            
            let templateOptions = '';
            templates.forEach((template, index) => {
                const templateName = template.patient_name.replace('შაბლონი: ', '');
                templateOptions += `
                    <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 10px; cursor: pointer; hover:background-color: #f8fafc;" onclick="selectTemplate(${index})">
                        <strong>${templateName}</strong>
                        <br><small style="color: #64748b;">შექმნილია: ${new Date(template.created_at).toLocaleDateString('ka-GE')}</small>
                    </div>
                `;
            });
            
            modalContent.innerHTML = `
                <h3 style="margin-top: 0; color: #1e40af;">აირჩიეთ შაბლონი</h3>
                <div id="templateList">${templateOptions}</div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button onclick="closeTemplateModal()" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer;">გაუქმება</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            window.closeTemplateModal = () => modal.remove();
            
            window.selectTemplate = (index) => {
                const selectedTemplate = templates[index];
                loadTemplateData(selectedTemplate);
                modal.remove();
            };
        }

        function loadTemplateData(template) {
            try {
                // Load medications
                const medications = JSON.parse(template.medications || '{}');
                
                // Load medication names and schedules
                Object.keys(medications).forEach(key => {
                    const input = document.querySelector(`input[name="${key}"]`);
                    if (input) {
                        input.value = medications[key];
                    }
                });

                showMessage('შაბლონი წარმატებით ჩაიტვირთა!', 'success');
            } catch (error) {
                showMessage('შეცდომა შაბლონის ჩატვირთვისას', 'error');
            }
        }

        function collectCurrentMedications() {
            const medications = {};
            // Collect medication names and schedules
            for (let i = 1; i <= 15; i++) {
                const nameInput = document.querySelector(`input[name="med_name_${i}"]`);
                if (nameInput && nameInput.value.trim()) {
                    medications[`med_name_${i}`] = nameInput.value.trim();
                    
                    // Collect schedule for this medication
                    const hours = [];
                    for (let h = 9; h <= 24; h++) hours.push(h);
                    for (let h = 1; h <= 9; h++) hours.push(h);
                    
                    hours.forEach(hour => {
                        const scheduleInput = document.querySelector(`input[name="med_${i}_${hour}"]`);
                        if (scheduleInput && scheduleInput.value.trim()) {
                            medications[`med_${i}_${hour}`] = scheduleInput.value.trim();
                        }
                    });
                }
            }
            return JSON.stringify(medications);
        }

        function printForm() {
            // Store current page state
            const originalPage = currentPage;
            
            // Show all pages for printing
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = 'block !important';
                page.classList.add('active');
            });
            
            // Add print-specific styles
            const printStyle = document.createElement('style');
            printStyle.id = 'print-styles';
            printStyle.textContent = `
                @media print {
                    .page {
                        display: block !important;
                        page-break-after: always;
                        page-break-inside: avoid;
                        min-height: 250mm;
                        margin-bottom: 0;
                    }
                    .page:last-child {
                        page-break-after: auto;
                    }
                    .navigation, .save-btn {
                        display: none !important;
                    }
                    .vitals-table {
                        page-break-inside: avoid;
                    }
                }
            `;
            document.head.appendChild(printStyle);
            
            // Print after a short delay to ensure styles are applied
            setTimeout(() => {
                window.print();
                
                // Clean up after printing
                setTimeout(() => {
                    // Remove print styles
                    const printStyleElement = document.getElementById('print-styles');
                    if (printStyleElement) {
                        printStyleElement.remove();
                    }
                    
                    // Restore original view
                    document.querySelectorAll('.page').forEach((page, index) => {
                        if (index + 1 !== originalPage) {
                            page.style.display = 'none';
                            page.classList.remove('active');
                        }
                    });
                    
                    // Show current page
                    showPage(originalPage);
                }, 500);
            }, 100);
        }

        function showMessage(text, type) {
            const msg = document.createElement('div');
            msg.textContent = text;
            msg.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 6px; z-index: 1000; color: white; background: ${type === 'success' ? '#059669' : '#dc2626'};`;
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 3000);
        }

        function collectVitalSigns() {
            const vitals = {};
            document.querySelectorAll('#vitalsTable input').forEach(input => {
                if (input.value.trim()) {
                    vitals[input.name] = input.value.trim();
                }
            });
            return JSON.stringify(vitals);
        }

        function collectEnteralFeeding() {
            const enteral = {};
            document.querySelectorAll('#enteralTable input').forEach(input => {
                if (input.value.trim()) {
                    enteral[input.name] = input.value.trim();
                }
            });
            return JSON.stringify(enteral);
        }

        function collectOtherParameters() {
            const others = {};
            document.querySelectorAll('#otherParamsTable input').forEach(input => {
                if (input.value.trim()) {
                    others[input.name] = input.value.trim();
                }
            });
            return JSON.stringify(others);
        }

        function clearForm() {
            // Clear all inputs
            document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], select').forEach(input => {
                if (input.id !== 'currentDate') {
                    input.value = '';
                }
            });
            
            // Reset to page 1
            showPage(1);
        }

        // Initialize the application
        document.addEventListener('DOMContentLoaded', initializeApp);
    </script>
 <script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'99fe5f8065bb13ad',t:'MTc2MzM3MzU0Mi4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script></body>
</html>
