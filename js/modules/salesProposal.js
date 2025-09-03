// js/modules/salesProposal.js

// --- VARIÁVEIS DO MÓDULO ---
let spEquipmentData = [{
    equipment: '', brand: '', notes: '', quantity: 1,
    price: '', total: 0, imageData: ''
}];

// --- FUNÇÕES INTERNAS DO MÓDULO ---

/**
 * Calcula os totais da proposta de venda e atualiza a interface.
 */
function calculateSPTotals() {
    let subtotal = 0;
    spEquipmentData.forEach((item, index) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const rowTotal = quantity * price;
        item.total = rowTotal;
        subtotal += rowTotal;

        const totalCell = document.querySelector(`#sp-equipment-body tr[data-index="${index}"] .total-cell`);
        if (totalCell) {
            totalCell.textContent = `R$ ${rowTotal.toFixed(2).replace('.', ',')}`;
        }
    });

    const discount = parseFloat(document.getElementById('discount-input').value) || 0;
    const shipping = parseFloat(document.getElementById('shipping-input').value) || 0;
    const total = subtotal - discount + shipping;

    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

/**
 * Cria a interface para escolher entre upload local ou por URL.
 * @param {number} index - O índice da linha do equipamento.
 */
function handleSPEquipmentPhoto(index) {
    // Remove qualquer menu de opções aberto
    const existingMenu = document.getElementById('photo-options-menu');
    if (existingMenu) existingMenu.remove();

    // Cria o menu de opções
    const menu = document.createElement('div');
    menu.id = 'photo-options-menu';
    menu.style = `position: absolute; background: white; border: 1px solid #ccc; box-shadow: var(--shadow-8); padding: 10px; border-radius: 8px; z-index: 100;`;

    const urlButton = document.createElement('button');
    urlButton.textContent = 'Inserir URL';
    urlButton.className = 'btn-secondary';
    urlButton.onclick = () => {
        const url = prompt('Cole a URL da imagem:');
        if (url) {
            spEquipmentData[index].imageData = url;
            initializeSPTable();
        }
        menu.remove();
    };

    const localButton = document.createElement('button');
    localButton.textContent = 'Carregar do Computador';
    localButton.className = 'btn-secondary';
    localButton.style.marginTop = '8px';
    localButton.onclick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = event => {
                    spEquipmentData[index].imageData = event.target.result;
                    initializeSPTable();
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
        menu.remove();
    };

    menu.appendChild(urlButton);
    menu.appendChild(localButton);

    // Posiciona o menu próximo ao placeholder clicado
    const placeholder = document.getElementById(`sp-photo-placeholder-${index}`);
    const rect = placeholder.getBoundingClientRect();
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    document.body.appendChild(menu);

    // Fecha o menu se clicar fora
    setTimeout(() => {
        document.body.addEventListener('click', () => menu.remove(), { once: true });
    }, 0);
}

/**
 * Renderiza a tabela de equipamentos da proposta.
 */
function initializeSPTable() {
    const tableBody = document.getElementById('sp-equipment-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    spEquipmentData.forEach((item, index) => {
        const row = tableBody.insertRow();
        row.dataset.index = index;
        row.innerHTML = `
            <td style="text-align:center; font-weight:600;">${index + 1}</td>
            <td class="photo-cell">
                <div class="photo-placeholder" id="sp-photo-placeholder-${index}" title="Adicionar Imagem"></div>
            </td>
            <td><input type="text" class="equipment-input" value="${item.equipment}" placeholder="Equipamento"></td>
            <td><input type="text" class="brand-input" value="${item.brand}" placeholder="Marca/Modelo"></td>
            <td><textarea class="notes-input" placeholder="Observações">${item.notes}</textarea></td>
            <td><input type="number" class="quantity-input" min="1" value="${item.quantity}"></td>
            <td><input type="number" class="price-input" step="0.01" min="0" value="${item.price}" placeholder="0,00"></td>
            <td class="total-cell" style="font-weight:600;">R$ 0,00</td>
            <td style="text-align:center;">
                <button class="btn-tertiary remove-row-btn" title="Remover Item"><i class="fas fa-trash"></i></button>
            </td>
        `;

        // Exibe a imagem se existir
        const placeholder = row.querySelector('.photo-placeholder');
        if (item.imageData) {
            placeholder.innerHTML = `<img src="${item.imageData}" alt="Equipamento" style="max-width:80px; max-height:60px; border-radius:4px; object-fit:cover;">`;
        } else {
            placeholder.innerHTML = `<i class="fas fa-camera" style="font-size: 24px; color: #ccc;"></i>`;
        }
        placeholder.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique feche o menu imediatamente
            handleSPEquipmentPhoto(index);
        });

        // Adiciona listeners para os inputs da linha
        row.querySelector('.equipment-input').addEventListener('input', e => { spEquipmentData[index].equipment = e.target.value; });
        row.querySelector('.brand-input').addEventListener('input', e => { spEquipmentData[index].brand = e.target.value; });
        row.querySelector('.notes-input').addEventListener('input', e => { spEquipmentData[index].notes = e.target.value; });
        row.querySelector('.quantity-input').addEventListener('input', e => { spEquipmentData[index].quantity = e.target.value; calculateSPTotals(); });
        row.querySelector('.price-input').addEventListener('input', e => { spEquipmentData[index].price = e.target.value; calculateSPTotals(); });
        row.querySelector('.remove-row-btn').addEventListener('click', () => removeSPRow(index));
    });

    calculateSPTotals();
}

