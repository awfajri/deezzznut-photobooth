// preview.js
// Script utama untuk preview photostrip dan QR code

const previewCanvas = document.getElementById("preview-canvas");
const photostripOptions = document.querySelector(".photostrip-options");
const qrcodeContainer = document.getElementById("qrcode-container");
const downloadButton = document.getElementById("download-button");
const retakeButton = document.getElementById("retake-button");

let capturedPhotos = [];
let selectedDesignUrl = "";

const photostripDesigns = [
  {
    id: "design1",
    url: "img/desain-1.jpg",
  },
  {
    id: "design2",
    url: "img/desain-2.jpg",
  },
  {
    id: "design3",
    url: "img/desain-3.jpg",
  },
];

function loadCapturedPhotos() {
  const storedPhotos = sessionStorage.getItem("capturedPhotos");
  if (storedPhotos) {
    capturedPhotos = JSON.parse(storedPhotos);
  } else {
    window.location.href = "index.html";
  }
}

async function showPreviewPage() {
  photostripOptions.innerHTML = "";
  photostripDesigns.forEach((design) => {
    const img = document.createElement("img");
    img.src = design.url;
    img.classList.add(
      "p-1",
      "border-4",
      "border-transparent",
      "hover:border-indigo-500"
    );
    img.onclick = () => {
      document
        .querySelectorAll(".photostrip-options img")
        .forEach((i) => i.classList.remove("selected"));
      img.classList.add("selected");
      selectedDesignUrl = design.url;
      renderPhotostripPreview();
    };
    photostripOptions.appendChild(img);
  });

  if (photostripDesigns.length > 0) {
    photostripOptions.querySelector("img").classList.add("selected");
    selectedDesignUrl = photostripDesigns[0].url;
    await renderPhotostripPreview();
  }
}

async function renderPhotostripPreview() {
  const canvas = previewCanvas;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = selectedDesignUrl;

  await new Promise((resolve) => (img.onload = resolve));

  const stripWidthPx = 5 * 118.11;
  const stripHeightPx = 15 * 118.11;

  canvas.width = stripWidthPx;
  canvas.height = stripHeightPx;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const totalPhotos = 3;
  const topMargin = 250;
  const bottomMargin = 24;
  const sideMargin = 24;
  const photoSpacing = 24;

  const photoWidthPx = stripWidthPx - 2 * sideMargin;
  const availableHeightForPhotos =
    stripHeightPx - topMargin - bottomMargin - photoSpacing * (totalPhotos - 1);
  const photoHeightPx = availableHeightForPhotos / totalPhotos;

  const photoPositions = [
    { x: sideMargin, y: topMargin, width: photoWidthPx, height: photoHeightPx },
    {
      x: sideMargin,
      y: topMargin + photoHeightPx + photoSpacing,
      width: photoWidthPx,
      height: photoHeightPx,
    },
    {
      x: sideMargin,
      y: topMargin + 2 * photoHeightPx + 2 * photoSpacing,
      width: photoWidthPx,
      height: photoHeightPx,
    },
  ];

  for (let i = 0; i < capturedPhotos.length; i++) {
    if (i < photoPositions.length) {
      const photo = new Image();
      photo.src = capturedPhotos[i];
      await new Promise((resolve) => (photo.onload = resolve));
      const pos = photoPositions[i];
      ctx.drawImage(photo, pos.x, pos.y, pos.width, pos.height);
    }
  }

  generateQRCode();
}

function generateQRCode() {
  const photostripDataUrl = previewCanvas.toDataURL("image/png");
  document.getElementById("qrcode").innerHTML = "";

  // Membuat link download sederhana agar QR Code dapat memprosesnya
  const tempDownloadLink = document.createElement("a");
  tempDownloadLink.href = photostripDataUrl;
  tempDownloadLink.download = "photostrip-himtika-" + Date.now() + ".png";

  // QR Code sekarang akan men-trigger event click pada tombol download
  new QRCode(document.getElementById("qrcode"), {
    text: "QR_DOWNLOAD", // Gunakan teks sederhana sebagai trigger
    width: 128,
    height: 128,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
  qrcodeContainer.classList.remove("hidden");

  // Saat QR code dipindai, kita akan memicu klik pada tombol download
  document.getElementById("qrcode").addEventListener("click", () => {
    downloadButton.click();
  });
}

retakeButton.addEventListener("click", () => {
  sessionStorage.removeItem("capturedPhotos");
  window.location.href = "index.html";
});

downloadButton.addEventListener("click", () => {
  const dataUrl = previewCanvas.toDataURL("image/png");
  const downloadLink = document.createElement("a");
  downloadLink.href = dataUrl;
  downloadLink.download = "photostrip-himtika-" + Date.now() + ".png";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
});

window.onload = () => {
  loadCapturedPhotos();
  showPreviewPage();
};
