<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-10">
    <form
      class="w-full max-w-md bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-8 space-y-4"
      @submit.prevent="submit"
    >
      <h1 class="text-xl font-semibold text-slate-800">Criar conta</h1>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div>
        <label class="block text-sm text-slate-600 mb-1">Nome</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full border border-slate-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label class="block text-sm text-slate-600 mb-1">E-mail</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full border border-slate-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label class="block text-sm text-slate-600 mb-1">Senha (mín. 6)</label>
        <input
          v-model="password"
          type="password"
          required
          minlength="6"
          class="w-full border border-slate-300 rounded px-3 py-2"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Criando…' : 'Cadastrar' }}
      </button>
      <p class="text-sm text-center text-slate-600">
        Já tem conta?
        <router-link to="/login" class="text-indigo-600 hover:underline">Entrar</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const auth = useAuthStore();
const router = useRouter();

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    await auth.login({ email: email.value, password: password.value });
    router.push('/');
  } catch (e) {
    error.value = e.response?.data?.error || 'Não foi possível cadastrar';
  } finally {
    loading.value = false;
  }
}
</script>
