import { Person, Workspace, ElementStyle, Tags, Shape, RelationshipStyle } from "structurizr-typescript";

export const generateStyles = (workspace: Workspace) => {
  const styles = workspace.views.configuration.styles;

  const personStyle = new ElementStyle(Tags.Person);
  personStyle.shape = Shape.Person;
  personStyle.color = "#ffffff";
  personStyle.background = "#073b6e";
  styles.addElementStyle(personStyle);

  const containerStyle = new ElementStyle(Tags.Container);
  containerStyle.shape = Shape.Ellipse;
  containerStyle.color = "#ffffff";
  containerStyle.background = "#438dd5";
  styles.addElementStyle(containerStyle);

  const componentStyle = new ElementStyle(Tags.Component);
  componentStyle.shape = Shape.Box;
  componentStyle.color = "#ffffff";
  componentStyle.background = "#438dd5";
  styles.addElementStyle(componentStyle);

  const softwaresystemStyle = new ElementStyle(Tags.SoftwareSystem);
  softwaresystemStyle.shape = Shape.Cylinder;
  softwaresystemStyle.color = "#ffffff";
  softwaresystemStyle.background = "#438dd5";
  styles.addElementStyle(softwaresystemStyle);
};
