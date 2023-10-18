import axios from "axios";
import cheerio from "cheerio";
import { app } from "./server";
import { selectorsConfig } from "./config";
import { Response } from "express";
import { getConfig } from "./utils";

type ContentType = {
  image: string;
  html: string;
};

const getContent = (url: string): Promise<ContentType[]> => {
  let content: ContentType[] = [];
  if (!url) {
    return Promise.resolve(content);
  }
  const [urlBase] = url.match(/(^https:\/\/\w+.pl\/)/g) || [""];
  const {
    nextButtonSelector,
    imageSelector,
    contentSelector,
    blockedUrlBases = [],
  } = getConfig(url);

  return new Promise((resolve) => {
    axios({ method: "get", url })
      .then((res) => {
        const $ = cheerio.load(res.data);
        const nextUrlSuffix = $(nextButtonSelector).attr("href");
        const imageSrc = $(imageSelector).attr("src");
        const paragraph = $(contentSelector).text() || "";

        if (imageSrc) {
          content.push({
            image: imageSrc,
            html: paragraph,
          });
        }
        if (
          blockedUrlBases.some((url) => !nextUrlSuffix?.startsWith(url)) &&
          nextUrlSuffix
        ) {
          getContent(urlBase + nextUrlSuffix).then((res) => {
            if (res) {
              content = content.concat(res);
            }
            resolve(content);
          });
        } else {
          resolve(content);
        }
      })
      .catch((err) => {
        console.log(err.code);
      });
  });
};

const findContent = (url: string) => {
  return axios({ method: "get", url }).then((res) => {
    const { nextButtonSelector, mainImageSelector } = getConfig(url);

    const $ = cheerio.load(res.data);
    const mainHref = $(mainImageSelector).attr("href");
    const nextUrlSuffix = $(nextButtonSelector).attr("href");
    if (mainHref) {
      return mainHref;
    } else if (nextUrlSuffix) {
      return url;
    }
    return "";
  });
};

const handleResults = (url: string, response: Response): void => {
  findContent(url)
    .then(getContent)
    .then((content) => {
      response.render("results.ejs", { content });
    })
    .catch(() => {
      response.redirect("/error");
    });
};

app.get("/", (_, res) => {
  return res.redirect("/home");
});

app.get("/home", (_, res) => {
  res.render("index.ejs");
});

app.get("/error", (_, res) => {
  res.render("error.ejs");
});

app.get("/results", (req, res) => {
  handleResults(req.query.url as string, res);
});

app.post("/results", async (req, res) => {
  handleResults(req.body.url, res);
});

app.listen(8080);
