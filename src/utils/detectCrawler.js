/**
 * Identifies social media crawlers from the User-Agent header.
 */
export const detectCrawler = (userAgent) => {
  if (!userAgent) return false;
  const crawlers = [
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'instagram',
    'whatsapp',
    'skypeuripreview',
    'slackbot',
    'vkshare',
    'pinterest',
    'googlebot'
  ];
  const ua = userAgent.toLowerCase();
  return crawlers.some(crawler => ua.includes(crawler));
};

export default detectCrawler;