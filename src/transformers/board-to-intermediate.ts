import axios from 'axios';
import { Board, LinkedPulses, Item, Tags } from "../interfaces/board";
import { IntermediateBoard, IntermediateItem, ItemDetails } from "../interfaces/intermediate";

const fetchSubitems = async (ids: string): Promise<ItemDetails[]> => {
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

  const items: Item[] = response.data?.data?.items;

  return items.map(itemToIntermediate);
}

const itemToIntermediate = (item: Item) : ItemDetails => {
  const usesStr = item.column_values.find(({ title }) => title == 'Uses')?.value;
  const uses: LinkedPulses = usesStr ? JSON.parse(usesStr): { linkedPulseIds: [] };

  return {
    id: item.id,
    name: item.name,
    description: item.column_values.find(({ title }) => title == 'Description')?.value || undefined,
    stack: item.column_values.find(({ title }) => title == 'Stack')?.value || undefined,
    uses: uses.linkedPulseIds.map(lp => lp.linkedPulseId)
  }
}

export const boardToIntermediate = async (board: Board) => {
  const intermediaryBoard: IntermediateBoard = {
    description: board.description,
    groups: board.groups
  };
  
  const jobs = board.items.map(async item => {
    const group = intermediaryBoard.groups.find(group => group.id === item.group.id);

    if(!group) return;

    const subitemsStr = item.column_values.find(({ title }) => title == 'Components')?.value;
    const subitemsIdsArr: LinkedPulses = subitemsStr ? JSON.parse(subitemsStr): { linkedPulseIds: [] };
    const subitemsIdsStr = subitemsIdsArr.linkedPulseIds.map(item => item.linkedPulseId).join(` `);
    const subitems = subitemsIdsStr ? await fetchSubitems(subitemsIdsStr): [];

    const personsStr = item.column_values.find(({ title }) => title == 'Persons')?.value;
    const personsIdsArr: Tags = personsStr ? JSON.parse(personsStr): { tag_ids: [] };
    const personsIdsStr = personsIdsArr.tag_ids.join(` `);
    const person = personsIdsStr ? await fetchSubitems(personsIdsStr): [];

    const intermediaryItem: IntermediateItem = {
      ...itemToIntermediate(item),
      subitems
    };

    if(group.items) {
      group.items.push(intermediaryItem);
    } else {
      group.items = [intermediaryItem];
    }
  });

  await Promise.all(jobs);

  return intermediaryBoard;
}