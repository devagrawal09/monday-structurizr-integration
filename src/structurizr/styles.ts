import { Person, Workspace, ElementStyle, Tags, Shape, RelationshipStyle } from "structurizr-typescript";

export const generateStyles = (workspace: Workspace) => {
  const styles = workspace.views.configuration.styles;
  const personStyle = new ElementStyle(Tags.Person);
  personStyle.shape = Shape.Person;

  styles.addElementStyle(personStyle);
};
