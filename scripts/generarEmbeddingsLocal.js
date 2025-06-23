// scripts/generarEmbeddingsLocal.js

require('dotenv').config();
const path = require('path');
const { Producto } = require('../models');
const localClipService = require('../services/localClipService.js');

// ✅ Validador robusto: soporta file:// y http(s)://
function esURLImagen(url) {
  if (!url) return false;

  if (url.startsWith('file://')) {
    const localPath = url.replace('file://', '');
    const ext = path.extname(localPath).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(ext);
  } else {
    return /\.(jpg|jpeg|png|webp|bmp)$/i.test(url);
  }
}

(async () => {
  console.log('👉 Generando embeddings con image-classification...');

  // ✅ Trae todos los productos activos
  const productos = await Producto.findAll({ where: { activo: true } });

  console.log(`🔎 ${productos.length} productos encontrados.`);

  for (const producto of productos) {
    try {
      const imageUrl = producto.image_url;

      // ⚠️ Saltar si no tiene URL o no es imagen válida
      if (!imageUrl) {
        console.log(`⚠️  Producto ID=${producto.id} sin image_url — se salta.`);
        continue;
      }

      if (!esURLImagen(imageUrl)) {
        console.log(`⚠️  Producto ID=${producto.id} URL no parece imagen — se salta.`, imageUrl);
        continue;
      }

      console.log(`\n📸 Procesando ID=${producto.id} | ${producto.nombre}`);
      console.log(`🌐 URL: ${imageUrl}`);

      // 🚀 Genera etiquetas con pipeline image-classification
      const embedding = await localClipService.generateImageEmbedding(imageUrl);

      // ✅ Guarda el JSON de etiquetas en la columna embedding
      producto.embedding = embedding;
      await producto.save();

      console.log(`✅ Etiquetas guardadas para ID=${producto.id}`);
    } catch (error) {
      console.error(`❌ Error en ID=${producto.id}: ${error.message}`);
    }
  }

  console.log('\n🎉 ¡Proceso completado sin problemas!');
  process.exit(0);
})();
