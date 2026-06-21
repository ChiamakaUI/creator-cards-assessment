function withoutNestedId(obj) {
  if (!obj) {
    return obj;
  }
  const clone = { ...obj };
  delete clone._id;
  return clone;
}

/**
 * Serialize a creator card document for API responses.
 * - Maps `_id` to `id` at the top level
 * - Strips Mongoose's auto-generated `_id` from nested links and rates
 * - Normalizes `deleted` (0 -> null) and unset `service_rates` (-> null)
 * - Conditionally includes `access_code` (creation/deletion only, never retrieval)
 */
function serializeCard(card, { includeAccessCode = false } = {}) {
  if (!card) {
    return null;
  }

  const links = (card.links || []).map(withoutNestedId);

  // Mongoose initializes service_rates as an empty nested object even when the
  // request omitted it. Treat "no currency" as "no service_rates."
  let serviceRates = null;
  if (card.service_rates && card.service_rates.currency) {
    serviceRates = {
      currency: card.service_rates.currency,
      rates: (card.service_rates.rates || []).map(withoutNestedId),
    };
  }

  const result = {
    id: card._id,
    title: card.title,
    description: card.description || null,
    slug: card.slug,
    creator_reference: card.creator_reference,
    links,
    service_rates: serviceRates,
    status: card.status,
    access_type: card.access_type,
    created: card.created,
    updated: card.updated,
    deleted: card.deleted === 0 ? null : card.deleted,
  };

  if (includeAccessCode) {
    result.access_code = card.access_code || null;
  }

  return result;
}

module.exports = serializeCard;
