import { useState } from "react";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const transcribeFile = async () => {
    if (!file) {
      setError("Please select an audio file.");
      return;
    }

    setLoading(true);
    setError("");
    setTranscript("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Transcription failed.");
      }

      setTranscript(data.transcript);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while transcribing."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Resume Architect AI</h1>

      <p>
        Turn your voice into a professional ATS-ready resume.
      </p>

      <div className="upload-box">
        <h2>🎙️ Your Story</h2>

        <p>Upload an audio recording of your story.</p>

        <input
          type="file"
          accept="audio/*"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0] || null;
            setFile(selectedFile);
            setTranscript("");
            setError("");
          }}
        />

        {file && (
          <p>
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <button
          onClick={transcribeFile}
          disabled={!file || loading}
        >
          {loading ? "Transcribing..." : "Transcribe with AI"}
        </button>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {transcript && (
        <div className="transcript">
          <h2>🧠 AI Transcript</h2>

          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}

export default App;