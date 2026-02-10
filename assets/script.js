/* ===== N&C Estética — JS con SITE_CONFIG ===== */

// Helpers
function $(sel) { return document.querySelector(sel); }
function setText(id, val) { const el = document.getElementById(id); if (el && val) el.textContent = val; }
function setHref(id, val) { const el = document.getElementById(id); if (el && val) el.href = val; }

const CFG = (typeof window !== 'undefined' ? window.SITE_CONFIG : null) || {};

// --- Navbar móvil
const toggle = $('.nav-toggle');
const menu = document.getElementById('menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// --- Año y nombre de marca
setText('year', new Date().getFullYear());
if (CFG.nombre_salon) {
  setText('brand-name', CFG.nombre_salon);
  const brandLogo = document.getElementById('brand-logo');
  if (brandLogo && CFG.logo_url) {
    brandLogo.src = CFG.logo_url;
    brandLogo.alt = `Logo ${CFG.nombre_salon}`;
  }
}

// --- Contacto visible + enlaces tel/mailto
if (CFG.telefono_visible && CFG.telefono) {
  const telLink = document.getElementById('tel-link');
  if (telLink) {
    telLink.textContent = CFG.telefono_visible;
    telLink.href = `tel:${CFG.telefono}`;
  }
}
if (CFG.email) {
  const emailLink = document.getElementById('email-link');
  if (emailLink) {
    emailLink.textContent = CFG.email;
    emailLink.href = `mailto:${CFG.email}`;
  }
}
if (CFG.direccion_calle && CFG.codigo_postal && CFG.ciudad) {
  setText('dir-text', `${CFG.direccion_calle}, ${CFG.codigo_postal} ${CFG.ciudad}`);
}

// --- Horarios
setText('horario-lun', CFG.horario_lun || '');
setText('horario-mv', CFG.horario_m_v || '');
setText('horario-sab', CFG.horario_sab || '');
setText('horario-dom', CFG.horario_dom || '');

// --- Legales
setText('cif', CFG.cif || '');
setHref('link-legal', CFG.url_aviso_legal || '#');
setHref('link-privacidad', CFG.url_privacidad || '#');
setHref('link-privacidad-footer', CFG.url_privacidad || '#');
setHref('link-cookies', CFG.url_cookies || '#');

// --- Redes sociales
setHref('link-ig', CFG.url_instagram || '#');
setHref('link-fb', CFG.url_facebook || '#');
setHref('link-tt', CFG.url_tiktok || '#');

// --- Mapa (iframe embebido con dirección aproximada en Google Maps)
// Puedes sustituir esta generación por el embed oficial si lo tienes
const map = document.getElementById('map-iframe');
if (map && CFG.direccion_calle && CFG.ciudad) {
  const q = encodeURIComponent(`${CFG.direccion_calle}, ${CFG.codigo_postal || ''} ${CFG.ciudad}, España`);
  // Usamos un embed genérico; idealmente pega tu IFRAME oficial de Google Maps
  map.src = `https://maps.google.com/maps?q=${q}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

// --- SEO dinámico básico (title, desc, OG)
if (CFG.titulo) document.title = CFG.titulo;
const setMeta = (sel, attr, val) => {
  let el = document.querySelector(sel);
  if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
  el.setAttribute(attr, val);
};
if (CFG.descripcion) setMeta('meta[name="description"]', 'name', 'description'), setMeta('meta[name="description"]', 'content', CFG.descripcion);
if (CFG.url_web) setMeta('meta[property="og:url"]', 'property', 'og:url'), setMeta('meta[property="og:url"]', 'content', CFG.url_web);
if (CFG.og_image) setMeta('meta[property="og:image"]', 'property', 'og:image'), setMeta('meta[property="og:image"]', 'content', CFG.og_image);

// --- Fecha mínima = hoy (formulario)
const inputFecha = document.getElementById('fecha');
if (inputFecha) {
  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
  const hoyISO = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  inputFecha.min = hoyISO;
}

// --- CTA WhatsApp dinámico
const form = document.getElementById('booking-form');
const statusEl = document.getElementById('form-status');
const ctaWhats = document.getElementById('cta-whatsapp');

const WHATS_NUMBER = CFG.telefono || ''; // usa el mismo número principal para WhatsApp por defecto

function buildWhatsAppLink(data) {
  const salon = CFG.nombre_salon || 'Nuestro salón';
  const msg = `Hola, soy ${data.nombre || '-'}.
Quisiera reservar en ${salon}:
• Servicio: ${data.servicio || '-'}
• Fecha y hora: ${data.fecha || '-'} ${data.hora || ''}
• Teléfono: ${data.telefono || '-'}
• Email: ${data.email || '-'}
Comentarios: ${data.mensaje || '-'}

He leído y acepto la política de privacidad.`;
  const encoded = encodeURIComponent(msg);
  return WHATS_NUMBER ? `https://wa.me/${WHATS_NUMBER}?text=${encoded}` : '#';
}

if (ctaWhats && form) {
  const updateLink = () => {
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    ctaWhats.href = buildWhatsAppLink(data);
  };
  form.addEventListener('input', updateLink);
  updateLink();
}

// --- Envío del formulario (simulado; prepara Formspree si lo deseas)
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Enviando...';

    if (!form.reportValidity()) {
      statusEl.textContent = 'Revisa los campos requeridos.';
      return;
    }

    try {
      // Si tienes backend: descomenta y configura
      // const resp = await fetch(form.action, { method: form.method, body: new FormData(form), headers: { 'Accept': 'application/json' } });
      // if (!resp.ok) throw new Error('Error de envío');

      statusEl.textContent = 'Solicitud registrada. Te atenderemos en breve.';
      if (ctaWhats && ctaWhats.href && ctaWhats.href !== '#') {
        window.open(ctaWhats.href, '_blank', 'noopener');
      }
      form.reset();
    } catch (err) {
      statusEl.textContent = 'No se pudo enviar. Inténtalo de nuevo o usa WhatsApp.';
    }
  });
}

