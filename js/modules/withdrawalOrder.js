// js/modules/withdrawalOrder.js

// --- VARIÁVEIS DO MÓDULO ---
let equipmentCount = 0;
let withdrawalData = {
    companyName: '', // Novo campo para o nome da empresa
    withdrawalNumber: '',
    withdrawalDate: '',
    technician: '',
    clinicLocation: '',
    estimatedReturn: '',
    urgency: 'normal',
    equipment: [],
    observations: ''
};

// --- FUNÇÕES INTERNAS DO MÓDULO ---

/**
 * Renderiza a tabela de equipamentos com base nos dados em withdrawalData.
 */
function renderEquipmentTable() {
    const tableBody = document.getElementById('equipment-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (withdrawalData.equipment.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-secondary);">Nenhum equipamento adicionado.</div>`;
        return;
    }

    withdrawalData.equipment.forEach((item, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td><input type="text" value="${item.name}" placeholder="Nome do equipamento/peça"></td>
            <td><input type="text" value="${item.brand}" placeholder="Marca/fabricante"></td>
            <td><input type="text" value="${item.serial}" placeholder="Nº de série/patrimônio"></td>
            <td><textarea placeholder="Problema relatado pelo cliente">${item.problem}</textarea></td>
            <td><textarea placeholder="Acessórios retirados junto">${item.accessories}</textarea></td>
            <td style="text-align:center;">
                <button class="btn-tertiary remove-row-btn" title="Remover Item"><i class="fas fa-trash"></i></button>
            </td>
        `;

        // Conecta os inputs da nova linha para atualizar os dados em tempo real
        const inputs = row.querySelectorAll('input, textarea');
        inputs[0].addEventListener('input', e => { withdrawalData.equipment[index].name = e.target.value; });
        inputs[1].addEventListener('input', e => { withdrawalData.equipment[index].brand = e.target.value; });
        inputs[2].addEventListener('input', e => { withdrawalData.equipment[index].serial = e.target.value; });
        inputs[3].addEventListener('input', e => { withdrawalData.equipment[index].problem = e.target.value; });
        inputs[4].addEventListener('input', e => { withdrawalData.equipment[index].accessories = e.target.value; });

        row.querySelector('.remove-row-btn').addEventListener('click', () => removeEquipment(item.id));
    });
}

/**
 * Adiciona uma nova linha de equipamento à tabela.
 */
function addEquipment() {
    equipmentCount++;
    withdrawalData.equipment.push({
        id: equipmentCount,
        name: '',
        brand: '',
        serial: '',
        problem: '',
        accessories: ''
    });
    renderEquipmentTable();
}

/**
 * Remove uma linha de equipamento da tabela.
 * @param {number} id - O ID do equipamento a ser removido.
 */
function removeEquipment(id) {
    withdrawalData.equipment = withdrawalData.equipment.filter(item => item.id !== id);
    renderEquipmentTable();
}

// --- FUNÇÕES EXPORTADAS (CONTROLADAS PELO main.js) ---

/**
 * Inicializa o módulo de Ordem de Retirada.
 */
export function initializeWithdrawalOrder() {
    const addButton = document.getElementById('add-wo-equipment-btn');
    if (addButton) {
        addButton.addEventListener('click', addEquipment);
    }
    updateWODateTime();
}

/**
 * Salva os dados do formulário no localStorage.
 */
export function saveWOData() {
    // Coleta os dados dos campos do formulário
    withdrawalData.companyName = document.getElementById('wo-company-name').value;
    withdrawalData.withdrawalNumber = document.getElementById('withdrawal-number').value;
    withdrawalData.withdrawalDate = document.getElementById('withdrawal-date').value;
    withdrawalData.technician = document.getElementById('wo-technician').value;
    withdrawalData.clinicLocation = document.getElementById('clinic-location').value;
    withdrawalData.estimatedReturn = document.getElementById('estimated-return').value;
    withdrawalData.urgency = document.getElementById('urgency').value;
    withdrawalData.observations = document.getElementById('observations-wo').value;

    // Salva no localStorage
    localStorage.setItem('woData', JSON.stringify(withdrawalData));

    // Exibe status de salvamento
    const saveStatus = document.getElementById('wo-save-status');
    if (saveStatus) {
        saveStatus.textContent = 'Dados salvos com sucesso!';
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
}

/**
 * Carrega os dados do localStorage para o formulário.
 */
export function loadWOData() {
    const savedData = localStorage.getItem('woData');
    if (savedData) {
        const data = JSON.parse(savedData);
        withdrawalData = data;

        // Popula os campos do formulário com os dados carregados
        document.getElementById('wo-company-name').value = data.companyName || '';
        document.getElementById('withdrawal-number').value = data.withdrawalNumber || '';
        document.getElementById('withdrawal-date').value = data.withdrawalDate || '';
        document.getElementById('wo-technician').value = data.technician || '';
        document.getElementById('clinic-location').value = data.clinicLocation || '';
        document.getElementById('estimated-return').value = data.estimatedReturn || '';
        document.getElementById('urgency').value = data.urgency || 'normal';
        document.getElementById('observations-wo').value = data.observations || '';

        // Garante que o contador de ID continue do ponto certo
        if (data.equipment && data.equipment.length > 0) {
            equipmentCount = Math.max(...data.equipment.map(item => item.id || 0));
        } else {
            equipmentCount = 0;
        }
    } else {
        // Define valores padrão se não houver dados salvos
        document.getElementById('withdrawal-date').value = new Date().toISOString().substr(0, 10);
        document.getElementById('withdrawal-number').value = `RET-${new Date().getFullYear()}-001`;
    }
    renderEquipmentTable();
}

/**
 * Limpa o formulário e os dados salvos.
 */
export function clearWOForm() {
    if (confirm('Tem certeza que deseja limpar todos os dados desta ordem de retirada?')) {
        equipmentCount = 0;
        withdrawalData = {
            companyName: '',
            withdrawalNumber: `RET-${new Date().getFullYear()}-001`,
            withdrawalDate: new Date().toISOString().substr(0, 10),
            technician: '',
            clinicLocation: '',
            estimatedReturn: '',
            urgency: 'normal',
            equipment: [],
            observations: ''
        };

        localStorage.removeItem('woData');
        loadWOData(); // Recarrega os dados em branco no formulário

        const saveStatus = document.getElementById('wo-save-status');
        if (saveStatus) {
            saveStatus.textContent = 'Formulário limpo!';
            setTimeout(() => { saveStatus.textContent = ''; }, 3000);
        }
    }
}

/**
 * Atualiza o campo de data e hora no rodapé do módulo.
 */
export function updateWODateTime() {
    const elem = document.getElementById('wo-current-datetime');
    if (elem) {
        const now = new Date();
        elem.textContent = now.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
}