# NotAlone

A supportive AI-powered platform designed to help people connect and support each other. NotAlone uses Google's Gemini AI to create meaningful interactions and foster connections between users.

## Live Demo

You can try the experimental version deployed on Firebase at: https://not-alone-flame.vercel.app/

## Getting Started

### Prerequisites

1. Install Firebase CLI and initialize Firebase:
```bash
npm install -g firebase-tools
firebase login
firebase init
```

2. Install Firebase emulators:
```bash
firebase init emulators
```
Select Auth, Firestore, and Functions emulators when prompted.

### Running the Application

1. Start the Next.js development server in the root directory:
```bash
npm run dev
```

2. In a separate terminal, start the Firebase emulators:
```bash
cd functions
firebase emulators:start
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running with the local emulators.

The application is configured to work stably with the local Firebase emulators, providing a full development environment for testing all features including authentication, database operations, and cloud functions.

## Features

- Real-time chat powered by Google Gemini AI
- User authentication and profile management
- Interactive relationship visualization
- Secure data storage with Firestore
- Cloud Functions for backend processing
- Graph RelationalShip Data
- NoSQL database for storing profiles and chat histories

## Development

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini AI](https://deepmind.google/technologies/gemini/)
