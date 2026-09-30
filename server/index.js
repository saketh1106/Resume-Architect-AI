const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: "uploads/",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Resume Architect backend is running",
  });
});

// REAL AUDIO TRANSCRIPTION
app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file uploaded",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OPENAI_API_KEY is not configured",
      });
    }

    console.log("Received file:", req.file.originalname);
    console.log("File type:", req.file.mimetype);
    console.log("File size:", req.file.size);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "gpt-4o-transcribe",
    });

    // Delete temporary uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log("Could not delete temporary file:", err.message);
      }
    });

    console.log("TRANSCRIPTION SUCCESS");
    console.log(transcription.text);

    res.json({
      success: true,
      mode: "live",
      transcript: transcription.text,
    });

  } catch (error) {
    console.error("TRANSCRIPTION ERROR:");
    console.error(error);

    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      success: false,
      mode: "error",
      error: error.message || "Transcription failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Resume Architect backend running on http://localhost:${PORT}`);
});