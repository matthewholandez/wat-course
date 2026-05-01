import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ModeToggle"
import HomeIcon from "@/components/HomeIcon"

function Header() {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
            <HomeIcon/>
            <nav className="flex items-center gap-4 sm:gap-6">
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
                    About
                </Link>
                <ModeToggle />
            </nav>
        </header>
    )
}

function Footer() {
    return (
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t mt-auto">
            <p className="text-xs text-muted-foreground">
                Not affiliated with the University of Waterloo.
            </p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="https://github.com/matthewholandez/wat-course" target="_blank" rel="noopener noreferrer">
                    GitHub
                </Link>
            </nav>
        </footer>
    )
}

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-[100dvh]">
            <Header />
            <main className="flex-1 flex flex-col justify-center items-center text-center px-4 md:px-6 py-12 md:py-24 lg:py-32">
                <div className="space-y-6 max-w-[800px]">
                    <h1 className="font-extrabold tracking-tight flex flex-col justify-center items-center gap-2">
                        <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">Plan your</span>
                        <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-yellow-500 dark:text-yellow-400">perfect term</span>
                        <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">at Waterloo.</span>
                    </h1>
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
