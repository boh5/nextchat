import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { env } from '@/env'
import { signIn } from '@/lib/auth/auth'

export async function SignInForm() {
  const origin = env.NEXT_PUBLIC_APP_URL

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        size="lg"
        variant="outline"
        className="w-full"
        onClick={async () => {
          'use server'
          await signIn('github', { redirectTo: `${origin}/friends` })
        }}
      >
        <Icons.gitHub className="mr-2 h-5 w-5" />
        Continue with GitHub
      </Button>
    </div>
  )
}
