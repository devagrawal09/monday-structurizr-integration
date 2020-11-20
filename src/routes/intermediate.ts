export interface IntermediateBoard {
  description: string

  groups: Array<{
    id: string
    title: string

    items?: Array<{
      id: string
      name: string
    }>
  }>
}