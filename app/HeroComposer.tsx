"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const PROMPTS = [
  "What's a bird elective for 2A?",
  "Is CS 240 doable with STAT 230?",
  "What can I take Tue/Thu mornings?",
  "What does MATH 239 unlock?",
  "Pick me a 4th course this term",
]

export function HeroComposer() {
  const [displayText, setDisplayText] = useState("")
  const [isEmpty, setIsEmpty] = useState(true)
  const state = useRef({ pi: 0, ci: 0, deleting: false, timer: null as ReturnType<typeof setTimeout> | null })

  useEffect(() => {
    const s = state.current

    function tick() {
      const cur = PROMPTS[s.pi]
      if (!s.deleting) {
        s.ci++
        const t = cur.slice(0, s.ci)
        setDisplayText(t)
        setIsEmpty(s.ci === 0)
        if (s.ci === cur.length) {
          s.deleting = true
          s.timer = setTimeout(tick, 1800)
          return
        }
      } else {
        s.ci--
        setDisplayText(cur.slice(0, s.ci))
        if (s.ci === 0) {
          s.deleting = false
          s.pi = (s.pi + 1) % PROMPTS.length
        }
      }
      s.timer = setTimeout(tick, s.deleting ? 22 : 55 + Math.random() * 40)
    }

    tick()
    return () => { if (s.timer) clearTimeout(s.timer) }
  }, [])

  return (
    <div>
      <form
        className="flex items-center gap-2.5 bg-card border rounded-[22px] py-1.5 pl-5 pr-1.5 shadow-md transition-all duration-200 hover:border-primary focus-within:border-primary focus-within:shadow-[0_0_0_3px_oklch(0.852_0.199_91.936/0.35)] max-w-[560px]"
        action="/chat"
      >
        <div
          className={`flex-1 min-w-0 text-base py-3.5 overflow-hidden whitespace-nowrap text-ellipsis ${isEmpty ? "text-muted-foreground" : "text-foreground"}`}
          aria-live="polite"
        >
          {displayText}
          <span
            className="inline-block w-px h-[1.05em] bg-foreground ml-0.5 align-[-0.15em]"
            style={{ animation: "blink 1s steps(1) infinite" }}
            aria-hidden="true"
          />
        </div>
        <Link
          href="/chat"
          className="bg-primary text-primary-foreground rounded-full w-11 h-11 flex-shrink-0 flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-sm"
          aria-label="Start chatting"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
      </form>

      <div className="flex flex-wrap gap-2 mt-6">
        {[
          { label: "Pick a bird elective for 2A", text: "Pick a bird elective for 2A" },
          { label: "Is CS 240 doable with STAT 230?", text: "Is CS 240 doable with STAT 230?" },
          { label: "What's a 4th course for 2A?", text: "What's a 4th course for 2A?" },
        ].map((p) => (
          <button
            key={p.text}
            type="button"
            onClick={() => {
              const s = state.current
              if (s.timer) clearTimeout(s.timer)
              s.deleting = false
              s.ci = p.text.length
              setDisplayText(p.text)
              setIsEmpty(false)
            }}
            className="bg-card border rounded-full px-3.5 py-2 text-[13px] text-foreground flex items-center gap-1.5 hover:border-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
