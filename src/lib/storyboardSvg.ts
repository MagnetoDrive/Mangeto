export type StoryboardPlatform = '9:16' | '1:1' | '16:9';

/**
 * Sanitizes strings for safe inclusion in SVG text elements and attributes.
 * Prevents XML injection and encoding breakages.
 */
export function sanitizeXmlText(input?: string | null, maxLength: number = 60): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove non-printable control characters (except space)
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();

  // Escape XML reserved characters
  const escaped = cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  if (maxLength && escaped.length > maxLength) {
    return escaped.slice(0, maxLength) + "…";
  }

  return escaped;
}

export function isBrokenImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (trimmed === "" || trimmed === "null" || trimmed === "undefined") return true;

  // Base64 data URLs (JPEG, PNG, WebP, SVG) are valid self-contained images
  if (trimmed.startsWith("data:image/")) {
    return trimmed.length < 50;
  }

  // Known broken dummy placeholder endpoints or legacy dead links
  if (
    trimmed.includes("picsum.photos") ||
    trimmed.includes("1557804506-669a67965ba0") ||
    trimmed.includes("via.placeholder.com") ||
    trimmed.includes("placeholder.com")
  ) {
    return true;
  }

  // Relative paths that don't exist
  if (trimmed.startsWith("./") || (trimmed.startsWith("/") && !trimmed.startsWith("/assets/") && !trimmed.startsWith("/api/"))) {
    return true;
  }

  return false;
}

/**
 * Creates a rock-solid, zero-failure vector SVG storyboard visual mockup.
 * Resilient against missing data, broken URLs, and failed API requests.
 */
