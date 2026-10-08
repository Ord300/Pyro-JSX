import QRCode from "qrcode";
import { subscriptionsDB } from "@/src/services/dbService";

// ============================================================
// CARTE ABONNÉ — QR code unique + téléchargement de la carte
// Chaque abonnement validé possède un `cardToken` unique.
// Le QR encode l'URL de connexion directe : /qr-login?token=...
// ============================================================

export function generateCardToken(): string {
  const rand = (n: number) => {
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  };
  return rand(24); // 48 caractères hexadécimaux
}

/** Retourne le token existant ou en génère un nouveau (persisté, unique). */
export async function ensureCardToken(subscription: any): Promise<string> {
  if (subscription?.cardToken) return subscription.cardToken;
  const all = await subscriptionsDB.getAll<any>();
  const used = new Set(all.map((s) => s.cardToken).filter(Boolean));
  let token = generateCardToken();
  while (used.has(token)) token = generateCardToken();
  const updated = await subscriptionsDB.update(subscription.id, { cardToken: token });
  return (updated as any)?.cardToken ?? token;
}

export function getCardLoginUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/qr-login?token=${encodeURIComponent(token)}`;
}

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 512,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Dessine la carte abonné (avec QR) sur un canvas et la télécharge en PNG. */
export async function downloadMemberCard(subscription: any, qrDataUrl: string): Promise<void> {
  const W = 1016;
  const H = 640;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supporté");

  // Fond dégradé émeraude
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#059669");
  gradient.addColorStop(0.55, "#047857");
  gradient.addColorStop(1, "#134e4a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Cercles décoratifs
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.beginPath();
  ctx.arc(W - 40, -40, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.arc(W - 60, H + 60, 210, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";

  // Logo du club
  const logo = await loadImage("/aigles-logo.png");
  if (logo) ctx.drawImage(logo, 56, 44, 92, 92);

  // Titres
  ctx.font = "700 40px 'Barlow Condensed', Arial, sans-serif";
  ctx.fillText("CARTE ABONNÉ", 168, 92);
  ctx.fillStyle = "#C8A44A";
  ctx.font = "600 26px 'Barlow Condensed', Arial, sans-serif";
  ctx.fillText("LES AIGLES DU CONGO", 170, 124);

  // Badge ACTIVE
  ctx.fillStyle = "rgba(34,197,94,0.25)";
  roundRect(ctx, W - 190, 56, 134, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#bbf7d0";
  ctx.font = "700 24px Arial, sans-serif";
  ctx.fillText("ACTIVE", W - 162, 86);

  // Titulaire
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "400 24px Arial, sans-serif";
  ctx.fillText("Titulaire", 60, 210);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 40px Arial, sans-serif";
  ctx.fillText(String(subscription.userName ?? ""), 60, 256);

  // Infos (2 colonnes x 2 lignes)
  const infos: Array<[string, string]> = [
    ["Formule", String(subscription.planName ?? "")],
    ["Activité", String(subscription.activityName ?? "")],
    ["Début", String(subscription.startDate ?? "")],
    ["Fin", String(subscription.endDate ?? "")],
  ];
  infos.forEach(([label, value], i) => {
    const x = 60 + (i % 2) * 360;
    const y = 310 + Math.floor(i / 2) * 90;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "400 23px Arial, sans-serif";
    ctx.fillText(label, x, y);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 30px Arial, sans-serif";
    ctx.fillText(value, x, y + 38);
  });

  // QR code (fond blanc arrondi)
  const qrImg = await loadImage(qrDataUrl);
  const qrBoxX = 60;
  const qrBoxY = H - 218;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrBoxX, qrBoxY, 158, 158, 18);
  ctx.fill();
  if (qrImg) ctx.drawImage(qrImg, qrBoxX + 12, qrBoxY + 12, 134, 134);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "400 22px Arial, sans-serif";
  ctx.fillText("Scannez pour", 240, H - 140);
  ctx.fillText("vous connecter", 240, H - 110);

  // N° Abonné
  const memberNo = `SUB-${String(subscription.id).padStart(4, "0")}`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "400 23px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("N° Abonné", W - 60, H - 140);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 40px 'Courier New', monospace";
  ctx.fillText(memberNo, W - 60, H - 96);
  if (subscription.memberNumber) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "400 22px 'Courier New', monospace";
    ctx.fillText(String(subscription.memberNumber), W - 60, H - 62);
  }
  ctx.textAlign = "left";

  const link = document.createElement("a");
  link.download = `carte-abonne-${memberNo}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  link.remove();
}
