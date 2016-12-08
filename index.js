const express    = require('express');
const connection = require('./config').db;
const baseUrl    = require('./config').baseUrl;

const app        = express();
const port       = process.env.PORT || 3000;
const router     = express.Router();

// http://api.manganext-app.com/api/v2.1/posts/:id?token=ea5af636cd2c0c07242ee43c07cbefb3&order=DESC&per_page=10&offset=0&list=now&s=''

function media(row) {
  row.image = row.source_url = null
  row.media = { size: [
    {
      height: '625',
      width: '450',
      name: 'thumbnail-450x625',
      url: `${baseUrl}${row.image_path}/full/${row.image_name}`,
    },
    {
      height: '300',
      width: '215',
      name: 'thumbnail-215x300',
      url: `${baseUrl}${row.image_path}/215/${row.image_name}`,
    },
  ]};
  return row;
}


router.get('/posts', (req, res) => {

  if(!req.query.token || req.query.token !== 'ea5af636cd2c0c07242ee43c07cbefb3') {
    res.status(500).send('Access denied');
  }

  const order = req.query.order ? req.query.order : 'DESC';
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 10;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;
  const list = req.query.list ? req.query.list : 'now';
  const search = req.query.s ? ` AND (
    title LIKE '%${req.query.s}%' OR
    vo_title LIKE '%${req.query.s}%' OR
    content LIKE '%${req.query.s}%' OR
    translate_title LIKE '%${req.query.s}%' OR
    designer LIKE '%${req.query.s}%' OR
    author LIKE '%${req.query.s}%' OR
    collection LIKE '%${req.query.s}%' OR
    editor LIKE '%${req.query.s}%' OR
    vo_editor LIKE '%${req.query.s}%'
  )` : '';


  const d = new Date().toLocaleString();
  const where = list === 'now' ? `publication_at < '${d}'` : `publication_at > '${d}'`;

  connection.query(`SELECT * FROM books WHERE ${where} ${search} ORDER BY publication_at ${order} LIMIT ?,?`, [offset, per_page], (err, rows, fields) => {
    if(rows && rows.length) {

      rows = rows.map(row => media(row));

      res.json({ posts: rows });
    }
    else {
      res.json({ posts: [] });
    }
  });
});

router.get('/posts/:id', (req, res) => {
  if(!req.query.token || req.query.token !== 'ea5af636cd2c0c07242ee43c07cbefb3') {
    res.status(500).send('Access denied');
  }

  connection.query('SELECT * FROM books WHERE id=? LIMIT 1', [req.params.id], (err, row, fields) => {
    if(row && row.length) {
      row = media(row[0]);
      res.json(row);
    }
    else {
      res.json({});
    }
  });
});

router.get('/posts/:id/comments', (req, res) => {
  res.json([]);
});

router.post('/comments', (req, res) => {
  res.json([]);
});

app.use('/api/v2.1', router);
app.use(express.static('public'));

app.listen(port);
