import type { APIRoute, GetStaticPaths } from 'astro';
import { getResumeData } from '../../lib/content';
import { locales, type Locale } from '../../lib/i18n';

// Resume data for the Typst PDF build (scripts/resume.ts). It uses the same
// content helpers as the /resume page, so the PDF always matches the site.
export const getStaticPaths: GetStaticPaths = () => locales.map((locale) => ({ params: { locale } }));

export const GET: APIRoute = async ({ params, site }) => {
  const data = await getResumeData(params.locale as Locale, site);
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
