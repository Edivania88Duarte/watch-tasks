<template>
  <div>
    <p v-if="error" class="text-sm text-red-600 mb-4">{{ error }}</p>
    <div v-if="loading" class="text-slate-600">Carregando…</div>
    <div v-else-if="task">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <router-link to="/tasks" class="text-sm text-indigo-600 hover:underline"
            >← Voltar</router-link
          >
          <h1 class="text-2xl font-semibold text-slate-800 mt-2">{{ task.title }}</h1>
          <p class="text-slate-600 mt-2 whitespace-pre-wrap">{{ task.description || '—' }}</p>
          <p class="text-sm text-slate-500 mt-2">
            Status: {{ labelStatus(task.status) }} ·
            {{ task.is_owner ? 'Você é o dono' : 'Colaborador' }}
          </p>
        </div>
        <button
          v-if="task.is_owner"
          type="button"
          class="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
          @click="editOpen = true"
        >
          Editar
        </button>
      </div>

      <section v-if="task.is_owner" class="mt-8 border-t border-slate-200 pt-6">
        <h2 class="font-semibold text-slate-800 mb-2">Colaboradores</h2>
        <form class="flex flex-wrap gap-2 mb-4" @submit.prevent="addCollab">
          <input
            v-model="collabEmail"
            type="email"
            required
            placeholder="E-mail do usuário"
            class="border rounded px-3 py-2 flex-1 min-w-[200px]"
          />
          <button
            type="submit"
            class="rounded bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700"
          >
            Adicionar
          </button>
        </form>
        <ul class="space-y-2">
          <li
            v-for="c in collaborators"
            :key="c.id"
            class="flex items-center justify-between rounded border border-slate-100 bg-white px-3 py-2"
          >
            <span>{{ c.name }} ({{ c.email }})</span>
            <button
              type="button"
              class="text-sm text-red-600 hover:underline"
              @click="removeCollab(c.id)"
            >
              Remover
            </button>
          </li>
        </ul>
        <p v-if="!collaborators.length" class="text-slate-500 text-sm">Nenhum colaborador.</p>
      </section>
    </div>

    <div
      v-if="editOpen && task"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      @click.self="editOpen = false"
    >
      <form
        class="bg-white rounded-lg shadow max-w-lg w-full p-6 space-y-4"
        @submit.prevent="saveEdit"
      >
        <h2 class="text-lg font-semibold">Editar tarefa</h2>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Título</label>
          <input v-model="editForm.title" required class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Descrição</label>
          <textarea
            v-model="editForm.description"
            rows="3"
            class="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Categoria</label>
          <select v-model="editForm.categoryId" class="w-full border rounded px-3 py-2">
            <option :value="''">(nenhuma)</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-slate-600 mb-1">Status</label>
          <select v-model="editForm.status" class="w-full border rounded px-3 py-2">
            <option value="todo">A fazer</option>
            <option value="in_progress">Em progresso</option>
            <option value="done">Concluída</option>
          </select>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="px-4 py-2 text-slate-600" @click="editOpen = false">
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
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { http } from '../api/http';

const route = useRoute();
const task = ref(null);
const categories = ref([]);
const collaborators = ref([]);
const loading = ref(true);
const error = ref('');
const collabEmail = ref('');
const editOpen = ref(false);
const editForm = ref({
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
    const id = route.params.id;
    const [tRes, cRes] = await Promise.all([
      http.get(`/api/tasks/${id}`),
      http.get('/api/categories'),
    ]);
    task.value = tRes.data;
    categories.value = cRes.data;
    editForm.value = {
      title: task.value.title,
      description: task.value.description || '',
      categoryId: task.value.category_id || '',
      status: task.value.status,
    };
    if (task.value.is_owner) {
      const colRes = await http.get(`/api/tasks/${id}/collaborators`);
      collaborators.value = colRes.data;
    } else {
      collaborators.value = [];
    }
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao carregar';
    task.value = null;
  } finally {
    loading.value = false;
  }
}

async function addCollab() {
  error.value = '';
  try {
    await http.post(`/api/tasks/${route.params.id}/collaborators`, {
      email: collabEmail.value,
    });
    collabEmail.value = '';
    const colRes = await http.get(`/api/tasks/${route.params.id}/collaborators`);
    collaborators.value = colRes.data;
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao adicionar';
  }
}

async function removeCollab(userId) {
  const id = route.params.id;
  try {
    await http.delete(`/api/tasks/${id}/collaborators/${userId}`);
    collaborators.value = collaborators.value.filter((c) => c.id !== userId);
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao remover';
  }
}

async function saveEdit() {
  const id = route.params.id;
  const payload = {
    title: editForm.value.title,
    description: editForm.value.description || undefined,
    status: editForm.value.status,
    categoryId: editForm.value.categoryId || null,
  };
  try {
    const { data } = await http.put(`/api/tasks/${id}`, payload);
    task.value = data;
    editOpen.value = false;
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao salvar';
  }
}

watch(
  () => route.params.id,
  () => {
    load();
  }
);

onMounted(load);
</script>
