import { cn } from "@/lib/utils"

export const AuroraBackground = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          {/* Top left blob */}
          <div
            className="absolute h-[40rem] w-[40rem] -left-[20rem] -top-[20rem] rounded-full bg-purple-500"
            style={{
              filter: 'blur(100px)',
              animation: 'pulse 8s infinite',
              background: 'linear-gradient(to right, #4f46e5, #0ea5e9)',
            }}
          />
          {/* Bottom right blob */}
          <div
            className="absolute h-[40rem] w-[40rem] -right-[20rem] -bottom-[20rem] rounded-full bg-indigo-500"
            style={{
              filter: 'blur(100px)',
              animation: 'pulse 8s infinite',
              animationDelay: '4s',
              background: 'linear-gradient(to right, #8b5cf6, #d946ef)',
            }}
          />
        </div>
      </div>
      {/* Noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20" />
      <div className="relative">{children}</div>
    </div>
  )
}

// Add this to your global CSS file
const styles = `
@keyframes pulse {
  0% {
    transform: translate(0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(1rem, 1rem) rotate(45deg) scale(1.1);
  }
  100% {
    transform: translate(0) rotate(0deg) scale(1);
  }
}
`

// Create a style element and append it to the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
}
