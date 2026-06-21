const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCard = require('@app/repository/creator-cards');
const CreatorCardMessages = require('@app/messages/creator-cards');
const generateSlug = require('./utils/generate-slug');

const spec = `root {
  title string<trim|lengthBetween:3,100>
  description? string<trim|maxLength:500>
  slug? string<trim|lengthBetween:5,50>
  creator_reference string<length:20>
  links[]? {
    title string<trim|lengthBetween:1,100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|lengthBetween:3,100>
      description string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<length:6>
}`;

const parsedSpec = validator.parse(spec);

const ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function isAlphanumeric(str) {
  return str.split('').every((char) => ALPHANUMERIC.includes(char));
}

function isValidSlugChar(char) {
  return (
    (char >= 'a' && char <= 'z') ||
    (char >= 'A' && char <= 'Z') ||
    (char >= '0' && char <= '9') ||
    char === '-' ||
    char === '_'
  );
}

function isValidSlug(slug) {
  return slug.split('').every(isValidSlugChar);
}

function hasValidProtocol(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

async function isSlugAvailable(candidate) {
  const existing = await CreatorCard.findOne({ query: { slug: candidate } });
  return !existing;
}

async function createCreatorCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let response;

  try {
    // --- Extended field-level validation (constraints VSL cannot express) ---

    if (data.links && data.links.some((link) => !hasValidProtocol(link.url))) {
      throwAppError(CreatorCardMessages.LINK_URL_INVALID_PROTOCOL, ERROR_CODE.VALIDATIONERR);
    }

    if (data.slug && !isValidSlug(data.slug)) {
      throwAppError(CreatorCardMessages.SLUG_INVALID_CHARACTERS, ERROR_CODE.VALIDATIONERR);
    }

    if (
      data.service_rates &&
      (!data.service_rates.rates || data.service_rates.rates.length === 0)
    ) {
      throwAppError('service_rates.rates must be a non-empty array', ERROR_CODE.VALIDATIONERR);
    }

    if (
      data.service_rates &&
      data.service_rates.rates &&
      data.service_rates.rates.some((rate) => !Number.isInteger(rate.amount))
    ) {
      throwAppError(CreatorCardMessages.AMOUNT_MUST_BE_INTEGER, ERROR_CODE.VALIDATIONERR);
    }

    // --- Business rules with custom codes (assessment-defined) ---

    const accessType = data.access_type || 'public';

    if (accessType === 'public' && data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED_ON_PUBLIC, 'AC05');
    }

    if (accessType === 'private' && !data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED_FOR_PRIVATE, 'AC01');
    }

    if (data.access_code && !isAlphanumeric(data.access_code)) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_INVALID_FORMAT, ERROR_CODE.VALIDATIONERR);
    }

    // --- Slug resolution ---

    let finalSlug = data.slug;
    if (finalSlug) {
      const available = await isSlugAvailable(finalSlug);
      if (!available) {
        throwAppError(CreatorCardMessages.SLUG_TAKEN, 'SL02');
      }
    } else {
      finalSlug = await generateSlug(data.title, isSlugAvailable);
    }

    // --- Persistence ---

    const cardData = {
      title: data.title,
      description: data.description,
      slug: finalSlug,
      creator_reference: data.creator_reference,
      links: data.links || [],
      service_rates: data.service_rates,
      status: data.status,
      access_type: accessType,
      access_code: accessType === 'private' ? data.access_code : null,
    };

    response = await CreatorCard.create(cardData);
  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = createCreatorCard;
