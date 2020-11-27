import axios from 'axios';
import { IntegrationModel } from '../database/integration';
import { Board, LinkedPulses, Item, Tags, Color, ShapeDropdown } from "../interfaces/board";
import { IntermediateBoard, IntermediateItem, ItemDetails, Person } from "../interfaces/intermediate";

const fetchPersons = async (ids: string, integration: IntegrationModel): Promise<Array<Person>> => {
  const response = await axios({
    url: `https://api.monday.com/v2`,
    method: `POST`,
    headers: {
      Authorization: integration.mondayToken
    },
    data: {
      query: `
        query {
          tags(ids: [${ids}]) {
            id
            name
          }
        }
      `
    }
  });

  return response.data?.data?.tags;
}

const fetchSubitems = async (ids: string, integration: IntegrationModel, shapeDropdown: ShapeDropdown): Promise<ItemDetails[]> => {
  const response = await axios({
    url: `https://api.monday.com/v2`,
    method: `POST`,
    headers: {
      Authorization: integration.mondayToken
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

  return Promise.all(items.map(itemToIntermediate(integration, shapeDropdown)));
}

const itemToIntermediate = (integration: IntegrationModel, shapeDropdown: ShapeDropdown) => async (item: Item): Promise<ItemDetails> => {
  const usesStr = item.column_values.find(({ title }) => title == 'Uses')?.value;
  const uses: LinkedPulses = usesStr ? JSON.parse(usesStr): { linkedPulseIds: [] };

  const personsStr = item.column_values.find(({ title }) => title == 'Persons')?.value;
  const personsIdsArr: Tags = personsStr ? JSON.parse(personsStr): { tag_ids: [] };
  const personsIdsStr = personsIdsArr.tag_ids.join(` `);
  const persons = personsIdsStr ? await fetchPersons(personsIdsStr, integration): [];

  const colorStr = item.column_values.find(({ title }) => title == 'Element Color')?.value;
  const color: Color = colorStr? JSON.parse(colorStr): {};

  const shapeStr = item.column_values.find(({ title }) => title == 'Element Shape')?.value;
  const shapeObj: { ids: number[] } = shapeStr? JSON.parse(shapeStr): { ids: [] };
  const shapeId = shapeObj.ids[0];
  const shape = shapeDropdown?.labels.find(({ id }) => id == shapeId);

  return {
    id: item.id,
    name: item.name,
    description: item.column_values.find(({ title }) => title == 'Description')?.value || undefined,
    stack: item.column_values.find(({ title }) => title == 'Stack')?.value || undefined,
    uses: uses.linkedPulseIds?.map(lp => lp.linkedPulseId) || [],
    persons,
    color: color.color?.hex,
    shape: shape?.name
  }
}

export const boardToIntermediate = async (board: Board, integration: IntegrationModel) => {
  const intermediaryBoard: IntermediateBoard = {
    description: board.description,
    groups: board.groups
  };

  const shapeSettings = board.columns.find(({ title }) => title === 'Element Shape');
  const shapeDropdown: ShapeDropdown = shapeSettings && JSON.parse(shapeSettings.settings_str!);
  
  const jobs = board.items.map(async item => {
    const group = intermediaryBoard.groups.find(group => group.id === item.group.id);

    if(!group) return;

    const subitemsStr = item.column_values.find(({ title }) => title == 'Components')?.value;
    const subitemsIdsArr: LinkedPulses = subitemsStr ? JSON.parse(subitemsStr): { linkedPulseIds: [] };
    const subitemsIdsStr = subitemsIdsArr.linkedPulseIds.map(item => item.linkedPulseId).join(` `);
    const subitems = subitemsIdsStr ? await fetchSubitems(subitemsIdsStr, integration, shapeDropdown): [];

    const intermediaryItem: IntermediateItem = {
      ...(await itemToIntermediate(integration, shapeDropdown)(item)),
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