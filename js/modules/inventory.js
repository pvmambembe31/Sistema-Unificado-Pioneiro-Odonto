// js/modules/inventory.js
const INVENTORY_ROWS = 20;
let inventoryData = Array(INVENTORY_ROWS).fill().map(() => ({ equipment: '', brand: '', serial: '' }));

function updateInventoryData(index, field) {
    const value = document.getElementById(`${field}-${index}`).value;
    inventoryData[index][field] = value;
}

export function initializeInventory() {
    const inventoryBody = document.getElementById('inventory-body');
    inventoryBody.innerHTML = '';
    for (let i = 0; i < INVENTORY_ROWS; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td><input type="text" id="equipment-${i}" name="equipment-${i}"></td>
            <td><input type="text" id="brand-${i}" name="brand-${i}"></td>
            <td><input type="text" id="serial-${i}" name="serial-${i}"></td>
        `;
        inventoryBody.appendChild(row);

        // Adiciona event listeners
        document.getElementById(`equipment-${i}`).addEventListener('input', () => updateInventoryData(i, 'equipment'));
        document.getElementById(`brand-${i}`).addEventListener('input', () => updateInventoryData(i, 'brand'));
        document.getElementById(`serial-${i}`).addEventListener('input', () => updateInventoryData(i, 'serial'));
    }
    updateInventoryDateTime();
}

export function saveInventoryData() {
    const data = {
        clinicName: document.getElementById('clinic-name').value,
        inventoryDate: document.getElementById('inventory-date').value,
        responsible: document.getElementById('responsible').value,
        location: document.getElementById('location').value,
        items: inventoryData
    };
    localStorage.setItem('inventoryData', JSON.stringify(data));
    const saveStatus = document.getElementById('inventory-save-status');
    saveStatus.textContent = 'Dados salvos com sucesso!';
    setTimeout(() => { saveStatus.textContent = ''; }, 3000);
}

export function loadInventoryData() {
    const savedData = localStorage.getItem('inventoryData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('clinic-name').value = data.clinicName || '';
        document.getElementById('inventory-date').value = data.inventoryDate || '';
        document.getElementById('responsible').value = data.responsible || '';
        document.getElementById('location').value = data.location || '';
        if (data.items) {
            inventoryData = data.items;
            for (let i = 0; i < INVENTORY_ROWS; i++) {
                if (data.items[i]) {
                    document.getElementById(`equipment-${i}`).value = data.items[i].equipment || '';
                    document.getElementById(`brand-${i}`).value = data.items[i].brand || '';
                    document.getElementById(`serial-${i}`).value = data.items[i].serial || '';
                }
            }
        }
    } else {
        document.getElementById('inventory-date').value = new Date().toISOString().substr(0, 10);
    }
}

export function clearInventoryForm() {
    if (confirm('Tem certeza que deseja limpar todos os dados do inventário?')) {
        document.getElementById('clinic-name').value = '';
        document.getElementById('inventory-date').value = new Date().toISOString().substr(0, 10);
        document.getElementById('responsible').value = '';
        document.getElementById('location').value = '';
        inventoryData = Array(INVENTORY_ROWS).fill().map(() => ({ equipment: '', brand: '', serial: '' }));
        for (let i = 0; i < INVENTORY_ROWS; i++) {
            document.getElementById(`equipment-${i}`).value = '';
            document.getElementById(`brand-${i}`).value = '';
            document.getElementById(`serial-${i}`).value = '';
        }
        localStorage.removeItem('inventoryData');
        const saveStatus = document.getElementById('inventory-save-status');
        saveStatus.textContent = 'Formulário limpo!';
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
}

export function updateInventoryDateTime() {
    const now = new Date();
    const dateTimeStr = now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    document.getElementById('inventory-current-datetime').textContent = dateTimeStr;
}