// --- Schema.org (BeautySalon + HairSalon) generado con SITE_CONFIG
(function injectSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["BeautySalon","HairSalon"],
    "name": CFG.nombre_salon || "N&C Estética",
    "image": CFG.og_image || "",
    "logo": CFG.logo_url || "",
    "telephone": CFG.telefono_visible ? CFG.telefono_visible.replace(/\s+/g, ' ') : "",
    "email": CFG.email || "",
    "url": CFG.url_web || "",
    "priceRange": CFG.price_range || "€€",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CFG.direccion_calle || "",
      "postalCode": CFG.codigo_postal || "",
      "addressLocality": CFG.ciudad || "",
      "addressCountry": "ES"
    },
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": CFG.abre_l_v || "10:00", "closes": CFG.cierra_l_v || "20:30" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": CFG.abre_sab || "10:00", "closes": CFG.cierra_sab || "14:00" }
    ],
    "sameAs": [CFG.url_instagram, CFG.url_facebook, CFG.url_tiktok].filter(Boolean),
    "makesOffer": [
      { "@type":"Offer", "name":"Lavado + Corte + Peinado (Mujer)", "price":"22", "priceCurrency":"EUR" },
      { "@type":"Offer", "name":"Corte (Hombre)", "price":"12", "priceCurrency":"EUR" },
      { "@type":"Offer", "name":"Tinte raíz", "price":"28", "priceCurrency":"EUR" },
      { "@type":"Offer", "name":"Mechas", "price":"45", "priceCurrency":"EUR" },
      { "@type":"Offer", "name":"Facial limpieza", "price":"28", "priceCurrency":"EUR" },
      { "@type":"Offer", "name":"Manicura clásica", "price":"12", "priceCurrency":"EUR" }
    ]
  };

  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(schema);
  document.head.appendChild(s);
})();