const base64Input = document.getElementById("base64Input");
const renderedImage = document.getElementById("renderedImage");
const pdfContainer = document.getElementById("pdfContainer");
const renderedPdf = document.getElementById("renderedPdf");
const placeholderState = document.querySelector(".placeholder-state");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const fullPreviewBtn = document.getElementById("fullPreviewBtn");
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

const GA_MEASUREMENT_ID = "G-Z972ERVJ0F";

let currentDataUrl = "";
let currentMimeType = "";
let activeRenderToken = 0;

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

// Auto-focus input on load
window.addEventListener("DOMContentLoaded", () => {
  base64Input.focus();
  initializeAnalytics();
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
    trackEvent("tab_switch", { tab: tabId });
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

      trackEvent("copy_base64_output", {
        source: "converter",
      });
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
    openImageModal(renderedImage.src);
  }
});

fullPreviewBtn.addEventListener("click", () => {
  if (!currentDataUrl || !currentMimeType) {
    return;
  }

  if (currentMimeType === "application/pdf") {
    openPdfInNewTab(currentDataUrl);
    return;
  }

  trackEvent("full_preview_open", {
    mime_type: currentMimeType,
  });
  openImageModal(currentDataUrl);
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
  modalImg.src = "";
  document.body.style.overflow = "auto";
}

function openImageModal(imageSrc) {
  modal.style.display = "block";
  modalImg.src = imageSrc;
  document.body.style.overflow = "hidden";
}

function openPdfInNewTab(dataUrl) {
  try {
    const blob = dataUrlToBlob(dataUrl);
    const blobUrl = URL.createObjectURL(blob);
    const previewWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");

    if (!previewWindow) {
      fileInfo.textContent =
        "Pop-up blocked. Allow pop-ups for full PDF preview.";
      URL.revokeObjectURL(blobUrl);
      return;
    }

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 60000);

    trackEvent("full_preview_open", {
      mime_type: "application/pdf",
    });
  } catch (error) {
    fileInfo.textContent = "Unable to open full PDF preview";
    console.error("Failed to open PDF preview:", error);
  }
}

downloadBtn.addEventListener("click", () => {
  if (currentDataUrl) {
    const link = document.createElement("a");
    link.href = currentDataUrl;
    link.download = getDownloadName(currentMimeType);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    trackEvent("download_file", {
      mime_type: currentMimeType,
    });
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

      trackEvent("copy_data_url", {
        mime_type: currentMimeType,
      });
    });
  }
});

function resetViewer() {
  activeRenderToken += 1;
  renderedImage.style.display = "none";
  renderedImage.src = "";
  pdfContainer.style.display = "none";
  const context = renderedPdf.getContext("2d");
  context.clearRect(0, 0, renderedPdf.width, renderedPdf.height);
  renderedPdf.width = 0;
  renderedPdf.height = 0;
  placeholderState.style.display = "flex";
  copyBtn.disabled = true;
  fullPreviewBtn.disabled = true;
  downloadBtn.disabled = true;
  fileInfo.textContent = "";
  currentDataUrl = "";
  currentMimeType = "";
}

function renderImage(base64String) {
  const renderToken = ++activeRenderToken;
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
  pdfContainer.style.display = "none";

  copyBtn.disabled = false;
  fullPreviewBtn.disabled = false;
  downloadBtn.disabled = false;
  placeholderState.style.display = "none";

  if (mimeType === "application/pdf") {
    renderPdfToCanvas(dataUrl, estimatedSizeKb, renderToken);
    return;
  }

  renderedImage.src = dataUrl;

  renderedImage.onload = function () {
    if (renderToken !== activeRenderToken) {
      return;
    }
    renderedImage.style.display = "block";
    const dimensions = `${this.naturalWidth}x${this.naturalHeight}`;
    fileInfo.textContent = `${dimensions} • ~${estimatedSizeKb.toFixed(1)} KB`;
    trackEvent("preview_success", {
      mime_type: mimeType,
      file_kind: "image",
    });
  };

  renderedImage.onerror = function () {
    if (renderToken !== activeRenderToken) {
      return;
    }
    resetViewer();
    fileInfo.textContent = "Unsupported or invalid image data";
  };
}

