import * as admin from 'firebase-admin';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';

// Your Firebase config object
const firebaseConfig = {
  // Add your config here from Firebase Console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Get the suggestions function
const getSuggestionsFunction = httpsCallable(functions, 'getSuggestions');

// Test the function
async function testSuggestions() {
  try {
    const result = await getSuggestionsFunction();
    console.log('Suggestions:', result.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testSuggestions();
