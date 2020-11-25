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
  title: "Description" | "Stack" | "Uses" | "Components" | "Users"
}

export interface LinkedPulses {
  linkedPulseIds: Array<{ linkedPulseId: number }>
}