import { router } from '../trpc';
import { chatRouter } from './chat';
import { friendRouter } from './friend';
import { groupRouter } from './group';

export const appRouter = router({
  chat: chatRouter,
  friend: friendRouter,
  group: groupRouter,
});

export type AppRouter = typeof appRouter;
