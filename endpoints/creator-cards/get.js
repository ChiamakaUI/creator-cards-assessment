const { createHandler } = require('@app-core/server');
const getCreatorCard = require('@app/services/creator-cards/get-creator-card');
const serializeCard = require('@app/services/creator-cards/utils/serialize-card');
const CreatorCardMessages = require('@app/messages/creator-cards');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async handler(rc, helpers) {
    const card = await getCreatorCard({
      slug: rc.params.slug,
      access_code: rc.query.access_code,
    });
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_RETRIEVED,
      data: serializeCard(card, { includeAccessCode: false }),
    };
  },
});
