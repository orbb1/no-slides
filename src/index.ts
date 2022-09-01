import axios from 'axios';
import cheerio from 'cheerio';

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

const urlBase = process.env.URL_BASE || '';

const urlSuffix = process.env.URL_SUFFIX || '';
const nextButtonSelector = process.env.NEXT_SELECTOR || '';
const imageSelector = process.env.IMAGE_SELECTOR || '';

const getContent = (url: string): Promise<string[]> => {
  let images: string[] = [];
  return new Promise((resolve) => {
    axios({ method: 'get', url })
      .then((res) => {
        const $ = cheerio.load(res.data);
        const nextUrlSuffix = $(nextButtonSelector).attr('href');
        const imageSrc = $(imageSelector).attr('src');
        if (imageSrc) {
          images.push(imageSrc);
        }
        if (nextUrlSuffix) {
          getContent(urlBase + nextUrlSuffix).then((res) => {
            if (res) {
              images = images.concat(res);
            }
            resolve(images);
          });
        } else {
          resolve(images);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const getSrc = async () => {
  let arr = await getContent(urlBase + urlSuffix).then((res) => res);
  console.log(arr);
  return arr;
};

// getSrc();
