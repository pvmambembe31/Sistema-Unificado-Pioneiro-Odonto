// js/modules/serviceOrder.js

/**
 * Gera um número de Ordem de Serviço (OS) único baseado na data e um número aleatório.
 */
function generateOSNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const osNumber = `${year}${month}${day}-${random}`;
    document.getElementById('os-number').value = osNumber;
}

/**
 * Inicializa o módulo de Ordem de Serviço, definindo a data atual e gerando um número de OS se necessário.
 */
export function initializeServiceOrder() {
    if (!document.getElementById('os-number').value) {
        generateOSNumber();
    }
    updateOSDateTime();
}

/**
 * Salva os dados do formulário da Ordem de Serviço no localStorage.
 */
export function saveOSData() {
    const data = {
        osNumber: document.getElementById('os-number').value,
        osDate: document.getElementById('os-date').value,
        client: document.getElementById('client').value,
        equipment: document.getElementById('equipment').value,
        serial: document.getElementById('serial').value,
        technician: document.getElementById('technician').value,
        reportedIssue: document.getElementById('reported-issue').value,
        condition: document.getElementById('condition').value,
        services: document.getElementById('services').value,
        observations: document.getElementById('observations-os').value
    };

    localStorage.setItem('osData', JSON.stringify(data));

    const saveStatus = document.getElementById('os-save-status');
    saveStatus.textContent = 'Dados salvos com sucesso!';
    setTimeout(() => { saveStatus.textContent = ''; }, 3000);
}

/**
 * Carrega os dados da Ordem de Serviço salvos no localStorage para o formulário.
 */
export function loadOSData() {
    const savedData = localStorage.getItem('osData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('os-number').value = data.osNumber || '';
        document.getElementById('os-date').value = data.osDate || '';
        document.getElementById('client').value = data.client || '';
        document.getElementById('equipment').value = data.equipment || '';
        document.getElementById('serial').value = data.serial || '';
        document.getElementById('technician').value = data.technician || '';
        document.getElementById('reported-issue').value = data.reportedIssue || '';
        document.getElementById('condition').value = data.condition || '';
        document.getElementById('services').value = data.services || '';
        document.getElementById('observations-os').value = data.observations || '';
    } else {
        // Define a data atual se não houver dados salvos
        document.getElementById('os-date').value = new Date().toISOString().substr(0, 10);
    }
}

/**
 * Limpa todos os campos do formulário da Ordem de Serviço e remove os dados do localStorage.
 */
export function clearOSForm() {
    if (confirm('Tem certeza que deseja limpar todos os dados da Ordem de Serviço?')) {
        document.getElementById('os-number').value = '';
        document.getElementById('os-date').value = new Date().toISOString().substr(0, 10);
        document.getElementById('client').value = '';
        document.getElementById('equipment').value = '';
        document.getElementById('serial').value = '';
        document.getElementById('technician').value = '';
        document.getElementById('reported-issue').value = '';
        document.getElementById('condition').value = '';
        document.getElementById('services').value = '';
        document.getElementById('observations-os').value = '';

        localStorage.removeItem('osData');
        
        // Gera um novo número de OS após limpar
        generateOSNumber();

        const saveStatus = document.getElementById('os-save-status');
        saveStatus.textContent = 'Formulário limpo!';
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
}

/**
 * Atualiza o campo de data e hora no rodapé do módulo.
 */
export function updateOSDateTime() {
    const now = new Date();
    const dateTimeStr = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('os-current-datetime').textContent = dateTimeStr;
}