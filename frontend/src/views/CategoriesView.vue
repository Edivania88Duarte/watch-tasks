<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-800 mb-6">Categorias</h1>
    <p v-if="error" class="text-sm text-red-600 mb-4">{{ error }}</p>
    <form class="flex flex-wrap gap-2 mb-4" @submit.prevent="create">
      <input
        v-model="newName"
        type="text"
        required
        placeholder="Nome da categoria"
        class="border rounded px-3 py-2 flex-1 min-w-[200px]"
      />
      <button
        type="submit"
        class="rounded bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700"
      >
        Adicionar
      </button>
    </form>
    <div v-if="loading" class="text-slate-600">Carregando…</div>
    <ul v-else class="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      <li
        v-for="c in categories"
        :key="c.id"
        class="flex items-center justify-between px-4 py-3 gap-2"
      >
        <template v-if="editing === c.id">
          <input v-model="editName" class="border rounded px-2 py-1 flex-1" />
          <button type="button" class="text-sm text-slate-600" @click="editing = null">Cancelar</button>
          <button
            type="button"
            class="text-sm text-indigo-600"
            @click="save(c.id)"
          >
            Salvar
          </button>
        </template>
        <template v-else>
          <span>{{ c.name }}</span>
          <div class="flex gap-2">
            <button
              type="button"
              class="text-sm text-slate-600 hover:underline"
              @click="startEdit(c)"
            >
              Editar
            </button>
            <button
              type="button"
              class="text-sm text-red-600 hover:underline"
              @click="remove(c)"
            >
              Excluir
            </button>
          </div>
        </template>
      </li>
    </ul>
    <p v-if="!loading && !categories.length" class="text-slate-500 mt-4">Nenhuma categoria.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { http } from '../api/http';

const categories = ref([]);
const loading = ref(true);
const error = ref('');
const newName = ref('');
const editing = ref(null);
const editName = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await http.get('/api/categories');
    categories.value = data;
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao carregar';
  } finally {
    loading.value = false;
  }
}

async function create() {
  try {
    await http.post('/api/categories', { name: newName.value });
    newName.value = '';
    await load();
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao criar';
  }
}

function startEdit(c) {
  editing.value = c.id;
  editName.value = c.name;
}

async function save(id) {
  try {
    await http.put(`/api/categories/${id}`, { name: editName.value });
    editing.value = null;
    await load();
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao salvar';
  }
}

async function remove(c) {
  if (!confirm(`Excluir "${c.name}"?`)) return;
  try {
    await http.delete(`/api/categories/${c.id}`);
    await load();
  } catch (e) {
    error.value = e.response?.data?.error || 'Erro ao excluir';
  }
}

onMounted(load);
</script>
