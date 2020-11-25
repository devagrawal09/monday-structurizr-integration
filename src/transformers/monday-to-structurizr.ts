import { Workspace } from "structurizr-typescript";
import { IntermediateBoard } from "../interfaces/intermediate";

export const mondayToStructurizr = (board: IntermediateBoard): Workspace => {
  const workspace = new Workspace(`Test`, board.description);

  board.groups?.forEach(group => {
    const system = workspace.model.addSoftwareSystem(group.title, `sample desc`)!;

    const view = workspace.views.createSystemContextView(
      system,
      `${group.title}-context`,
      'The system context view'
    );

    const items = group.items?.map(item => {
      const container = system.addContainer(item.name, `${item.description}`, `${item.stack}`)!;

      if(item.subitems?.length) {
        const subitems = item.subitems.map(subitem => {
          const component = container.addComponent(subitem.name, `${subitem.description}`, `${subitem.stack}`)!;
          return { subitem, component };
        });

        subitems.forEach(({ subitem, component }) => {
          subitem.uses.forEach(linkedItem => {
            const linked = subitems.find(({ subitem: { id } }) => id === `${linkedItem}`);
            linked && component.uses(linked.component, 'Uses');
          });
        });

        const view = workspace.views.createComponentView(
          container,
          `${container.name}-components`,
          `The component view from ${container.name}`
        );

        view.addAllComponents();
        view.setAutomaticLayout(true);
      }

      return { item, container };
    });

    items?.forEach(({ item, container }) => {
      item.uses.forEach(linkedItem => {
        const linked = items.find(({ item: { id } }) => id === `${linkedItem}`);
        linked && container.uses(linked.container, 'Uses');
      });
    });

    const containerView = workspace.views.createContainerView(
      system,
      `${group.title}-containers`,
      'Container view'
    );

    containerView.addAllContainers();
    containerView.setAutomaticLayout(true);
  });

  return workspace;
};
