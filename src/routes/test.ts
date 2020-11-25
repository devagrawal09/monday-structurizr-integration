import * as util from 'util';
import * as fs from 'fs';
import { Router } from 'express';
import axios from 'axios';

import { Board } from '../interfaces/board';
import { boardToIntermediate } from '../transformers/board-to-intermediate';
import { mondayToStructurizr } from '../transformers/monday-to-structurizr';
import { pushWorkspace } from '../structurizr/pushWorkspace';

export const testRouter = Router();

testRouter.post('/moday/testaction', async (req, res) => {
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
              description
              groups {
                id
                title
              }
              items {
                id
                name
                group { id }
                column_values {
                  id
                  value
                  title
                }
              }
            }
          }
        `
      }
    });

    const { data: { boards: [ board ] } }: { data : { boards: Board[] } } = response.data;
    const intermediate = await boardToIntermediate(board);

    await util.promisify(fs.writeFile)('board.json', JSON.stringify({ board, intermediate }, null, 2));

    const workspace = mondayToStructurizr(intermediate);
    await pushWorkspace(workspace);

    console.log(`Done`);
  } finally {
    res.sendStatus(201);
  }
});
