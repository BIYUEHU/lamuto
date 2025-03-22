import { writable } from 'svelte/store'
import type { Word } from './types'

const TOKEN_KEY = 'lamuto_token'

export const token = writable<string>(localStorage.getItem(TOKEN_KEY) ?? '')
export const editMode = writable<boolean>(false)

export const dictionary = writable<Word[]>([
  {
    id: 1,
    word: 'hello',
    type: 'n.',
    meaning: '问候',
    example: 'hello, how are you?'
  },
  {
    id: 2,
    word: 'world',
    type: 'n.',
    meaning: '世界',
    example: "I'm from the world."
  }
])

export function saveToken(tokenVal: string) {
  localStorage.setItem(TOKEN_KEY, tokenVal)
  token.set(tokenVal)
}

export function getToken() {
  let tokenVal: string | undefined
  token.subscribe((v) => {
    tokenVal = v
  })()
  return tokenVal
}

export function getEditMode() {
  let editModeVal: boolean | undefined
  editMode.subscribe((v) => {
    editModeVal = v
  })()
  return !!editModeVal
}
