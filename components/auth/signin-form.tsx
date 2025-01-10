'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { authClient } from '@/lib/auth/auth-client';

export function SignInForm() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        size="lg"
        variant="outline"
        className="w-full"
        onClick={async () => {
          await authClient.signIn.social({
            provider: 'github',
            callbackURL: '/chat',
          });
        }}
      >
        <Icons.gitHub className="mr-2 h-5 w-5" />
        Continue with GitHub
      </Button>
    </div>
  );
}
