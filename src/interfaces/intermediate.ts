export interface IntermediateBoard {
  description: string

  groups: Array<{
    id: string
    title: string

    items?: IntermediateItem[]
  }>

  users?: Array<User>
}

export interface ItemDetails {
  id: string
  name: string
  description?: string
  stack?: string
  uses: number[]
}

export interface IntermediateItem extends ItemDetails {
  subitems?: Array<ItemDetails>
}

export interface User {

}