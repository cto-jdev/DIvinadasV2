/**
 * copilot-mock.js
 * DivinAds v2.0 — Claude Copilot Contextual Intelligence
 * Respuestas inteligentes por módulo con Quick Actions y alertas proactivas
 */

(function() {
  'use strict';

  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').replace('.html','');

  // ─── Respuestas contextuales por módulo ───
  const contextResponses = {
    index: [
      "📊 Tu ROAS promedio de los últimos 7 días es 3.2x — por encima del benchmark de la industria (2.5x). Tus campañas Advantage+ están capturando señales de AI Chat Intent correctamente.",
      "⚠️ Alerta de gasto: Has consumido el 78% del presupuesto mensual con 12 días restantes. Te sugiero reducir el daily budget de las campañas de prospecting en un 15%.",
      "✅ Todas tus cuentas pasan el test H.E.C. (Health, Employment, Credit). No tienes campañas con categoría especial sin declarar.",
      "🔄 Meta deprecará los caminos legacy de Advantage+ Shopping el 19 de mayo 2026. Tus 3 campañas ASC necesitan migrar a Automation Unification. ¿Quieres que inicie la migración?"
    ],
    ads: [
      "He analizado el Ad Account seleccionado. Tus campañas con objetivo 'Conversiones' tienen un CTR 2.3x mayor que las de 'Tráfico'. Considere migrar el presupuesto.",
      "⚡ Optimización detectada: Tu Advantage+ Audience está expandiendo a segmentos con +45% conversion rate. El algoritmo Andromeda está funcionando correctamente.",
      "📋 Recordatorio: Las ventanas de atribución 7-day view y 28-day view ya no son retornadas por la API desde enero 2026. Solo Click-through 7d y Engage-through 1d están activos.",
      "🎯 El CreativeAsset 'Video_Promo_03' tiene fatigue coefficient de 0.82. Recomendación: rotar el creativo para mantener CPM competitivo."
    ],
    bm: [
      "🔍 He auditado el Business Manager. 2 de 5 BMs tienen restricciones menores. Puedo preparar un borrador de apelación basado en Policy 4.2 (Prácticas Engañosas).",
      "📊 BM ACT_283847 muestra actividad inusual: 15 cambios de configuración en las últimas 24h. Esto puede activar el sistema de revisión automática de Meta.",
      "✅ Verificación de roles completada: Todos los administradores tienen 2FA habilitado. Cumples con los requisitos de seguridad de Meta Business Suite 2026.",
      "⚠️ El BM 'Marketing LATAM' tiene 3 páginas sin verificar. Las páginas no verificadas pierden acceso a Ads API después de 90 días. Quedan 12 días."
    ],
    page: [
      "📄 Las páginas con posting frecuency > 3/semana tienen 40% más engagement orgánico. 2 de tus 8 páginas están por debajo de este umbral.",
      "🎯 Tu página 'Tienda Online CO' tiene el mejor Quality Score: 8.4/10. Recomiendo usarla como landing principal para las campañas Advantage+.",
      "📊 El alcance orgánico promedio ha bajado 12% este mes. Es consistente con la tendencia global de Meta hacia paid reach. Considera aumentar boost budget.",
      "🔄 Meta lanzó Page Viewer Metrics para Graph API v22 (disponible junio 2026). Esto reemplazará las métricas de alcance legacy."
    ],
    clone: [
      "🔄 Sistema de clonación listo. Al clonar un Ad Account, considere que las Custom Audiences NO se copian (restricción de privacidad Meta 2026).",
      "⚡ Tip: Usa la clonación para crear versiones A/B de tus configuraciones de campaña. El algoritmo Advantage+ optimizará cada versión independientemente.",
      "✅ Los parámetros de clonación están configurados correctamente. Los 'excluded_custom_audiences' se ajustarán automáticamente a la convención de API v22."
    ],
    phoi: [
      "🖼️ El editor de plantillas está listo. Las imágenes de anuncios con contraste alto (>4.5:1) tienen 23% más CTR según los estudios de Meta Creative Best Practices 2026.",
      "📐 Formatos recomendados para 2026: Stories (9:16), Feed (1:1 y 4:5), Reels (9:16). La resolución mínima subió a 1080x1080px.",
      "🎨 Tip: Los anuncios con menos de 20% de texto en la imagen ya no tienen penalización directa, pero los creativos con texto mínimo aún performan 15% mejor orgánicamente."
    ],
    advantage: [
      "🤖 La automatización Advantage+ está funcionando en modo 'Automation Unification'. Esto es el estándar obligatorio para mayo 2026.",
      "📈 Tu campaña 'Retargeting Viewers' tiene el mejor ROAS (5.1x). Considera aumentar su budget share al 30% del total.",
      "⚠️ 'Prospecting Lookalike 2%' está en Learning Limited. Necesita al menos 50 conversiones/semana para salir de esta fase. Opciones: ampliar audiencia o bajar el CPA target.",
      "🧠 Señales de AI Chat Intent: Meta está detectando intención de compra de usuarios que mencionaron tus productos en conversaciones con Meta AI. Esto alimenta tu Advantage+ Audience automáticamente."
    ],
    pixel: [
      "🎯 Tu Event Match Quality es 8.2/10 — Excelente. Estás enviando email, phone, y fbp/fbc como parámetros del servidor. Esto maximiza la deduplicación.",
      "⚠️ El evento 'Search' tiene solo 62% de cobertura CAPI. Considera implementar el server-side tracking para este evento. Te doy el endpoint de ejemplo.",
      "📊 La tasa de deduplicación es del 30% — dentro del rango saludable (20-40%). Si sube de 50%, indica problemas de configuración del event_id.",
      "✅ Todos los eventos críticos (Purchase, Lead, AddToCart) tienen cobertura CAPI > 90%. Esto asegura tracking completo incluso con bloqueo de cookies."
    ],
    attribution: [
      "📊 Cambio importante: Desde marzo 2026, las conversiones por 'likes, shares, comments' ya no cuentan como Click-through. Se mueven a la nueva categoría Engage-through.",
      "🔍 Tu canal con mejor ROAS es Instagram Stories (6.5x). Considera reasignar 10% del budget de Facebook Feed hacia Stories para optimizar.",
      "📱 El 74% de tus conversiones vienen de Mobile (iOS + Android). La atribución mobile es más precisa con CAPI que con el Pixel browser. Tu cobertura está bien.",
      "⚡ Threads Ads tiene un CPA de $12.30, mayor que el promedio ($9.50). Es normal para un canal nuevo. El algoritmo necesita ~500 conversiones para optimizar."
    ]
  };

  let responseIndex = 0;

  function getContextPage() {
    if (contextResponses[currentPage]) return currentPage;
    return 'index';
  }

  // ─── UI Functions ───
  function appendMessage(text, isUser = false) {
    const messagesContainer = document.getElementById('copilotMessages');
    if (!messagesContainer) return;

    const div = document.createElement('div');
    div.className = `d-flex mb-3 ${isUser ? 'justify-content-end' : ''}`;

    if (isUser) {
      div.innerHTML = `
        <div><div class="p-3 bg-primary bg-opacity-25 border border-primary border-opacity-50 text-white" style="font-size:13px;line-height:1.5;border-radius:12px;border-top-right-radius:4px">${text}</div></div>
        <div class="rounded-circle bg-white bg-opacity-10 d-flex justify-content-center align-items-center ms-3 mt-1 flex-shrink-0" style="width:30px;height:30px;border:1px solid rgba(255,255,255,0.2)"><i class="ri-user-line" style="color:white;font-size:14px"></i></div>
      `;
    } else {
      div.innerHTML = `
        <div class="rounded-circle bg-primary bg-opacity-25 d-flex justify-content-center align-items-center me-3 mt-1 flex-shrink-0" style="width:30px;height:30px;border:1px solid rgba(56,189,248,0.5);box-shadow:0 0 10px rgba(56,189,248,0.3)"><img src="img/favicon.png" width="16"/></div>
        <div><div class="p-3 bg-white bg-opacity-10 border border-white border-opacity-10 text-white" style="font-size:13px;line-height:1.5;border-radius:12px;border-top-left-radius:4px">${text}</div></div>
      `;
    }

    messagesContainer.appendChild(div);
    const body = document.getElementById('copilotChat');
    if (body) body.scrollTop = body.scrollHeight;
  }

  function showTypingIndicator() {
    const messagesContainer = document.getElementById('copilotMessages');
    if (!messagesContainer) return;
    const div = document.createElement('div');
    div.id = 'copilotTyping';
    div.className = 'd-flex mb-3';
    div.innerHTML = `
      <div class="rounded-circle bg-primary bg-opacity-25 d-flex justify-content-center align-items-center me-3 mt-1 flex-shrink-0" style="width:30px;height:30px;border:1px solid rgba(56,189,248,0.5)"><img src="img/favicon.png" width="16"/></div>
      <div><div class="p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10 text-white d-flex align-items-center" style="font-size:13px;height:45px;border-top-left-radius:4px!important">
        <div class="spinner-grow spinner-grow-sm text-primary me-1" style="width:0.5rem;height:0.5rem"></div>
        <div class="spinner-grow spinner-grow-sm text-primary me-1" style="width:0.5rem;height:0.5rem;animation-delay:0.2s"></div>
        <div class="spinner-grow spinner-grow-sm text-primary" style="width:0.5rem;height:0.5rem;animation-delay:0.4s"></div>
      </div></div>
    `;
    messagesContainer.appendChild(div);
    const body = document.getElementById('copilotChat');
    if (body) body.scrollTop = body.scrollHeight;
  }

  // ─── Smart Response Logic ───
  function getSmartReply(userText) {
    const text = userText.toLowerCase();

    // Keyword triggers (global)
    if (text.includes('ban') || text.includes('baneo') || text.includes('restringi'))
      return "🛡️ He analizado el caso. Meta marca las cuentas por 'Prácticas Engañosas' (Policy 4.2) o 'Circumventing Systems' (Policy 4.3). Te preparé un borrador de apelación. ¿Lo enviamos?";
    if (text.includes('clonar') || text.includes('copiar') || text.includes('duplicar'))
      return "🔄 Listo para clonar. He ajustado los 'excluded_custom_audiences' usando la convención API v22. Las Custom Audiences originales NO se copiarán (restricción de privacidad Meta 2026). ¿Procedo?";
    if (text.includes('pixel') || text.includes('capi') || text.includes('tracking'))
      return "🎯 Tu EMQ Score es 8.2/10. Los eventos Purchase y Lead tienen >95% de cobertura CAPI. El único gap significativo es el evento 'Search' con 62%. Te recomiendo implementar el tag server-side para este evento.";
    if (text.includes('advantage') || text.includes('campaña') || text.includes('optimizar'))
      return "🤖 Tus campañas Advantage+ están optimizando correctamente. La campaña 'Retargeting Viewers 7d' tiene el mejor ROAS (5.1x). Recomendación: aumentar su daily budget un 20% y reducir 'Prospecting Lookalike' que está en Learning Limited.";
    if (text.includes('gasto') || text.includes('presupuesto') || text.includes('budget'))
      return "💰 Has gastado $4,280 en los últimos 30 días. El ROAS promedio es 3.2x generando ~$13,696 en revenue estimado. Tu campaña más eficiente en CPA es 'Retargeting ViewContent 7d' con $0.77/conversión.";
    if (text.includes('atribu') || text.includes('conversion'))
      return "📊 Desde marzo 2026, Meta redefinió la atribución: solo clics reales cuentan como Click-through. Likes, shares y comments son ahora 'Engage-through'. Tu 65.9% de conversiones son Click-through y 24.3% son Engage-through.";
    if (text.includes('reporte') || text.includes('export'))
      return "📋 Puedo generar un reporte con las métricas actuales. Incluiría: KPIs de rendimiento, breakdown por canal/dispositivo, estado de campañas Advantage+, y cobertura Pixel/CAPI. ¿Lo exporto en CSV o PDF?";

    // Context-based response
    const page = getContextPage();
    const responses = contextResponses[page] || contextResponses.index;
    const reply = responses[responseIndex % responses.length];
    responseIndex++;
    return reply;
  }

  // ─── Submit Handler — conecta con /api/ai (Claude real) o fallback local ───
  window.mockCopilotSubmit = async function() {
    const input = document.getElementById('copilotInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, true);
    input.value = '';
    showTypingIndicator();

    // Recopilar contexto del módulo actual
    const pageCtx = {
      page: currentPage,
      tong: document.getElementById('tong')?.innerText || '0',
      dachon: document.getElementById('dachon')?.innerText || '0',
      url: window.location.href
    };

    let reply;
    try {
      // Intentar conexión real con /api/ai (Claude vía server.js)
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: pageCtx, page: currentPage }),
        signal: AbortSignal.timeout(8000)
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.reply || getSmartReply(text);
        if (data.mode === 'claude') {
          console.log('[Copilot] Respuesta real de Claude API 🧠');
        }
      } else {
        reply = getSmartReply(text);
      }
    } catch (err) {
      // Sin servidor activo o timeout — usar respuesta local
      reply = getSmartReply(text);
    }

    const typing = document.getElementById('copilotTyping');
    if (typing) typing.remove();
    appendMessage(reply);
  };

  // ─── Proactive Alert (cada 45s) ───
  let proactiveIndex = 0;
  const proactiveAlerts = [
    "💡 Tip: Los anuncios con formato Reels tienen 22% más Views que los posts estáticos según los datos de esta semana.",
    "📊 Actualización: Tu gasto diario promedio ha subido 5% esta semana. Monitorea el budget pacing.",
    "🔔 Recordatorio: Revisa el Attribution Center para ver el impacto del nuevo Engage-through attribution.",
    "⚡ Tus señales CAPI están llegando con latencia < 500ms. Excelente calidad de datos."
  ];

  function showProactiveAlert() {
    const messages = document.getElementById('copilotMessages');
    if (!messages) return;
    appendMessage(proactiveAlerts[proactiveIndex % proactiveAlerts.length]);
    proactiveIndex++;
  }

  // ─── Init ───
  document.addEventListener('DOMContentLoaded', () => {
    const messages = document.getElementById('copilotMessages');
    if (messages && messages.children.length === 0) {
      const page = getContextPage();
      const greeting = {
        index: "👋 ¡Hola! He auditado tus recursos contra las reglas de Meta 2026. Tu ROAS promedio es 3.2x y todas las cuentas pasan el test H.E.C. Te muestro un resumen ejecutivo en el dashboard.",
        ads: "📊 Analizando tus cuentas publicitarias. Tienes 12 cuentas con 3 activas en Advantage+. Las métricas ahora usan Views en lugar de Impressions (Graph API v22).",
        bm: "🔍 Auditando tus Business Managers. 5 BMs detectados con estado mixto. Te muestro las alertas de compliance y opciones de apelación.",
        page: "📄 Revisando las 8 páginas conectadas. Monitoreando Quality Score y recomendaciones de contenido.",
        clone: "🔄 Sistema de clonación activo. Listo para duplicar configuraciones de cuentas con ajustes para API v22.",
        phoi: "🎨 Editor de plantillas preparado. Los formatos óptimos para 2026 son 1080x1080 (Feed) y 1080x1920 (Stories/Reels).",
        advantage: "🤖 Advantage+ Intelligence activado. Monitoreando 8 campañas bajo Automation Unification. 2 en fase de aprendizaje.",
        pixel: "🎯 Pixel & CAPI Health: EMQ Score 8.2/10. Monitoreando cobertura de eventos en tiempo real.",
        attribution: "📊 Attribution Center: Nuevo modelo de atribución Meta 2026 activo. Click-through redefinido, Engage-through habilitado."
      };
      appendMessage(greeting[page] || greeting.index);
    }

    // Proactive alerts every 45 seconds
    setTimeout(() => setInterval(showProactiveAlert, 45000), 15000);
  });
})();
