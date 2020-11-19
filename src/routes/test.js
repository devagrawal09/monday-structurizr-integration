const express = require('express');
const axios = require('axios').default;
const router = express.Router();

console.log({ token: process.env.API_TOKEN })

router.post('/moday/testaction', async (req, res) => {
  try {
    const { payload } = req.body;
    console.log(JSON.stringify(payload, null, 2));
    const boardId = payload.inputFields.boardId;
    const response = await axios({
      url: `https://api.monday.com/v2`,
      method: `POST`,
      headers: {
        Authorization: process.env.API_TOKEN
      },
      data: {
        query: `
          query {
            boards (ids: ${boardId}) {
              ...
            }
          }
        `
      }
    });
    const data = response.data;
    console.log({ data: JSON.stringify(data, null, 2) });
  } finally {
    res.sendStatus(201);
  }
});

module.exports = router;
