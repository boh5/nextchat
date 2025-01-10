import { auth } from '@/lib/auth/auth';
import { TRPCError, initTRPC } from '@trpc/server';
import { headers } from 'next/headers';
import superjson from 'superjson';

const t = initTRPC.context().create({
  transformer: superjson,
});

const isAuthed = t.middleware(async (opts) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  return opts.next({
    ctx: {
      user: {
        ...session.user,
        id: session.user.id,
      },
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
