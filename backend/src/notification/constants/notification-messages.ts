export const NOTIFICATION_MESSAGES = {
  NEW_REQUEST: (senderName: string) =>
    `Поступила новая заявка от ${senderName}`,

  REQUEST_ACCEPTED: (receiverName: string) =>
    `Ваша заявка была принята пользователем ${receiverName}`,

  REQUEST_REJECTED: (receiverName: string) =>
    `Ваша заявка была отклонена пользователем ${receiverName}`,
} as const;
