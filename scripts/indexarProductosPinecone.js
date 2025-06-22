// scripts/indexarProductosPinecone.js

require('dotenv').config();
const { Producto } = require('../models');
const visionService = require('../services/visionService');
const vectorService = require('../services/vectorService');

(async () => {
  try {
    console.log('👉 Iniciando indexación de productos en Pinecone...');

    // 1️⃣ Traer todos los productos activos
    const productos = await Producto.findAll({
      where: { activo: true }
    });

    console.log(`📦 Encontrados ${productos.length} productos para indexar.`);

    for (const producto of productos) {
      try {
        console.log(`\n🔄 Procesando ID=${producto.id} | ${producto.nombre}`);

        // 2️⃣ Usar image_url real o una de prueba
        const imageUrl = producto.image_url || "https://www.google.com/imgres?q=arbol&imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F0%2F03%2FEiche_bei_Graditz.jpg%2F1200px-Eiche_bei_Graditz.jpg&imgrefurl=https%3A%2F%2Fes.wikipedia.org%2Fwiki%2F%25C3%2581rbol&docid=bVlswiD0_z_fUM&tbnid=6etgjIKYiQmD9M&vet=12ahUKEwjqluen_oCOAxV5pZUCHcyvOrIQM3oECBgQAA..i&w=1200&h=800&hcb=2&ved=2ahUKEwjqluen_oCOAxV5pZUCHcyvOrIQM3oECBgQAA";
        console.log(`🌐 URL de imagen: ${imageUrl}`);

        // 3️⃣ Describir la imagen usando GPT-4o Vision
        const description = await visionService.describeImage(imageUrl);
        console.log(`📝 Descripción generada: ${description}`);

        // 4️⃣ Generar embedding de la descripción
        const embedding = await visionService.generateEmbedding(description);

        // 5️⃣ Guardar embedding en Pinecone con el ID del producto como clave
        await vectorService.upsertVector({
          id: producto.id.toString(),
          values: embedding
        });

        console.log(`✅ Embedding guardado en Pinecone para ID=${producto.id}`);
      } catch (error) {
        console.error(`❌ Error procesando ID=${producto.id}: ${error.message}`);
      }
    }

    console.log('\n🎉 Indexación completada correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('🚨 Error general en el script:', err);
    process.exit(1);
  }
})();
