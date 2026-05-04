import Link from "next/link"
import { ArrowRight, Lock, MessageCircle, Sparkles, Info } from "lucide-react"
import { ModeToggle } from "@/components/ModeToggle"
import { HeroComposer } from "./HeroComposer"

const FACULTY = {
  arts: "#D93F00",
  eng: "#5D0096",
  math: "#A2006E",
  sci: "#003599",
  env: "#607000",
  health: "#115E6B",
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.99 0 1.98.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.55C20.22 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

function LogoMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="32" height="32" role="img" aria-label="Wat Course">
      <rect x="0" y="0" width="52" height="52" rx="12" fill="#FFD54F" />
      <g fill="#111217">
        <ellipse cx="20" cy="33" rx="12" ry="7" />
        <path d="M 8 32 L 5 31 L 8 34 Z" />
        <path d="M 24 28 C 27 23 25 18 29 14 C 31 12 33 11 35 11 L 35 15 C 32 16 31 20 31 25 C 31 28 29 31 27 32 Z" />
        <circle cx="35" cy="10" r="3.5" />
        <path d="M 37.5 9.5 L 43 9 L 37.5 12 Z" />
        <rect x="17" y="40" width="2" height="4" />
        <rect x="22" y="40" width="2" height="4" />
      </g>
      <circle cx="35.5" cy="9.5" r="0.9" fill="#FFD54F" />
    </svg>
  )
}

function Highlighter({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <svg
        viewBox="0 0 220 26"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute left-[-6px] bottom-[0.08em] z-0 h-[0.36em]"
        style={{ width: "calc(100% + 12px)" }}
      >
        <path
          d="M3 16 Q 40 6 90 11 T 170 9 T 217 13 L 215 23 Q 160 18 95 22 T 5 22 Z"
          fill="#FFD54F"
        />
      </svg>
    </span>
  )
}

function Header() {
  return (
    <header className="h-16 px-5 md:px-8 flex items-center justify-between border-b bg-background sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Wat Course home">
        <LogoMark />
      </Link>
      <nav className="flex items-center gap-1">
        <Link
          href="#how-it-works"
          className="text-sm font-medium text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          How it works
        </Link>
        <Link
          href="/about"
          className="text-sm font-medium text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          About
        </Link>
        <a
          href="https://github.com/matthewholandez/wat-course"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          GitHub
        </a>
        <ModeToggle />
      </nav>
    </header>
  )
}

