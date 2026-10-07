# InsightGuard Command Center

Demo web estática para la exposición de InsightGuard.

## Qué incluye
- Dashboard responsive para laptop y celular.
- Topología visual de infraestructura.
- AI-GUARD con estados MONITOR → DETECT → ANALYZE → RESPOND.
- Telemetría animada.
- Stream de eventos.
- Tres incidentes simulados: server overload, network anomaly y storage alert.
- Reporte automático y métricas de impacto estimadas.
- Módulo preparado para la experiencia por QR.
- Funciona sin backend y puede ejecutarse localmente sin internet.

> Importante: es una simulación educativa. No monitorea ni ataca infraestructura real.

## Ejecutar en el PC
Abre `index.html` con el navegador. No necesita instalación.

## Publicar gratis
### GitHub Pages
1. Crea un repositorio público en GitHub.
2. Sube el contenido de esta carpeta al repositorio.
3. En Settings → Pages, configura la publicación desde la rama `main` y la carpeta `/ (root)`.
4. GitHub generará una URL pública.

### Cloudflare Pages
También puedes conectar el repositorio de GitHub a Cloudflare Pages. Para esta web no hay comando de compilación: los archivos estáticos se publican directamente.

## QR
Después de obtener la URL pública, genera el QR con:

```bash
python3 make_qr.py "https://TU-URL-PUBLICA"
```

Esto crea `assets/insightguard-qr.png`.

Para la exposición recomendamos imprimir el QR con un texto tipo:

**¿QUIERES PONER A PRUEBA A AI-GUARD?**

El visitante entra a la demo y ejecuta una simulación segura.
