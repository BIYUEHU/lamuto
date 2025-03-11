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

  loadDictionary()
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

  function addWord(event: Event) {
    event.preventDefault();

    const tokenVal = getToken()
    if (!tokenVal) {
      alert("请先输入 GitHub Token");
      return;
    }

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
  <div class="text-3xl font-bold mb-6">Lamuto 词典</div>
  <div class="flex flex-col sm:flex-row gap-4 mb-6">
    <input
      bind:value={searchTerm}
      placeholder="搜索单词或释义..."
      class="flex-grow border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
    />
    <select
      bind:value={sortBy}
      class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
    >
      <option value="word">按字母排序</option>
      <option value="type">按词性排序</option>
    </select>
  </div>

  {#if loadingStatus === LoadingStatus.Loading}
    <div class="text-center text-gray-600">加载中...</div>
  {:else if loadingStatus === LoadingStatus.Error}
    <div class="text-center text-red-600">加载失败，请检查网络连接。</div>
  {:else}
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each paginatedWords as word}
          <div
            class="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 class="text-2xl font-semibold mb-1">{word.word}</h3>
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
        class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
      />
    </div>
    {#if $token}
      <h3 class="text-xl font-semibold mb-4">添加新单词</h3>
      <form on:submit|preventDefault={addWord} class="gap-4 grid">
        <input
          name="word"
          placeholder="单词"
          required
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          name="type"
          placeholder="词性"
          required
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          name="meaning"
          placeholder="释义"
          required
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          name="example"
          placeholder="例句"
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          type="submit"
          class="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
        >
          添加
        </button>
      </form>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    font-family: "Inter", sans-serif;
  }
</style>
