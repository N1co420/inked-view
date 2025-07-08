const { initTRPC } = require('@trpc/server');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const Artist = require('../models/Artist');

const t = initTRPC.create();

const appRouter = t.router({
  registerArtist: t.procedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password, name } = input;

      const existingArtist = await Artist.findOne({ email });
      if (existingArtist) {
        throw new Error('Ein Künstler mit dieser E-Mail existiert bereits.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newArtist = new Artist({ name, email, password: hashedPassword });
      await newArtist.save();

      return { success: true, message: 'Künstler erfolgreich registriert!' };
    }),
});

// Exportiere den Typ des Routers für das Frontend
// module.exports.appRouter = appRouter;
// module.exports.AppRouter = typeof appRouter;

module.exports.appRouter = appRouter;