import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, FileText, Mic, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-md bg-background/50 sticky top-0 z-50">
        <Link className="flex items-center justify-center font-bold text-xl" href="#">
          <span className="text-primary">AI</span>Resume
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--primary)_0%,transparent_100%)] opacity-20" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  Master Your Interview. <br /> Land Your Dream Job.
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  AI-powered resume analysis and mock interviews to help you prepare smarter and faster. Completely free.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button size="lg" className="px-8">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything you need to succeed
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  From resume scoring to real-time voice interviews, we&apos;ve got you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center glass-card p-6 rounded-xl">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Resume Analyzer</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Upload your PDF and get instant ATS scoring, keyword analysis, and improvement tips.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center glass-card p-6 rounded-xl">
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600">
                  <Mic className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">AI Mock Interview</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Practice with realistic AI-generated questions tailored to your role and experience.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center glass-card p-6 rounded-xl">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Detailed Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Track your progress, view detailed feedback reports, and see how you improve over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Free Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Pricing
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Premium Features, <br /> Zero Cost.
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  We believe accessible career preparation should be available to everyone. No credit card required.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-end">
                <ul className="grid gap-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Unlimited Resume Scans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Unlimited Mock Interviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Detailed PDF Reports</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 AI Resume Platform. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
