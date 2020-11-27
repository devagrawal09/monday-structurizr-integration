import * as util from 'util';
import * as fs from 'fs';
import { Router } from 'express';
import axios from 'axios';

import { authenticationMiddleware } from '../middlewares/authentication';
import { Board, Item } from '../interfaces/board';
import { boardToIntermediate } from '../transformers/board-to-intermediate';
import { mondayToStructurizr } from '../transformers/monday-to-structurizr';
import { pushWorkspace } from '../structurizr/pushWorkspace';
import { generateStyles } from '../structurizr/styles';

export const testRouter = Router();

testRouter.use(authenticationMiddleware);

testRouter.post('/testaction', async (req, res) => {
  try {
    console.log('/monday/testaction');
    const { payload } = req.body;
    const boardId = payload.inputFields.boardId;
    const response = await axios({
      url: `https://api.monday.com/v2`,
      method: `POST`,
      headers: {
        Authorization: process.env.MONDAY_API_TOKEN
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
    generateStyles(workspace);
    await pushWorkspace(workspace);

    console.log(`Done`);
  } finally {
    res.sendStatus(201);
  }
});

testRouter.post('/system', async (req, res) => {
  try {
    console.log('/monday/system');
    const { payload } = req.body;
    const { boardId, itemId } = payload.inputFields;

    const response = await axios({
      url: `https://api.monday.com/v2`,
      method: `POST`,
      headers: {
        Authorization: process.env.MONDAY_API_TOKEN
      },
      data: {
        query: `
          query {
            items(ids: ${itemId}) {
              id
              name
              group {
                id
                title
              }
            }
          }
        `
      }
    });
    const item: Item = response.data.data.items[0];
    if(item?.group.title === `Systems`) {
      const response = await axios({
        url: `https://api.monday.com/v2`,
        method: `POST`,
        headers: {
          Authorization: process.env.MONDAY_API_TOKEN
        },
        data: {
          query: `
            mutation {
              create_group (board_id: ${boardId}, group_name: "${item.name}") { id }
            }
          `
        }
      });
      console.log(`Created group`);
      console.log(response.data);
    }
  } finally {
    res.sendStatus(201);
  }
});
