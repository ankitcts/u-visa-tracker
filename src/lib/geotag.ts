/**
 * Rule-based fallback geotagger. Runs locally (zero LLM tokens) to catch
 * items where the classifier returned null but the title or source has a
 * recoverable US-state signal.
 */

// State full names → USPS.
const STATE_NAME_TO_USPS: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR',
  california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
  kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
  'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA',
  'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY',
  'washington d.c.': 'DC', 'washington dc': 'DC', 'd.c.': 'DC',
  'puerto rico': 'PR',
};

// Major US cities → USPS. Ambiguous names (Springfield, Aurora, Columbia,
// Portland, etc.) are intentionally omitted to avoid wrong geotags.
const CITY_TO_USPS: Record<string, string> = {
  'new york city': 'NY', nyc: 'NY', manhattan: 'NY', brooklyn: 'NY',
  queens: 'NY', bronx: 'NY', albany: 'NY', buffalo: 'NY', rochester: 'NY',
  syracuse: 'NY',
  'los angeles': 'CA', 'san francisco': 'CA', 'san diego': 'CA',
  oakland: 'CA', sacramento: 'CA', fresno: 'CA', 'san jose': 'CA',
  'santa ana': 'CA', 'long beach': 'CA', anaheim: 'CA', irvine: 'CA',
  riverside: 'CA', bakersfield: 'CA', stockton: 'CA',
  chicago: 'IL',
  houston: 'TX', dallas: 'TX', austin: 'TX', 'san antonio': 'TX',
  'fort worth': 'TX', 'el paso': 'TX', arlington: 'TX', plano: 'TX',
  laredo: 'TX', lubbock: 'TX', 'corpus christi': 'TX',
  phoenix: 'AZ', tucson: 'AZ', mesa: 'AZ', scottsdale: 'AZ', chandler: 'AZ',
  philadelphia: 'PA', pittsburgh: 'PA', harrisburg: 'PA',
  jacksonville: 'FL', miami: 'FL', tampa: 'FL', orlando: 'FL',
  'st. petersburg': 'FL', hialeah: 'FL', tallahassee: 'FL',
  'fort lauderdale': 'FL', 'west palm beach': 'FL',
  'cleveland': 'OH', cincinnati: 'OH', toledo: 'OH', akron: 'OH',
  dayton: 'OH',
  indianapolis: 'IN', 'fort wayne': 'IN',
  charlotte: 'NC', raleigh: 'NC', greensboro: 'NC', durham: 'NC',
  seattle: 'WA', spokane: 'WA', tacoma: 'WA',
  denver: 'CO', 'colorado springs': 'CO', boulder: 'CO',
  'd.c.': 'DC', 'washington, d.c.': 'DC', 'washington dc': 'DC',
  boston: 'MA', worcester: 'MA', cambridge: 'MA',
  nashville: 'TN', memphis: 'TN', knoxville: 'TN', chattanooga: 'TN',
  'oklahoma city': 'OK', tulsa: 'OK',
  'las vegas': 'NV', reno: 'NV', henderson: 'NV',
  milwaukee: 'WI', madison: 'WI',
  albuquerque: 'NM', 'santa fe': 'NM',
  baltimore: 'MD', annapolis: 'MD',
  louisville: 'KY', lexington: 'KY',
  'new orleans': 'LA', 'baton rouge': 'LA', shreveport: 'LA',
  detroit: 'MI', 'grand rapids': 'MI', 'ann arbor': 'MI',
  minneapolis: 'MN', 'st. paul': 'MN',
  'salt lake city': 'UT',
  'kansas city': 'MO', 'st. louis': 'MO',
  atlanta: 'GA', savannah: 'GA', augusta: 'GA',
  honolulu: 'HI',
  anchorage: 'AK',
  birmingham: 'AL', montgomery: 'AL', huntsville: 'AL',
  charleston: 'SC',
  hartford: 'CT', bridgeport: 'CT',
  newark: 'NJ', 'jersey city': 'NJ', paterson: 'NJ', trenton: 'NJ',
  providence: 'RI',
  'sioux falls': 'SD',
  fargo: 'ND',
  wilmington: 'DE',
  'des moines': 'IA', 'cedar rapids': 'IA',
};

