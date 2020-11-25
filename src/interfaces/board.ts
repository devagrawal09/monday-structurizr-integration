export interface Board {
  description: string
  groups: Group[]
  items: Item[]
}

export interface Group {
  id: string
  title: string
}

export interface Item {
  id: string
  name: string
  group: { id: string }
  column_values: Column[]
}

export interface Column {
  id: string
  value: string
  title: "Description" | "Stack" | "Uses" | "Components" | "Persons"
}

export interface LinkedPulses {
  linkedPulseIds: Array<{ linkedPulseId: number }>
}

export interface Tags {
  tag_ids: Array<number>
}