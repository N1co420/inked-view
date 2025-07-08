// backend/routes/trpc.js

const { initTRPC, TRPCError } = require('@trpc/server'); // TRPCError importieren
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service'); // Den neuen Service importieren
const studioService = require('../services/studio.service');

// 1. Kontext-Erstellung definieren
// Diese Funktion wird für JEDE Anfrage ausgeführt.
// Sie nimmt den Express-Request und gibt ein "Kontext"-Objekt zurück.
const createContext = ({ req }) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  return { token };
};

const t = initTRPC.context().create();


const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Kein Token vorhanden.' });
  }

  try {
    const payload = jwt.verify(ctx.token, process.env.JWT_SECRET);
    // Hänge die entschlüsselten Daten an den Kontext an für die nächste Funktion
    return next({
      ctx: {
        ...ctx,
        artist: payload, // z.B. { id: '...', name: '...' }
      },
    });
  } catch (error) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Ungültiger Token.' });
  }
});

const protectedProcedure = t.procedure.use(isAuthed);

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

    createStudio: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, 'Der Name muss mindestens 3 Zeichen haben.'),
        region: z.string().min(2, 'Die Region muss mindestens 2 Zeichen haben.'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // ctx.artist.id kommt von unserer isAuthed-Middleware
      const ownerId = ctx.artist.id;
      const newStudio = await studioService.createStudio(input, ownerId);
      
      return { success: true, studio: newStudio };
    }),

    getMe: protectedProcedure.query(({ ctx }) => {
    return {
      message: `Willkommen zurück, ${ctx.artist.name}!`,
      artistData: ctx.artist,
    };
  }),
});

module.exports.appRouter = appRouter;