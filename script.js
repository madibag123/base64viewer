const base64Input = document.getElementById('base64Input');
const renderedImage = document.getElementById('renderedImage');
const placeholderState = document.querySelector('.placeholder-state');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const imageInfo = document.getElementById('imageInfo');

// Converter Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const base64Output = document.getElementById('base64Output');
const copyBase64Btn = document.getElementById('copyBase64Btn');

// Modal Elements
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('fullImage');
const closeModal = document.querySelector('.close-modal');

// Auto-focus input on load
window.addEventListener('DOMContentLoaded', () => {
    base64Input.focus();
});

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active to clicked
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

base64Input.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    
    if (value === '') {
        resetViewer();
        return;
    }

    renderImage(value);
});

// Converter Logic
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        const base64Result = e.target.result;
        base64Output.value = base64Result;
        copyBase64Btn.disabled = false;
    };
    
    reader.readAsDataURL(file);
}

copyBase64Btn.addEventListener('click', () => {
    if (base64Output.value) {
        navigator.clipboard.writeText(base64Output.value).then(() => {
            const originalText = copyBase64Btn.textContent;
            copyBase64Btn.textContent = 'Copied!';
            setTimeout(() => {
                copyBase64Btn.textContent = originalText;
            }, 2000);
        });
    }
});

clearBtn.addEventListener('click', () => {
    base64Input.value = '';
    resetViewer();
    base64Input.focus();
});

// Modal Logic
renderedImage.addEventListener('click', () => {
    if (renderedImage.src) {
        modal.style.display = "block";
        modalImg.src = renderedImage.src;
        // Disable scroll on body
        document.body.style.overflow = "hidden";
    }
});

closeModal.addEventListener('click', () => {
    closeModalFunc();
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFunc();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === "block") {
        closeModalFunc();
    }
});

function closeModalFunc() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

downloadBtn.addEventListener('click', () => {
    const src = renderedImage.src;
    if (src) {
        const link = document.createElement('a');
        link.href = src;
        // Try to guess extension from src or default to png
        let extension = 'png';
        const match = src.match(/^data:image\/(\w+);base64,/);
        if (match && match[1]) {
            extension = match[1];
        }
        link.download = `image.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

copyBtn.addEventListener('click', () => {
    const src = renderedImage.src;
    if (src) {
        navigator.clipboard.writeText(src).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    }
});

function resetViewer() {
    renderedImage.style.display = 'none';
    renderedImage.src = '';
    placeholderState.style.display = 'flex';
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    imageInfo.textContent = '';
}

function renderImage(base64String) {
    // Remove whitespace/newlines which might break the image
    let cleanedString = base64String.replace(/\s/g, '');
    
    // Check if it already has the data URI scheme
    if (!cleanedString.startsWith('data:image')) {
        // Prepare prefix (defaulting to png, but detection would be better if we could, 
        // for now, we follow instructions to auto-add)
        // If the user pastes a raw base64 string, we assume it's an image.
        cleanedString = `data:image/png;base64,${cleanedString}`;
    }

    renderedImage.src = cleanedString;
    
    renderedImage.onload = function() {
        renderedImage.style.display = 'block';
        placeholderState.style.display = 'none';
        copyBtn.disabled = false;
        downloadBtn.disabled = false;
        
        // Show dimensions or size
        const sizeInKb = (cleanedString.length * 0.75) / 1024;
        imageInfo.textContent = `${this.naturalWidth}x${this.naturalHeight} • ~${sizeInKb.toFixed(1)} KB`;
    };

    renderedImage.onerror = function() {
        // If PNG default fails, maybe try JPEG? Or just show error
        // For this MVP, we'll just log and maybe show a subtle UI hint if we wanted
        // but keeping it simple as requested.
        console.error('Failed to load image');
        // We could revert to placeholder or show "Invalid Image" text
        renderedImage.style.display = 'none';
        placeholderState.style.display = 'flex';
        imageInfo.textContent = 'Invalid Image Data';
    };
}
