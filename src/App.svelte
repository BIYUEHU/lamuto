<!-- App.svelte -->
<script lang="ts">
  import type { Word } from "$lib/types";
  import { writable } from "svelte/store";

  const dictionary = writable<Word[]>([
    {
      id: 1,
      word: "hello",
      type: ".n",
      meaning: "问候",
      example: "hello, how are you?",
    },
    {
      id: 2,
      word: "world",
      type: ".n",
      meaning: "世界",
      example: "I'm from the world.",
    },
  ]);

  let searchTerm = "";
  let sortBy = "word";
  let currentPage = 1;
  const itemsPerPage = 10;

  let filteredWords: Word[] = [];
  let sortedWords: Word[] = [];
  let paginatedWords: Word[] = [];
  let totalPages = 1;

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

<div class="max-w-5xl mx-auto p-6">
  <div class="text-3xl font-bold mb-6">Lamuto 词典</div>
  <!-- 搜索与排序 -->
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

  <!-- 单词卡片列表 -->
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

  <!-- 分页控制 -->
  <div class="flex items-center justify-center gap-4 mt-6">
    <button
      on:click={() => (currentPage = Math.max(currentPage - 1, 1))}
      disabled={currentPage === 1}
      class="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
    >
      上一页
    </button>
    <span class="text-gray-600">第 {currentPage} 页 / 共 {totalPages} 页</span>
    <button
      on:click={() => (currentPage = Math.min(currentPage + 1, totalPages))}
      disabled={currentPage === totalPages}
      class="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
    >
      下一页
    </button>
  </div>

  <!-- GitHub Token 输入 -->
  <div class="mt-8">
    <input
      type="text"
      placeholder="输入 GitHub Token"
      value={$token}
      on:input={saveToken}
      class="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
    />
  </div>

  <!-- 添加单词表单（仅在 token 存在时显示） -->
  {#if $token}
    <div class="mt-8 p-6 border rounded-lg shadow">
      <h3 class="text-xl font-semibold mb-4">添加新单词</h3>
      <form on:submit|preventDefault={addWord} class="flex flex-col gap-4">
        <input
          name="word"
          placeholder="单词"
          required
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          name="type"
          placeholder="词性 (如 noun, verb)"
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
          required
          class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          type="submit"
          class="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
        >
          添加
        </button>
      </form>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    font-family: "Inter", sans-serif;
  }
</style>
