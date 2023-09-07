// import { NextRequest, NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
// import { extract } from "@extractus/article-extractor";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import dotenv from "dotenv";
// dotenv.config();

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);



export const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL || DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL || OPENAI_URL;
const DISABLE_GPT4 = !!process.env.DISABLE_GPT4;

export async function requestOpenai(req: any) {
  const controller = new AbortController();
  const authValue = req.headers.get("Authorization") ?? "";
  const openaiPath = `${req.nextUrl.pathname}`.replaceAll(
    "/api/openai/",
    "",
  );
  console.log("openaipath: ", openaiPath);
  let baseUrl = BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `${PROTOCOL}://${baseUrl}`;
  }

  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  console.log("[Proxy] ", openaiPath);
  console.log("[Base Url]", baseUrl);

  if (process.env.OPENAI_ORG_ID) {
    console.log("[Org ID]", process.env.OPENAI_ORG_ID);
  }

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10 * 60 * 1000);

  const fetchUrl = `${baseUrl}/${openaiPath}`;
  console.log("fetUrl: ", fetchUrl);
  // const fetchOptions: RequestInit = {
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Cache-Control": "no-store",
  //     Authorization: authValue,
  //     ...(process.env.OPENAI_ORG_ID && {
  //       "OpenAI-Organization": process.env.OPENAI_ORG_ID,
  //     }),
  //   },
  //   method: req.method,
  //   body: req.body,
  //   // to fix #2485: https://stackoverflow.com/questions/55920957/cloudflare-worker-typeerror-one-time-use-body
  //   redirect: "manual",
  //   // @ts-ignore
  //   duplex: "half",
  //   signal: controller.signal,
  // };
  // console.log("body: ", req.body);

  // #1815 try to refuse gpt4 request
  // if (DISABLE_GPT4 && req.body) {
  //   try {
  //     const clonedBody = await req.text();
  //     fetchOptions.body = clonedBody;

  //     const jsonBody = JSON.parse(clonedBody);

  //     if ((jsonBody?.model ?? "").includes("gpt-4")) {
  //       return NextResponse.json(
  //         {
  //           error: true,
  //           message: "you are not allowed to use gpt-4 model",
  //         },
  //         {
  //           status: 403,
  //         },
  //       );
  //     }
  //   } catch (e) {
  //     console.error("[OpenAI] gpt4 filter", e);
  //   }
  // }

  try {
    console.log("here: ");
    // const res = await fetch(fetchUrl, fetchOptions);
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: "title with opposite viewpoint to",
        },
      ],
    });
    // console.log(completion.choices[0]);
    // return completion.data.choices[0].message.content;
    // to prevent browser prompt for credentials
    // const newHeaders = new Headers(res.headers);
    // newHeaders.delete("www-authenticate");
    // // to disable nginx buffering
    // newHeaders.set("X-Accel-Buffering", "no");

    // return new Response(res.body, {
    //   status: res.status,
    //   statusText: res.statusText,
    //   headers: newHeaders,
    // });
  } finally {
    clearTimeout(timeoutId);
  }
}
