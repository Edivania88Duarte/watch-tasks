<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-800 mb-2">Painel</h1>
    <p class="text-slate-600 mb-6">
      Gerencie tarefas, categorias e colaboradores. Use o menu para navegar.
    </p>
    <div class="grid gap-4 sm:grid-cols-3">
      <router-link
        to="/tasks"
        class="block rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300"
      >
        <h2 class="font-medium text-slate-800">Tarefas</h2>
        <p class="text-sm text-slate-600 mt-1">Listar e editar tarefas</p>
      </router-link>
      <router-link
        to="/categories"
        class="block rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300"
      >
        <h2 class="font-medium text-slate-800">Categorias</h2>
        <p class="text-sm text-slate-600 mt-1">Organizar por categoria</p>
      </router-link>
      <router-link
        to="/reports"
        class="block rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300"
      >
        <h2 class="font-medium text-slate-800">Relatórios</h2>
        <p class="text-sm text-slate-600 mt-1">Resumo por status e categoria</p>
      </router-link>
    </div>
  </div>
</template>

<script setup></script>
