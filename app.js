/* SURVIBE — JS principal
   ------------------------------------------------------------
   Este archivo hace TRES cosas:
     1. Interacciones generales (nav, scroll, filtros).
     2. Renderiza el catálogo, las destacadas y la página de
        detalle leyendo de `expediciones-data.js`.
     3. Dibuja el gráfico de elevación y el mapa cuando la
        expedición los tiene definidos.
   No hace falta editarlo para agregar expediciones.
   ------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- NAV: scroll & toggle ---------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => document.body.classList.remove('nav-open'));
    });
  }

  /* ---------------- Renderers ---------------- */
  // Si las variables del archivo de datos existen en la página, usamos los renderers.
  if (typeof EXPEDICIONES !== 'undefined') {
    renderDestacadas();        // Home: tarjetas destacadas
    renderCatalogo();          // Página de catálogo: lista completa
    renderExpedicionDetail();  // Página de detalle: todo a partir del ?id=
  }

  /* ---------------- Scroll reveal ---------------- */
  // Se aplica DESPUÉS de renderizar, para que los elementos inyectados
  // por JS también aparezcan con animación.
  activarReveal();

  /* ---------------- Filtros del catálogo ---------------- */
  activarFiltros();
});


/* ============================================================
   RENDER — TARJETAS DESTACADAS (index.html)
   Busca el contenedor [data-destacadas] y lo llena con las
   recorridos que tengan destacado:true (máx. 6).
   ============================================================ */
function renderDestacadas() {
  const wrap = document.querySelector('[data-destacadas]');
  if (!wrap) return;

  const destacadas = EXPEDICIONES.filter(e => e.destacado).slice(0, 6);

  wrap.innerHTML = destacadas.map((e, i) => `
    <a href="expedicion.html?id=${e.id}" class="exp-card reveal${i % 2 === 1 ? ' offset' : ''}">
      <div class="exp-card-img">
        <span class="exp-card-tag ${diffClass(e.dificultad)}">${e.dificultad}</span>
        <span class="exp-card-num">N°${e.numero}</span>
        <img src="${e.imagenes.card}" alt="${escapeHtml(e.titulo)}" loading="lazy" />
      </div>
      <div class="exp-card-meta" style="color: rgba(241,234,216,.6);">
        <span>${escapeHtml(e.region)}</span>
        <span>${escapeHtml(e.ubicacion)} · Bolivia</span>
      </div>
      <h3 style="color: var(--sand);">${escapeHtml(e.titulo)}</h3>
      <p style="color: rgba(241,234,216,.7);">${escapeHtml(e.descripcionCorta)}</p>
      <div class="exp-card-foot" style="border-color: rgba(241,234,216,.15); color: rgba(241,234,216,.6);">
        <span>${e.duracion} · ${e.distancia} · ${e.altitudMax}</span>
        <span class="price" style="color: var(--clay-2);">${escapeHtml(e.precio)}</span>
      </div>
    </a>
  `).join('');
}


/* ============================================================
   RENDER — CATÁLOGO (expediciones.html)
   Busca [data-catalogo] y lo llena con TODAS las expediciones.
   ============================================================ */
function renderCatalogo() {
  const wrap = document.querySelector('[data-catalogo]');
  if (!wrap) return;

  wrap.innerHTML = EXPEDICIONES.map(e => `
    <a href="expedicion.html?id=${e.id}" class="catalog-row reveal" data-cat="${e.categorias.join(' ')}">
      <span class="cidx">N°${e.numero}</span>
      <div class="crow-main">
        <div class="cthumb"><img src="${e.imagenes.thumb}" alt="" loading="lazy"></div>
        <div>
          <h3>${escapeHtml(e.titulo)}</h3>
          <div class="cmeta">${escapeHtml(e.region)} · ${escapeHtml(e.ubicacion)}</div>
        </div>
      </div>
      <div class="cinfo">
        <span><strong>${e.duracionCorta}</strong> duración</span>
        <span><strong>${escapeHtml(e.distancia)}</strong></span>
        <span><strong>${escapeHtml(e.altitudMax)}</strong> máx.</span>
        <span><strong>${e.dificultad}</strong></span>
      </div>
      <div class="cprice">${escapeHtml(e.precio)}</div>
    </a>
  `).join('');

  // Actualizar el contador del hero si existe
  const counter = document.querySelector('[data-count]');
  if (counter) {
    counter.textContent = `${EXPEDICIONES.length} recorridos`;
  }
}


