// js/modules/purchaseOrder.js

// --- VARIÁVEIS DO MÓDULO ---
const PRODUCT_ROWS = 15;
let productsData = Array(PRODUCT_ROWS).fill().map(() => ({ name: '', quantity: '', image: '' }));


// --- FUNÇÕES INTERNAS DO MÓDULO ---

/**
 * Lida com o upload de uma imagem local para uma linha específica da tabela.
 * @param {number} index - O índice da linha do produto.
 */
function handleImageUpload(index) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Aceita apenas arquivos de imagem

    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                // Converte a imagem para um Data URL (string base64) e salva nos dados
                productsData[index].image = event.target.result;

                // Exibe uma miniatura da imagem na tabela
                const display = document.getElementById(`product-image-display-${index}`);
                if (display) {
                    display.innerHTML = `<img src="${event.target.result}" alt="Miniatura" style="max-width: 80px; max-height: 50px; border-radius: 4px; object-fit: cover;" />`;
                }
            };
            reader.readAsDataURL(file);
        }
    };

    fileInput.click(); // Abre a janela de seleção de arquivo
}

/**
 * Atualiza os dados de texto para uma linha de produto.
 * @param {number} index - O índice da linha.
 * @param {string} field - O campo a ser atualizado ('name' ou 'quantity').
 * @param {string} value - O novo valor.
 */
function updateProductData(index, field, value) {
    if (productsData[index]) {
        productsData[index][field] = value;
    }
}


// --- FUNÇÕES EXPORTADAS (CONTROLADAS PELO main.js) ---

/**
 * Inicializa o módulo de Pedido de Compras, criando a tabela.
 */
export function initializePurchaseOrder() {
    const productsBody = document.getElementById('products-body');
    if (!productsBody) return;
    productsBody.innerHTML = ''; // Limpa a tabela antes de recriar

    for (let i = 0; i < PRODUCT_ROWS; i++) {
        const row = productsBody.insertRow();
        row.innerHTML = `
            <td><input type="text" id="product-name-${i}" placeholder="Nome do produto"></td>
            <td><input type="number" id="product-quantity-${i}" min="1" placeholder="Qtd"></td>
            <td class="photo-cell">
                <div id="product-image-display-${i}" style="margin-bottom: 8px; min-height: 50px;"></div>
                <button class="btn-secondary" id="upload-po-img-${i}"><i class="fas fa-upload"></i> Carregar</button>
            </td>
        `;

        // Conecta os inputs para atualizar os dados em tempo real
        document.getElementById(`product-name-${i}`).addEventListener('input', (e) => updateProductData(i, 'name', e.target.value));
        document.getElementById(`product-quantity-${i}`).addEventListener('input', (e) => updateProductData(i, 'quantity', e.target.value));
        document.getElementById(`upload-po-img-${i}`).addEventListener('click', () => handleImageUpload(i));
    }
    updatePODateTime();
}

/**
 * Salva os dados do formulário no localStorage.
 */
export function savePOData() {
    const data = {
        chain: document.getElementById('chain').value,
        clinic: document.getElementById('clinic').value,
        products: productsData
    };
    localStorage.setItem('poData', JSON.stringify(data));
    const saveStatus = document.getElementById('po-save-status');
    if (saveStatus) {
        saveStatus.textContent = 'Dados salvos com sucesso!';
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
}

/**
 * Carrega os dados do localStorage para o formulário.
 */
export function loadPOData() {
    const savedData = localStorage.getItem('poData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('chain').value = data.chain || '';
        document.getElementById('clinic').value = data.clinic || '';

        if (data.products) {
            productsData = data.products;
            for (let i = 0; i < PRODUCT_ROWS; i++) {
                if (productsData[i]) {
                    document.getElementById(`product-name-${i}`).value = productsData[i].name || '';
                    document.getElementById(`product-quantity-${i}`).value = productsData[i].quantity || '';

                    const display = document.getElementById(`product-image-display-${i}`);
                    if (productsData[i].image && display) {
                        display.innerHTML = `<img src="${productsData[i].image}" alt="Miniatura" style="max-width: 80px; max-height: 50px; border-radius: 4px; object-fit: cover;" />`;
                    }
                }
            }
        }
    }
}

/**
 * Limpa o formulário e os dados salvos.
 */
export function clearPOForm() {
    if (confirm('Tem certeza que deseja limpar todos os dados do pedido de compras?')) {
        document.getElementById('chain').value = '';
        document.getElementById('clinic').value = '';

        productsData = Array(PRODUCT_ROWS).fill().map(() => ({ name: '', quantity: '', image: '' }));
        localStorage.removeItem('poData');

        // Limpa visualmente a tabela
        for (let i = 0; i < PRODUCT_ROWS; i++) {
            document.getElementById(`product-name-${i}`).value = '';
            document.getElementById(`product-quantity-${i}`).value = '';
            const display = document.getElementById(`product-image-display-${i}`);
            if (display) display.innerHTML = '';
        }

        const saveStatus = document.getElementById('po-save-status');
        if (saveStatus) {
            saveStatus.textContent = 'Formulário limpo!';
            setTimeout(() => { saveStatus.textContent = ''; }, 3000);
        }
    }
}

/**
 * Atualiza o campo de data e hora no rodapé do módulo.
 */
export function updatePODateTime() {
    const elem = document.getElementById('po-current-datetime');
    if (elem) {
        const now = new Date();
        elem.textContent = now.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
}