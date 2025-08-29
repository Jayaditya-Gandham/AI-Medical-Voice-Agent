# 🏥 MediEcho: AI Medical Voice Agent  


**MediEcho** is an innovative application that revolutionizes healthcare access by enabling **instant AI-powered medical voice consultations**. Users can describe symptoms, interact with specialized AI doctor agents, receive preliminary guidance, and access automatically generated medical reports.  

---

## ✨ Key Features  

- **🎙 AI Voice Consultations** – Natural conversations with AI medical agents (e.g., General Physician, Pediatrician, Dermatologist).  
- **👨‍⚕️ Symptom-Based Doctor Suggestions** – AI recommends relevant specialists based on user symptoms or notes.  
- **🔐 Secure Authentication** – User sign-up/sign-in powered by **Clerk**.  
- **📜 Consultation History** – View past consultations with notes and timestamps.  
- **📝 Automated Medical Reports** – AI generates detailed session reports including symptoms & recommendations.  
- **📊 Interactive Dashboard** – Manage consultations, history, and explore AI doctor agents in a clean UI.  

---

## 🛠 Technology Stack  

- **Framework:** Next.js 15 (App Router)  
- **Styling:** Tailwind CSS, Shadcn UI  
- **Database:** Neon (PostgreSQL)  
- **ORM:** Drizzle ORM  
- **Authentication:** Clerk  
- **Voice & AI:**  
  - Voice Interface → Vapi  
  - Language Model → OpenAI (via OpenRouter)  
  - Speech-to-Text → Deepgram  
  - Text-to-Speech → PlayHT  
- **UI Components:** Radix UI, Lucide React  
- **Animations:** Motion  

---

## 🚀 Getting Started  

### 1. Prerequisites  
Ensure you have:  
- **Node.js v20+**  
- **npm / yarn / pnpm**  

### 2. Clone the Repository  

```bash
git clone https://github.com/jayaditya-gandham/ai-medical-voice-agent.git
cd ai-medical-voice-agent
```  

### 3. Install Dependencies  

```bash
npm install
# or
yarn install
# or
pnpm install
```  

### 4. Configure Environment Variables  

Create a `.env.local` file in the project root and add:  

```env
# Neon Database URL
DATABASE_URL="your_neon_database_connection_string"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

# Vapi API Key for Voice AI
NEXT_PUBLIC_VAPI_API_KEY="your_vapi_api_key"

# OpenRouter API Key for LLM
OPEN_ROUTER_API_KEY="your_openrouter_api_key"
```  

### 5. Set Up Database  

```bash
npx drizzle-kit push
```  

### 6. Run Development Server  

```bash
npm run dev
```  

Now visit 👉 [http://localhost:3000](http://localhost:3000).  

---

## 📡 API Endpoints  

| Endpoint               | Method | Description                                                                 |
|------------------------|--------|-----------------------------------------------------------------------------|
| `/api/users`           | POST   | Create or fetch a user in the database.                                     |
| `/api/suggest-doctors` | POST   | Suggests AI doctor agents based on user notes/symptoms.                     |
| `/api/session-chat`    | POST   | Creates a new consultation session with selected AI doctor & notes.         |
| `/api/session-chat`    | GET    | Fetches all consultations for a user or retrieves a specific session.        |
| `/api/medical-report`  | POST   | Generates and stores a structured AI-based medical report.                   |  

---

## 🌐 Deployment  

Deploy easily with **Vercel**:  
👉 [Deploy on Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)  

For more details, check the [Next.js deployment guide](https://nextjs.org/docs/app/building-your-application/deploying).  
