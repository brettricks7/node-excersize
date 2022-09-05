var express = require('express');
var router = express.Router();
const fetch = (...args) =>
    import('node-fetch').then(({default: fetch}) => fetch(...args));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

async function ifetch(path) {
  fetch(path)
      .then(res => res.json())
      .then(json => {
        console.log(json)
      })
      .catch(err => console.error('error:' + err));
}

module.exports = router;
