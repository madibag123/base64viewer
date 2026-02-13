const base64Input = document.getElementById("base64Input");
const renderedImage = document.getElementById("renderedImage");
const renderedPdf = document.getElementById("renderedPdf");
const placeholderState = document.querySelector(".placeholder-state");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const fileInfo = document.getElementById("fileInfo");

// Converter Elements
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const base64Output = document.getElementById("base64Output");
const copyBase64Btn = document.getElementById("copyBase64Btn");

// Modal Elements
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("fullImage");
const closeModal = document.querySelector(".close-modal");

let currentDataUrl = "";
let currentMimeType = "";

// Auto-focus input on load
window.addEventListener("DOMContentLoaded", () => {
  base64Input.focus();
});

// Tab Switching
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    // Add active to clicked
    btn.classList.add("active");
    const tabId = btn.getAttribute("data-tab");
    document.getElementById(tabId).classList.add("active");
  });
});

base64Input.addEventListener("input", (e) => {
  const value = e.target.value.trim();

  if (value === "") {
    resetViewer();
    return;
  }

  renderImage(value);
});

// Converter Logic
dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");

  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file");
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

copyBase64Btn.addEventListener("click", () => {
  if (base64Output.value) {
    navigator.clipboard.writeText(base64Output.value).then(() => {
      const originalText = copyBase64Btn.textContent;
      copyBase64Btn.textContent = "Copied!";
      setTimeout(() => {
        copyBase64Btn.textContent = originalText;
      }, 2000);
    });
  }
});

clearBtn.addEventListener("click", () => {
  base64Input.value = "";
  resetViewer();
  base64Input.focus();
});

// Modal Logic
renderedImage.addEventListener("click", () => {
  if (renderedImage.src) {
    modal.style.display = "block";
    modalImg.src = renderedImage.src;
    // Disable scroll on body
    document.body.style.overflow = "hidden";
  }
});

closeModal.addEventListener("click", () => {
  closeModalFunc();
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModalFunc();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.style.display === "block") {
    closeModalFunc();
  }
});

function closeModalFunc() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

downloadBtn.addEventListener("click", () => {
  if (currentDataUrl) {
    const link = document.createElement("a");
    link.href = currentDataUrl;
    link.download = getDownloadName(currentMimeType);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});

copyBtn.addEventListener("click", () => {
  if (currentDataUrl) {
    navigator.clipboard.writeText(currentDataUrl).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });
  }
});

function resetViewer() {
  renderedImage.style.display = "none";
  renderedImage.src = "";
  renderedPdf.style.display = "none";
  renderedPdf.src = "";
  placeholderState.style.display = "flex";
  copyBtn.disabled = true;
  downloadBtn.disabled = true;
  fileInfo.textContent = "";
  currentDataUrl = "";
  currentMimeType = "";
}

function renderImage(base64String) {
  const parsed = parseBase64Input(base64String);

  if (!parsed) {
    resetViewer();
    fileInfo.textContent = "Invalid Base64 Data";
    return;
  }

  const { dataUrl, mimeType, estimatedSizeKb } = parsed;
  currentDataUrl = dataUrl;
  currentMimeType = mimeType;

  renderedImage.style.display = "none";
  renderedImage.src = "";
  renderedPdf.style.display = "none";
  renderedPdf.src = "";

  copyBtn.disabled = false;
  downloadBtn.disabled = false;
  placeholderState.style.display = "none";

  if (mimeType === "application/pdf") {
    renderedPdf.src = dataUrl;
    renderedPdf.style.display = "block";
    fileInfo.textContent = `PDF • ~${estimatedSizeKb.toFixed(1)} KB`;
    return;
  }

  renderedImage.src = dataUrl;

  renderedImage.onload = function () {
    renderedImage.style.display = "block";
    const dimensions = `${this.naturalWidth}x${this.naturalHeight}`;
    fileInfo.textContent = `${dimensions} • ~${estimatedSizeKb.toFixed(1)} KB`;
  };

  renderedImage.onerror = function () {
    resetViewer();
    fileInfo.textContent = "Unsupported or invalid image data";
  };
}

function parseBase64Input(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const hasDataUri = trimmed.startsWith("data:");

  if (hasDataUri) {
    const match = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
    if (!match) {
      return null;
    }

    const mimeType = match[1].toLowerCase();
    const payload = match[2].replace(/\s/g, "");

    if (!isLikelyBase64(payload)) {
      return null;
    }

    return {
      dataUrl: `data:${mimeType};base64,${payload}`,
      mimeType,
      estimatedSizeKb: estimateBase64SizeKb(payload),
    };
  }

  const payload = trimmed.replace(/\s/g, "");
  if (!isLikelyBase64(payload)) {
    return null;
  }

  const mimeType = detectMimeType(payload);

  return {
    dataUrl: `data:${mimeType};base64,${payload}`,
    mimeType,
    estimatedSizeKb: estimateBase64SizeKb(payload),
  };
}

function detectMimeType(payload) {
  if (payload.startsWith("JVBERi0")) {
    return "application/pdf";
  }

  if (payload.startsWith("/9j/")) {
    return "image/jpeg";
  }

  if (payload.startsWith("iVBORw0KGgo")) {
    return "image/png";
  }

  if (payload.startsWith("R0lGOD")) {
    return "image/gif";
  }

  if (payload.startsWith("UklGR")) {
    return "image/webp";
  }

  if (payload.startsWith("Qk")) {
    return "image/bmp";
  }

  return "image/png";
}

function isLikelyBase64(payload) {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(payload);
}

function estimateBase64SizeKb(payload) {
  return (payload.length * 3) / 4 / 1024;
}

function getDownloadName(mimeType) {
  const extensionMap = {
    "application/pdf": "pdf",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
  };

  const extension = extensionMap[mimeType] || "bin";
  const baseName = mimeType === "application/pdf" ? "file" : "image";
  return `${baseName}.${extension}`;
}
