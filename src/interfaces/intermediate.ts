export interface IntermediateBoard {
  description: string

  groups: Array<{
    id: string
    title: string

    items?: IntermediateItem[]
  }>

  users?: Array<Person>
}

export interface ItemDetails {
  id: string
  name: string
  description?: string
  stack?: string
  uses?: number[]
  persons?: Person[]
}

export interface IntermediateItem extends ItemDetails {
  subitems?: Array<ItemDetails>
}

export interface Person {
  id: string
  name: string
}