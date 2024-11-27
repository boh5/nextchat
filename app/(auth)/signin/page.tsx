import { SignInForm } from '@/components/auth/signin-form'
import { Icons } from '@/components/ui/icons'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default async function SignInPage() {
  return (
    <div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 min-h-[calc(100vh-4rem)]">
      <div className="relative hidden h-full flex-col text-white lg:flex dark:border-r overflow-hidden">
        <AuroraBackground>
          <div className="relative z-20 flex items-center text-lg font-medium p-8">
            <div className="flex items-center bg-background/10 p-3 rounded-lg backdrop-blur-sm border border-background/20 shadow-lg">
              <Icons.logo className="h-6 w-6 mr-2 text-primary" />
              <span className="font-bold text-primary">NextChat</span>
            </div>
          </div>
          <div className="relative z-20 mt-auto p-8">
            <blockquote className="space-y-2 bg-background/10 p-6 rounded-lg backdrop-blur-sm border border-background/20 shadow-lg">
              <p className="text-lg font-medium text-muted">
                "This chat platform has transformed how we communicate and collaborate. It's simple, elegant, and powerful."
              </p>
              <footer className="text-sm font-medium text-primary">- NextChat Team</footer>
            </blockquote>
          </div>
        </AuroraBackground>
      </div>
      <div className="relative flex h-full items-center lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] px-4 md:px-0">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center bg-muted/50 p-3 rounded-lg">
              <Icons.logo className="h-8 w-8 mr-3 text-primary" />
              <h2 className="text-2xl font-bold text-primary">NextChat</h2>
            </div>
          </div>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to NextChat
            </p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
