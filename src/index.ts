import axios from 'axios';
import cheerio from 'cheerio';
import { app } from './server';

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

const nextButtonSelector = process.env.NEXT_SELECTOR || '';
const imageSelector = process.env.IMAGE_SELECTOR || '';
const contentSelector = process.env.CONTENT_SELECTOR || '';

type ContentType = {
  image: string;
  html: string;
};

const getContent = (url: string): Promise<ContentType[]> => {
  if (!url) {
    return Promise.resolve([]);
  }
  // const urlBase =
  let content: ContentType[] = [];
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
  getContent(req.body.url).then((content) => {
    res.render('results.ejs', { content });
  });
});

app.listen(3000);
