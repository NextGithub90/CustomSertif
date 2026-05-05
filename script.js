document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const formSection = document.getElementById('form-section');
    const previewSection = document.getElementById('preview-section');
    const certForm = document.getElementById('cert-form');
    const btnBack = document.getElementById('btn-back');
    const btnDownload = document.getElementById('btn-download');
    const btnPrint = document.getElementById('btn-print');
    const certWrapper = document.getElementById('cert-wrapper');

    // Mappings between input IDs and output element IDs
    const idMap = {
        'partName': 'out-partName',
        'detDuration': 'out-detDuration',
        'detField': 'out-detField',
        'detDate': 'out-detDate',
        'detExtra': 'out-detExtra',
        'authPlaceDate': 'out-authPlaceDate',
        'authEntity': 'out-authEntity',
        'authSignerName': 'out-authSignerName',
        'authSignerTitle': 'out-authSignerTitle',
        'instName': 'out-instName',
        'certTitle': 'out-certTitle',
        'detAchievement': 'out-detAchievement'
    };

    // Responsive Scaling for Preview
    function resizeCert() {
        if (previewSection.classList.contains('hidden')) return;
        
        // Target fixed width of the certificate container
        const targetWidth = 1123; 
        const targetHeight = 794;
        
        // Parent container width (with some padding allowance)
        const parentWidth = certWrapper.parentElement.clientWidth - 40; 
        
        if (parentWidth < targetWidth) {
            const scale = parentWidth / targetWidth;
            certWrapper.style.transform = `scale(${scale})`;
            // Adjust margin bottom so the wrapper doesn't take full height after scaling
            certWrapper.style.marginBottom = `-${targetHeight * (1 - scale)}px`;
        } else {
            certWrapper.style.transform = 'scale(1)';
            certWrapper.style.marginBottom = '0px';
        }
    }

    // Form Submission: Generate Certificate
    certForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Update all output fields based on form inputs
        for (const [inputId, outputId] of Object.entries(idMap)) {
            const inputEl = document.getElementById(inputId);
            const outputEl = document.getElementById(outputId);
            if (inputEl && outputEl) {
                outputEl.textContent = inputEl.value;
            }
        }

        // Hide form, show preview
        formSection.classList.add('hidden');
        previewSection.classList.remove('hidden');
        previewSection.classList.add('flex'); // Uses flex-col

        // Trigger resize to fit screen immediately
        resizeCert();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Back to Form
    btnBack.addEventListener('click', () => {
        previewSection.classList.add('hidden');
        previewSection.classList.remove('flex');
        formSection.classList.remove('hidden');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Window Resize listener for responsive certificate view
    window.addEventListener('resize', resizeCert);

    // Print Functionality (Best for PDF and physical printing)
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }

    // Download Functionality using html2canvas
    btnDownload.addEventListener('click', async () => {
        const certContainer = document.getElementById('certificate-container');
        
        // Change button state
        const originalText = btnDownload.innerHTML;
        btnDownload.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;
        btnDownload.disabled = true;

        try {
            // html2canvas configuration for best quality
            const canvas = await html2canvas(certContainer, {
                scale: 2, // 2x scale for high resolution (print quality)
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Convert canvas to image URL
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // Create download link
            const link = document.createElement('a');
            const partName = document.getElementById('partName').value.trim().replace(/\s+/g, '_');
            link.download = `Sertifikat_${partName}.jpeg`;
            link.href = imgData;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error generating certificate image: ", error);
            alert("Terjadi kesalahan saat mengunduh sertifikat. Pastikan gambar background dan logo dapat diakses (bukan error CORS).");
        } finally {
            // Restore button state
            btnDownload.innerHTML = originalText;
            btnDownload.disabled = false;
        }
    });
});
