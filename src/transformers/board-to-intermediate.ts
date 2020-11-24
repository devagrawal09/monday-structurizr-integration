import { Board, LinkedPulses } from "../interfaces/board";
import { IntermediateBoard, IntermediateItem } from "../interfaces/intermediate";

export const boardToIntermediate = (board: Board) => {
  const intermediaryBoard: IntermediateBoard = {
    description: board.description,
    groups: board.groups
  };

  board.items.forEach(item => {
    const group = intermediaryBoard.groups.find(group => group.id === item.group.id);

    if(!group) return;

    const description = item.column_values.find(({ title }) => title == 'Description')?.value || undefined;
    const stack = item.column_values.find(({ title }) => title == 'Stack')?.value || undefined;
    const usesStr = item.column_values.find(({ title }) => title == 'Uses')?.value;

    const uses: LinkedPulses = usesStr ? JSON.parse(usesStr): { linkedPulseIds: [] };

    const intermediaryItem: IntermediateItem = {
      ...item,
      description,
      stack,
      uses: uses.linkedPulseIds.map(lp => lp.linkedPulseId)
    };

    if(group.items) {
      group.items.push(intermediaryItem);
    } else {
      group.items = [intermediaryItem];
    }
  });

  return intermediaryBoard;
}