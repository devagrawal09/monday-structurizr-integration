const express = require('express');
const test = require('./test');

const router = express.Router();

router.use(test);

router.get('/', function(req, res) {
  res.json(getHealth());
});

router.get('/health', function(req, res) {
  res.json(getHealth());
  res.end();
});

function getHealth() {
  return {
    ok: true,
    message: 'Healthy'
  };
}

module.exports = router;
