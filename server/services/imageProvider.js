import * as azureImage from './azureImage.js';
import * as geminiImage from './gemini.js';
import * as openaiImage from './openaiImage.js';

export const imageProvider = (process.env.IMAGE_PROVIDER || 'gemini').toLowerCase();

function provider() {
  if (imageProvider === 'azure' || imageProvider === 'azure-openai' || imageProvider === 'azure_ai_foundry') {
    return azureImage;
  }
  if (imageProvider === 'openai' || imageProvider === 'chatgpt' || imageProvider === 'openai-api') {
    return openaiImage;
  }
  if (imageProvider === 'gemini') return geminiImage;
  throw new Error(`Unsupported IMAGE_PROVIDER "${imageProvider}". Use "gemini", "azure", or "openai".`);
}

export function generateScene(args) {
  return provider().generateScene(args);
}

export function refineFace(args) {
  return provider().refineFace(args);
}
