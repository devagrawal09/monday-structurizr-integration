import * as util from 'util';
import * as fs from 'fs';
import { Router } from 'express';
import axios from 'axios';

import { Board } from './board';
import { IntermediateBoard } from './intermediate';

export const testRouter = Router();

const transformer = (board: Board) => {
  const intermediaryBoard: IntermediateBoard = {
    description: board.description,
    groups: board.groups
  };
  board.items.forEach(item => {
    const group = intermediaryBoard.groups.find(group => group.id === item.group.id);
    
    if(!group) { return; }
    
    if(group.items) {
      group.items.push(item);
    } else {
      group.items = [item];
    }
  });
  return intermediaryBoard;
}

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
              }
            }
          }
        `
      }
    });
    const data: { data : { boards: Board[] } } = response.data;
    await util.promisify(fs.writeFile)('data.json', JSON.stringify(data.data, null, 2));
    await util.promisify(fs.writeFile)('board.json', JSON.stringify({ board: transformer(data.data.boards[0])}, null, 2));
    console.log(`Done`);
  } finally {
    res.sendStatus(201);
  }
});
