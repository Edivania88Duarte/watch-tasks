<template>
  <div class="min-h-screen flex flex-col">
    <header
      class="border-b border-white/10 bg-slate-950/40 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/30"
    >
      <div
        class="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 w-full sm:w-auto">
          <router-link
            to="/"
            class="font-semibold text-white tracking-tight shrink-0"
          >
            Watch Tasks
          </router-link>
          <nav class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <router-link
              v-for="l in links"
              :key="l.to"
              :to="l.to"
              class="text-slate-200 hover:text-white"
              active-class="text-indigo-300 font-medium"
            >
              {{ l.label }}
            </router-link>
          </nav>
        </div>
        <div v-if="auth.user" class="text-sm text-slate-200 w-full sm:w-auto text-left sm:text-right">
          <span class="mr-3 block sm:inline">{{ auth.user.name }}</span>
          <button
            type="button"
            class="text-indigo-300 hover:text-indigo-200 hover:underline"
            @click="onLogout"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div
        class="rounded-2xl border border-white/15 bg-white/90 backdrop-blur-md shadow-xl shadow-slate-900/20 px-4 py-6 sm:px-8 sm:py-8"
      >
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const links = [
  { to: '/', label: 'Início' },
  { to: '/tasks', label: 'Tarefas' },
  { to: '/categories', label: 'Categorias' },
  { to: '/reports', label: 'Relatórios' },
];

function onLogout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>