function DemoStage() {
  return (
    <div className="relative p-3.5 rounded-[28px] bg-gradient-to-b from-yellow-50 to-transparent dark:from-yellow-400/5">
      {/* Floating pins */}
      <div className="absolute top-[60px] -right-3 z-10 bg-card border rounded-xl px-3 py-2 text-xs font-medium shadow-md flex items-center gap-1.5">
        <MessageCircle className="w-3.5 h-3.5 text-primary" />
        Just like real chat
      </div>
      <div className="absolute bottom-[38px] -left-4 z-10 bg-card border rounded-xl px-3 py-2 text-xs font-medium shadow-md flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        Knows the calendar cold
      </div>

      {/* Demo window */}
      <div
        className="bg-card border rounded-[20px] shadow-xl overflow-hidden flex flex-col"
        role="img"
        aria-label="Example conversation with the Wat Course advisor"
      >
        {/* Chrome */}
        <div className="h-[38px] px-3.5 border-b bg-background flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-border dark:bg-muted-foreground/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-border dark:bg-muted-foreground/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-border dark:bg-muted-foreground/30" />
          <span className="flex-1 text-center font-mono text-[11px] text-muted-foreground/60 tracking-wide">
            wat-course.app / chat
          </span>
        </div>

        {/* Chat body */}
        <div className="p-[22px_22px_14px] flex flex-col gap-3.5">
          {/* Student bubble */}
          <div className="flex justify-end">
            <div className="max-w-[88%] px-[15px] py-[11px] rounded-[18px_18px_4px_18px] text-[14.5px] leading-[1.55] bg-foreground text-background dark:bg-background dark:text-foreground">
              I&apos;m in 2A SYDE. Need a 4th course that won&apos;t kill me — already have{" "}
              <span className="font-mono font-semibold text-[0.92em] bg-white/20 dark:bg-black/10 px-1.5 py-px rounded">
                STAT&nbsp;230
              </span>
              .
            </div>
          </div>

          {/* Advisor bubble */}
          <div className="flex justify-start">
            <div className="max-w-[88%] px-[15px] py-[11px] rounded-[18px_18px_18px_4px] text-[14.5px] leading-[1.55] bg-card border">
              Yeah,{" "}
              <span className="font-mono font-semibold text-[0.92em] bg-black/[0.06] dark:bg-white/[0.08] px-1.5 py-px rounded">
                STAT&nbsp;230
              </span>{" "}
              is heavy. Skip another math — here&apos;s a popular bird that fits your Tue/Thu gap:
            </div>
          </div>

          {/* Course card */}
          <div className="flex justify-start">
            <div className="w-full bg-card border rounded-[14px] p-3.5 grid grid-cols-[auto_1fr_auto] gap-3 items-start mt-[-4px]">
              <div className="font-mono font-semibold text-xs bg-muted border rounded-md px-2.5 py-1.5 whitespace-nowrap">
                PHIL&nbsp;145
              </div>
              <div>
                <div className="font-[family-name:var(--font-display)] text-base font-bold leading-tight mb-1">
                  Critical Thinking
                </div>
                <div className="flex gap-2.5 text-xs text-muted-foreground flex-wrap items-center">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white"
                    style={{ background: FACULTY.arts }}
                  >
                    Arts
                  </span>
                  <span>0.5 unit · no prereq</span>
                </div>
              </div>
              <button
                type="button"
                className="bg-primary text-primary-foreground rounded-lg px-2.5 py-1.5 font-semibold text-xs whitespace-nowrap flex items-center gap-1 hover:opacity-90 transition-all"
              >
                <Info className="w-3 h-3" /> More
              </button>
            </div>
          </div>

          {/* Advisor follow-up */}
          <div className="flex justify-start">
            <div className="max-w-[88%] px-[15px] py-[11px] rounded-[18px_18px_18px_4px] text-[14.5px] leading-[1.55] bg-card border">
              Two seats left. Want me to also check{" "}
              <span className="font-mono font-semibold text-[0.92em] bg-black/[0.06] dark:bg-white/[0.08] px-1.5 py-px rounded">
                CLAS&nbsp;104
              </span>
              ? Lighter readings but more tests.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CHIP_COURSES = [
  { code: "PSYCH 101", name: "Intro to Psychology", color: FACULTY.arts, label: "Arts" },
  { code: "EARTH 121", name: "Geological Hazards", color: FACULTY.sci, label: "Sci" },
  { code: "MUSIC 140", name: "Pop Music After 1960", color: FACULTY.arts, label: "Arts" },
  { code: "SPCOM 223", name: "Public Speaking", color: FACULTY.arts, label: "Arts" },
]

type SchedCell = { filled: true; label: string; variant: "primary" | "dark" | "pink" } | { filled: false }
const SCHED_CELLS: SchedCell[] = [
  { filled: true, label: "M", variant: "primary" },
  { filled: true, label: "T", variant: "primary" },
  { filled: false },
  { filled: true, label: "Th", variant: "primary" },
  { filled: false },
  { filled: true, label: "M", variant: "dark" },
  { filled: false },
  { filled: true, label: "W", variant: "dark" },
  { filled: false },
  { filled: true, label: "F", variant: "dark" },
  { filled: false },
  { filled: true, label: "T", variant: "pink" },
  { filled: false },
  { filled: true, label: "Th", variant: "pink" },
  { filled: false },
  { filled: true, label: "M", variant: "primary" },
  { filled: false },
  { filled: false },
  { filled: false },
  { filled: true, label: "F", variant: "primary" },
]

function SchedGrid() {
  return (
    <div className="grid gap-0.5 flex-1" style={{ gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(4, 1fr)" }} aria-hidden="true">
      {SCHED_CELLS.map((cell, i) => {
        if (!cell.filled) {
          return <div key={i} className="bg-card border rounded" />
        }
        if (cell.variant === "primary") {
          return (
            <div key={i} className="bg-primary border border-primary rounded flex items-center justify-center font-mono font-semibold text-[9px] text-primary-foreground">
              {cell.label}
            </div>
          )
        }
        if (cell.variant === "dark") {
          return (
            <div key={i} className="bg-foreground border border-foreground rounded flex items-center justify-center font-mono font-semibold text-[9px] text-background dark:bg-background dark:border-background dark:text-foreground">
              {cell.label}
            </div>
          )
        }
        return (
          <div key={i} className="rounded flex items-center justify-center font-mono font-semibold text-[9px] text-white" style={{ background: FACULTY.math, borderColor: FACULTY.math, border: "1px solid" }}>
            {cell.label}
          </div>
        )
      })}
    </div>
  )
}

function ThreeJobs() {
  return (
    <section className="border-t py-24 md:py-[96px_0_72px]" id="how-it-works">
      <div className="max-w-[1180px] mx-auto px-5 md:px-8">
        {/* Head */}
        <div className="flex items-end justify-between gap-8 mb-12 flex-col md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
              How it works
            </p>
            <h2
              className="font-[family-name:var(--font-display)] font-extrabold leading-[1.1] tracking-tight m-0 max-w-[600px]"
              style={{ fontSize: "clamp(32px, 4vw, 48px)", fontVariationSettings: "'opsz' 72" }}
            >
              Three things <Highlighter>actually hard</Highlighter> about course selection.
            </h2>
          </div>
          <p className="max-w-[360px] text-muted-foreground m-0 text-[15px] leading-relaxed shrink-0">
            Built for the moments Banner SSC and PDF flowcharts don&apos;t help with. The advisor cites real signals — prereq trees, schedule fit, the actual course calendar.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Job 1 — Discovery */}
          <div className="bg-card border rounded-[18px] p-6 flex flex-col gap-4 hover:border-border/80 hover:shadow-md transition-all duration-200">
            <span className="font-mono text-[11px] text-muted-foreground/60 font-semibold tracking-[0.04em]">01 / Discovery</span>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.15] tracking-tight m-0 mb-1" style={{ fontVariationSettings: "'opsz' 36" }}>
                Find courses you&apos;d never have searched.
              </h3>
              <p className="m-0 text-muted-foreground text-[14.5px] leading-[1.55]">
                Hidden electives, faculty-adjacent picks, the ones your friends took and loved. Filtered by your program and what you&apos;ve already cleared.
              </p>
            </div>
            <div className="mt-auto bg-muted border border-border/50 rounded-xl p-3.5 min-h-[132px] flex flex-col gap-2 overflow-hidden">
              <div className="flex flex-col gap-2">
                {CHIP_COURSES.map((c) => (
                  <div key={c.code} className="flex items-center gap-2.5 bg-card border rounded-[10px] px-2.5 py-2">
                    <span className="font-mono font-semibold text-xs">{c.code}</span>
                    <span className="text-muted-foreground flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px]">{c.name}</span>
                    <span className="text-[10px] px-1.5 py-px rounded-full font-semibold text-white" style={{ background: c.color }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Job 2 — Sequencing */}
          <div className="bg-card border rounded-[18px] p-6 flex flex-col gap-4 hover:border-border/80 hover:shadow-md transition-all duration-200">
            <span className="font-mono text-[11px] text-muted-foreground/60 font-semibold tracking-[0.04em]">02 / Sequencing</span>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.15] tracking-tight m-0 mb-1" style={{ fontVariationSettings: "'opsz' 36" }}>
                Untangle prereqs without a flowchart.
              </h3>
              <p className="m-0 text-muted-foreground text-[14.5px] leading-[1.55]">
                Ask what you can take next, what&apos;s blocked, and what unlocks downstream. Plain-English answers grounded in your program&apos;s real requirements.
              </p>
            </div>
            <div className="mt-auto bg-muted border border-border/50 rounded-xl p-3.5 min-h-[132px] flex flex-col gap-2 overflow-hidden">
              <SchedGrid />
            </div>
          </div>

          {/* Job 3 — Decision */}
          <div className="bg-card border rounded-[18px] p-6 flex flex-col gap-4 hover:border-border/80 hover:shadow-md transition-all duration-200">
            <span className="font-mono text-[11px] text-muted-foreground/60 font-semibold tracking-[0.04em]">03 / Decision support</span>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.15] tracking-tight m-0 mb-1" style={{ fontVariationSettings: "'opsz' 36" }}>
                Two courses, one open seat — pick.
              </h3>
              <p className="m-0 text-muted-foreground text-[14.5px] leading-[1.55]">
                Compare side-by-side on prereqs cleared, schedule fit, faculty, and what each unlocks next. The advisor recommends with reasons, not vibes.
              </p>
            </div>
            <div className="mt-auto bg-muted border border-border/50 rounded-xl p-3.5 min-h-[132px] flex flex-col gap-2 overflow-hidden">
              <div className="flex flex-col gap-2">
                <div className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
                  <div className="bg-card border rounded-[10px] px-2.5 py-2 font-mono font-semibold text-xs text-center">CS 245</div>
                  <span className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-[0.08em]">vs</span>
                  <div className="bg-card border border-primary rounded-[10px] px-2.5 py-2 font-mono font-semibold text-xs text-center shadow-[0_0_0_2px_oklch(0.852_0.199_91.936/0.45)]">CS 246</div>
                </div>
                {[
                  { label: "prereqs cleared", value: "no · yes" },
                  { label: "fits Tue/Thu?", value: "no · yes" },
                  { label: "unlocks next", value: "2 · 5" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center text-[11px] text-muted-foreground px-0.5">
                    <span>{row.label}</span>
                    <span className="font-mono font-semibold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const RECEIPTS = [
  {
    quote: <>Caught a prereq I&apos;d missed for <span className="font-mono font-semibold">CS&nbsp;341</span> before I tried to enrol. Saved me a panicked email to my advisor.</>,
    name: "Aarav, 2B CS",
    term: "F25 · co-op stream",
    initial: "A",
    avatarBg: undefined,
    avatarColor: undefined,
  },
  {
    quote: <>Found <span className="font-mono font-semibold">EARTH&nbsp;121</span> as a bird elective in 30 seconds. Banner gave me a 412-page calendar PDF.</>,
    name: "Maya, 3A SYDE",
    term: "W26",
    initial: "M",
    avatarBg: FACULTY.eng,
    avatarColor: "#fff",
  },
  {
    quote: <>Asked what was open for me Tue/Thu mornings and got three real options — with the prereqs I&apos;d actually cleared. That&apos;s it. That&apos;s the feature.</>,
    name: "Jenna, 1B Math",
    term: "S26",
    initial: "J",
    avatarBg: FACULTY.math,
    avatarColor: "#fff",
  },
]

function Receipts() {
  return (
    <section className="py-[72px_0_96px] md:py-24">
      <div className="max-w-[1180px] mx-auto px-5 md:px-8">
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground block mb-3">
            Why students use it
          </span>
          <h2
            className="font-[family-name:var(--font-display)] font-extrabold leading-[1.15] tracking-tight m-0"
            style={{ fontSize: "clamp(28px, 3.4vw, 40px)", fontVariationSettings: "'opsz' 60" }}
          >
            The advisor that actually took the course.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECEIPTS.map((r) => (
            <article key={r.name} className="bg-card border rounded-2xl p-5 flex flex-col gap-3.5 text-[14.5px] leading-[1.55]">
              <blockquote className="m-0">&ldquo;{r.quote}&rdquo;</blockquote>
              <div className="flex items-center gap-2.5 text-xs pt-3 border-t border-border/40">
                <div
                  className="w-[30px] h-[30px] rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={r.avatarBg ? { background: r.avatarBg, color: r.avatarColor } : undefined}
                >
                  {r.initial}
                </div>
                <div>
                  <strong className="text-foreground font-semibold block leading-tight">{r.name}</strong>
                  <span className="font-mono text-[11px] text-muted-foreground/60">{r.term}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t py-6 text-[13px] text-muted-foreground">
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 flex items-center justify-between gap-4 flex-wrap">
        <span>Not affiliated with the University of Waterloo. 🦢</span>
        <nav className="flex gap-1">
          <Link href="/about" className="px-2 py-1 rounded-md hover:text-foreground transition-colors">About</Link>
          <a href="https://github.com/matthewholandez/wat-course" target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-md hover:text-foreground transition-colors">GitHub</a>
        </nav>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />

      <main className="flex-1">

        {/* HERO */}
        <section className="max-w-[1180px] mx-auto px-5 md:px-8 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="hero-copy">
            <h1
              className="font-[family-name:var(--font-display)] font-extrabold tracking-[-0.025em] leading-[1.02] m-0 mb-6"
              style={{ fontSize: "clamp(48px, 6vw, 84px)", fontVariationSettings: "'opsz' 144" }}
            >
              Pick the <Highlighter>right courses</Highlighter>
              <br />at Waterloo.
            </h1>

            <p className="text-[19px] leading-[1.55] text-muted-foreground max-w-[540px] m-0 mb-8">
              A smart-friend academic advisor that&apos;s actually been through the program. Ask anything — pick electives, check prereqs, find a fit for next term. Answers in plain English, not flowchart PDFs.
            </p>

            <HeroComposer />

            <div className="flex items-center gap-1.5 mt-4 text-[13px] text-muted-foreground/60">
              <Lock className="w-3.5 h-3.5" />
              No login &middot; nothing leaves your browser
            </div>
          </div>

          <div className="lg:block">
            <DemoStage />
          </div>
        </section>

        <ThreeJobs />

        <Receipts />

        {/* FINAL CTA */}
        <section className="border-t py-24 text-center" id="about">
          <div className="max-w-[1180px] mx-auto px-5 md:px-8">
            <h2
              className="font-[family-name:var(--font-display)] font-extrabold leading-[1.05] tracking-tight m-0 mb-3"
              style={{ fontSize: "clamp(40px, 5vw, 64px)", fontVariationSettings: "'opsz' 96" }}
            >
              Pick the right four.<br />Skip the bad ones.
            </h2>
            <p className="text-muted-foreground text-[17px] leading-relaxed max-w-[540px] mx-auto mb-7">
              Free. No login. Open source. The advisor remembers nothing about you between sessions — tell it once and it tailors everything.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-[15px] px-[22px] py-[13px] rounded-xl hover:opacity-90 transition-all duration-200"
              >
                Start a chat <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/matthewholandez/wat-course"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-card text-foreground border font-semibold text-[15px] px-[22px] py-[13px] rounded-xl hover:bg-muted hover:border-border/80 transition-all duration-200"
              >
                <GitHubIcon />
                View on GitHub
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
