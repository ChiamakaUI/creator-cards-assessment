const { createHandler } = require('@app-core/server');
const deleteCreatorCard = require('@app/services/creator-cards/delete-creator-card');
const serializeCard = require('@app/services/creator-cards/utils/serialize-card');
const CreatorCardMessages = require('@app/messages/creator-cards');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const card = await deleteCreatorCard({
      slug: rc.params.slug,
      ...rc.body,
    });
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_DELETED,
      data: serializeCard(card, { includeAccessCode: true }),
    };
  },
});
