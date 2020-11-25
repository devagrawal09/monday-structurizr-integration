import e = require("express");
import { Workspace } from "structurizr-typescript";
import { IntermediateBoard } from "../interfaces/intermediate";

export const mondayToStructurizr = (board: IntermediateBoard): Workspace => {
  const workspace = new Workspace(`Test`, board.description);
  const Persons = [];
  board.groups?.forEach(group => {

    if (group.title === "Persons") {
      const items = group.items?.map(item => {
        const Person = workspace.model.addPerson(item.name, `${item.description}`);
        Persons.push(Person);
      });

    }
    else {
      const system = workspace.model.addSoftwareSystem(group.title, `sample desc`)!;
      workspace.views.createSystemContextView(
        system,
        `${group.title}-context`,
        'The system context view'

      );

      const items = group.items?.map(item => {
        const role = item.Person;
        const container = system.addContainer(item.name, `${item.description}`, `${item.stack}`)!;
        item.subitems?.forEach(subitem => {
          const component = container.addComponent(subitem.name, `sample desc`)!;
        });

        return { item, container };
      });

      items?.forEach(({ item, container }) => {
        item.uses.forEach(linkedItem => {
          const linked = items.find(({ item: { id } }) => id === `${linkedItem}`);
          linked && console.log(`${item.name} uses ${linked?.item.name}`);
          linked && container.uses(linked.container, 'Uses');
        });
      });

      workspace.views.createContainerView(
        system,
        `${group.title}-containers`,
        'Container view'
      ).addAllContainers();
    }
  });

  return workspace;
};