/* ============================================================
   RENDER — PÁGINA DE DETALLE (expedicion.html)
   Lee ?id=xxx de la URL, busca la expedición y llena todo.
   Si una sección no tiene datos, la oculta.
   ============================================================ */
function renderExpedicionDetail() {
  const root = document.querySelector('[data-exp-root]');
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get('id');
  const e = id ? getExpedicionById(id) : null;

  // Si no hay id válido, volvemos al catálogo
  if (!e) {
    window.location.href = 'expediciones.html';
    return;
  }

  // --- META (título de pestaña y descripción) ---
  document.title = `${e.titulo} · ${e.region} — survibe`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', e.metaDescripcion || e.descripcionCorta);

  // --- HERO ---
  setHtml('[data-hero-img]',    `<img class="zoom-slow" src="${e.imagenes.hero}" alt="${escapeHtml(e.region)}" />`);
  setText('[data-hero-tag]',    `N°${e.numero} · Survibe presenta — ${e.region}`);
  setHtml('[data-hero-title]',  e.tituloIt
    ? formatTitulo(e.titulo, e.tituloIt)
    : `${escapeHtml(e.titulo)}.`);
  setText('[data-hero-sub]',    e.descripcionHero || e.descripcionCorta);

  setText('[data-stat-dist]',   e.distancia.replace(/\s*km\s*$/i, ''));
  setText('[data-stat-alt]',    e.altitudMax.replace(/\s*m\s*$/i, ''));
  setText('[data-stat-dur]',    e.duracionCorta.replace(/\D/g, '') || '1');
  setText('[data-stat-diff]',   e.dificultad);

  // --- DESCRIPCIÓN DEL RECORRIDO ---
  const descWrap = document.querySelector('[data-recorrido-descripcion]');
  if (descWrap) {
    const descripcion = e.descripcionRecorrido || e.descripcionCorta || e.descripcionHero;
    if (descripcion) {
      descWrap.innerHTML = `<p>${escapeHtml(descripcion)}</p>`;
    } else {
      hideSection(descWrap);
    }
  }

  // --- SPECS (opcional) ---
  const specsWrap = document.querySelector('[data-specs]');
  if (specsWrap) {
    const rows = [
      ['Distancia total',    e.distancia],
      ['Desnivel positivo',  e.specs?.desnivelPositivo],
      ['Desnivel negativo',  e.specs?.desnivelNegativo],
      ['Altitud máxima',     e.altitudMax],
      ['Altitud mínima',     e.specs?.altitudMinima],
      ['Tipo de recorrido',  e.specs?.tipoRecorrido],
      ['Temporada',          e.specs?.temporada],
      ['Tamaño del grupo',   e.specs?.tamanoGrupo],
      ['Inversión',          e.precio, true]
    ].filter(r => r[1]);

    specsWrap.innerHTML = rows.map(([k, v, highlight]) => `
      <div class="spec-row">
        <span class="key">${escapeHtml(k)}</span>
        <span class="val"${highlight ? ' style="color: var(--clay-2);"' : ''}>${escapeHtml(v)}</span>
      </div>
    `).join('');
  }

  // --- INCLUYE / LLEVÁS / TENER EN CUENTA (opcional) ---
  renderLista('[data-incluye]',     e.incluye);
  renderLista('[data-llevas]',      e.llevas);
  renderLista('[data-tener]',       e.tenerCuenta);
  // Si NINGUNA de las tres tiene contenido, ocultamos toda la sección
  if (!e.incluye && !e.llevas && !e.tenerCuenta) {
    hideSection(document.querySelector('[data-seccion-incluye]'));
  }

  // --- GALERÍA (opcional) ---
  const galWrap = document.querySelector('[data-galeria]');
  if (galWrap) {
    if (Array.isArray(e.imagenes.galeria) && e.imagenes.galeria.length) {
      galWrap.innerHTML = e.imagenes.galeria.map(src => `
        <div class="gallery-item reveal"><img src="${src}" alt="" loading="lazy"/></div>
      `).join('');
    } else {
      hideSection(galWrap);
    }
  }

  // --- RELACIONADAS ---
  const relWrap = document.querySelector('[data-relacionadas]');
  if (relWrap) {
    const relacionadas = getRelatedExpediciones(e.id, 3);
    relWrap.innerHTML = relacionadas.map(r => `
      <a href="expedicion.html?id=${r.id}" class="exp-card reveal" style="margin:0;">
        <div class="exp-card-img" style="aspect-ratio: 4/4;">
          <span class="exp-card-tag ${diffClass(r.dificultad)}">${r.dificultad}</span>
          <img src="${r.imagenes.card}" alt="${escapeHtml(r.titulo)}" loading="lazy">
        </div>
        <div class="exp-card-meta"><span>${escapeHtml(r.region)}</span><span>${r.duracion}</span></div>
        <h3>${escapeHtml(r.titulo)}</h3>
      </a>
    `).join('');
  }

  // --- CHART (opcional) ---
  const chartCanvas = document.getElementById('elevationChart');
  if (chartCanvas) {
    if (e.chart && Array.isArray(e.chart.distancia) && Array.isArray(e.chart.elevacion)) {
      dibujarChart(chartCanvas, e.chart);
    } else {
      hideSection(chartCanvas);
    }
  }

  // --- MAPA (opcional) ---
  const mapEl = document.getElementById('map');
  if (mapEl) {
    if (e.mapa && Array.isArray(e.mapa.ruta) && e.mapa.ruta.length) {
      dibujarMapa(mapEl, e.mapa);
    } else {
      hideSection(mapEl);
    }
  }

  // Mostrar el body (evita flash de contenido vacío)
  root.removeAttribute('hidden');
}


