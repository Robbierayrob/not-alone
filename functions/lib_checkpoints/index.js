"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processChat = void 0;
const functions = __importStar(require("firebase-functions"));
const vertexai_1 = require("@google-cloud/vertexai");
// Initialize Vertex AI
const vertex = new vertexai_1.VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT || 'notalone-de4fc',
    location: 'australia-southeast1',
});
const model = vertex.preview.getGenerativeModel({
    model: 'gemini-1.5-flash-002',
});
/**
 * Processes a chat message through Vertex AI and returns the AI response
 * @param {functions.https.CallableRequest<ChatRequest>} data - The request data containing the
 *        message
 * @returns {Promise<ChatResponse>} The AI generated response
 */
exports.processChat = functions.https.onCall(async (request) => {
    var _a, _b, _c, _d, _e;
    // Check if the user is authenticated
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { message } = request.data;
    try {
        const result = await model.generateContent(message);
        const response = await result.response;
        if (!((_e = (_d = (_c = (_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text)) {
            throw new functions.https.HttpsError('internal', 'Invalid response format from AI model');
        }
        const aiResponse = response.candidates[0].content.parts[0].text;
        return {
            message: aiResponse,
        };
    }
    catch (error) {
        console.error('Error processing chat:', error);
        throw new functions.https.HttpsError('internal', 'Error processing chat');
    }
});
//# sourceMappingURL=index.js.map