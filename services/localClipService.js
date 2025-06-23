// services/localClipService.js

const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

let extractor;

async function loadModel() {
  if (!extractor) {
    console.log('⏳ Cargando pipeline image-classification...');
    const { pipeline } = await import('@xenova/transformers');

    // ✔ Usamos modelo de visión puro
    extractor = await pipeline('image-classification', 'Xenova/vit-base-patch16-224');

    console.log('✅ Pipeline image-classification cargado.');
  }
  return extractor;
}

async function generateImageEmbedding(imageUrl) {
  const model = await loadModel();

  let input;

  if (imageUrl.startsWith('file://')) {
    const localPath = imageUrl.replace('file://', '');
    if (!fs.existsSync(localPath)) throw new Error(`Archivo no existe: ${localPath}`);
    input = fs.readFileSync(localPath); // ✅ Buffer local
  } else {
    // ✅ Pasa la URL como string para que el pipeline la descargue solo
    input = imageUrl;
  }

  // 🚀 Ejecuta pipeline → devuelve labels y scores
  const output = await model(input);

  // Opcional: convierte a JSON string para guardar en DB
  return JSON.stringify(output);
}

module.exports = {
  generateImageEmbedding,
};
