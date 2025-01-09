import { auth } from '@/lib/auth/auth';
import { appRouter } from '@/server/routers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const session = await auth();
      return { auth: session };
    },
  });

export { handler as GET, handler as POST };
