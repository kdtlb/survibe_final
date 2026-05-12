# Cómo editar los recorridos

Todo vive en **un solo archivo**: `expediciones-data.js`.
No hace falta tocar el HTML ni `app.js` para modificar textos, imágenes, mapas, perfiles de altura o datos generales.

La página quedó configurada con una sola categoría visible:

```js
categorias: ['conociendo-tarija']
```

El nombre que se muestra en la página es **CONOCIENDO TARIJA**.

---

## Recorridos cargados

1. Camino del Inca
2. Cascada Escondida de Pinos
3. De Cochas a Trancas
4. El Morao
5. De Lazareto a la Victoria
6. Laguna Brava

Cada recorrido es independiente. Podés cambiar las imágenes, textos, precio, dificultad, mapa o gráfico de un recorrido sin afectar a los demás.

---

## Cambiar imágenes

En cada bloque buscá:

```js
imagenes: {
  thumb: '...',
  card: '...',
  hero: '...',
  galeria: ['...', '...', '...']
}
```

- `thumb`: imagen cuadrada pequeña del catálogo.
- `card`: imagen de tarjeta/home.
- `hero`: imagen grande de la página individual.
- `galeria`: imágenes adicionales de la página individual.

Las imágenes actuales son de ejemplo. Para reemplazarlas por archivos propios, creá una carpeta `imagenes/` junto a los HTML y usá rutas así:

```js
imagenes: {
  thumb: 'imagenes/camino-del-inca-thumb.jpg',
  card: 'imagenes/camino-del-inca-card.jpg',
  hero: 'imagenes/camino-del-inca-hero.jpg',
  galeria: [
    'imagenes/camino-del-inca-1.jpg',
    'imagenes/camino-del-inca-2.jpg',
    'imagenes/camino-del-inca-3.jpg'
  ]
}
```

Tamaños recomendados: `thumb` 500×500, `card` 1200×900, `hero` 2400×1400.

---

## Agregar otro recorrido a futuro

1. Abrí `expediciones-data.js`.
2. Copiá un bloque completo `{ ... }` de cualquier recorrido existente.
3. Pegalo antes del cierre final del arreglo `EXPEDICIONES`.
4. Cambiá `id`, `numero`, `titulo`, textos, imágenes y datos.
5. Mantené la categoría:

```js
categorias: ['conociendo-tarija']
```

---

## Campos principales

```js
{
  id: 'nombre-unico-en-minusculas-con-guiones',
  numero: '07',
  titulo: 'Nuevo Recorrido',
  region: 'Conociendo Tarija',
  ubicacion: 'Tarija',
  categorias: ['conociendo-tarija'],
  dificultad: 'Moderada',
  duracion: '1 día',
  duracionCorta: '1d',
  distancia: '8 km',
  altitudMax: '3.200 m',
  precio: 'Consultar',
  descripcionCorta: 'Texto corto para tarjetas.',
  descripcionHero: 'Subtítulo para la página individual.',
  descripcionRecorrido: 'Texto que aparece en el apartado Descripción del recorrido.',
  imagenes: { ... },
  chart: { distancia: [...], elevacion: [...] },
  mapa: { centro: [...], ruta: [...] }
}
```

Dificultades recomendadas: `Suave`, `Moderada`, `Exigente`.

---

## Qué no tocar

- No necesitás editar `app.js` para agregar recorridos.
- No necesitás editar `expediciones.html` para que aparezcan en el catálogo.
- Evitá nombres de imágenes con espacios o tildes. Usá nombres como `laguna-brava-hero.jpg`.

## Corrección del mapa

La página ahora tiene un respaldo automático: si Leaflet, `leaflet.css` o los mosaicos online no cargan, el sistema dibuja un mapa referencial en SVG usando las coordenadas de `mapa.ruta`. Así el recorrido no queda como un cuadro negro.

Para que el mapa interactivo cargue correctamente, abrí la página con conexión a internet. Si querés probarlo de forma más estable, es recomendable abrir el proyecto con un servidor local, por ejemplo con Live Server en VS Code.

## Nota sobre el mapa

La página ya no usa directamente los mosaicos de `tile.openstreetmap.org`, porque al abrir el sitio como archivo local algunos navegadores no envían `Referer` y OpenStreetMap puede mostrar un aviso 403. Ahora el mapa usa una capa satelital de Google Maps y, si la capa online falla, se dibuja automáticamente un mapa referencial en SVG con la ruta para que el recorrido nunca quede como un cuadro negro.

Nota: esta versión usa mosaicos satelitales de Google para facilitar la prueba visual. Para un sitio público, comercial o definitivo, lo recomendable es integrar Google Maps con una API key propia mediante la API oficial de Google Maps.
