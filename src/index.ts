import axios from 'axios';
import cheerio from 'cheerio';
import { app } from './server';
import { selectorsConfig } from './config';

type ContentType = {
  image: string;
  html: string;
};

const getContent = (url: string): Promise<ContentType[]> => {
  let content: ContentType[] = [];
  if (!url) {
    return Promise.resolve(content);
  }
  const [urlBase] = url.match(/(^https:\/\/\w+.pl\/)/g) || [''];
  const [siteName] = url.match(/[^https://](\w+)/) || [''];
  const { nextButtonSelector, imageSelector, contentSelector } =
    selectorsConfig[siteName];

  return new Promise((resolve) => {
    axios({ method: 'get', url })
      .then((res) => {
        const $ = cheerio.load(res.data);
        const nextUrlSuffix = $(nextButtonSelector).attr('href');
        const imageSrc = $(imageSelector).attr('src');
        const paragraph = $(contentSelector).text() || '';

        if (imageSrc) {
          content.push({
            image: imageSrc,
            html: paragraph,
          });
        }
        if (nextUrlSuffix) {
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
        console.log(err);
      });
  });
};

const findContent = (url: string) => {
  return axios({ method: 'get', url }).then((res) => {
    const [siteName] = url.match(/[^https://](\w+)/) || [''];
    const { nextButtonSelector, mainImageSelector } = selectorsConfig[siteName];

    const $ = cheerio.load(res.data);
    const mainHref = $(mainImageSelector).attr('href');
    const nextUrlSuffix = $(nextButtonSelector).attr('href');

    if (mainHref) {
      return mainHref;
    } else if (nextUrlSuffix) {
      return url;
    }
    return '';
  });
};

app.get('/', (_, res) => {
  return res.redirect('/home');
});

app.get('/home', (_, res) => {
  res.render('index.ejs');
});

app.get('/results', (_, res) => {
  res.render('results.ejs', { content: [] });
});

app.post('/results', async (req, res) => {
  // TODO: refactor, error page;
  findContent(req.body.url)
    .then((url = '') => {
      getContent(url).then((content) => {
        res.render('results.ejs', { content });
      });
    })
    .catch(() => {
      res.render('results.ejs', { content: [] });
    });
});

app.listen(3000);