/* ============================================================
   GRÁFICO DE ELEVACIÓN
   ============================================================ */
function dibujarChart(canvas, chart) {
  if (typeof Chart === 'undefined') return;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 400);
  grad.addColorStop(0, 'rgba(201, 102, 59, 0.32)');
  grad.addColorStop(1, 'rgba(201, 102, 59, 0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chart.distancia.map(d => `${d} km`),
      datasets: [{
        label: 'Elevación (m)',
        data: chart.elevacion,
        borderColor: '#c9663b',
        backgroundColor: grad,
        borderWidth: 2,
        pointBackgroundColor: '#1f2d22',
        pointBorderColor: '#f1ead8',
        pointBorderWidth: 1.5,
        pointRadius: 3,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0e1410',
          titleFont: { family: 'Geist Mono, monospace', size: 11 },
          bodyFont:  { family: 'Geist, sans-serif',     size: 13, weight: '500' },
          padding: 12,
          displayColors: false,
          callbacks: { label: c => c.parsed.y + ' m' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { family: 'Geist Mono, monospace', size: 10 }, color: '#0e1410aa', maxTicksLimit: 8 }
        },
        y: {
          grid: { color: 'rgba(14,20,16,.06)' },
          border: { display: false },
          ticks: { font: { family: 'Geist Mono, monospace', size: 10 }, color: '#0e1410aa', stepSize: 200 }
        }
      }
    }
  });
}


/* ============================================================
   MAPA LEAFLET
   ============================================================ */