export function createStoryboardSvg(
  scene?: {
    visualPrompt?: string;
    onScreenText?: string;
    avatarDirection?: string;
    timestamp?: string;
    id?: string;
  } | null,
  sceneNumber: number = 1,
  platform: StoryboardPlatform = '16:9'
): string {
  try {
    const cleanSceneNum = Number.isFinite(sceneNumber) && sceneNumber > 0 ? Math.floor(sceneNumber) : 1;
    const targetPlatform: StoryboardPlatform =
      platform === '9:16' || platform === '1:1' || platform === '16:9' ? platform : '16:9';

    const rawText = scene?.onScreenText || "KEY MOMENT OVERLAY";
    const rawPrompt = scene?.visualPrompt || "Cinematic camera composition and visual framing";
    const rawTime = scene?.timestamp || `00:${String((cleanSceneNum - 1) * 15).padStart(2, "0")}s`;

    const safeText = sanitizeXmlText(rawText, 40) || "SCENE VISUAL";
    const safePrompt = sanitizeXmlText(rawPrompt, 75) || "Cinematic storyboard shot direction";
    const safeTime = sanitizeXmlText(rawTime, 16) || "00:00s";

    const gradients = [
      { start: "#1e1b4b", mid: "#0f172a", glow: "#6366f1", accent: "#818cf8" },
      { start: "#0f172a", mid: "#1e293b", glow: "#06b6d4", accent: "#38bdf8" },
      { start: "#172554", mid: "#0f172a", glow: "#3b82f6", accent: "#60a5fa" },
      { start: "#141c2e", mid: "#090d16", glow: "#a855f7", accent: "#c084fc" },
    ];
    const g = gradients[(cleanSceneNum - 1) % gradients.length];
    const uid = `${cleanSceneNum}_${Math.abs((scene?.id || "sc").split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 10000)}`;

    if (targetPlatform === '9:16') {
      // Vertical mobile 9:16 (Shorts, TikTok, IG Reels)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640" width="360" height="640">
        <defs>
          <linearGradient id="bg_vert_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${g.start}" />
            <stop offset="50%" stop-color="${g.mid}" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <linearGradient id="glow_vert_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${g.glow}" stop-opacity="0.8" />
            <stop offset="100%" stop-color="${g.accent}" stop-opacity="0.8" />
          </linearGradient>
          <pattern id="grid_vert_${uid}" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" stroke-width="0.75" stroke-opacity="0.2"/>
          </pattern>
        </defs>
        
        <rect width="360" height="640" fill="url(#bg_vert_${uid})"/>
        <rect width="360" height="640" fill="url(#grid_vert_${uid})"/>
        
        <!-- Viewfinder Corner Markers -->
        <path d="M 18 36 L 18 20 L 34 20" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 326 20 L 342 20 L 342 36" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 18 604 L 18 620 L 34 620" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 326 620 L 342 620 L 342 604" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Top Header Badges -->
        <rect x="22" y="26" width="86" height="24" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <text x="65" y="42" fill="#f1f5f9" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" text-anchor="middle">SCENE ${cleanSceneNum}</text>

        <rect x="252" y="26" width="86" height="24" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <text x="295" y="42" fill="${g.accent}" font-family="system-ui, -apple-system, monospace" font-size="10" font-weight="700" text-anchor="middle">${safeTime}</text>

        <!-- Subject Center Framing Reticle -->
        <rect x="65" y="160" width="230" height="240" rx="20" fill="#090d16" fill-opacity="0.65" stroke="url(#glow_vert_${uid})" stroke-width="1.5" stroke-dasharray="6,4"/>
        
        <!-- Character Avatar Graphic -->
        <circle cx="180" cy="250" r="44" fill="${g.start}" stroke="${g.accent}" stroke-width="2"/>
        <circle cx="180" cy="238" r="16" fill="${g.accent}" fill-opacity="0.9"/>
        <path d="M 152 278 C 152 260, 208 260, 208 278 Z" fill="${g.accent}" fill-opacity="0.75"/>

        <!-- Focus Crosshairs -->
        <line x1="110" y1="250" x2="130" y2="250" stroke="${g.accent}" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="230" y1="250" x2="250" y2="250" stroke="${g.accent}" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="180" y1="180" x2="180" y2="200" stroke="${g.accent}" stroke-width="1.5" stroke-linecap="round"/>

        <!-- Platform Tag -->
        <rect x="125" y="136" width="110" height="20" rx="10" fill="#090d16" stroke="#334155" stroke-width="1"/>
        <text x="180" y="150" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" text-anchor="middle">9:16 VERTICAL VIDEO</text>

        <!-- Lower Third Subtitle Bar -->
        <rect x="20" y="450" width="320" height="52" rx="10" fill="#020617" fill-opacity="0.92" stroke="#334155" stroke-width="1"/>
        <text x="180" y="478" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="0.5" text-anchor="middle">${safeText}</text>
        <text x="180" y="494" fill="${g.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" text-anchor="middle">ON-SCREEN OVERLAY</text>

        <!-- Visual Direction Caption -->
        <rect x="20" y="520" width="320" height="70" rx="10" fill="#090d16" fill-opacity="0.5" stroke="#1e293b" stroke-width="1"/>
        <text x="180" y="542" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" text-anchor="middle">CAMERA / VISUAL DIRECTION</text>
        <text x="180" y="564" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="500" text-anchor="middle">${safePrompt}</text>
      </svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    if (targetPlatform === '1:1') {
      // Square 1:1 (LinkedIn, Instagram Feeds)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <defs>
          <linearGradient id="bg_sq_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${g.start}" />
            <stop offset="50%" stop-color="${g.mid}" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <linearGradient id="glow_sq_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${g.glow}" stop-opacity="0.8" />
            <stop offset="100%" stop-color="${g.accent}" stop-opacity="0.8" />
          </linearGradient>
          <pattern id="grid_sq_${uid}" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#334155" stroke-width="0.75" stroke-opacity="0.2"/>
          </pattern>
        </defs>
        
        <rect width="500" height="500" fill="url(#bg_sq_${uid})"/>
        <rect width="500" height="500" fill="url(#grid_sq_${uid})"/>
        
        <path d="M 24 40 L 24 24 L 40 24" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 460 24 L 476 24 L 476 40" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 24 460 L 24 476 L 40 476" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 460 476 L 476 476 L 476 460" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>

        <rect x="24" y="24" width="88" height="24" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <text x="68" y="40" fill="#f1f5f9" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">SCENE ${cleanSceneNum}</text>

        <rect x="388" y="24" width="88" height="24" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <text x="432" y="40" fill="${g.accent}" font-family="system-ui, -apple-system, monospace" font-size="10" font-weight="700" text-anchor="middle">${safeTime}</text>

        <rect x="140" y="110" width="220" height="190" rx="16" fill="#090d16" fill-opacity="0.65" stroke="url(#glow_sq_${uid})" stroke-width="1.5" stroke-dasharray="6,4"/>
        <circle cx="250" cy="185" r="36" fill="${g.start}" stroke="${g.accent}" stroke-width="2"/>
        <circle cx="250" cy="175" r="14" fill="${g.accent}" fill-opacity="0.9"/>
        <path d="M 226 210 C 226 195, 274 195, 274 210 Z" fill="${g.accent}" fill-opacity="0.75"/>

        <rect x="36" y="340" width="428" height="50" rx="10" fill="#020617" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
        <text x="250" y="371" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle">${safeText}</text>

        <text x="250" y="425" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="500" text-anchor="middle">${safePrompt}</text>
      </svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    // Landscape 16:9 (YouTube, Slides, Web)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
      <defs>
        <linearGradient id="bg_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${g.start}" />
          <stop offset="60%" stop-color="${g.mid}" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <linearGradient id="glow_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${g.glow}" stop-opacity="0.8" />
          <stop offset="100%" stop-color="${g.accent}" stop-opacity="0.8" />
        </linearGradient>
        <pattern id="grid_${uid}" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#334155" stroke-width="0.75" stroke-opacity="0.2"/>
        </pattern>
      </defs>
      
      <rect width="640" height="360" fill="url(#bg_${uid})"/>
      <rect width="640" height="360" fill="url(#grid_${uid})"/>
      
      <path d="M 28 44 L 28 28 L 44 28" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 596 28 L 612 28 L 612 44" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 28 316 L 28 332 L 44 332" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 596 332 L 612 332 L 612 316" fill="none" stroke="${g.accent}" stroke-width="2.5" stroke-linecap="round"/>

      <rect x="220" y="70" width="200" height="150" rx="16" fill="#090d16" fill-opacity="0.6" stroke="url(#glow_${uid})" stroke-width="1.5" stroke-dasharray="6,4"/>
      <circle cx="320" cy="125" r="30" fill="${g.start}" stroke="${g.accent}" stroke-width="2"/>
      <circle cx="320" cy="118" r="12" fill="${g.accent}" fill-opacity="0.9"/>
      <path d="M 302 144 C 302 134, 338 134, 338 144 Z" fill="${g.accent}" fill-opacity="0.7"/>
      
      <line x1="270" y1="125" x2="285" y2="125" stroke="${g.accent}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="355" y1="125" x2="370" y2="125" stroke="${g.accent}" stroke-width="1.5" stroke-linecap="round"/>

      <rect x="28" y="24" width="92" height="24" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="74" y="40" fill="#f1f5f9" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">SCENE ${cleanSceneNum}</text>

      <rect x="520" y="24" width="92" height="24" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="566" y="40" fill="${g.accent}" font-family="system-ui, -apple-system, monospace" font-size="10" font-weight="700" text-anchor="middle">${safeTime}</text>

      <rect x="50" y="252" width="540" height="48" rx="10" fill="#020617" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
      <text x="320" y="282" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" letter-spacing="0.5" text-anchor="middle">${safeText}</text>

      <text x="320" y="332" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="500" text-anchor="middle">${safePrompt}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch (err) {
    console.warn("createStoryboardSvg fallback triggered:", err);
    return getFallbackStoryboardDataUrl(sceneNumber, platform);
  }
}

/**
 * Minimalist infallible fallback SVG in case of unexpected errors.
 */
export function getFallbackStoryboardDataUrl(sceneNumber: number = 1, platform: StoryboardPlatform = '16:9'): string {
  const isVert = platform === '9:16';
  const isSquare = platform === '1:1';
  const width = isVert ? 360 : isSquare ? 500 : 640;
  const height = isVert ? 640 : isSquare ? 500 : 360;

  const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#0f172a"/>
    <rect x="${width * 0.1}" y="${height * 0.2}" width="${width * 0.8}" height="${height * 0.5}" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <circle cx="${width / 2}" cy="${height * 0.42}" r="32" fill="#312e81"/>
    <text x="${width / 2}" y="${height * 0.78}" fill="#f8fafc" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">SCENE ${sceneNumber}</text>
    <text x="${width / 2}" y="${height * 0.86}" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">Storyboard Frame</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallback)}`;
}
