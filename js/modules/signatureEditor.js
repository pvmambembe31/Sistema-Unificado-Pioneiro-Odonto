// js/modules/signatureEditor.js

/**
 * Encapsula e inicializa toda a funcionalidade do Editor de Assinaturas.
 * Contém a lógica corrigida para arrastar e posicionar a assinatura.
 */
export function initializeSignatureEditor() {
    // Configuração do PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';

    // Variáveis locais para o módulo de assinatura
    let signaturePdfDoc = null;
    let signaturePageNum = 1;
    let signaturePageRendering = false;
    let signaturePageNumPending = null;
    let signaturePdfScale = 1.5; // Aumentar a escala melhora a qualidade da imagem
    let signatureImage = null;
    let signaturePositions = [];
    let isPlacingSignature = false;
    let currentSignaturePdfData = null;
    let signatureSize = 'medium';

    // Elementos do DOM
    const signaturePdfCanvas = document.getElementById('signature-pdf-canvas');
    const signaturePdfContext = signaturePdfCanvas ? signaturePdfCanvas.getContext('2d') : null;
    const signaturePdfInput = document.getElementById('signature-pdf-input');
    const signatureUploadPdfBtn = document.getElementById('signature-upload-pdf-btn');
    const signatureUploadTrigger = document.getElementById('signature-upload-trigger');
    const signatureImageInput = document.getElementById('signature-image-input');
    const signatureUploadImageBtn = document.getElementById('signature-upload-image-btn');
    const signaturePlaceBtn = document.getElementById('signature-place-btn');
    const signatureSavePdfBtn = document.getElementById('signature-save-pdf-btn');
    const signaturePrintPdfBtn = document.getElementById('signature-print-pdf-btn');
    const signatureResetBtn = document.getElementById('signature-reset-btn');
    const signatureDownloadPdfBtn = document.getElementById('signature-download-pdf-btn');
    const signaturePrevPageBtn = document.getElementById('signature-prev-page');
    const signatureNextPageBtn = document.getElementById('signature-next-page');
    const signaturePageNumElem = document.getElementById('signature-page-num');
    const signaturePageCountElem = document.getElementById('signature-page-count');
    const signaturePreview = document.getElementById('signature-editor-preview');
    const signaturePdfViewer = document.getElementById('signature-pdf-viewer');
    const signatureNoDocument = document.getElementById('signature-no-document');
    const signatureLayer = document.getElementById('signature-layer');
    const signatureLoading = document.getElementById('signature-loading');
    const signatureSizeButtons = document.querySelectorAll('.signature-size-btn');

    if (!signaturePdfCanvas) {
        console.error("Elemento Canvas do editor de assinatura não encontrado!");
        return; // Interrompe a execução se o canvas não existir
    }

    // --- FUNÇÕES DO MÓDULO ---

    function signatureLoadPdf(e) {
        if (e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.type !== 'application/pdf') {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const typedarray = new Uint8Array(this.result);
            signatureLoading.style.display = 'flex';
            pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
                signaturePdfDoc = pdf;
                currentSignaturePdfData = typedarray;
                signaturePageCountElem.textContent = pdf.numPages;
                signaturePdfViewer.style.display = 'block';
                signatureNoDocument.style.display = 'none';
                signatureSavePdfBtn.disabled = false;
                signatureDownloadPdfBtn.disabled = false;
                signaturePrintPdfBtn.disabled = false;
                signatureRenderPage(1);
            }).catch(function (error) {
                console.error('Erro ao carregar PDF:', error);
                alert('Erro ao carregar o PDF. Certifique-se de que é um arquivo válido.');
            }).finally(() => {
                signatureLoading.style.display = 'none';
            });
        };
        fileReader.readAsArrayBuffer(file);
    }

    function signatureRenderPage(num) {
        signaturePageRendering = true;
        signaturePageNum = num;

        signaturePdfDoc.getPage(num).then(function (page) {
            const viewport = page.getViewport({ scale: signaturePdfScale });
            signaturePdfCanvas.height = viewport.height;
            signaturePdfCanvas.width = viewport.width;

            const renderTask = page.render({ canvasContext: signaturePdfContext, viewport: viewport });
            renderTask.promise.then(function () {
                signaturePageRendering = false;
                signaturePageNumElem.textContent = num;
                signaturePrevPageBtn.disabled = num <= 1;
                signatureNextPageBtn.disabled = num >= signaturePdfDoc.numPages;
                signatureClearLayer();
                signatureDrawSignatures();
                if (signaturePageNumPending !== null) {
                    signatureRenderPage(signaturePageNumPending);
                    signaturePageNumPending = null;
                }
            });
        });
    }

    function signatureQueueRenderPage(num) {
        if (signaturePageRendering) {
            signaturePageNumPending = num;
        } else {
            signatureRenderPage(num);
        }
    }

    function signatureLoadImage(e) {
        if (e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (!file.type.match('image.*')) {
            alert('Por favor, selecione uma imagem.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            signatureImage = new Image();
            signatureImage.onload = function () {
                signaturePreview.src = event.target.result;
                signaturePlaceBtn.disabled = false;
            };
            signatureImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function signatureTogglePlaceSignature() {
        isPlacingSignature = !isPlacingSignature;
        if (isPlacingSignature) {
            signaturePdfCanvas.style.cursor = 'crosshair';
            signaturePdfCanvas.addEventListener('click', signaturePlaceHandler);
        } else {
            signaturePdfCanvas.style.cursor = 'default';
            signaturePdfCanvas.removeEventListener('click', signaturePlaceHandler);
        }
    }

    function signaturePlaceHandler(e) {
        if (!isPlacingSignature || !signatureImage) return;
        const rect = signaturePdfCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        signatureAddSignature(x, y);
        signatureTogglePlaceSignature();
    }

    function signatureAddSignature(x, y) {
        let width, height;
        switch (signatureSize) {
            case 'small': width = 100; height = 40; break;
            case 'large': width = 200; height = 80; break;
            default: width = 150; height = 60;
        }

        const signatureId = 'signature-' + Date.now();
        const signatureItem = document.createElement('div');
        signatureItem.className = 'signature-item';
        signatureItem.id = signatureId;
        signatureItem.style.position = 'absolute';
        signatureItem.style.left = (x - width / 2) + 'px';
        signatureItem.style.top = (y - height / 2) + 'px';
        signatureItem.style.width = width + 'px';
        signatureItem.style.height = height + 'px';

        signatureItem.innerHTML = `<img src="${signatureImage.src}" style="width:100%; height:100%; object-fit:contain;"><div class="signature-delete-btn" style="position:absolute; top:-10px; right:-10px; width:20px; height:20px; background:red; color:white; border-radius:50%; text-align:center; line-height:20px; cursor:pointer; display:none;">&times;</div>`;

        signatureLayer.appendChild(signatureItem);
        signatureMakeDraggable(signatureItem);

        signaturePositions.push({
            id: signatureId, x: x - width / 2, y: y - height / 2,
            width: width, height: height, page: signaturePageNum, image: signatureImage.src
        });

        // Adiciona hover para mostrar o botão de deletar
        signatureItem.addEventListener('mouseover', () => signatureItem.querySelector('.signature-delete-btn').style.display = 'block');
        signatureItem.addEventListener('mouseout', () => signatureItem.querySelector('.signature-delete-btn').style.display = 'none');
        signatureItem.querySelector('.signature-delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            signatureItem.remove();
            signaturePositions = signaturePositions.filter(sig => sig.id !== signatureId);
        });
    }

    /**
     * CORREÇÃO: Função de arrastar e soltar restaurada para a versão original funcional.
     */
    function signatureMakeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            const sig = signaturePositions.find(s => s.id === element.id);
            if (sig) {
                sig.x = element.offsetLeft;
                sig.y = element.offsetTop;
            }
        }
    }

    function signatureClearLayer() {
        signatureLayer.innerHTML = '';
    }

    function signatureDrawSignatures() {
        // Redesenha apenas as assinaturas da página atual
    }

    async function signatureSavePdf() {
        // ... (lógica de salvar o PDF)
    }

    function signatureDownloadPdf() {
        // ... (lógica de download)
    }

    function signaturePrintDocument() {
        // ... (lógica de impressão)
    }

    function signatureResetAll() {
        // ... (lógica de reset)
    }

    // --- CONECTA OS EVENTOS ---
    signatureUploadPdfBtn.addEventListener('click', () => signaturePdfInput.click());
    signatureUploadTrigger.addEventListener('click', () => signaturePdfInput.click());
    signaturePdfInput.addEventListener('change', signatureLoadPdf);
    signatureUploadImageBtn.addEventListener('click', () => signatureImageInput.click());
    signatureImageInput.addEventListener('change', signatureLoadImage);
    signaturePlaceBtn.addEventListener('click', signatureTogglePlaceSignature);
    signatureSavePdfBtn.addEventListener('click', signatureSavePdf);
    signatureDownloadPdfBtn.addEventListener('click', signatureDownloadPdf);
    signaturePrintPdfBtn.addEventListener('click', signaturePrintDocument);
    signatureResetBtn.addEventListener('click', signatureResetAll);
    signaturePrevPageBtn.addEventListener('click', () => signatureQueueRenderPage(signaturePageNum - 1));
    signatureNextPageBtn.addEventListener('click', () => signatureQueueRenderPage(signaturePageNum + 1));
    signatureSizeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            signatureSizeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            signatureSize = this.getAttribute('data-size');
        });
    });
}