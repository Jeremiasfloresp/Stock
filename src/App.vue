<template>
  <header class="header">
    <div class="banner">
      <h1>VETERINARIA ARZAC</h1>
    </div>
    <nav>
      <router-link to="/">Gestor Stock</router-link> |
      <router-link to="/clientes">Clientes</router-link> |
      <router-link to="/recordatorios">Recordatorios</router-link> |
      <router-link to="/nota-pedido">Venta</router-link> 
    </nav>
  </header>

  <main>
    <router-view />
  </main>
</template>

<style>
body {
  margin: 0;
  background-color: #f5f7fa; /* azul claro/grisáceo */
}

/* Contenedor que agrupa h1 y nav */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column; /* uno abajo del otro */
  background: rgb(129, 169, 235);
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.banner h1 {
  margin: 0;
  padding: 0.25em;
  text-align: left;
}

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

/* Le damos espacio al contenido para que no quede tapado */
main {
  position: relative;
  top: 20px;
  left: 0px;
}
</style>