// Publisher name keyword → USPS.
const SOURCE_HINTS: { re: RegExp; state: string }[] = [
  { re: /\borlando sentinel\b/i, state: 'FL' },
  { re: /\bmiami herald\b/i, state: 'FL' },
  { re: /\btampa bay\b/i, state: 'FL' },
  { re: /\bsun[- ]sentinel\b/i, state: 'FL' },
  { re: /\b(la times|los angeles times)\b/i, state: 'CA' },
  { re: /\bsfgate\b|\bsf chronicle\b|\bsan francisco chronicle\b/i, state: 'CA' },
  { re: /\bmercury news\b|\bsj mercury\b/i, state: 'CA' },
  { re: /\bsacramento bee\b/i, state: 'CA' },
  { re: /\bkhou\b/i, state: 'TX' },
  { re: /\bhouston chronicle\b/i, state: 'TX' },
  { re: /\bdallas morning news\b/i, state: 'TX' },
  { re: /\baustin[- ]american[- ]statesman\b/i, state: 'TX' },
  { re: /\bny post\b|\bnew york post\b/i, state: 'NY' },
  { re: /\bny daily news\b/i, state: 'NY' },
  { re: /\bnewsday\b/i, state: 'NY' },
  { re: /\bboston globe\b|\bboston herald\b/i, state: 'MA' },
  { re: /\bchicago tribune\b|\bchicago sun[- ]times\b/i, state: 'IL' },
  { re: /\bphiladelphia inquirer\b|\bphilly\.com\b/i, state: 'PA' },
  { re: /\bseattle times\b|\bkomo\b|\bkiro\b/i, state: 'WA' },
  { re: /\bdenver post\b|\b9news\b/i, state: 'CO' },
  { re: /\bstar tribune\b/i, state: 'MN' },
  { re: /\btwin[- ]cities\b/i, state: 'MN' },
  { re: /\boregonian\b|\bkgw\b/i, state: 'OR' },
  { re: /\bnew orleans advocate\b|\bnola\.com\b/i, state: 'LA' },
  { re: /\bthe oklahoman\b/i, state: 'OK' },
  { re: /\blas vegas review[- ]journal\b/i, state: 'NV' },
  { re: /\bnj\.com\b|\bstar[- ]ledger\b/i, state: 'NJ' },
  { re: /\battorney general\s+of\s+([a-z ]+)/i, state: '' }, // captured
  { re: /\bwashington post\b/i, state: 'DC' },
];

// US Attorney / federal-court district patterns → USPS.
const DISTRICT_HINTS: { re: RegExp; state: string }[] = [
  { re: /\b(northern|southern|eastern|western|central|middle)\s+district\s+of\s+([a-z ]+)/i, state: '' },
  { re: /\bdistrict\s+of\s+([a-z ]+)/i, state: '' },
  { re: /\bus\s+attorney['']?s?\s+office[,\s]+([a-z ]+)/i, state: '' },
];

// Valid set for whitelist check.
const VALID = new Set(Object.values(STATE_NAME_TO_USPS));

function findByStateName(text: string): string | null {
  const lower = text.toLowerCase();
  // Prefer longest matches first to avoid "washington" picking over "washington d.c."
  const names = Object.keys(STATE_NAME_TO_USPS).sort(
    (a, b) => b.length - a.length,
  );
  for (const name of names) {
    const re = new RegExp(`\\b${escapeRe(name)}\\b`, 'i');
    if (re.test(lower)) return STATE_NAME_TO_USPS[name];
  }
  return null;
}

