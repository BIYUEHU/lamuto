export interface Word {
  id: number
  word: string
  type: '.n' | '.v' | '.adj' | '.adv' | '.pron' | '.prep' | '.conj' | '.intj' | '.num' | '.sym' | '.punc'
  meaning: string
  example: string
}

export enum LoadingStatus {
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error'
}
