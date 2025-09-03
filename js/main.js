// js/main.js

// --- 1. IMPORTA AS FUNÇÕES DE TODOS OS MÓDULOS ---
import { initializeInventory, saveInventoryData, clearInventoryForm, loadInventoryData, updateInventoryDateTime } from './modules/inventory.js';
import { initializeServiceOrder, saveOSData, clearOSForm, loadOSData, updateOSDateTime } from './modules/serviceOrder.js';
import { initializePurchaseOrder, savePOData, clearPOForm, loadPOData, updatePODateTime } from './modules/purchaseOrder.js';
import { initializePreventiveMaintenance, savePMData, clearPMForm, loadPMData, updatePMDateTime } from './modules/preventiveMaintenance.js';
import { initializeWithdrawalOrder, saveWOData, clearWOForm, loadWOData, updateWODateTime } from './modules/withdrawalOrder.js';
import { initializeSalesProposal, saveSPData, clearSPForm, loadSPData, updateSPDateTime } from './modules/salesProposal.js';
import { initializeSignatureEditor } from './modules/signatureEditor.js';


// --- 2. CONTROLA A NAVEGAÇÃO ENTRE OS MÓDULOS ---
function setupNavigation() {
    const navTabsContainer = document.querySelector('.nav-tabs');
    const navTabs = document.querySelectorAll('.nav-tab');
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    const modules = document.querySelectorAll('.module');

    function activateModule(moduleId) {
        // Esconde ou mostra as abas de navegação
        if (moduleId === 'dashboard') {
            navTabsContainer.style.display = 'none';
        } else {
            navTabsContainer.style.display = 'flex';
        }

        // Ativa o módulo correto
        modules.forEach(module => module.classList.remove('active'));
        const activeModule = document.getElementById(moduleId);
        if (activeModule) {
            activeModule.classList.add('active');
        }

        // Ativa a aba correta
        navTabs.forEach(tab => tab.classList.remove('active'));
        const activeTab = document.querySelector(`.nav-tab[data-module="${moduleId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => activateModule(tab.getAttribute('data-module')));
    });

    dashboardCards.forEach(card => {
        card.addEventListener('click', () => activateModule(card.getAttribute('data-module')));
    });

    // Estado inicial: esconde as abas se a página carregar no dashboard
    activateModule('dashboard');
}


// --- 3. INICIALIZA A APLICAÇÃO E CONECTA TODOS OS BOTÕES ---
function initializeApp() {
    setupNavigation();

    // Inicializa todos os módulos
    initializeInventory();
    initializeServiceOrder();
    initializePurchaseOrder();
    initializePreventiveMaintenance();
    initializeWithdrawalOrder();
    initializeSalesProposal();
    initializeSignatureEditor();

    // Carrega dados salvos
    loadInventoryData();
    loadOSData();
    loadPOData();
    loadPMData();
    loadWOData();
    loadSPData();

    // ==================================================================
    // CONECTA OS BOTÕES ÀS FUNÇÕES DOS MÓDULOS (VERSÃO COMPLETA)
    // ==================================================================

    // --- Botões do Inventário ---
    document.getElementById('print-inventory-btn').addEventListener('click', () => window.print());
    document.getElementById('save-inventory-btn').addEventListener('click', saveInventoryData);
    document.getElementById('clear-inventory-btn').addEventListener('click', clearInventoryForm);

    // --- Botões da Ordem de Serviço ---
    document.getElementById('print-os-btn').addEventListener('click', () => window.print());
    document.getElementById('save-os-btn').addEventListener('click', saveOSData);
    document.getElementById('clear-os-btn').addEventListener('click', clearOSForm);

    // --- Botões do Pedido de Compras ---
    document.getElementById('print-po-btn').addEventListener('click', () => window.print());
    document.getElementById('save-po-btn').addEventListener('click', savePOData);
    document.getElementById('clear-po-btn').addEventListener('click', clearPOForm);

    // --- Botões da Manutenção Preventiva ---
    document.getElementById('print-pm-btn').addEventListener('click', () => window.print());
    document.getElementById('save-pm-btn').addEventListener('click', savePMData);
    document.getElementById('clear-pm-btn').addEventListener('click', clearPMForm);

    // --- Botões da Retirada de Peças ---
    document.getElementById('print-wo-btn').addEventListener('click', () => window.print());
    document.getElementById('save-wo-btn').addEventListener('click', saveWOData);
    document.getElementById('clear-wo-btn').addEventListener('click', clearWOForm);

    // --- Botões da Proposta de Venda ---
    document.getElementById('print-sp-btn').addEventListener('click', () => window.print());
    document.getElementById('save-sp-btn').addEventListener('click', saveSPData);
    document.getElementById('clear-sp-btn').addEventListener('click', clearSPForm);

    // Atualiza data/hora a cada minuto
    setInterval(() => {
        updateInventoryDateTime();
        updateOSDateTime();
        updatePODateTime();
        updatePMDateTime();
        updateWODateTime();
        updateSPDateTime();
    }, 60000);
}

// --- 4. DISPARA A APLICAÇÃO QUANDO A PÁGINA CARREGA ---
document.addEventListener('DOMContentLoaded', initializeApp);