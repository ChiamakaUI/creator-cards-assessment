const { createHandler } = require('@app-core/server');
const createCreatorCard = require('@app/services/creator-cards/create-creator-card');
const serializeCard = require('@app/services/creator-cards/utils/serialize-card');
const CreatorCardMessages = require('@app/messages/creator-cards');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const card = await createCreatorCard(rc.body);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_CREATED,
      data: serializeCard(card, { includeAccessCode: true }),
    };
  },
});
