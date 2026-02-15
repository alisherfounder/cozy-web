"use client"

import { usePathname, useRouter } from "next/navigation"
import { LayoutGrid, Video, Zap, CreditCard, Settings, Map } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", icon: LayoutGrid, label: "Главная" },
  { href: "/scenarios", icon: Zap, label: "Сценарии" },
  { href: "/cameras", icon: Video, label: "Камеры" },
  { href: "/bills", icon: CreditCard, label: "Счета" },
  { href: "/settings", icon: Settings, label: "Настройки" },
]

export function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-heavy pb-safe"
      style={{ borderRadius: 0, borderBottom: "none", borderLeft: "none", borderRight: "none" }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-[var(--radius-md)] min-w-[52px]"
              style={{ color: isActive ? "var(--primary)" : "var(--text-muted)" }}
            >
              <Icon className="h-5 w-5" />
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
