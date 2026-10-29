import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.get("/api/config", (_req, res) => {
res.json({
ready: Boolean(
process.env.JENNA_API_KEY &&
process.env.JENNA_PROJECT_ID
)
});
});

app.post("/api/generate", async (req, res) => {
const apiKey = process.env.JENNA_API_KEY;
const projectId = process.env.JENNA_PROJECT_ID;

if (!apiKey || !projectId) {
return res.status(503).json({
error: "Konfigurasi API belum lengkap di server."
});
}

const {
prompt,
model = "veo-3.1",
aspectRatio = "landscape",
durationSeconds = 8
} = req.body ?? {};

if (typeof prompt !== "string" || !prompt.trim()) {
return res.status(400).json({
error: "Prompt video belum diisi."
});
}

try {
const response = await fetch(
"https://fire.jennabot.pro/api/projects/${encodeURIComponent(projectId)}/videos",
{
method: "POST",
headers: {
"x-api-key": apiKey,
"content-type": "application/json"
},
body: JSON.stringify({
prompt: prompt.trim(),
model,
aspectRatio,
count: 1,
durationSeconds: Number(durationSeconds)
})
}
);

const result = await response.json().catch(() => ({}));

if (!response.ok) {
  return res.status(response.status).json({
    error: result.error || result.message ||
      `Jenna Bot API error ${response.status}`,
    details: result
  });
}

return res.json(result);

} catch {
return res.status(502).json({
error: "Server gagal menghubungi Jenna Bot API."
});
}
});

const port = Number(process.env.PORT || 10000);

app.listen(port, "0.0.0.0", () => {
console.log("JARVIS AI VIDEO STUDIO aktif di port ${port}");
});
