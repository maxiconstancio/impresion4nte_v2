const { Pinecone } = require("@pinecone-database/pinecone");

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.Index("products-index");

exports.upsertVector = async ({ id, values }) => {
  await index.upsert([{ id, values }]);
};

exports.searchVector = async (embedding) => {
  const result = await index.query({
    vector: embedding,
    topK: 1
  });
  return result.matches[0];
};
