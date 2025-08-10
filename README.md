# 🎬 Movie Script Generator

A web application that creates professional, industry-formatted movie scripts using the Gemini 2.0 Flash API.  
The app splits a full-length screenplay into 5 sections for efficient processing, preserves story continuity,  
and lets users download the finished script in **TXT** or **Word (.docx)** formats.

---

## ✨ Features

- **Multi-Section Generation** — Breaks scripts into 5 segments (~24 pages each) to stay within API limits.
- **Context Preservation** — Passes important plot and character details between sections for narrative flow.
- **Multiple API Keys** — Rotates through 5 Gemini API keys for improved throughput and rate limit handling.
- **Retry & Backoff** — Handles API errors with exponential backoff and retries.
- **Professional Formatting** — Outputs scripts in standard screenplay format.
- **Dual Download Formats** — TXT and DOCX exports, with proper margins and typography.
- **Responsive UI** — Dark cinematic theme with gold accents, progress tracking, and real-time previews.

---

## 🛠 Tech Stack

- **Frontend:** React + TypeScript
- **Backend:** Node.js / Express (or Netlify Functions for serverless deployment)
- **APIs:** Gemini 2.0 Flash
- **Styling:** Tailwind CSS
- **Document Export:** `docx` + `file-saver`

---

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/movie-script-generator.git
cd movie-script-generator
```

2. Install dependencies
```
npm install
```

3. Configure environment variables
Create a .env file in the root of your project:
```
GEMINI_KEYS=key1,key2,key3,key4,key5
```
- Note: Keep API keys private. Never commit them to source control.

4. Run the development server
```
npm run dev
```

5. Build for production
```
npm run build
```

## 📄 Usage

- Enter your movie details (title, genre, synopsis, characters).
- The app generates the script in 5 parts, preserving continuity between them.
- Review your script in real time.
- Download the final screenplay in TXT or DOCX format.

## 🔒 Security Notes

- API keys are stored on the server and never exposed to the client.
- Rotating keys helps manage rate limits but does not bypass API provider policies.
- Always follow the Gemini API Terms of Service.

## 📜 License
MIT License © 2025 R.Maunick























