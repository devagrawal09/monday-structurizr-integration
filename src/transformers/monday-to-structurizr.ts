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
      const { system, item } = systems.find(({ system }) => system.name === group.title)!;

      const containerView = workspace.views.createContainerView(
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
            containerView.addPerson(role);
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
          // each dependency can either be another container in the same system, or another system
          const linked = items.find(({ item: { id } }) => id === `${linkedItem}`);
          if(linked) {
            // the dependency is another container in the same system
            container.uses(linked.container, 'Uses');
          } else {
            const linkedSystem = systems.find(({ item: { id } }) => id === `${linkedItem}`);
            if(linkedSystem) {
              // the dependency is another system
              container.uses(linkedSystem.system, 'Uses');
              containerView.addNearestNeighbours(linkedSystem.system);
            }
          }
        });
      });

      const systemView = workspace.views.createSystemContextView(
        system,
        `${group.title}-context`,
        'The system context view'
      );

      // define system to system relationships
      item.uses?.forEach(linkedItem => {
        // each dependency is another system
        const linked = systems.find(({ item: { id } }) => id === `${linkedItem}`);
        if(linked) {
          // the dependency is another container in the same system
          system.uses(linked.system, 'Uses');
          systemView.addNearestNeighbours(linked.system);
        }
      });

      // define system to person relationships
      item.persons?.forEach(person => {
        const role = persons.find(role => role.name == person.name);
        if (role) {
          role.uses(system, `Uses`);
          systemView.addPerson(role);
        }
      });

      containerView.addAllContainers();
      containerView.setAutomaticLayout(true);

      systemView.setAutomaticLayout(true);
    }
  });

  return workspace;
};
