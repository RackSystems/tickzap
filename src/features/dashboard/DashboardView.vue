<template>
  <div class="p-6 space-y-6">
    <!-- Título e filtros -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center">
      <h1 class="text-2xl font-bold">Dashboard de Tickets</h1>
      <div class="flex flex-wrap gap-2 mt-4 md:mt-0">
        <input type="date" class="input input-bordered input-sm" />
        <select class="select select-bordered select-sm">
          <option>Status: Todos</option>
          <option>Abertos</option>
          <option>Fechados</option>
          <option>Em andamento</option>
        </select>
      </div>
    </div>

    <!-- Cards principais -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="card-title">Total de Tickets</h2>
          <p class="text-2xl font-bold">1.284</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="card-title">Contatos</h2>
          <p class="text-2xl font-bold">872</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="card-title">Atendentes Ativos</h2>
          <p class="text-2xl font-bold">12</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="card-title">Canal Mais Usado</h2>
          <p class="text-lg">WhatsApp</p>
        </div>
      </div>
    </div>
  </div>
</template>
