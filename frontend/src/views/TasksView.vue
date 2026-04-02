<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-semibold text-slate-800">Tarefas</h1>
      <button
        type="button"
        class="rounded bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700"
        @click="openCreate"
      >
        Nova tarefa
      </button>
    </div>
    <p class="text-sm text-slate-600 mb-4">
      O papel é automático: quem cria a tarefa é <strong>Dono</strong>; quem é adicionado na tela da
      tarefa vira <strong>Colaborador</strong>.
    </p>
    <p v-if="error" class="text-sm text-red-600 mb-4">{{ error }}</p>
    <div v-if="loading" class="text-slate-600">Carregando…</div>
    <!-- Mobile: cartões -->
    <ul v-else-if="tasks.length" class="md:hidden space-y-3">
      <li
        v-for="t in tasks"
        :key="t.id"
        class="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm"
      >
        <router-link
          :to="`/tasks/${t.id}`"
          class="text-base font-medium text-indigo-600 hover:underline"
        >
          {{ t.title }}
        </router-link>
        <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
          <span>{{ labelStatus(t.status) }}</span>
          <span class="text-slate-400">·</span>
          <span>{{ t.is_owner ? 'Dono' : 'Colaborador' }}</span>
        </div>
        <div class="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm">
          <router-link :to="`/tasks/${t.id}`" class="text-indigo-600 hover:underline">
            {{ t.is_owner ? 'Editar' : 'Abrir' }}
          </router-link>
          <router-link
            v-if="t.is_owner"
            :to="`/tasks/${t.id}`"
            class="text-slate-600 hover:underline"
          >
            Colaboradores
          </router-link>
          <button
            v-if="t.is_owner"
            type="button"
            class="text-red-600 hover:underline"
            @click="remove(t)"
          >
            Excluir
          </button>
        </div>
      </li>
    </ul>
    <!-- Desktop: tabela -->
    <div
      v-if="!loading && tasks.length"
      class="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white/95"
    >
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-slate-600">
          <tr>
            <th class="px-4 py-2">Título</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Papel</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tasks" :key="'d-' + t.id" class="border-t border-slate-100">
            <td class="px-4 py-2">
              <router-link :to="`/tasks/${t.id}`" class="text-indigo-600 hover:underline">
                {{ t.title }}
              </router-link>
            </td>
            <td class="px-4 py-2">{{ labelStatus(t.status) }}</td>
            <td class="px-4 py-2">{{ t.is_owner ? 'Dono' : 'Colaborador' }}</td>
            <td class="px-4 py-2 text-right space-x-3">
              <router-link
                :to="`/tasks/${t.id}`"
                class="text-indigo-600 hover:underline"
              >
                {{ t.is_owner ? 'Editar' : 'Abrir' }}
              </router-link>
              <router-link
                v-if="t.is_owner"
                :to="`/tasks/${t.id}`"
                class="text-slate-600 hover:underline"
              >
                Colaboradores
              </router-link>
              <button
                v-if="t.is_owner"
                type="button"
                class="text-red-600 hover:underline"
                @click="remove(t)"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!loading && !tasks.length" class="rounded-lg border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-slate-500">
      Nenhuma tarefa ainda.
    </p>

    <div
      v-if="modalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      @click.self="modalOpen = false"
    >
      <form
        class="bg-white rounded-lg shadow max-w-lg w-full p-6 space-y-4"
        @submit.prevent="saveTask"
      >
        <h2 class="text-lg font-semibold">Nova tarefa</h2>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Título</label>
          <input v-model="form.title" required class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Descrição</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Categoria</label>
          <select v-model="form.categoryId" class="w-full border rounded px-3 py-2">
            <option :value="''">(nenhuma)</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Status</label>
          <select v-model="form.status" class="w-full border rounded px-3 py-2">
            <option value="todo">A fazer</option>
            <option value="in_progress">Em progresso</option>
            <option value="done">Concluída</option>
          </select>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="px-4 py-2 text-slate-600" @click="modalOpen = false">
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { http } from '../api/http';

const tasks = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref('');
const modalOpen = ref(false);

const form = ref({
  title: '',
  description: '',
  categoryId: '',
  status: 'todo',
});

function labelStatus(s) {
  const map = { todo: 'A fazer', in_progress: 'Em progresso', done: 'Concluída' };
  return map[s] || s;
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [tRes, cRes] = await Promise.all([
      http.get('/api/tasks'),
      http.get('/api/categories'),
    ]);
    tasks.value = tRes.data;
    categories.value = cRes.data;
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao carregar';
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.value = { title: '', description: '', categoryId: '', status: 'todo' };
  modalOpen.value = true;
}

async function saveTask() {
  const payload = {
    title: form.value.title,
    description: form.value.description || undefined,
    status: form.value.status,
    categoryId: form.value.categoryId || undefined,
  };
  try {
    await http.post('/api/tasks', payload);
    modalOpen.value = false;
    await load();
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao salvar';
  }
}

async function remove(t) {
  if (!confirm(`Excluir "${t.title}"?`)) return;
  try {
    await http.delete(`/api/tasks/${t.id}`);
    await load();
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao excluir';
  }
}

onMounted(load);
</script>
