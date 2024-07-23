<script setup>
</script>

<template>
  <div class="p-4 overflow-y-scroll">

    <div class="grid gap-4">
      <div class="relative flex items-center justify-between rounded-md">
        <div class="fade absolute top-0 left-0 z-20 w-full h-full grid rejilla rounded-md">
  
          <div class="inventario">
            <h2 class="text-gray-200 p-4 text-lg font-medium">Inventario</h2>
            <div class="flex items-center justify-between">
  
              <p class="p-4 text-gray-400 pt-0 flex-1 text-sm">El módulo de inventario gestiona el stock, escanea artículos y los
                clasifica como escaneados o no escaneados.</p>
              <div class="p-4 pt-0"><router-link to="/inventario"
                  class="text-gray-100 border border-solid border-[#ddd] px-4 py-2 rounded-sm">Continuar</router-link>
              </div>
            </div>
          </div>
  
        </div>
        <img src="../../public/inventario.jpg" class="block w-full rounded-md h-[200px] object-cover">
  
      </div>

      <div class="relative flex items-center justify-between rounded-md">
        <div class="fade absolute top-0 left-0 z-20 w-full h-full grid rejilla rounded-md">
  
          <div class="inventario">
            <h2 class="text-gray-200 p-4 text-lg font-medium">Precio de Venta</h2>
            <div class="flex items-center justify-between">
  
              <p class="p-4 text-gray-400 pt-0 flex-1 text-sm">El módulo de ventas permite a los usuarios calcular y visualizar el margen de ganancias de manera precisa y eficiente.</p>
              <div class="p-4 pt-0"><router-link to="/precio-venta"
                  class="text-gray-100 border border-solid border-[#ddd] px-4 py-2 rounded-sm">Continuar</router-link>
              </div>
            </div>
          </div>
  
        </div>
        <img src="../../public/ventas.jpg" class="block w-full rounded-md h-[200px] object-cover">
  
      </div>


      <div class="relative flex items-center justify-between rounded-md">
        <div class="fade absolute top-0 left-0 z-20 w-full h-full grid rejilla rounded-md">
  
          <div class="inventario">
            <h2 class="text-gray-200 p-4 text-lg font-medium">Calcular Intereses</h2>
            <div class="flex items-center justify-between">
  
              <p class="p-4 text-gray-400 pt-0 flex-1 text-sm">El módulo de interés calcula de manera precisa cuánto se ha acumulado en intereses según los días transcurridos.</p>
              <div class="p-4 pt-0"><router-link to="/inventario"
                  class="text-gray-100 border border-solid border-[#ddd] px-4 py-2 rounded-sm">Continuar</router-link>
              </div>
            </div>
          </div>
  
        </div>
        <img src="../../public/interes.jpg" class="block w-full rounded-md h-[200px] object-cover">
  
      </div>

      <div class="relative flex items-center justify-between rounded-md">
        <div class="fade absolute top-0 left-0 z-20 w-full h-full grid rejilla rounded-md">
  
          <div class="inventario">
            <h2 class="text-gray-200 p-4 text-lg font-medium">Meta</h2>
            <div class="flex items-center justify-between">
  
              <p class="p-4 text-gray-400 pt-0 flex-1 text-sm">El módulo de metas calcula el ingreso necesario para alcanzar los objetivos financieros establecidos.</p>
              <div class="p-4 pt-0"><router-link to="/inventario"
                  class="text-gray-100 border border-solid border-[#ddd] px-4 py-2 rounded-sm">Continuar</router-link>
              </div>
            </div>
          </div>
  
        </div>
        <img src="../../public/meta.jpg" class="block w-full rounded-md h-[200px] object-cover">
  
      </div>
    </div>
  </div>
</template>
<style>
.sombra {
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, .2);
}

.fade {
  background: rgb(0, 0, 0);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5446953781512605) 30%, rgba(0, 0, 0, 0.96) 70%);
}

.rejilla {
  grid-template-rows: 1fr 1fr;
}

.inventario {
  grid-row-start: 2;
}
</style>