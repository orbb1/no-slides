import express, { Express } from 'express';

import path from 'path';

const app: Express = express();

app.set('views', path.join(__dirname, '/views'));
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get('/', (_, res) => {
  return res.redirect('/home');
});

app.get('/home', (_, res) => {
  res.render('index.ejs');
});

export { app };