function addNewSPRow() {
    spEquipmentData.push({ equipment: '', brand: '', notes: '', quantity: 1, price: '', total: 0, imageData: '' });
    initializeSPTable();
}

function removeSPRow(index) {
    if (spEquipmentData.length > 1) {
        spEquipmentData.splice(index, 1);
        initializeSPTable();
    } else {
        alert("A proposta deve ter pelo menos um item.");
    }
}

// --- FUNÇÕES EXPORTADAS (CONTROLADAS PELO main.js) ---

export function initializeSalesProposal() {
    document.getElementById('add-sp-equipment-btn').addEventListener('click', addNewSPRow);
    document.getElementById('discount-input').addEventListener('input', calculateSPTotals);
    document.getElementById('shipping-input').addEventListener('input', calculateSPTotals);
    updateSPDateTime();
}

export function saveSPData() {
    const data = {
        saleNumber: document.getElementById('sale-number').value,
        saleDate: document.getElementById('sale-date').value,
        validDate: document.getElementById('valid-date').value,
        clientName: document.getElementById('client-name').value,
        clientDocument: document.getElementById('client-document').value,
        clientEmail: document.getElementById('client-email').value,
        clientPhone: document.getElementById('client-phone').value,
        clientAddress: document.getElementById('client-full-address').value,
        salesperson: document.getElementById('salesperson').value,
        paymentMethod: document.getElementById('payment-method').value,
        paymentTerms: document.getElementById('payment-terms').value,
        equipment: spEquipmentData,
        discount: document.getElementById('discount-input').value,
        shipping: document.getElementById('shipping-input').value,
    };
    localStorage.setItem('spData', JSON.stringify(data));
    const saveStatus = document.getElementById('sp-save-status');
    saveStatus.textContent = 'Proposta salva com sucesso!';
    setTimeout(() => { saveStatus.textContent = ''; }, 3000);
}

export function loadSPData() {
    const savedData = localStorage.getItem('spData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('sale-number').value = data.saleNumber || '';
        document.getElementById('sale-date').value = data.saleDate || '';
        document.getElementById('valid-date').value = data.validDate || '';
        document.getElementById('client-name').value = data.clientName || '';
        document.getElementById('client-document').value = data.clientDocument || '';
        document.getElementById('client-email').value = data.clientEmail || '';
        document.getElementById('client-phone').value = data.clientPhone || '';
        document.getElementById('client-full-address').value = data.clientAddress || '';
        document.getElementById('salesperson').value = data.salesperson || '';
        document.getElementById('payment-method').value = data.paymentMethod || '';
        document.getElementById('payment-terms').value = data.paymentTerms || '';
        document.getElementById('discount-input').value = data.discount || '0.00';
        document.getElementById('shipping-input').value = data.shipping || '0.00';
        spEquipmentData = data.equipment || spEquipmentData;
    } else {
        const today = new Date();
        document.getElementById('sale-date').value = today.toISOString().substr(0, 10);
        const validDate = new Date();
        validDate.setDate(today.getDate() + 30);
        document.getElementById('valid-date').value = validDate.toISOString().substr(0, 10);
    }
    initializeSPTable();
}

export function clearSPForm() {
    if (confirm('Tem certeza que deseja limpar todos os dados da proposta?')) {
        spEquipmentData = [{ equipment: '', brand: '', notes: '', quantity: 1, price: '', total: 0, imageData: '' }];
        localStorage.removeItem('spData');

        // Limpa todos os campos do formulário
        const formIds = ['sale-number', 'sale-date', 'valid-date', 'client-name', 'client-document', 'client-email', 'client-phone', 'client-full-address', 'salesperson', 'payment-method', 'payment-terms', 'discount-input', 'shipping-input'];
        formIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById('discount-input').value = '0.00';
        document.getElementById('shipping-input').value = '0.00';

        loadSPData(); // Recarrega com os valores padrão de data
        const saveStatus = document.getElementById('sp-save-status');
        saveStatus.textContent = 'Formulário limpo!';
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
}

export function updateSPDateTime() {
    const elem = document.getElementById('sp-current-datetime');
    if (elem) {
        const now = new Date();
        elem.textContent = now.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
}