function dibujarMapa(el, mapa) {
  const ruta = normalizarRuta(mapa.ruta);
  if (!ruta.length) {
    dibujarMapaEstatico(el, mapa, 'No hay coordenadas suficientes para dibujar el recorrido.');
    return;
  }

  // Respaldo inmediato: así el recorrido se ve incluso si Leaflet,
  // el CSS externo o los mosaicos del mapa no cargan.
  dibujarMapaEstatico(el, { ...mapa, ruta });

  if (typeof L === 'undefined') {
    return;
  }

  try {
    el.innerHTML = '';
    el.classList.add('has-leaflet-map');

    const m = L.map(el, {
      zoomControl: true,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: false,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true
    });

    // Capa base: Google Maps en vista satelital.
    // Nota: para un sitio público/comercial conviene reemplazar esto por la
    // integración oficial de Google Maps JavaScript API con una API key propia.
    delete el.dataset.staticFallback;
    let tileErrors = 0;
    const baseLayer = L.tileLayer(
      'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps'
      }
    );

    baseLayer.on('tileerror', () => {
      tileErrors += 1;
      if (tileErrors >= 3 && !el.dataset.staticFallback) {
        el.dataset.staticFallback = '1';
        try { m.remove(); } catch (_) {}
        dibujarMapaEstatico(
          el,
          { ...mapa, ruta },
          'El mapa online no pudo cargar, pero esta vista mantiene visible el recorrido con sus coordenadas.'
        );
      }
    });

    baseLayer.addTo(m);


    const trail = L.polyline(ruta, {
      color: '#c9663b',
      weight: 5,
      opacity: 0.98,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(m);

    const colorPorTipo = { inicio: '#1f2d22', final: '#1f2d22' };
    (mapa.marcadores || [])
      .filter(mk => mk.tipo !== 'cumbre' && !String(mk.label || '').toLowerCase().includes('punto destacado'))
      .forEach(mk => {
      const idx = mk.posicion < 0 ? ruta.length + mk.posicion : mk.posicion;
      const latlng = ruta[idx];
      if (!latlng) return;
      const marker = L.circleMarker(latlng, {
        radius: 8,
        color: '#f1ead8',
        weight: 2,
        fillColor: colorPorTipo[mk.tipo] || '#1f2d22',
        fillOpacity: 1
      }).addTo(m);
      marker.bindTooltip(mk.label, {
        permanent: true,
        direction: 'right',
        offset: [10, 0],
        className: 'leaflet-tip-custom'
      });
    });

    const bounds = trail.getBounds();
    m.fitBounds(bounds, { padding: [44, 44] });

    // Importante cuando el mapa está dentro de layouts con animación/reveal.
    setTimeout(() => {
      m.invalidateSize();
      m.fitBounds(bounds, { padding: [44, 44] });
    }, 250);
  } catch (err) {
    console.warn('No se pudo cargar Leaflet. Se muestra mapa referencial.', err);
    dibujarMapaEstatico(el, { ...mapa, ruta });
  }
}

function normalizarRuta(ruta) {
  if (!Array.isArray(ruta)) return [];
  return ruta
    .map(p => Array.isArray(p) ? [Number(p[0]), Number(p[1])] : null)
    .filter(p => p && Number.isFinite(p[0]) && Number.isFinite(p[1]));
}

function dibujarMapaEstatico(el, mapa, mensaje) {
  const ruta = normalizarRuta(mapa.ruta);
  if (!ruta.length) {
    el.innerHTML = '<div class="map-fallback empty-map">No hay coordenadas para este recorrido.</div>';
    return;
  }

  const padding = 42;
  const width = 900;
  const height = 620;
  const lats = ruta.map(p => p[0]);
  const lngs = ruta.map(p => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = Math.max(maxLat - minLat, 0.0001);
  const lngRange = Math.max(maxLng - minLng, 0.0001);

  const project = ([lat, lng]) => {
    const x = padding + ((lng - minLng) / lngRange) * (width - padding * 2);
    const y = height - padding - ((lat - minLat) / latRange) * (height - padding * 2);
    return [x, y];
  };

  const points = ruta.map(project);
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const inicio = points[0];
  const fin = points[points.length - 1];

  const marcadores = (mapa.marcadores || [])
    .filter(mk => mk.tipo !== 'cumbre' && !String(mk.label || '').toLowerCase().includes('punto destacado'))
    .map(mk => {
    const idx = mk.posicion < 0 ? ruta.length + mk.posicion : mk.posicion;
    const p = points[idx];
    if (!p) return '';
    const label = escapeHtml(mk.label || 'Punto');
    return `
      <g class="static-marker">
        <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="8"></circle>
        <text x="${(p[0] + 14).toFixed(1)}" y="${(p[1] - 12).toFixed(1)}">${label}</text>
      </g>`;
  }).join('');

  el.classList.remove('has-leaflet-map');
  el.innerHTML = `
    <div class="map-fallback" role="img" aria-label="Mapa referencial del recorrido">
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fallbackTerrain" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f1ead8"/>
            <stop offset="50%" stop-color="#d8c9a8"/>
            <stop offset="100%" stop-color="#9f9b75"/>
          </linearGradient>
          <pattern id="fallbackGrid" width="90" height="90" patternUnits="userSpaceOnUse">
            <path d="M 90 0 L 0 0 0 90" fill="none" stroke="rgba(31,45,34,.14)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#fallbackTerrain)"></rect>
        <rect width="${width}" height="${height}" fill="url(#fallbackGrid)"></rect>
        <path d="${path}" fill="none" stroke="rgba(14,20,16,.20)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="${path}" fill="none" stroke="#c9663b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
        <circle cx="${inicio[0].toFixed(1)}" cy="${inicio[1].toFixed(1)}" r="10" class="start-dot"></circle>
        <circle cx="${fin[0].toFixed(1)}" cy="${fin[1].toFixed(1)}" r="10" class="end-dot"></circle>
        ${marcadores}
      </svg>
      <div class="map-fallback-label">
        <strong>Recorrido referencial</strong>
        <span>${mensaje ? escapeHtml(mensaje) : 'Si el mapa online no carga, esta vista sigue mostrando la ruta con sus coordenadas.'}</span>
      </div>
    </div>`;
}


/* ============================================================
   UTILIDADES
   ============================================================ */
function activarReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }
}

