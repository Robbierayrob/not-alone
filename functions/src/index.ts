import * as firebaseFunctions from 'firebase-functions';
import { VertexAI } from '@google-cloud/vertexai';
import * as admin from 'firebase-admin';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { initializeApp as initializeClientApp, getApps } from 'firebase/app';

// Utility function to safely initialize Firebase client app
function getOrInitializeClientApp(projectId: string, apiKey: string) {
  const existingApps = getApps();
  
  // Find an existing app with matching configuration
  const existingMatchingApp = existingApps.find(
    app => app.options.projectId === projectId && app.options.apiKey === apiKey
  );

  // Use existing app if it matches, otherwise create a new one
  const clientApp = existingMatchingApp || initializeClientApp({
    projectId: projectId,
    apiKey: apiKey
  });

  const functionsInstance = getFunctions(clientApp);
  
  // Safely connect to emulator
  try {
    connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
    console.log('🔧 Configured Firebase Functions to use local emulator');
  } catch (error) {
    console.warn('⚠️ Failed to connect to Functions emulator:', error);
  }

  return { clientApp, functions: functionsInstance };
}

// Initialize Firebase client app with project-specific configuration
const { clientApp: _clientApp } = getOrInitializeClientApp('notalone-de4fc', 'local-api-key');

// Initialize Vertex AI
const vertex = new VertexAI({
  project: 'notalone-de4fc',
  location: 'australia-southeast1',
});

const model = vertex.preview.getGenerativeModel({
  model: 'gemini-1.5-flash-002',
});

// Store chat sessions with explicit history tracking
const chatSessions = new Map<string, {
  chat: any;
  history: Array<{role: string, parts: Array<{text: string}>}>;
}>();



// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
  
  if (process.env.FUNCTIONS_EMULATOR) { // Check if running in emulator
    console.log('Connecting to Firestore Emulator: localhost:8080');
    admin.firestore().settings({
      host: 'localhost:8080',
      ssl: false
    });
  }
}

export { saveChatHistory } from './chat/chatHistory';
export { getChatHistory } from './chat/getChatHistory';
export { deleteChatHistory } from './chat/deleteChatHistory';
export { analyzeProfileFromChat } from './profile/profileAnalysis';
export { saveProfileHistory } from './profile/profileHistory';

