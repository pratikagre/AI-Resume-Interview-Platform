# AI Resume + Interview Platform

A free, AI-powered platform for resume analysis and mock interviews. Built with Next.js 14, ShadCN UI, Supabase, and OpenAI.

## 🚀 Features

- **Resume Analyzer**: Upload your PDF resume to get an instant ATS score, skill analysis, and improvement tips.
- **AI Mock Interview**: Practice technical interviews with AI-generated questions tailored to your role and experience.
- **Voice Interaction**: Answer interview questions using your voice with real-time transcription.
- **Detailed Reports**: Get comprehensive feedback and download PDF reports of your interview performance.
- **Dashboard**: Track your progress with detailed analytics and history.

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (via Supabase/Neon), Prisma ORM
- **Auth**: NextAuth.js (JWT)
- **AI**: OpenAI API (GPT-3.5/4)
- **Storage**: Supabase Storage

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-resume-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Database (Supabase / Neon)
   DATABASE_URL="postgresql://user:password@host:port/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://user:password@host:port/postgres"

   # Authentication
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # AI (OpenAI)
   OPENAI_API_KEY="sk-..."

   # Storage (Supabase)
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 License

This project is licensed under the MIT License.
