import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: "us-central1",
});

export async function processRelationshipData(message: string, history: any[]) {
  const relationshipPrompt = [
    'Analyze the following conversation for relationship information:',
    history.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
    `Current message: ${message}`,
    '',
    'Extract and structure the following information:',
    '1. People mentioned (names, ages, gender, descriptions)',
    '2. Relationships between people',
    '3. Interactions or events between people',
    '4. Emotional states or sentiments',
    '',
    'Return the data in a structured format matching our graph schema.'
  ].join('\n');

  try {
    const model = vertexAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    const result = await model.generateContent(relationshipPrompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error processing relationship data:', error);
    return null;
  }
}

export async function updateGraphData(newData: any, userId: string) {
  const graphRef = admin.firestore().collection('relationships').doc(userId);
  const graphDoc = await graphRef.get();
  
  let currentData = graphDoc.exists ? graphDoc.data() : { nodes: [], links: [] };
  const merged = mergeRelationshipData(currentData, newData);
  
  await graphRef.set(merged);
  return merged;
}

export async function getGraphData(userId: string) {
  const graphRef = admin.firestore().collection('relationships').doc(userId);
  const graphDoc = await graphRef.get();
  
  return graphDoc.exists ? graphDoc.data() : { nodes: [], links: [] };
}

function mergeRelationshipData(currentData: any, newData: any) {
  const merged = { ...currentData };

  // Merge nodes
  if (newData.nodes) {
    newData.nodes.forEach((newNode: any) => {
      const existingNodeIndex = merged.nodes.findIndex((node: any) => node.id === newNode.id);
      if (existingNodeIndex >= 0) {
        merged.nodes[existingNodeIndex] = {
          ...merged.nodes[existingNodeIndex],
          ...newNode,
          details: {
            ...merged.nodes[existingNodeIndex].details,
            ...newNode.details,
            lastUpdated: new Date().toISOString()
          }
        };
      } else {
        merged.nodes.push({
          ...newNode,
          details: {
            ...newNode.details,
            lastUpdated: new Date().toISOString()
          }
        });
      }
    });
  }

  // Merge links
  if (newData.links) {
    newData.links.forEach((newLink: any) => {
      const existingLinkIndex = merged.links.findIndex((link: any) => 
        link.source === newLink.source && link.target === newLink.target
      );
      if (existingLinkIndex >= 0) {
        merged.links[existingLinkIndex] = {
          ...merged.links[existingLinkIndex],
          ...newLink,
          details: {
            ...merged.links[existingLinkIndex].details,
            ...newLink.details,
            lastUpdated: new Date().toISOString()
          }
        };
      } else {
        merged.links.push({
          ...newLink,
          details: {
            ...newLink.details,
            lastUpdated: new Date().toISOString()
          }
        });
      }
    });
  }

  merged.metadata = {
    lastUpdated: new Date().toISOString(),
    version: "1.0"
  };

  return merged;
}
