import { SignInForm } from '@/components/auth/signin-form'
import Link from 'next/link'

export default async function SignInPage() {
  return (
    <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
      <div className="flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">Enter your email and password to sign in</p>
        </div>
        <SignInForm />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
