import type { AstroIntegration } from 'astro';
import { attachStudio } from './server';

/**
 * Local-only control panel served by `astro dev` at /__studio.
 * It is never part of the production build.
 */
export default function studio(): AstroIntegration {
  return {
    name: 'local-studio',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        attachStudio(server, logger);
      },
    },
  };
}
