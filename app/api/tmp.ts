const { Configuration, OpenAIApi } = require("openai");
const { extract } = require("@extractus/article-extractor");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const dotenv = require("dotenv");
dotenv.config();

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const summarize = async (
  text,
  prompt = "Summarize this text in one sentence"
) => {
  const summary = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `${prompt}.
          ---Text---
          ${text}
          ---------------------
          `,
      },
    ],
  });
  return summary.data.choices[0].message.content;
};

exports.summarize_content = async (url) => {
  try {
    const article = await extract(url);
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
      chunkSize: 2000,
      chunkOverlap: 0,
    });
    const jsOutput = await splitter.createDocuments([article.content]);
    const promises = jsOutput.map(
      async (item, index) => await summarize(item.pageContent)
    );
    const summarized_content = await Promise.all(promises);
    const final_summarized_content = await summarize(
      summarized_content.join("\n"),
      "Summarzie the main content of this article"
    );
    return { content: final_summarized_content, title: article.title };
  } catch (err) {
    console.log(err);
    return { content: "", title: "" };
  }
};

exports.opposite_view = async (title) => {
  try {
    const opposite_view = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `title with opposite viewpoint to ${title}.`,
        },
      ],
    });
    return opposite_view.data.choices[0].message.content;
  } catch (e) {
    console.log(e);
    return "";
  }
};