export const processChat = firebaseFunctions.https.onCall(async (request: firebaseFunctions.https.CallableRequest) => {
  console.log('🚀 Incoming request:', {
    auth: request.auth ? 'Authenticated' : 'Not authenticated',
    data: request.data,
  });

  // Authentication check
  if (!request.auth) {
    console.error('❌ Authentication missing');
    throw new firebaseFunctions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  // Validate message
  if (!request.data?.message) {
    console.error('❌ Message missing in request data');
    throw new firebaseFunctions.https.HttpsError('invalid-argument', 'Message is required');
  }

  try {
    const { message, chatId } = request.data;
    // Generate new chat ID only if one wasn't provided
    const sessionChatId = chatId || `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = request.auth.uid;
    
    console.log('📝 Using chat ID:', chatId);
    
    console.log('📥 Processing request:', {
      messageLength: message.length,
      userId,
      chatId,
    });

    // Get or create chat session
    let chatSession = chatSessions.get(sessionChatId);
    if (!chatSession) {
      console.log('🆕 Creating new chat session:', sessionChatId);
      const initialHistory = [
        {
          role: "user",
          parts: [{ text: "You are a relationship counselor AI assistant. Help users understand and improve their relationships." }]
        },
        {
          role: "assistant", 
          parts: [{ text: "I understand my role as a relationship counselor AI assistant. I'm here to help users explore and improve their relationships." }]
        },
        {
          role: "user",
          parts: [{ text: "Tell me about my relationships" }]
        },
        {
          role: "assistant",
          parts: [{ text: "I'd be happy to help you explore and understand your relationships. What specific aspects would you like to discuss?" }]
        }
      ];

      const chat = await model.startChat({ history: initialHistory });
      
      chatSession = {
        chat,
        history: initialHistory
      };
      
      chatSessions.set(sessionChatId, chatSession);
      
      console.log('📝 Chat session created:', {
        chatId: sessionChatId,
        sessionExists: chatSessions.has(sessionChatId)
      });
    }

    const chat = chatSession.chat;
    const history = chatSession.history;

    console.log('💬 Sending message to Gemini:', message);
    
    // Update history with current user message
    const userMessagePart = { role: "user", parts: [{ text: message }] };
    history.push(userMessagePart);

    const result = await chat.sendMessage(message);
    const response = result.response;
    
    if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini');
    }

    const aiResponse = response.candidates[0].content.parts[0].text;
    
    // Update history with AI response
    const aiResponsePart = { role: "model", parts: [{ text: aiResponse }] };
    history.push(aiResponsePart);

    // Log the current chat history for debugging
    console.log('📚 Current Chat History:', {
      chatId: sessionChatId,
      historyLength: history.length,
      lastMessages: history.slice(-4)  // Show last 4 messages
    });
    
    console.log('✅ Response received:', {
      responseLength: aiResponse.length,
      timestamp: new Date().toISOString(),
    });

    const finalResponse = {
      message: aiResponse,
      userMessage: message,
      timestamp: new Date().toISOString(),
      userId,
      chatId: sessionChatId
    };

    console.log('📤 Sending response:', finalResponse);
    // Attempt to save chat history and analyze profile
    try {
      console.log('🔍 Attempting to save chat history and analyze profile:', {
        userId,
        chatId: sessionChatId,
        messageCount: 2,
        timestamp: new Date().toISOString(),
        clientAppConfig: _clientApp.options
      });

      // Trigger profile analysis
      try {
        const functionsInstance = getFunctions(_clientApp);
        const analyzeProfileFunction = httpsCallable(functionsInstance, 'analyzeProfileFromChat');
        const profileAnalysisPayload = {
          userId: request.auth?.uid,
          chatId: sessionChatId,
          messages: [
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'model', content: aiResponse, timestamp: new Date().toISOString() }
          ]
        };

        const profileAnalysisResult = await analyzeProfileFunction(profileAnalysisPayload);
        console.log('✅ Profile analysis result:', profileAnalysisResult);
      } catch (profileAnalysisError) {
        console.error('❌ Profile analysis error:', profileAnalysisError);
        // Non-critical error, continue with main response
      }

      // Explicitly log Firebase configuration
      console.log('🔧 Firebase Client Configuration:', {
        projectId: _clientApp.options.projectId,
        apiKey: _clientApp.options.apiKey,
        authDomain: _clientApp.options.authDomain,
        emulatorHost: 'localhost',
        emulatorPort: 5001
      });

      const functions = getFunctions(_clientApp);
      console.log('🔍 Firebase Functions Object Keys:', Object.keys(functions));
      console.log('🔍 Firebase Functions Instance:', functions);

      try {
        // Explicitly use the correct project configuration
        const adminApp = admin.app();
        const projectId = adminApp.options.projectId || 'demo-project';
        
        console.log('🔍 Admin App Project Configuration:', {
          projectId,
          name: adminApp.name
        });

        // Use the existing client app or reinitialize if needed
        const { clientApp: _clientApp, functions: _functions } = getOrInitializeClientApp(projectId, 'local-api-key');

        const functionsInstance = getFunctions(_clientApp);
        const saveChatHistoryFunction = httpsCallable(functionsInstance, 'saveChatHistory');
        console.log('🔍 Save Chat History Function Details:', {
          functionExists: !!saveChatHistoryFunction,
          functionType: typeof saveChatHistoryFunction,
          functionName: 'saveChatHistory'
        });

        const chatHistoryPayload = {
          userId: request.auth?.uid, // Explicitly use the authenticated user's ID
          chatId: sessionChatId,
          messages: [
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'model', content: aiResponse, timestamp: new Date().toISOString() }
          ],
          timestamp: new Date().toISOString()
        };

        console.log('📤 Chat History Payload:', JSON.stringify({
          ...chatHistoryPayload,
          authDetails: {
            uid: request.auth?.uid,
            token: request.auth ? 'Present' : 'Missing'
          }
        }, null, 2));

        const result = await saveChatHistoryFunction(chatHistoryPayload);

        console.log('✅ Chat history save result:', result);
      } catch (saveError: unknown) {
        console.error('❌ COMPREHENSIVE Save Chat History Error (Enhanced):', {
          errorType: typeof saveError,
          errorInstance: saveError instanceof Error,
          fullErrorObject: saveError,
          stringRepresentation: String(saveError),
          adminAppConfig: admin.app().options
        });

        if (saveError instanceof Error) {
          console.error('❌ Detailed Error Breakdown (Enhanced):', {
            errorName: saveError.name,
            errorCode: (saveError as any).code,
            errorMessage: saveError.message,
            errorStack: saveError.stack
          });
        }
        
        // Non-critical error, so we'll continue with the main response
      }
    } catch (saveError: unknown) {
      console.error('❌ COMPREHENSIVE Save Chat History Error:', {
        errorType: typeof saveError,
        errorInstance: saveError instanceof Error,
        fullErrorObject: saveError,
        stringRepresentation: String(saveError)
      });

      if (saveError instanceof Error) {
        console.error('❌ Detailed Error Breakdown:', {
          errorName: saveError.name,
          errorCode: (saveError as any).code,
          errorMessage: saveError.message,
          errorStack: saveError.stack
        });
      }
      
      // Non-critical error, so we'll continue with the main response
    }

    return { result: finalResponse };

  } catch (error) {
    console.error('💥 Chat processing error:', error);
    
    // Specific handling for 429 Too Many Requests
    if (error instanceof Error && error.message.includes('429')) {
      throw new firebaseFunctions.https.HttpsError(
        'resource-exhausted', 
        'Too many requests. Please try again later.'
      );
    }
    
    throw new firebaseFunctions.https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Error processing chat'
    );
  }
});
