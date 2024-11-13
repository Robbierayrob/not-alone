import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
  
  // Connect to local Firestore emulator
  console.log('Connecting to Firestore Emulator: localhost:8080');
  admin.firestore().settings({
    host: 'localhost:8080',
    ssl: false
  });
}

const firestore = admin.firestore();

// Initialize Vertex AI
const vertex = new VertexAI({
  project: 'notalone-de4fc',
  location: 'australia-southeast1',
});

const model = vertex.preview.getGenerativeModel({
  model: 'gemini-1.5-flash-002',
});

export const analyzeProfileFromChat = onCall(async (request: unknown, context?: CallableContext) => {
  console.log('🔍 Analyzing Profile from Chat History', { request });

  // Basic validation
  if (!request || typeof request !== 'object') {
    console.error('❌ Invalid request');
    throw new HttpsError('invalid-argument', 'Invalid request');
  }

  // Handle nested data structure
  const data = (request as any).data || request;

  const { userId, chatId, messages = [] } = data as {
    userId?: string, 
    chatId?: string, 
    messages?: Array<{role: string, content: string, timestamp: string}>
  };

  // Fetch chat history if messages are not provided
  if (messages.length === 0) {
    const chatHistoryRef = firestore.collection('chat_histories').doc(chatId);
    const chatHistoryDoc = await chatHistoryRef.get();
    
    if (chatHistoryDoc.exists) {
      const chatHistoryData = chatHistoryDoc.data();
      messages.push(...(chatHistoryData?.messages || []));
    }
  }

  console.log('🔍 Extracted Data:', { userId, chatId, messagesCount: messages?.length });

  // Minimal validation
  if (!userId || !chatId || messages.length === 0) {
    console.error('❌ Missing userId, chatId, or messages', { data });
    throw new HttpsError('invalid-argument', 'User ID, Chat ID, and Messages are required');
  }

  try {
    // Prepare user messages for analysis
    const userMessages = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n\n');

    // Prompt for structured profile analysis
    const prompt = `
      Analyze the following conversation and extract a detailed profile and relationship graph:

      Conversation:
      ${userMessages}

      Please provide a JSON response strictly following this template:
      {
        "nodes": [
          {
            "id": "unique_identifier",
            "name": "Full Name",
            "val": 1,
            "gender": "male/female",
            "age": 0,
            "summary": "Brief personal description",
            "details": {
              "occupation": "",
              "interests": [],
              "personality": "",
              "background": "",
              "emotionalState": ""
            }
          }
        ],
        "links": [
          {
            "source": "source_id",
            "target": "target_id",
            "value": 1,
            "label": "relationship_type",
            "details": {
              "relationshipType": "",
              "duration": "",
              "status": "",
              "sentiment": "",
              "interactions": [
                {
                  "date": "YYYY-MM-DD",
                  "type": "",
                  "description": "",
                  "impact": ""
                }
              ]
            }
          }
        ]
      }

      Instructions:
      - Use the conversation to infer details
      - Be concise but informative
      - If information is uncertain, use reasonable assumptions
      - Ensure all fields are populated
    `;

    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    };

    const result = await model.generateContent(request);
    const response = result.response;
    
    if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini');
    }

    const analysisText = response.candidates[0].content.parts[0].text;
    
    // Extract JSON from markdown code block or raw text
    const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                      analysisText.match(/(\{[\s\S]*?\})/);
    
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }

    const profileAnalysis = JSON.parse(jsonMatch[1]);

    // Save profile analysis directly to Firestore
    const profileHistoryRef = firestore
      .collection('profile_histories')
      .doc(userId);

    await profileHistoryRef.set({
      ...profileAnalysis,
      metadata: {
        sourceType: 'chat_analysis',
        sourceId: chatId,
        analyzedAt: new Date().toISOString()
      }
    }, { merge: true });

    console.log('✅ Profile Analysis Saved:', {
      userId,
      nodesCount: profileAnalysis.nodes?.length || 0,
      linksCount: profileAnalysis.links?.length || 0
    });

    return { 
      success: true, 
      message: 'Profile analysis completed and saved',
      analysis: profileAnalysis
    };

  } catch (error) {
    console.error('❌ Profile Analysis Error:', error);
    throw new HttpsError(
      'internal', 
      'Failed to analyze profile from chat',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
