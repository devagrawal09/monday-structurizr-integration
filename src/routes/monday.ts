import { Router } from 'express';
import axios from 'axios';
import debug from 'debug';

import { authenticationMiddleware } from '../middlewares/authentication';
import { Board, Item } from '../interfaces/board';
import { boardToIntermediate } from '../transformers/board-to-intermediate';
import { mondayToStructurizr } from '../transformers/monday-to-structurizr';
import { pushWorkspace } from '../structurizr/pushWorkspace';
import { generateStyles } from '../structurizr/styles';
import { IntegrationModel } from '../database/integration';

const logger = debug(`monday-router`);

export const mondayRouter = Router();

mondayRouter.use(authenticationMiddleware);

mondayRouter.post('/testaction', async (req: any, res) => {
  try {
    logger('POST /monday/testaction hit');
    const { payload } = req.body;
    const boardId = payload.inputFields.boardId;

    const integration: IntegrationModel = req.session.integration;

    logger({ boardId });

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

    logger(`Created intermediate board object`);

    const workspace = mondayToStructurizr(intermediate);
    logger(`Created structurizr workspace object`);

    generateStyles(workspace);
    logger(`Generated default styles`);

    await pushWorkspace(workspace, integration);

    logger(`POST /monday/testaction done`);
  } catch(err) {
    logger('POST /monday/testaction error');
    console.error(err);
  } finally {
    res.sendStatus(201);
  }
});

mondayRouter.post('/system', async (req: any, res) => {
  try {
    logger('POST /monday/system hit');
    const { payload } = req.body;
    const { boardId, itemId } = payload.inputFields;

    logger({ boardId, itemId });

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
      logger('New system detected, creating item group');

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

      logger(`Created new group with id ${response.data.data?.create_group?.id}`);
    }
    logger('POST /monday/system complete');
  } catch(err) {
    logger('POST /monday/system error');
    console.error(err);
  } finally {
    res.sendStatus(201);
  }
});
