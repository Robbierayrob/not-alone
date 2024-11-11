import * as functions from 'firebase-functions';

export const getSuggestions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  return {
    suggestions: [
      { id: '1', text: 'How can I improve communication?', icon: '💭' },
      { id: '2', text: 'Help me resolve a conflict', icon: '🤝' },
      { id: '3', text: 'Understanding my emotions', icon: '❤️' },
      { id: '4', text: 'Building trust in relationships', icon: '🔒' }
    ],
    timestamp: new Date().toISOString()
  };
});
