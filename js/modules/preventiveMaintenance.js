// js/modules/preventiveMaintenance.js

const equipmentList = ["Cadeira", "Unidade Auxiliar", "Kart", "Refletor", "Prof", "Raio X", "Bomba a vácuo", "Compressor", "Fotopolimerizador", "Amalgamador", "Moxo"];
let maintenanceData = equipmentList.map(equipment => ({
    equipment: equipment,
    problems: '',
    requests: '',
    services: ''
}));

function updateMaintenanceData(index, field, value) {
    maintenanceData[index][field] = value;
}

export function initializePreventiveMaintenance() {
    const maintenanceBody = document.getElementById('maintenance-body');
    maintenanceBody.innerHTML = '';
    maintenanceData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.equipment}</td>
            <td><textarea placeholder="Problemas encontrados" data-field="problems"></textarea></td>
            <td><textarea placeholder="Solicitações de troca/reparo" data-field="requests"></textarea></td>
            <td><textarea placeholder="Serviços realizados na hora" data-field="services"></textarea></td>
        `;
        maintenanceBody.appendChild(row);

        row.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                updateMaintenanceData(index, e.target.dataset.field, e.target.value);
            });
        });
    });
    updatePMDateTime();
}

export function savePMData() {
    const data = {
        clinicNumber: document.getElementById('clinic-number').value,
        maintenanceDate: document.getElementById('maintenance-date').value,
        technician: document.getElementById('pm-technician').value,
        weekDay: document.getElementById('week-day').value,
        maintenance: maintenanceData
    };
    localStorage.setItem('pmData', JSON.stringify(data));
    const saveStatus = document.getElementById('pm-save-status');
    saveStatus.textContent = 'Dados salvos com sucesso!';
    setTimeout(() => { saveStatus.textContent = ''; }, 3000);
}

export function loadPMData() {
    const savedData = localStorage.getItem('pmData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('clinic-number').value = data.clinicNumber || '';
        document.getElementById('maintenance-date').value = data.maintenanceDate || '';
        document.getElementById('pm-technician').value = data.technician || '';
        document.getElementById('week-day').value = data.weekDay || '';
        if (data.maintenance) {
            maintenanceData = data.maintenance;
            const textareas = document.querySelectorAll('#maintenance-body textarea');
            textareas.forEach((textarea, i) => {
                const index = Math.floor(i / 3);
                const field = textarea.dataset.field;
                if (maintenanceData[index]) {
                    textarea.value = maintenanceData[index][field] || '';
                }
            });
        }
    } else {
        const today = new Date();
        document.getElementById('maintenance-date').value = today.toISOString().substr(0, 10);
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        document.getElementById('week-day').value = days[today.getDay()];
    }
}

export function clearPMForm() {
    if (confirm('Tem certeza que deseja limpar todos os dados da Manutenção Preventiva?')) {
        document.getElementById('clinic-number').value = '';
        document.getElementById('pm-technician').value = '';
        
        maintenanceData = equipmentList.map(equipment => ({ equipment, problems: '', requests: '', services: '' }));
        document.querySelectorAll('#maintenance-body textarea').forEach(textarea => textarea.value = '');
        
        localStorage.removeItem('pmData');

        const today = new Date();
        document.getElementById('maintenance-date').value = today.toISOString().substr(0, 10);
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        document.getElementById('week-day').value = days[today.getDay()];
        
        const saveStatus = document.getElementById('pm-save-status');
        saveStatus.textContent = 'Formulário limpo!';
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
}

export function updatePMDateTime() {
    const now = new Date();
    const dateTimeStr = now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    document.getElementById('pm-current-datetime').textContent = dateTimeStr;
}