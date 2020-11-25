import { SoftwareSystem, Person, Workspace, ElementStyle, Tags, Shape } from "structurizr-typescript";
import { IntermediateBoard, IntermediateItem } from "../interfaces/intermediate";

export const mondayToStructurizr = (board: IntermediateBoard): Workspace => {
  const workspace = new Workspace(`Test`, board.description);
  const systems: { system: SoftwareSystem, item: IntermediateItem }[] = [];
  const persons: Person[] = [];

  board.groups.find(group => group.title == "Systems")?.items?.forEach(item => {
    const system = workspace.model.addSoftwareSystem(item.name, `${item.description}`)!;
    systems.push({ system, item });
  });

  board.groups.find(group => group.title == "Persons")?.items?.forEach(item => {
    const person = workspace.model.addPerson(item.name, `${item.description}`)!;
    persons.push(person);
  });

  board.groups?.forEach(group => {
    if (group.title !== "Systems" && group.title !== "Persons") {
      const { system } = systems.find(({ system }) => system.name === group.title)!;

      workspace.views.createSystemContextView(
        system,
        `${group.title}-context`,
        'The system context view'
      );

      const view = workspace.views.createContainerView(
        system,
        `${group.title}-containers`,
        'Container view'
      );

      const items = group.items?.map(item => {
        const container = system.addContainer(
          item.name,
          `${item.description}`,
          `${item.stack}`
        )!;

        item.persons?.forEach(person => {
          const role = persons.find(role => role.name == person.name);
          if (role) {
            role.uses(container, `Uses`);
            view.addPerson(role);
          }
        });

        if(item.subitems?.length) {
          const view = workspace.views.createComponentView(
            container,
            `${container.name}-components`,
            `The component view from ${container.name}`
          );

          const subitems = item.subitems.map(subitem => {
            const component = container.addComponent(
              subitem.name,
              `${subitem.description}`,
              `${subitem.stack}`
            )!;

            subitem.persons?.forEach(person => {
              const role = persons.find(role => role.name == person.name);
              if(role) {
                view.addPerson(role);
                role.uses(component, `Uses`);
              }
            });

            return { subitem, component };
          });
  
          subitems.forEach(({ subitem, component }) => {
            subitem.uses?.forEach(linkedItem => {
              const linked = subitems.find(({ subitem: { id } }) => id === `${linkedItem}`);
              linked && component.uses(linked.component, 'Uses');
            });
          });
  
          view.addAllComponents();
          view.setAutomaticLayout(true);
        }

        return { item, container };
      });

      items?.forEach(({ item, container }) => {
        item.uses?.forEach(linkedItem => {
          const linked = items.find(({ item: { id } }) => id === `${linkedItem}`);
          if(linked) {
            container.uses(linked.container, 'Uses');
          } else {
            const linkedSystem = systems.find(({ item: { id } }) => id === `${linkedItem}`);
            if(linkedSystem) {
              container.uses(linkedSystem.system, 'Uses');
              view.addNearestNeighbours(linkedSystem.system);
            }
          }
        });
      });

      // define system to system relationships

      // add system to system relationships to view

      view.addAllContainers();
      view.setAutomaticLayout(true);
    }
  });

  return workspace;
};
