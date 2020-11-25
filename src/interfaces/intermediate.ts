export interface IntermediateBoard {
  description: string

  groups: Array<{
    id: string
    title: string

    items?: IntermediateItem[]
  }>

  users?: Array<User>
}

export interface IntermediateItem {
  id: string
  name: string
  description?: string
  stack?: string

  uses: number[]

  subitems?: Array<{
    id: string
    name: string
  }>
}

export interface User {

}