import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 payloads (PDFs can be several megabytes)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Create local directory for persistent pdf storage
  const pdfsDir = path.join(process.cwd(), "pdfs");
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  // Intercept ?download_pdf query parameter on any GET request to serve files directly
  app.get("*", (req, res, next) => {
    const downloadPdfId = req.query.download_pdf;
    if (typeof downloadPdfId === "string" && downloadPdfId) {
      // Clean up reference ID
      const safeId = downloadPdfId.replace(/[^a-zA-Z0-9_-]/g, "");
      const pdfFilePath = path.join(pdfsDir, `${safeId}.pdf`);

      if (fs.existsSync(pdfFilePath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="Attestation_CIVITAS_${safeId}.pdf"`
        );
        const fileStream = fs.createReadStream(pdfFilePath);
        fileStream.pipe(res);
        return;
      } else {
        res.status(404).send(
          `<html><body style="font-family:sans-serif;padding:40px;text-align:center;">
            <h2 style="color:#dc2626;">Fichier introuvable</h2>
            <p>L'attestation avec la référence <strong>${safeId}</strong> n'a pas été trouvée sur le serveur.</p>
            <p><a href="/" style="color:#4f46e5;text-decoration:none;font-weight:bold;">Retourner à l'accueil</a></p>
          </body></html>`
        );
        return;
      }
    }
    next();
  });

  // Endpoint to save a generated PDF on the server
  app.post("/api/save-pdf", (req, res) => {
    try {
      const { referenceId, pdfBase64 } = req.body;

      if (!referenceId || !pdfBase64) {
        return res.status(400).json({ error: "referenceId et pdfBase64 sont requis." });
      }

      // Extract raw base64 data
      const cleanBase64 = pdfBase64.includes(",") ? pdfBase64.split(",")[1] : pdfBase64;
      const buffer = Buffer.from(cleanBase64, "base64");

      const safeId = referenceId.replace(/[^a-zA-Z0-9_-]/g, "");
      const pdfFilePath = path.join(pdfsDir, `${safeId}.pdf`);

      fs.writeFileSync(pdfFilePath, buffer);
      console.log(`[PDF Saved] ${pdfFilePath} (${buffer.length} bytes)`);

      return res.json({ success: true, url: `/?download_pdf=${safeId}` });
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde du PDF:", err);
      return res.status(500).json({ error: "Erreur interne lors de la sauvegarde du PDF." });
    }
  });

  // Explicit API download endpoint
  app.get("/api/pdf/:id", (req, res) => {
    const { id } = req.params;
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    const pdfFilePath = path.join(pdfsDir, `${safeId}.pdf`);

    if (fs.existsSync(pdfFilePath)) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Attestation_CIVITAS_${safeId}.pdf"`
      );
      const fileStream = fs.createReadStream(pdfFilePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: "Attestation introuvable." });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
