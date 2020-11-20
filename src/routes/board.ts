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
}