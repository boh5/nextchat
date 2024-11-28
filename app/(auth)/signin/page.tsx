import { SignInForm } from '@/components/auth/signin-form'
import { Icons } from '@/components/ui/icons'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default async function SignInPage() {
  return (
    <div className="container relative min-h-[calc(100vh-65px)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col overflow-hidden text-white dark:border-r lg:flex">
        <AuroraBackground>
          <div className="relative z-20 flex items-center p-8 text-lg font-medium">
            <div className="flex items-center rounded-lg border border-background/20 bg-background/10 p-3 shadow-lg backdrop-blur-sm">
              <Icons.logo className="mr-2 h-6 w-6 text-primary" />
              <span className="font-bold text-primary">NextChat</span>
            </div>
          </div>
          <div className="relative z-20 mt-auto p-8">
            <blockquote className="space-y-2 rounded-lg border border-background/20 bg-background/10 p-6 shadow-lg backdrop-blur-sm">
              <p className="text-lg font-medium text-muted">
                "This chat platform has transformed how we communicate and collaborate. It's simple,
                elegant, and powerful."
              </p>
              <footer className="text-sm font-medium text-primary">- NextChat Team</footer>
            </blockquote>
          </div>
        </AuroraBackground>
      </div>
      <div className="relative flex h-full items-center lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 px-4 sm:w-[350px] md:px-0">
          <div className="mb-8 flex items-center justify-center lg:hidden">
            <div className="flex items-center rounded-lg bg-muted/50 p-3">
              <Icons.logo className="mr-3 h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-primary">NextChat</h2>
            </div>
          </div>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue to NextChat</p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
