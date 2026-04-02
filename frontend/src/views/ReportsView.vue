<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-800 mb-6">Relatórios</h1>
    <p v-if="error" class="text-sm text-red-600 mb-4">{{ error }}</p>
    <div v-if="loading" class="text-slate-600">Carregando…</div>
    <div v-else-if="data" class="grid gap-6 md:grid-cols-2">
      <section class="rounded-lg border border-slate-200 bg-white p-4">
        <h2 class="font-medium text-slate-800 mb-3">Por status</h2>
        <p class="text-sm text-slate-600 mb-2">Total: {{ data.total_tasks }}</p>
        <ul class="space-y-1 text-sm">
          <li v-for="row in data.by_status" :key="row.status" class="flex justify-between">
            <span>{{ labelStatus(row.status) }}</span>
            <span class="font-medium">{{ row.count }}</span>
          </li>
        </ul>
      </section>
      <section class="rounded-lg border border-slate-200 bg-white p-4">
        <h2 class="font-medium text-slate-800 mb-3">Por categoria</h2>
        <ul class="space-y-1 text-sm">
          <li v-for="row in data.by_category" :key="row.category_name" class="flex justify-between">
            <span>{{ row.category_name }}</span>
            <span class="font-medium">{{ row.count }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { http } from '../api/http';

const data = ref(null);
const loading = ref(true);
const error = ref('');

function labelStatus(s) {
  const map = { todo: 'A fazer', in_progress: 'Em progresso', done: 'Concluída' };
  return map[s] || s;
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const { data: d } = await http.get('/api/reports/summary');
    data.value = d;
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao carregar';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