function activarFiltros() {
  const filterPills = document.querySelectorAll('[data-filter]');
  const catalogRows = document.querySelectorAll('[data-cat]');
  if (!filterPills.length || !catalogRows.length) return;
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const target = pill.dataset.filter;
      catalogRows.forEach(row => {
        const cats = (row.dataset.cat || '').split(' ');
        const show = target === 'all' || cats.includes(target);
        row.style.display = show ? '' : 'none';
      });
    });
  });
}

function diffClass(dificultad) {
  const d = (dificultad || '').toLowerCase();
  if (d === 'suave')     return 'diff-easy';
  if (d === 'exigente')  return 'diff-hard';
  return 'diff-mid';
}

function formatTitulo(titulo, tituloIt) {
  // Pone la palabra `tituloIt` en itálica dentro del <h1>
  if (!tituloIt || !titulo.includes(tituloIt)) {
    return `${escapeHtml(titulo)}.`;
  }
  const idx = titulo.indexOf(tituloIt);
  const antes   = titulo.slice(0, idx);
  const despues = titulo.slice(idx + tituloIt.length);
  return `${escapeHtml(antes)}<br/><span class="it">${escapeHtml(tituloIt)}.</span>${escapeHtml(despues)}`;
}

function renderLista(selector, items) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (!Array.isArray(items) || !items.length) {
    // Si no hay datos, oculta el bloque padre (la "columna" de la grilla)
    const parent = el.closest('[data-grupo-incluye]') || el.parentElement;
    if (parent) parent.style.display = 'none';
    return;
  }
  el.innerHTML = items.map(i => `<li>· ${escapeHtml(i)}</li>`).join('');
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el && value != null) el.textContent = value;
}

function setHtml(selector, html) {
  const el = document.querySelector(selector);
  if (el && html != null) el.innerHTML = html;
}

function hideSection(el) {
  if (!el) return;
  const section = el.closest('section') || el;
  section.style.display = 'none';
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
