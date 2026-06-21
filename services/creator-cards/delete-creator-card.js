const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCard = require('@app/repository/creator-cards');
const CreatorCardMessages = require('@app/messages/creator-cards');

const spec = `root {
  slug string
  creator_reference string<length:20>
}`;

const parsedSpec = validator.parse(spec);

async function deleteCreatorCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let response;

  try {
    const card = await CreatorCard.findOne({ query: { slug: data.slug } });

    if (!card) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
    }

    await CreatorCard.deleteOne({ query: { slug: data.slug } });

    // The factory's paranoid soft-delete sets `deleted = Date.now()`. Rather than
    // re-fetching via `raw` to read that exact value back, we stamp our own
    // `Date.now()` on the in-memory card. Sub-millisecond drift is invisible at
    // the API surface, and saves a third DB hit.
    response = { ...card, deleted: Date.now() };
  } catch (error) {
    appLogger.errorX(error, 'delete-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = deleteCreatorCard;