async function renderPdfToCanvas(dataUrl, estimatedSizeKb, renderToken) {
  if (!window.pdfjsLib) {
    resetViewer();
    fileInfo.textContent = "PDF renderer unavailable (CDN load failed)";
    return;
  }

  try {
    const pdfData = dataUrlToUint8Array(dataUrl);
    const loadingTask = window.pdfjsLib.getDocument({ data: pdfData });
    const pdfDocument = await loadingTask.promise;

    if (renderToken !== activeRenderToken) {
      return;
    }

    const firstPage = await pdfDocument.getPage(1);
    const baseViewport = firstPage.getViewport({ scale: 1 });
    const availableWidth = Math.max(pdfContainer.clientWidth - 16, 320);
    const scale = Math.min(2, availableWidth / baseViewport.width);
    const viewport = firstPage.getViewport({ scale });

    const context = renderedPdf.getContext("2d");
    renderedPdf.width = Math.floor(viewport.width);
    renderedPdf.height = Math.floor(viewport.height);

    await firstPage.render({ canvasContext: context, viewport }).promise;

    if (renderToken !== activeRenderToken) {
      return;
    }

    pdfContainer.style.display = "flex";
    const pageLabel =
      pdfDocument.numPages === 1 ? "1 page" : `${pdfDocument.numPages} pages`;
    fileInfo.textContent = `PDF • ${pageLabel} • ~${estimatedSizeKb.toFixed(1)} KB`;
    trackEvent("preview_success", {
      mime_type: "application/pdf",
      file_kind: "pdf",
      page_count: pdfDocument.numPages,
    });
  } catch (error) {
    resetViewer();
    fileInfo.textContent = "Invalid or unsupported PDF data";
    console.error("Failed to render PDF:", error);
  }
}

function parseBase64Input(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const hasDataUri = trimmed.startsWith("data:");

  if (hasDataUri) {
    const match = trimmed.match(
      /^data:([^;,]+)(?:;[^;,=]+=[^;,]+)*;base64,([\s\S]+)$/i,
    );
    if (!match) {
      return null;
    }

    const mimeType = match[1].toLowerCase();
    const payload = normalizeBase64(match[2]);

    if (!isLikelyBase64(payload)) {
      return null;
    }

    return {
      dataUrl: `data:${mimeType};base64,${payload}`,
      mimeType,
      estimatedSizeKb: estimateBase64SizeKb(payload),
    };
  }

  const payload = normalizeBase64(trimmed);
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

  if (payload.startsWith("PHN2Zy")) {
    return "image/svg+xml";
  }

  return "image/png";
}

function isLikelyBase64(payload) {
  if (!payload) {
    return false;
  }

  if (payload.length % 4 !== 0) {
    return false;
  }

  return /^[A-Za-z0-9+/]+={0,2}$/.test(payload);
}

function estimateBase64SizeKb(payload) {
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return ((payload.length * 3) / 4 - padding) / 1024;
}

function normalizeBase64(value) {
  const cleaned = value
    .replace(/\s/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const remainder = cleaned.length % 4;

  if (remainder === 0) {
    return cleaned;
  }

  return cleaned + "=".repeat(4 - remainder);
}

function dataUrlToUint8Array(dataUrl) {
  const payload = dataUrl.split(",")[1] || "";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function dataUrlToBlob(dataUrl) {
  const [header, payload] = dataUrl.split(",");
  const mimeMatch = header.match(/^data:([^;]+);base64$/i);

  if (!mimeMatch) {
    throw new Error("Invalid data URL format");
  }

  const binary = atob(payload || "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeMatch[1] });
}

function getDownloadName(mimeType) {
  const extensionMap = {
    "application/pdf": "pdf",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/svg+xml": "svg",
  };

  const extension = extensionMap[mimeType] || "bin";
  const baseName = mimeType === "application/pdf" ? "file" : "image";
  return `${baseName}.${extension}`;
}

function initializeAnalytics() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    return;
  }

  if (window.gtag) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
  });
}

function trackEvent(eventName, eventParams = {}) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, eventParams);
}
