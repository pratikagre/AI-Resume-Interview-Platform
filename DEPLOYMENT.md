# Deployment Guide

This guide covers deploying the AI Resume Platform to **Vercel** (Frontend + API) and **Supabase** (Database + Storage).

## 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com).
2. Go to **Settings > Database** and copy the `Connection String` (Transaction pooler) for `DATABASE_URL` and (Session pooler) for `DIRECT_URL`.
3. Go to **Storage**, create a new public bucket named `resumes`.

## 2. OpenAI Setup

1. Get your API Key from [OpenAI Platform](https://platform.openai.com).
2. Ensure you have credits/billing enabled.

## 3. Deploy to Vercel

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import your repository.
3. In functionality settings, **Framework Preset** should be Next.js.
4. **Environment Variables**: Add all variables from your `.env.local` file.
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET` (Generate one using `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (Set to your Vercel domain, e.g., `https://project.vercel.app`)
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.

## 4. Post-Deployment

1. After deployment, go to your Vercel dashboard.
2. If the build failed due to Prisma, ensure `npx prisma generate` is in the build command (Vercel does this automatically for Next.js usually).
3. If database migrations are needed, run `npx prisma db push` from your local machine pointing to the production DB, or add a post-install script.

Your platform is now live! 🚀
