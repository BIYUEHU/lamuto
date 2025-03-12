<script lang="ts">
  import { LoadingStatus, type Word } from "./lib/types";
  import { updateDictionary, loadDictionary } from "./lib/http";
  import { dictionary, token, saveToken, getToken } from "./lib/stores";

  let searchTerm = "";
  let sortBy = "word";
  let currentPage = 1;
  const itemsPerPage = 10;

  let filteredWords: Word[] = [];
  let sortedWords: Word[] = [];
  let paginatedWords: Word[] = [];
  let totalPages = 1;
  let loadingStatus: LoadingStatus = LoadingStatus.Loading;

  loadDictionary(getToken())
    .then((data) => {
      loadingStatus = LoadingStatus.Loaded;
      dictionary.set(data);
    })
    .catch((err) => {
      loadingStatus = LoadingStatus.Error;
      console.error("Load dictionary failed:", err);
    });

  function onSaveToken(event: Event) {
    const tokenVal = (event.target as HTMLInputElement).value;
    saveToken(tokenVal);
  }

  function addWord(event: Event, tokenVal: string) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    let dict: Word[] = [];
    dictionary.subscribe((v) => {
      dict = v;
    })();
    const newWord = {
      id: dict.reduce((maxId, word) => Math.max(maxId, word.id), 0) + 1,
      word: (form.elements.namedItem("word") as HTMLInputElement).value,
      type: (form.elements.namedItem("type") as HTMLInputElement)
        .value as Word["type"],
      meaning: (form.elements.namedItem("meaning") as HTMLInputElement).value,
      example: (form.elements.namedItem("example") as HTMLInputElement).value,
    };
    if (
      dict.some(
        (word) => word.word.toLowerCase() === newWord.word.toLowerCase(),
      )
    ) {
      alert(`单词 "${newWord.word}" 已存在`);
      return;
    }

    const data = [...dict, newWord];
    updateDictionary(
      tokenVal,
      data,
      `Word: add "${newWord.word}" (${newWord.type})"`,
    )
      .then(() => {
        dictionary.set(data);
        form.reset();
      })
      .catch((err) => {
        alert(`更新词典失败：${err.message}`);
        console.error("Update dictionary failed:", err);
      });
  }

  function deleteWord(word: Word, tokenVal: string) {
    if (!confirm(`确认删除 "${word.word}" (${word.type})?`)) return;
    let data: Word[] = [];
    dictionary.subscribe((v) => {
      data = v.filter((w) => w.id !== word.id);
    })();
    updateDictionary(
      tokenVal,
      data,
      `Word: delete "${word.word}" (${word.type})"`
    )
      .then(() => {
        dictionary.set(data);
      })
      .catch((err) => {
        alert(`更新词典失败：${err.message}`);
        console.error("Update dictionary failed:", err);
      });
  }

  $: dictionary.subscribe((dict) => {
    filteredWords = dict.filter(
      (word) =>
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    sortedWords = [...filteredWords].sort((a, b) => {
      if (sortBy === "word") return a.word.localeCompare(b.word);
      if (sortBy === "type") return a.type.localeCompare(b.type);
      return 0;
    });
    totalPages = Math.ceil(sortedWords.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    paginatedWords = sortedWords.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  });
</script>

<div class="max-w-5xl mx-auto p-14">
  <div class="text-3xl font-bold mb-6"><span class="text-teal-400">L</span>a<span class="text-teal-300">m</span>u<span class="text-teal-300">t</span>o 词典</div>
  <div class="flex flex-col sm:flex-row gap-4 mb-6">
    <input
      bind:value={searchTerm}
      placeholder="搜索单词或释义..."
      class="flex-grow border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
    />
    <select
      bind:value={sortBy}
      class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
    >
      <option value="word">按字母排序</option>
      <option value="type">按词性排序</option>
    </select>
  </div>

  {#if loadingStatus === LoadingStatus.Loading}
    <div class="text-center text-gray-600">加载中...</div>
  {:else if loadingStatus === LoadingStatus.Error}
    <div class="text-center text-red-600">加载失败，请检查网络连接。</div>
  {:else if filteredWords.length === 0}
    <div class="text-center text-gray-600">没有找到匹配的单词。</div>
  {:else}
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each paginatedWords as word}
          <div
            class="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {#if $token}
            <div class="flex items-center justify-between mb-1">
            <h3 class="text-2xl font-semibold">{word.word}</h3>
              <button type="button"
                class="relative top-0 right-0 mr-2 border-0 items-end bg-gray-100 text-gray-400 hover:text-red-500 rounded-full" on:click={() => deleteWord(word, $token)}
              >X
              </button>
            </div>
            {:else}
            <h3 class="text-2xl font-semibold mb-1">{word.word}</h3>
            {/if}
            <p class="text-sm text-gray-500 mb-2">{word.type}</p>
            <p class="mb-2">{word.meaning}</p>
            <p class="text-sm italic text-gray-400">{word.example}</p>
          </div>
        {/each}
      </div>
      <div class="flex items-center justify-center gap-4 mt-6">
        <button
          on:click={() => (currentPage = Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          class="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
        >
          上一页
        </button>
        <span class="text-gray-600"
          >第 {currentPage} 页 / 共 {totalPages} 页</span
        >
        <button
          on:click={() => (currentPage = Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          class="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
        >
          下一页
        </button>
      </div>
    </div>
  {/if}

  <div class="mt-16 border rounded-lg shadow">
    <div class="gap-4 grid">
      <input
        type="text"
        placeholder="输入 GitHub Token"
        value={$token}
        on:input={onSaveToken}
        class="border border-gray-300 text-white p-3 rounded focus:outline-none focus:ring focus:border-teal-300 focus:text-black"
      />
    </div>
    {#if $token}
      <h3 class="text-xl font-semibold mb-4">添加新单词</h3>
      <form on:submit|preventDefault={(e)=>addWord(e, $token)} class="gap-4 grid">
        <input
          name="word"
          placeholder="单词"
          required
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
        />
        <select
          name="type"
          required
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
        >
          <option value="n.">名词</option>
          <option value="v.">动词</option>
          <option value="adj.">形容词</option>
          <option value="adv.">副词</option>
          <option value="pron.">代词</option>
          <option value="conj.">连词</option>
          <option value="intj.">感叹词</option>
          <option value="prep.">介词</option>
        </select>
        <input
          name="meaning"
          placeholder="释义"
          required
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
        />
        <input
          name="example"
          placeholder="例句"
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
        />
        <button
          type="submit"
          class="bg-teal-300 text-white p-3 rounded hover:bg-teal-400 transition"
        >
          添加
        </button>
      </form>
    {/if}
  </div>

  <div class="mt-13 mb-0 text-center text-gray-500">
    <hr class="w-full border-gray-300 mb-6" />
    Copyrigth © 2025 by <a class="text-teal-400 no-underline hover:underline" href="https://github.com/biyuehu/lamuto">Lamuto</a>
  </div>
</div>

<style>
  :global(body) {
    font-family: "Inter", sans-serif;
  }
</style>
