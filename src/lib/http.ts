import type { Word } from './types'

const URL = 'https://api.github.com/repos/biyuehu/lamuto/contents/data/lamuto-dictionary.json'

export async function loadDictionary(): Promise<Word[]> {
  const res = (await (await fetch(URL)).json()) as { content: string; download_url: string }
  return JSON.parse(
    res.content
      ? // biome-ignore lint:
        new TextDecoder().decode((Uint8Array.from as any)(atob(res.content), (m: any) => m.codePointAt(0)))
      : JSON.stringify(await (await fetch(res.download_url.split('?token=')[0])).json())
  )
}

export async function updateDictionary(tokenVal: string, data: Word[], message: string): Promise<void> {
  const shaResponse = await fetch(URL, {
    headers: { Authorization: `token ${tokenVal}` }
  })
  const shaData = await shaResponse.json()
  return (
    await fetch(URL, {
      method: 'PUT',
      headers: {
        Authorization: `token ${tokenVal}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        content: btoa(JSON.stringify(data)),
        sha: shaData.sha
      })
    })
  ).json()
}
