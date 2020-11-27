import { Shape } from "structurizr-typescript";

export interface Board {
  description: string
  groups: Group[]
  items: Item[]
  columns: Column[]
}

export interface Group {
  id: string
  title: string
}

export interface Item {
  id: string
  name: string
  group: { id: string, title?: string }
  column_values: Column[]
}

export interface Column {
  id: string
  value: string
  title: "Description" | "Stack" | "Uses" | "Components" | "Persons" | "Element Color" | "Element Shape"
  settings_str?: string
}

export interface LinkedPulses {
  linkedPulseIds: Array<{ linkedPulseId: number }>
}

export interface Tags {
  tag_ids: Array<number>
}

export interface Color {
  color: { hex: string }
}

export interface ShapeDropdown {
  labels: Array<{ id: number, name: Shape }>
}