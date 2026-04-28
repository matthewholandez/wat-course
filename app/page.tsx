import { Button } from "@/components/ui/button"
import Link from "next/link"

function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
      {/* Empty for now as requested */}
    </header>
  )
}

function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t mt-auto">
      {/* Empty for now as requested */}
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 md:px-6 py-12 md:py-24 lg:py-32">
        <div className="space-y-6 max-w-[800px]">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Wat Course
          </h1>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground md:text-xl">
            Your intelligent guide to University of Waterloo electives. Ask questions, explore options, and plan your perfect term with our AI-powered chatbot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/chat">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
