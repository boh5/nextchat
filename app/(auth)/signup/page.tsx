import { SignUpForm } from '@/components/auth/signup-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SignUpPage() {
  const supabase = await createClient()
  const session = await supabase.auth.getSession()

  if (session.data.session) {
    redirect('/chat')
  }

  return (
    <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
      <div className="flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>
        <SignUpForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/signin" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
