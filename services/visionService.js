// services/visionService.js

const OpenAI = require("openai");

// Instanciar cliente
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Poné tu API key en .env
});

// Esta función describe la imagen usando GPT-4 Vision
exports.describeImage = async (imageUrl) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe esta imagen para búsqueda de producto:"
          },
          {
            type: "image_url",
            image_url: { url: imageUrl }
          }
        ]
      }
    ]
  });

  // Devuelve solo el texto de la descripción
  return response.choices[0].message.content;
};

// Esta función genera embedding de un texto (la descripción)
exports.generateEmbedding = async (text) => {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });

  return embeddingResponse.data[0].embedding;
};
