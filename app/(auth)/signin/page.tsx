import { SignInForm } from '@/components/auth/signin-form';
import { requireGuest } from '@/lib/auth/auth-guard';

export default async function SignInPage() {
  await requireGuest();

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignInForm />
    </div>
  );
}
