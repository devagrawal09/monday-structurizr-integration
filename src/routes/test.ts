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
import { IntegrationModel } from '../database/integration';

export const testRouter = Router();

testRouter.use(authenticationMiddleware);

testRouter.post('/testaction', async (req: any, res) => {
  try {
    console.log('/monday/testaction');
    const { payload } = req.body;
    const boardId = payload.inputFields.boardId;

    const integration: IntegrationModel = req.session.integration;

    const response = await axios({
      url: `https://api.monday.com/v2`,
      method: `POST`,
      headers: {
        Authorization: integration.mondayToken
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
              columns(ids: "dropdown") {
                id
                title
                settings_str
              }
            }
          }
        `
      }
    });

    const { data: { boards: [ board ] } }: { data : { boards: Board[] } } = response.data;
    const intermediate = await boardToIntermediate(board, integration);

    await util.promisify(fs.writeFile)('board.json', JSON.stringify({ board, intermediate }, null, 2));

    const workspace = mondayToStructurizr(intermediate);
    generateStyles(workspace);
    await pushWorkspace(workspace, integration);

    console.log(`Done`);
  } finally {
    res.sendStatus(201);
  }
});

testRouter.post('/system', async (req: any, res) => {
  try {
    console.log('POST /monday/system hit');
    const { payload } = req.body;
    const { boardId, itemId } = payload.inputFields;

    console.log({ boardId, itemId });

    const integration: IntegrationModel = req.session.integration;

    const response = await axios({
      url: `https://api.monday.com/v2`,
      method: `POST`,
      headers: {
        Authorization: integration.mondayToken
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
      console.log('New system detected, creating item group');

      const response = await axios({
        url: `https://api.monday.com/v2`,
        method: `POST`,
        headers: {
          Authorization: integration.mondayToken
        },
        data: {
          query: `
            mutation {
              create_group (board_id: ${boardId}, group_name: "${item.name}") { id }
            }
          `
        }
      });

      console.log(`Created new group with id ${response.data.data?.create_group?.id}`);
    }
    console.log('POST /monday/system complete');
  } catch(err) {
    console.log('POST /monday/system error');
    console.error(err);
  } finally {
    res.sendStatus(201);
  }
});
