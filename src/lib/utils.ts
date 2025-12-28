import { ValidType, type Word } from './types'

const list = [
  ['v.', 'u'],
  ['n.', 'e'],
  ['adj.', 'm'],
  ['adv.', 'n'],
  ['porn.', 'a']
] as const

const extraTypes = ['conj.', 'interj.', 'prep.', 'part.', 'num.', 'axu.']
const regularSuffix = list.map(([, suffix]) => suffix)

export function checkValidity(word: Word) {
  const end = word.word.at(word.word.length - 1) as 'u'

  if (regularSuffix.includes(end)) {
    if (list.some(([type, suffix]) => word.type === type && word.word.endsWith(suffix))) {
      return ValidType.Valid
    }
    return ValidType.UnknownSuffix
  }

  if (extraTypes.includes(word.type)) {
    if (regularSuffix.includes(end)) {
      return ValidType.IllegalSuffix
    }
    return ValidType.Valid
  }

  return ValidType.UnknownType
}

export function getFormInputValueFactory(form: HTMLFormElement) {
  return (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value
}
