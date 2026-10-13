// ============================================================
// SERVICE REÇUS — aperçu, téléchargement et impression RÉELS
// Génère un document HTML autonome (aucune dépendance) : l'utilisateur
// peut l'imprimer ou l'enregistrer en PDF depuis le dialogue d'impression.
// ============================================================

const esc = (value: unknown): string =>
  String(value ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildReceiptHtml(receipt: any, autoPrint = false): string {
  const items: any[] = Array.isArray(receipt?.items) ? receipt.items : [];
  const rows =
    items.length > 0
      ? items
          .map(
            (item) => `<tr>
              <td>${esc(item.label)}</td>
              <td style="text-align:center">${esc(item.quantity ?? 1)}</td>
              <td style="text-align:right">${esc(item.unitPrice ?? "")} ${esc(receipt.currency)}</td>
              <td style="text-align:right"><strong>${esc(item.total ?? "")} ${esc(receipt.currency)}</strong></td>
            </tr>`
          )
          .join("")
      : `<tr><td>${esc(receipt.description)}</td><td style="text-align:center">1</td>
          <td style="text-align:right">${esc(receipt.amount)} ${esc(receipt.currency)}</td>
          <td style="text-align:right"><strong>${esc(receipt.amount)} ${esc(receipt.currency)}</strong></td></tr>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Reçu ${esc(receipt.reference)}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
  .sheet { max-width: 640px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; }
  h1 { font-size: 22px; margin: 0; }
  .muted { color: #64748b; font-size: 13px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold;
    background: ${receipt.status === "Payé" ? "#dcfce7; color: #166534" : "#fef3c7; color: #92400e"}; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
  th { text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; padding: 8px 4px; }
  td { border-bottom: 1px solid #f1f5f9; padding: 10px 4px; }
  .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 16px; }
  .foot { margin-top: 24px; font-size: 12px; color: #64748b; text-align: center; }
  @media print { body { padding: 0; } .sheet { border: none; } }
</style>
${autoPrint ? "<script>window.onload = function () { window.print(); };</script>" : ""}
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div>
        <h1>Aigles du congo</h1>
        <p class="muted">Centre sportif — Kinshasa, RDC<br />Reçu ${esc(receipt.reference)}</p>
      </div>
      <span class="badge">${esc(receipt.status)}</span>
    </div>
    <p><strong>Client :</strong> ${esc(receipt.userName)}${receipt.email ? ` (${esc(receipt.email)})` : ""}<br />
    <strong>Date :</strong> ${esc(receipt.date)}<br />
    <strong>Réf. paiement :</strong> ${esc(receipt.paymentReference)}<br />
    <strong>Méthode :</strong> ${esc(receipt.paymentMethod)}${receipt.memberNumber ? `<br /><strong>N° abonné :</strong> ${esc(receipt.memberNumber)}` : ""}</p>
    <table>
      <thead><tr><th>Désignation</th><th style="text-align:center">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="total"><span>Total</span><span>${esc(receipt.amount)} ${esc(receipt.currency)}</span></div>
    <p class="foot">Merci de votre confiance. Document généré le ${esc(new Date().toLocaleDateString("fr-FR"))}.</p>
  </div>
</body>
</html>`;
}

export function downloadReceipt(receipt: any): void {
  const blob = new Blob([buildReceiptHtml(receipt)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `recu-${receipt?.reference || receipt?.id || "document"}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function printReceipt(receipt: any): void {
  const popup = window.open("", "_blank", "width=800,height=700");
  // Bloqueur de popups : repli sur le téléchargement.
  if (!popup) {
    downloadReceipt(receipt);
    return;
  }
  popup.document.write(buildReceiptHtml(receipt, true));
  popup.document.close();
  popup.focus();
}
