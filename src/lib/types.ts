export interface Word {
  id: number
  word: string
  type: 'n.' | 'v.' | 'adj.' | 'adv.' | 'pron.' | 'conj.' | 'intj.' | 'prep.'
  meaning: string
  example: string
}

export enum LoadingStatus {
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error'
}
