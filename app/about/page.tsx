import { Metadata } from "next"
import Link from "next/link"

export default function AboutPage() {
    return (
        <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-24 space-y-12">
            <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                    Hi, I'm <Link href="https://matthewholandez.com" className="font-medium underline underline-offset-4 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">Matthew</Link>, SYDE30 at UW. I thought of this app while deciding which elective to take for 1B. I hope it helps.
                </p>
                
                <p className="text-muted-foreground">
                    Please note that this site is nowhere near a fully developed state.
                </p>

                <details className="group border rounded-lg p-4 transition-all [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between font-medium text-sm">
                        For nerds
                        <span className="transition duration-300 group-open:-rotate-180">
                            <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </span>
                    </summary>
                    <div className="mt-4 text-sm text-muted-foreground">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>This site was made with Next.js and Tailwind CSS. It's hosted on Vercel.</li>
                            <li>Program and course information was scraped with scripts written in TypeScript and run with Node.js and tsx.</li>
                        </ul>
                    </div>
                </details>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Acknowledgements</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        This project is licensed under the <Link href="https://github.com/matthewholandez/wat-course/blob/main/LICENSE" className="font-medium underline underline-offset-4 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">MIT license.</Link>
                    </p>
                    <p>
                        Developed in part by AI (mostly for the frontend) using OpenCode and Google Gemini 3.1 Pro.
                    </p>
                </div>
            </div>

            <div>
                <Link href="/" className="inline-flex items-center text-sm font-medium hover:underline underline-offset-4 text-muted-foreground hover:text-primary transition-colors">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </Link>
            </div>
        </main>
    )
}

export const metadata: Metadata = {
    title: 'About'
}