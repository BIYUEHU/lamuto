// 从 GitHub 加载词典数据
export async function loadDictionary() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/你的用户名/仓库名/main/lamuto-dictionary.json')
    if (!response.ok) throw new Error('加载词典失败')
    const data = await response.json()
    dictionary.set(data)
  } catch (error) {
    console.error('加载词典出错:', error)
  }
}

// 保存 token 到 localStorage
export function saveToken(event: Event) {
  const value = (event.target as HTMLInputElement).value
  token.set(value)
  localStorage.setItem('token', value)
}

// 添加新单词（调用 GitHub API 更新词典）
export async function addWord(event: Event) {
  event.preventDefault()
  let tokenVal: string
  token.subscribe((v) => (tokenVal = v))()
  if (!tokenVal) {
    alert('请先输入 GitHub Token')
    return
  }
  const form = event.target as HTMLFormElement
  const newWord: Word = {
    word: (form.elements.namedItem('word') as HTMLInputElement).value,
    type: (form.elements.namedItem('type') as HTMLInputElement).value,
    meaning: (form.elements.namedItem('meaning') as HTMLInputElement).value,
    example: (form.elements.namedItem('example') as HTMLInputElement).value
  }
  let dict: Word[]
  dictionary.subscribe((v) => (dict = v))()
  const updatedDictionary = [...dict, newWord]
  try {
    const shaResponse = await fetch('https://api.github.com/repos/你的用户名/仓库名/contents/lamuto-dictionary.json', {
      headers: { Authorization: `token ${tokenVal}` }
    })
    const shaData = await shaResponse.json()
    const response = await fetch('https://api.github.com/repos/你的用户名/仓库名/contents/lamuto-dictionary.json', {
      method: 'PUT',
      headers: {
        Authorization: `token ${tokenVal}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add new word: ${newWord.word}`,
        content: btoa(JSON.stringify(updatedDictionary)),
        sha: shaData.sha
      })
    })
    if (!response.ok) throw new Error('添加单词失败')
    dictionary.set(updatedDictionary)
    form.reset()
  } catch (error) {
    console.error('添加单词出错:', error)
    alert('添加失败，请检查 Token 或网络')
  }
}
