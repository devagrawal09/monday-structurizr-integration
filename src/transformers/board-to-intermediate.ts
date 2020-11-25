import axios from 'axios';
import { Board, LinkedPulses, Item, Tags } from "../interfaces/board";
import { IntermediateBoard, IntermediateItem } from "../interfaces/intermediate";

const fetchItemsById = async (ids: string): Promise<Item[]> => {
  console.log({ ids });
  const response = await axios({
    url: `https://api.monday.com/v2`,
    method: `POST`,
    headers: {
      Authorization: process.env.API_TOKEN
    },
    data: {
      query: `
        query {
          items(ids: [${ids}]) {
            id
            name
            column_values
            {
              id
              value
              title
            }
          }
        }
      `
    }
  });

  return response.data?.data?.items;
}

export const boardToIntermediate = async (board: Board) => {
  const intermediaryBoard: IntermediateBoard = {
    description: board.description,
    groups: board.groups
  };
  
  board.items.forEach(async item => {
    const group = intermediaryBoard.groups.find(group => group.id === item.group.id);

    if(!group) return;

    const description = item.column_values.find(({ title }) => title == 'Description')?.value || undefined;
    const stack = item.column_values.find(({ title }) => title == 'Stack')?.value || undefined;

    const usesStr = item.column_values.find(({ title }) => title == 'Uses')?.value;
    const uses: LinkedPulses = usesStr ? JSON.parse(usesStr): { linkedPulseIds: [] };

    const subitemsStr = item.column_values.find(({ title }) => title == 'Components')?.value;
    const subitemsIdsArr: LinkedPulses = subitemsStr ? JSON.parse(subitemsStr): { linkedPulseIds: [] };
    const subitemsIdsStr = subitemsIdsArr.linkedPulseIds.map(item => item.linkedPulseId).join(` `);
    const subitems = subitemsIdsStr ? await fetchItemsById(subitemsIdsStr): [];

    const personsStr = item.column_values.find(({ title }) => title == 'Persons')?.value;
    const personsIdsArr: Tags = personsStr ? JSON.parse(personsStr): { tag_ids: [] };
    const personsIdsStr = personsIdsArr.tag_ids.join(` `);
    const person = personsIdsStr ? await fetchItemsById(personsIdsStr): [];

    const intermediaryItem: IntermediateItem = {
      ...item,
      description,
      stack,
      uses: uses.linkedPulseIds.map(lp => lp.linkedPulseId),
      subitems
    };

    if(group.items) {
      group.items.push(intermediaryItem);
    } else {
      group.items = [intermediaryItem];
    }
  });

  return intermediaryBoard;
}