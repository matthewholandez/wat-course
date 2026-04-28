import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google"

import { Metadata } from "next";

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const jetbrainsMonoHeading = JetBrains_Mono({ subsets: ['latin'], variable: '--font-heading' });

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn("antialiased", fontMono.variable, "font-sans", geist.variable, jetbrainsMonoHeading.variable)}
        >
            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    )
}

export const metadata: Metadata = {
    title: {
        template: '%s | Wat Course',
        default: 'Wat Course'
    },
    description: 'Plan your perfect term at Waterloo.',
    robots: {
        index: false,
        follow: false,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1
        }
    }
}
