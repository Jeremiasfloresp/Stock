<template>
  <div>
    <nav>
      <router-link to="/">Gestor Stock</router-link> |
      <router-link to="/clientes">Clientes</router-link>|
      <router-link to="/nota-pedido">Nota Pedido</router-link> 
    </nav>
    <router-view />
  </div>
</template>

<style>
nav {
  background-color: #f0f0f0;
  padding: 1em;
}
nav a {
  margin: 0 1em;
  text-decoration: none;
  color: #333;
}
nav a.router-link-exact-active {
  font-weight: bold;
  color: #42b983;
}
</style>