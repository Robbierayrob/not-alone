import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import * as admin from 'firebase-admin';

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

const firestore = admin.firestore();

export const saveProfileHistory = onCall(async (request: unknown, context?: CallableContext) => {
  console.log('🔍 Saving Profile History', { request });

  // Basic validation
  if (!request || typeof request !== 'object') {
    console.error('❌ Invalid request');
    throw new HttpsError('invalid-argument', 'Invalid request');
  }

  // Handle nested data structure
  const data = (request as any).data || request;

  const { userId, nodes = [], links = [], metadata = {} } = data as {
    userId: string, 
    nodes?: Array<{
      id: string, 
      name: string, 
      val: number, 
      gender: string, 
      age: number, 
      summary: string, 
      details?: {
        occupation?: string,
        interests?: string[],
        personality?: string,
        background?: string,
        emotionalState?: string,
        [key: string]: any
      }
    }>,
    links?: Array<{
      source: string, 
      target: string, 
      value: number, 
      label: string, 
      details?: {
        relationshipType?: string,
        duration?: string,
        status?: string,
        sentiment?: string,
        interactions?: Array<{
          date: string,
          type: string,
          description: string,
          impact: string
        }>
      }
    }>,
    metadata?: Record<string, any>
  };

  // If no nodes/links provided, attempt to retrieve from profile_histories
  if (nodes.length === 0 || links.length === 0) {
    const profileHistoryRef = firestore.collection('profile_histories').doc(userId);
    const profileHistoryDoc = await profileHistoryRef.get();
    
    if (profileHistoryDoc.exists) {
      const profileHistoryData = profileHistoryDoc.data();
      nodes.push(...(profileHistoryData?.nodes || []));
      links.push(...(profileHistoryData?.links || []));
    }
  }

  console.log('🔍 Extracted Profile Data:', { 
    userId, 
    nodesCount: nodes.length, 
    linksCount: links.length 
  });

  try {
    // Prepare metadata with version and last updated timestamp
    const finalMetadata = {
      ...metadata,
      lastUpdated: new Date().toISOString(),
      version: metadata.version || '1.0'
    };

    // Save or update profile_histories document with full template
    const profileHistoryRef = firestore
      .collection('profile_histories')
      .doc(userId);

    await profileHistoryRef.set({
      userId,
      nodes,
      links,
      metadata: finalMetadata
    }, { merge: true });

    console.log(`✅ Profile history saved/updated: ${userId}`, {
      totalNodes: nodes.length,
      totalLinks: links.length
    });

    // Return the full profile history data
    return { 
      success: true, 
      message: 'Profile history saved',
      result: {
        userId,
        nodes,
        links,
        metadata: finalMetadata
      }
    };

  } catch (error) {
    console.error('❌ Save Profile History Error:', error);
    throw new HttpsError(
      'internal', 
      'Failed to save profile history',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
