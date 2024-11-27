import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { signIn } from '@/lib/auth/auth'
import { headers } from 'next/headers'

export async function SignInForm() {
  const headersList = await headers()
  const origin =
    headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        size="lg"
        variant="outline"
        className="w-full"
        onClick={async () => {
          'use server'
          await signIn('github', { redirectTo: `${origin}/chat` })
        }}
      >
        <Icons.gitHub className="mr-2 h-5 w-5" />
        Continue with GitHub
      </Button>
    </div>
  )
}
