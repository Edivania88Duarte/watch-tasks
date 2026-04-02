<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-10">
    <form
      class="w-full max-w-md bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-8 space-y-4"
      @submit.prevent="submit"
    >
      <h1 class="text-xl font-semibold text-slate-800">Entrar</h1>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
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
        <label class="block text-sm text-slate-600 mb-1">Senha</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full border border-slate-300 rounded px-3 py-2"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </button>
      <p class="text-sm text-center text-slate-600">
        Não tem conta?
        <router-link to="/register" class="text-indigo-600 hover:underline">Cadastre-se</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login({ email: email.value, password: password.value });
    const redirect = route.query.redirect || '/';
    router.push(typeof redirect === 'string' ? redirect : '/');
  } catch (e) {
    error.value = e.response?.data?.error || 'Falha no login';
  } finally {
    loading.value = false;
  }
}
</script>
