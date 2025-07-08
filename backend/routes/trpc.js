// backend/routes/trpc.js

const { initTRPC, TRPCError } = require('@trpc/server'); // TRPCError importieren
const { z } = require('zod');
const authService = require('../services/auth.service'); // Den neuen Service importieren

const t = initTRPC.create();

const appRouter = t.router({
  registerArtist: t.procedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const newArtist = await authService.register(input);
        return { 
            success: true, 
            message: 'Künstler erfolgreich registriert!',
            artistId: newArtist._id 
        };
      } catch (error) {
        if (error.message === 'EMAIL_EXISTS') {
          // Send a structured, predictable error to the client
          throw new TRPCError({
            code: 'CONFLICT', // HTTP 409
            message: 'Ein Künstler mit dieser E-Mail existiert bereits.',
          });
        }
        // For all other errors
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR', // HTTP 500
          message: 'Ein unerwarteter Fehler ist aufgetreten.',
        });
      }
    }),
    
    login: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const token = await authService.login(input);
        return {
          success: true,
          token,
        };
      } catch (error) {
        if (error.message === 'INVALID_CREDENTIALS') {
          throw new TRPCError({
            code: 'UNAUTHORIZED', // HTTP 401
            message: 'E-Mail oder Passwort ist ungültig.',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ein unerwarteter Fehler ist aufgetreten.',
        });
      }
    }),
});

module.exports.appRouter = appRouter;