import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { signIn } from '@/lib/auth'
import { headers } from 'next/headers'

export async function SignInForm() {
  const headersList = await headers()
  const origin =
    headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="grid gap-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={async () => {
          'use server'
          await signIn('github', { redirectTo: `${origin}/chat` })
        }}
      >
        <Icons.gitHub className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  )
}