function findByCity(text: string): string | null {
  const lower = text.toLowerCase();
  const cities = Object.keys(CITY_TO_USPS).sort((a, b) => b.length - a.length);
  for (const city of cities) {
    const re = new RegExp(`\\b${escapeRe(city)}\\b`, 'i');
    if (re.test(lower)) return CITY_TO_USPS[city];
  }
  return null;
}

function findByUsps(text: string): string | null {
  // Match " in NY" / " in TX," etc. — requires context ("in") so we don't
  // pick up random 2-letter words.
  const m = text.match(/\b(?:in|of|from|at)\s+([A-Z]{2})\b/);
  if (m && VALID.has(m[1])) return m[1];
  return null;
}

function findByDistrict(text: string): string | null {
  for (const { re } of DISTRICT_HINTS) {
    const m = text.match(re);
    if (m) {
      const name = (m[2] ?? m[1] ?? '').trim().toLowerCase();
      const usps = STATE_NAME_TO_USPS[name];
      if (usps) return usps;
    }
  }
  return null;
}

function findBySource(source: string): string | null {
  for (const { re, state } of SOURCE_HINTS) {
    if (re.test(source) && state && VALID.has(state)) return state;
  }
  return null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Infer a USPS state code from a news item using local rules.
 * Returns null if nothing found.
 */
export function inferStateFromItem(item: {
  title: string;
  source: string;
  description?: string;
}): string | null {
  const haystack = `${item.title} ${item.description ?? ''}`;
  return (
    findByDistrict(haystack) ||
    findByStateName(haystack) ||
    findByCity(haystack) ||
    findByUsps(haystack) ||
    findBySource(item.source) ||
    null
  );
}

/**
 * Best-effort country tagger for news items. Returns an ISO 3166-1 alpha-2
 * country code (e.g. "US","IN","MX"). Priority: publisher name / domain →
 * nationality keyword in title → country name in title. Defaults to null
 * rather than forcing "US", so the UI can decide how to render.
 */

const COUNTRY_BY_PUBLISHER: { re: RegExp; cc: string }[] = [
  // Indian outlets
  { re: /\b(scroll\.in|the hindu|hindustan times|moneycontrol|dna india|ndtv|times of india|india today|indian express|connectedtoindia|zee news|news18|outlook india|the print|wire\.in|firstpost|rediff|deccan chronicle|deccan herald|the quint)\b/i, cc: 'IN' },
  // Pakistani
  { re: /\b(dawn|geo news|ary news|express tribune|the news international|pakistan today)\b/i, cc: 'PK' },
  // Mexican
  { re: /\b(el universal|milenio|reforma|la jornada|excelsior)\b/i, cc: 'MX' },
  // Nigerian
  { re: /\b(premium times|punch|vanguard|the guardian nigeria|sahara reporters|leadership|this day)\b/i, cc: 'NG' },
  // Kenyan
  { re: /\b(daily nation|standard\.co\.ke|citizen digital|the star)\b/i, cc: 'KE' },
  // UK
  { re: /\b(bbc|the guardian|the times|daily mail|the telegraph|sky news|independent\b|financial times|ft\.com|itv|the sun)\b/i, cc: 'GB' },
  // Canadian
  { re: /\b(cbc|ctv|global news|the globe and mail|toronto star|national post|university affairs|montreal gazette)\b/i, cc: 'CA' },
  // Australian
  { re: /\b(abc news australia|sydney morning herald|the age|the australian|news\.com\.au|sbs news)\b/i, cc: 'AU' },
  // Irish
  { re: /\b(the irish times|rte|irish independent|irish examiner)\b/i, cc: 'IE' },
  // Filipino
  { re: /\b(philippine daily inquirer|gma news|abs[- ]cbn|rappler|manila bulletin)\b/i, cc: 'PH' },
  // Chinese / HK / TW
  { re: /\b(scmp|south china morning post|xinhua|china daily|global times)\b/i, cc: 'CN' },
  { re: /\b(taipei times|focus taiwan)\b/i, cc: 'TW' },
];

// Country full-name / demonym → alpha-2. Demonyms help catch titles like
// "Ten Indians indicted…" even when the article itself is published in the US.
const COUNTRY_KEYWORD_TO_CC: Record<string, string> = {
  india: 'IN', indian: 'IN', indians: 'IN',
  pakistan: 'PK', pakistani: 'PK', pakistanis: 'PK',
  bangladesh: 'BD', bangladeshi: 'BD',
  'sri lanka': 'LK', sri_lankan: 'LK',
  nepal: 'NP', nepali: 'NP', nepalese: 'NP',
  mexico: 'MX', mexican: 'MX', mexicans: 'MX',
  guatemala: 'GT', guatemalan: 'GT',
  honduras: 'HN', honduran: 'HN',
  'el salvador': 'SV', salvadoran: 'SV',
  nicaragua: 'NI', nicaraguan: 'NI',
  colombia: 'CO', colombian: 'CO',
  venezuela: 'VE', venezuelan: 'VE',
  ecuador: 'EC', ecuadorian: 'EC',
  brazil: 'BR', brazilian: 'BR', brazilians: 'BR',
  cuba: 'CU', cuban: 'CU',
  haiti: 'HT', haitian: 'HT',
  'dominican republic': 'DO', dominican: 'DO',
  china: 'CN', chinese: 'CN',
  taiwan: 'TW', taiwanese: 'TW',
  'hong kong': 'HK',
  japan: 'JP', japanese: 'JP',
  'south korea': 'KR', korean: 'KR',
  vietnam: 'VN', vietnamese: 'VN',
  philippines: 'PH', filipino: 'PH', filipina: 'PH',
  thailand: 'TH', thai: 'TH',
  indonesia: 'ID', indonesian: 'ID',
  malaysia: 'MY', malaysian: 'MY',
  afghanistan: 'AF', afghan: 'AF',
  iran: 'IR', iranian: 'IR',
  iraq: 'IQ', iraqi: 'IQ',
  syria: 'SY', syrian: 'SY',
  turkey: 'TR', turkish: 'TR',
  israel: 'IL', israeli: 'IL',
  palestine: 'PS', palestinian: 'PS',
  lebanon: 'LB', lebanese: 'LB',
  'saudi arabia': 'SA', saudi: 'SA',
  egypt: 'EG', egyptian: 'EG',
  nigeria: 'NG', nigerian: 'NG', nigerians: 'NG',
  kenya: 'KE', kenyan: 'KE',
  ethiopia: 'ET', ethiopian: 'ET',
  ghana: 'GH', ghanaian: 'GH',
  'south africa': 'ZA',
  somalia: 'SO', somali: 'SO',
  ukraine: 'UA', ukrainian: 'UA',
  russia: 'RU', russian: 'RU',
  canada: 'CA', canadian: 'CA',
  'united kingdom': 'GB', britain: 'GB', british: 'GB', england: 'GB',
  ireland: 'IE', irish: 'IE',
  france: 'FR', french: 'FR',
  germany: 'DE', german: 'DE',
  italy: 'IT', italian: 'IT',
  spain: 'ES', spanish: 'ES',
  poland: 'PL', polish: 'PL',
  australia: 'AU', australian: 'AU',
  'new zealand': 'NZ',
};

/**
 * Infer the nationality of the SUBJECT of the news (i.e. the person or group
 * the story is about), not the country of the publisher. "Ten Indians
 * indicted in Boston" → IN even if the source is the Washington Post. Only
 * falls back to the publisher's country when the content itself carries no
 * nationality signal.
 *
 * Priority:
 *   1. Demonym / country name mentioned in title or description.
 *   2. Publisher country (as a last resort).
 *   3. null.
 */
export function inferCountryFromItem(item: {
  title: string;
  source: string;
  description?: string;
  state?: string | null;
}): string | null {
  const kwCC = findByCountryKeyword(`${item.title} ${item.description ?? ''}`);
  if (kwCC) return kwCC;
  const pubCC = findByPublisher(item.source);
  if (pubCC) return pubCC;
  return null;
}

// Alpha-2 → display name. Keyed off the keyword map, so every country we can
// detect also has a display name for the note line.
const CC_TO_NAME: Record<string, string> = {
  IN: 'India', PK: 'Pakistan', BD: 'Bangladesh', LK: 'Sri Lanka', NP: 'Nepal',
  MX: 'Mexico', GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador',
  NI: 'Nicaragua', CO: 'Colombia', VE: 'Venezuela', EC: 'Ecuador',
  BR: 'Brazil', CU: 'Cuba', HT: 'Haiti', DO: 'Dominican Republic',
  CN: 'China', TW: 'Taiwan', HK: 'Hong Kong', JP: 'Japan', KR: 'South Korea',
  VN: 'Vietnam', PH: 'Philippines', TH: 'Thailand', ID: 'Indonesia',
  MY: 'Malaysia', AF: 'Afghanistan', IR: 'Iran', IQ: 'Iraq', SY: 'Syria',
  TR: 'Turkey', IL: 'Israel', PS: 'Palestine', LB: 'Lebanon',
  SA: 'Saudi Arabia', EG: 'Egypt', NG: 'Nigeria', KE: 'Kenya',
  ET: 'Ethiopia', GH: 'Ghana', ZA: 'South Africa', SO: 'Somalia',
  UA: 'Ukraine', RU: 'Russia', CA: 'Canada', GB: 'United Kingdom',
  IE: 'Ireland', FR: 'France', DE: 'Germany', IT: 'Italy', ES: 'Spain',
  PL: 'Poland', AU: 'Australia', NZ: 'New Zealand', US: 'United States',
  AR: 'Argentina', CL: 'Chile',
};

export function countryName(cc?: string | null): string {
  if (!cc) return '';
  return CC_TO_NAME[cc] ?? cc;
}

/**
 * Short context note for display under the headline, e.g. "Involves Indian
 * nationals" or "About Somalia". Uses the demonym where possible.
 */
const CC_TO_DEMONYM: Record<string, string> = {
  IN: 'Indian', PK: 'Pakistani', BD: 'Bangladeshi', LK: 'Sri Lankan',
  NP: 'Nepalese', MX: 'Mexican', GT: 'Guatemalan', HN: 'Honduran',
  SV: 'Salvadoran', NI: 'Nicaraguan', CO: 'Colombian', VE: 'Venezuelan',
  EC: 'Ecuadorian', BR: 'Brazilian', CU: 'Cuban', HT: 'Haitian',
  DO: 'Dominican', CN: 'Chinese', TW: 'Taiwanese', JP: 'Japanese',
  KR: 'South Korean', VN: 'Vietnamese', PH: 'Filipino', TH: 'Thai',
  ID: 'Indonesian', MY: 'Malaysian', AF: 'Afghan', IR: 'Iranian',
  IQ: 'Iraqi', SY: 'Syrian', TR: 'Turkish', IL: 'Israeli',
  PS: 'Palestinian', LB: 'Lebanese', SA: 'Saudi', EG: 'Egyptian',
  NG: 'Nigerian', KE: 'Kenyan', ET: 'Ethiopian', GH: 'Ghanaian',
  ZA: 'South African', SO: 'Somali', UA: 'Ukrainian', RU: 'Russian',
  CA: 'Canadian', GB: 'British', IE: 'Irish', FR: 'French',
  DE: 'German', IT: 'Italian', ES: 'Spanish', PL: 'Polish',
  AU: 'Australian', NZ: 'New Zealand', US: 'U.S.',
};

export function countryNote(cc?: string | null): string {
  if (!cc) return '';
  const demonym = CC_TO_DEMONYM[cc];
  const name = CC_TO_NAME[cc] ?? cc;
  if (!demonym || cc === 'US') return `About ${name}`;
  return `Involves ${demonym} national${demonym.endsWith('s') ? '' : 's'}`;
}

function findByPublisher(source: string): string | null {
  for (const { re, cc } of COUNTRY_BY_PUBLISHER) {
    if (re.test(source)) return cc;
  }
  // Domain-based fallback: ".in" → India, ".pk" → Pakistan, ".mx" → Mexico, etc.
  const tldMatch = source.match(/\.([a-z]{2})\b/i);
  if (tldMatch) {
    const tld = tldMatch[1].toLowerCase();
    const TLD_TO_CC: Record<string, string> = {
      in: 'IN', pk: 'PK', bd: 'BD', lk: 'LK', np: 'NP',
      mx: 'MX', br: 'BR', co: 'CO', ar: 'AR', cl: 'CL',
      cn: 'CN', tw: 'TW', hk: 'HK', jp: 'JP', kr: 'KR',
      vn: 'VN', ph: 'PH', th: 'TH', id: 'ID', my: 'MY',
      ng: 'NG', ke: 'KE', za: 'ZA', eg: 'EG', gh: 'GH',
      uk: 'GB', ie: 'IE', de: 'DE', fr: 'FR', it: 'IT',
      ca: 'CA', au: 'AU', nz: 'NZ',
    };
    if (TLD_TO_CC[tld]) return TLD_TO_CC[tld];
  }
  return null;
}

function findByCountryKeyword(text: string): string | null {
  const lower = text.toLowerCase();
  const keys = Object.keys(COUNTRY_KEYWORD_TO_CC).sort(
    (a, b) => b.length - a.length,
  );
  for (const k of keys) {
    const re = new RegExp(`\\b${escapeRe(k)}\\b`, 'i');
    if (re.test(lower)) return COUNTRY_KEYWORD_TO_CC[k];
  }
  return null;
}

/** Returns a flag emoji for an alpha-2 country code, or '' if invalid. */
export function flagEmoji(cc?: string | null): string {
  if (!cc || !/^[A-Z]{2}$/.test(cc)) return '';
  const base = 0x1f1e6 - 'A'.charCodeAt(0);
  return String.fromCodePoint(base + cc.charCodeAt(0)) +
    String.fromCodePoint(base + cc.charCodeAt(1));
}

export type RuleTag =
  | 'policy-change'
  | 'litigation'
  | 'fraud-concern'
  | 'data-report'
  | 'commentary'
  | 'general';

const TAG_PATTERNS: { re: RegExp; tag: RuleTag }[] = [
  { re: /\b(indict(ed|ment)?|charged|plea|sentenced|convicted|guilty|lawsuit|sued|appeal|ruling|court|judge|attorney general|prosecut)/i, tag: 'litigation' },
  { re: /\b(fraud|scam|scheme|racket|conspir|bogus|phony|fake|staged)/i, tag: 'fraud-concern' },
  { re: /\b(rule|regulation|policy|USCIS announce|final rule|proposed rule|executive order|DHS announce|cap raised|cap lifted)/i, tag: 'policy-change' },
  { re: /\b(backlog|processing time|approvals?|denials?|receipts|statistics|data report|FY\d{4}|fiscal year|quarterly report)/i, tag: 'data-report' },
  { re: /\b(opinion|editorial|commentary|op-ed|column|essay|analysis)/i, tag: 'commentary' },
];

/**
 * Infer a tag from the item's title/description when the LLM classifier didn't
 * run or returned the default "general" tag. Keeps map markers colorful even
 * during rate-limited renders.
 */
export function inferTagFromItem(item: {
  title: string;
  description?: string;
}): RuleTag | null {
  const haystack = `${item.title} ${item.description ?? ''}`;
  for (const { re, tag } of TAG_PATTERNS) {
    if (re.test(haystack)) return tag;
  }
  return null;
}
