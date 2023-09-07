import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import { PineconeClient } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
dotenv.config();


export const config = {
  api: {
    bodyParser: false,
  },
};


export async function POST(req: any) {
  console.log(req.url);
  let content = "";
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const loader = new PDFLoader("app/data/1.pdf");
    const docs = await loader.load();
    docs.forEach(doc => {
      content += doc.pageContent;
    });

    // const docs = [
    //   new Document({
    //     metadata: { foo: "bar" },
    //     pageContent: "pinecone is a vector db",
    //   }),
    //   new Document({
    //     metadata: { foo: "bar" },
    //     pageContent: "the quick brown fox jumped over the lazy dog",
    //   }),
    //   new Document({
    //     metadata: { baz: "qux" },
    //     pageContent: "lorem ipsum dolor sit amet",
    //   }),
    //   new Document({
    //     metadata: { baz: "qux" },
    //     pageContent: "pinecones are the woody fruiting body and of a pine tree",
    //   }),
    // ];

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    console.log(pineconeIndex);
    await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      pineconeIndex,
    });
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex }
    );

    /* Search the vector DB independently with meta filters */
    const results = await vectorStore.similaritySearch("Phone Number", 1);
    // console.log(results);

    const model = new OpenAI();
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    });
    const response = await chain.call({ query: "What is Phone Number" });
    console.log("response: ", response.text);

  } catch (error) {
    console.error(error);
  }


}