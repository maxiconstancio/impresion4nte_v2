const fs = require('fs');
const sharp = require('sharp');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

let extractor;

async function loadModel() {
  if (!extractor) {
    console.log('⏳ Cargando modelo CLIP local...');
    const { CLIPFeatureExtractor } = await import('@xenova/transformers');
    extractor = await CLIPFeatureExtractor.from_pretrained('Xenova/clip-vit-base-patch32');
    console.log('✅ Modelo CLIP listo.');
  }
  return extractor;
}

async function generateImageEmbedding(imageUrl) {
  const model = await loadModel();

  let buffer;

  if (imageUrl.startsWith('file://')) {
    const localPath = imageUrl.replace('file://', '');
    if (!fs.existsSync(localPath)) throw new Error(`Archivo no existe: ${localPath}`);
    buffer = fs.readFileSync(localPath);
  } else {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`No se pudo descargar imagen: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  // 👉 Preprocesa con sharp a RGB y normaliza
  const { data, info } = await sharp(buffer)
    .resize(224, 224)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [width, height, channels] = [info.width, info.height, info.channels];

  // Normaliza pixeles a rango 0-1 (dividir por 255)
  const normalized = Array.from(data).map(v => v / 255);

  // Reorganiza: [batch, channels, height, width]
  const tensor = [
    normalized
  ];

  // 👉 Usa CLIPFeatureExtractor para extraer embeddings
  const output = await model.forward({ pixel_values: tensor });

  return output.last_hidden_state[0];
}

module.exports = {
  generateImageEmbedding,
};
