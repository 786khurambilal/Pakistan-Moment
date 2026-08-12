// Webcam helpers: start a stream, and capture a square-ish portrait as a JPEG data URL.

export async function startCamera(videoEl) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });
  videoEl.srcObject = stream;
  await videoEl.play().catch(() => {});
  return stream;
}

export function stopCamera(stream) {
  stream?.getTracks?.().forEach((t) => t.stop());
}

const PORTRAIT_WIDTH = 1024;
const JPEG_QUALITY = 0.88;

// Capture a centered portrait crop (4:5) from the live video, mirrored to match the preview.
export function capturePortrait(videoEl, size = PORTRAIT_WIDTH) {
  const vw = videoEl.videoWidth;
  const vh = videoEl.videoHeight;
  if (!vw || !vh) return null;

  const targetRatio = 4 / 5; // width / height
  let cropW = vh * targetRatio;
  let cropH = vh;
  if (cropW > vw) {
    cropW = vw;
    cropH = vw / targetRatio;
  }
  const sx = (vw - cropW) / 2;
  const sy = (vh - cropH) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size / targetRatio);
  const ctx = canvas.getContext('2d');
  // Mirror horizontally so the saved image matches what the user saw.
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, sx, sy, cropW, cropH, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

function resizeImage(img) {
  const targetRatio = 4 / 5;
  const sourceRatio = img.naturalWidth / img.naturalHeight;
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (sourceRatio > targetRatio) {
    sw = img.naturalHeight * targetRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / targetRatio;
    sy = (img.naturalHeight - sh) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = PORTRAIT_WIDTH;
  canvas.height = Math.round(PORTRAIT_WIDTH / targetRatio);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

// Read an uploaded file into a compressed portrait data URL.
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(resizeImage(img));
      img.onerror = () => resolve(reader.result);
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
