export interface IntermediateBoard {
  description: string

  groups: Array<{
    id: string
    title: string

    items?: IntermediateItem[]
  }>
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