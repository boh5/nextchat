import Link from 'next/link'
import { MessageCircle, Settings, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[hsl(142.1,30%,95%)] to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white md:text-6xl">
              Next<span className="text-primary">Chat</span>
            </h1>
            <p className="mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              Experience seamless communication with our modern chat platform
            </p>
            <div className="flex gap-4">
              <Link
                href="/chat"
                className="rounded-full bg-primary px-8 py-3 text-white transition hover:bg-primary/90"
              >
                Start Chat
              </Link>
              <Link
                href="/chat"
                className="rounded-full border border-primary px-8 py-3 text-primary transition hover:bg-primary/10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Why Choose NextChat?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg p-6 text-center shadow-lg transition hover:shadow-xl dark:bg-gray-800"
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-3 dark:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Start?</h2>
          <p className="mb-8 text-lg">Join us and experience better communication</p>
          <Link
            href="/chat"
            className="rounded-full bg-white px-8 py-3 text-primary transition hover:bg-gray-100"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">NextChat</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} NextChat. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Real-time Chat',
    description: 'Experience instant message delivery with smooth chat interactions',
    icon: MessageCircle,
  },
  {
    title: 'Easy to Use',
    description: 'Intuitive interface design for seamless user experience',
    icon: Settings,
  },
  {
    title: 'Secure & Reliable',
    description: 'Advanced security measures to protect your privacy',
    icon: Shield,
  },
]
