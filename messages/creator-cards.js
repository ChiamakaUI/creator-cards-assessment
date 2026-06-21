const CreatorCardMessages = {
  // Business rule errors
  SLUG_TAKEN: 'Slug is already taken',
  ACCESS_CODE_REQUIRED_FOR_PRIVATE: 'access_code is required when access_type is private',
  ACCESS_CODE_NOT_ALLOWED_ON_PUBLIC: 'access_code can only be set on private cards',
  CARD_NOT_FOUND: 'Creator card not found',
  CARD_IS_DRAFT: 'Creator card not found',
  PRIVATE_CARD_REQUIRES_CODE: 'This card is private. An access code is required',
  INVALID_ACCESS_CODE: 'Invalid access code',

  // Extended field-level validation messages (things VSL can't express)
  LINK_URL_INVALID_PROTOCOL: 'Link URL must start with http:// or https://',
  SLUG_INVALID_CHARACTERS: 'Slug must contain only letters, numbers, hyphens, and underscores',
  ACCESS_CODE_INVALID_FORMAT: 'access_code must be exactly 6 alphanumeric characters',
  AMOUNT_MUST_BE_INTEGER: 'Service rate amount must be a positive integer',

  // Success messages
  CARD_CREATED: 'Creator Card Created Successfully.',
  CARD_RETRIEVED: 'Creator Card Retrieved Successfully.',
  CARD_DELETED: 'Creator Card Deleted Successfully.',
};

module.exports = CreatorCardMessages;
