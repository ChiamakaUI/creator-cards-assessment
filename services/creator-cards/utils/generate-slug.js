const SUFFIX_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const MIN_SLUG_LENGTH = 5;
const SUFFIX_LENGTH = 6;
const MAX_ATTEMPTS = 10;

function isAllowedSlugChar(char) {
  return (
    (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char === '-' || char === '_'
  );
}

function isWhitespace(char) {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

/**
 * Transform a title into a slug per the assessment rules:
 * 1. Lowercase
 * 2. Whitespace -> hyphen
 * 3. Drop characters outside [a-z0-9_-]
 */
function sanitizeTitle(title) {
  return title
    .toLowerCase()
    .split('')
    .map((char) => {
      if (isWhitespace(char)) return '-';
      if (isAllowedSlugChar(char)) return char;
      return '';
    })
    .join('');
}

function generateSuffix() {
  return Array.from(
    { length: SUFFIX_LENGTH },
    () => SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)]
  ).join('');
}

/**
 * Recursively try suffixed candidates until one is free. Sequential by design:
 * collisions on a 6-char alphanumeric suffix are vanishingly rare, so usually
 * the first attempt succeeds and parallelizing N DB checks would be wasteful.
 * Recursion sidesteps both `no-await-in-loop` and `no-restricted-syntax`.
 */
async function findUnusedSuffixedSlug(base, isAvailable, attemptsLeft) {
  if (attemptsLeft <= 0) {
    throw new Error('Failed to generate a unique slug after maximum attempts');
  }
  const suffix = generateSuffix();
  const candidate = base.length > 0 ? `${base}-${suffix}` : suffix;
  const available = await isAvailable(candidate);
  return available ? candidate : findUnusedSuffixedSlug(base, isAvailable, attemptsLeft - 1);
}

/**
 * Generate a unique slug from a title.
 *
 * @param {string} title - Source title for the slug.
 * @param {function(string): Promise<boolean>} isAvailable - Async predicate;
 *   resolves true if the candidate slug is free.
 * @returns {Promise<string>}
 */
async function generateSlug(title, isAvailable) {
  const base = sanitizeTitle(title);
  let result;

  if (base.length >= MIN_SLUG_LENGTH && (await isAvailable(base))) {
    result = base;
  } else {
    result = await findUnusedSuffixedSlug(base, isAvailable, MAX_ATTEMPTS);
  }

  return result;
}

module.exports = generateSlug;
