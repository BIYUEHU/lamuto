export interface Word {
  id: number
  word: string
  type: 'n.' | 'v.' | 'adj.' | 'adv.' | 'pron.' | 'conj.' | 'intj.' | 'prep.'
  meaning: string
  example: string
}

export enum LoadingStatus {
  Loading,
  Loaded,
  Error
}

export enum ValidType {
  Valid,
  UnknownType,
  IllegalSuffix,
  UnknownSuffix
}
