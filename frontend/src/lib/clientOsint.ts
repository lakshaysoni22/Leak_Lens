/**
 * Client-side OSINT scanner — queries free public APIs directly from the browser.
 * Used as fallback when backend is unavailable (e.g. Vercel frontend-only deploy).
 */

interface BreachInfo {
  name: string;
  domain: string;
  date: string;
  data_types: string[];
}

interface ClientScanResult {
  identifier_hint: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  exposure_count: number;
  data_source: 'live_intelligence';
  summary: string;
  breaches: BreachInfo[];
  recommendations: string[];
  created_at: string;
  raw_result: Record<string, unknown>;
}

function computeRisk(breachCount: number): { score: number; level: 'low' | 'medium' | 'high' | 'critical' } {
  if (breachCount === 0) return { score: 0, level: 'low' };
  if (breachCount <= 2) return { score: 35, level: 'medium' };
  if (breachCount <= 5) return { score: 65, level: 'high' };
  return { score: 85, level: 'critical' };
}

/**
 * Scan email via XposedOrNot public API (no key required, CORS-friendly).
 * Endpoint: https://api.xposedornot.com/v1/check-email/{email}
 */
export async function scanEmailClient(email: string): Promise<ClientScanResult> {
  const breaches: BreachInfo[] = [];
  let rawXposed: unknown = null;

  try {
    const res = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const data = await res.json();
      rawXposed = data;

      // XposedOrNot returns { breaches: [...] } when found
      const xBreaches = data?.breaches ?? data?.ExposedBreaches?.breaches_details ?? [];
      if (Array.isArray(xBreaches)) {
        for (const b of xBreaches) {
          breaches.push({
            name: b.breach ?? b.name ?? 'Unknown Breach',
            domain: b.domain ?? b.xposed_domain ?? '',
            date: b.xposed_date ?? b.date ?? '',
            data_types: Array.isArray(b.xposed_data)
              ? b.xposed_data
              : typeof b.xposed_data === 'string'
                ? b.xposed_data.split(',').map((s: string) => s.trim())
                : [],
          });
        }
      }
    }
    // 404 = not found = clean
  } catch {
    // Network error — continue with what we have
  }

  const { score, level } = computeRisk(breaches.length);
  const hint = email.substring(0, 3) + '***@' + email.split('@')[1];

  const recommendations: string[] = breaches.length > 0
    ? [
        'Change your password immediately on all affected services',
        'Enable two-factor authentication (2FA) on all accounts',
        'Check for unauthorized access or suspicious activity',
        'Use a unique password for each service (password manager recommended)',
        'Monitor your accounts for unusual activity over the next 30 days',
      ]
    : [
        'Continue using strong, unique passwords for each account',
        'Enable two-factor authentication where available',
        'Run periodic breach checks to stay ahead of new exposures',
      ];

  return {
    identifier_hint: hint,
    risk_score: score,
    risk_level: level,
    exposure_count: breaches.length,
    data_source: 'live_intelligence',
    summary: breaches.length > 0
      ? `Found ${breaches.length} data breach exposure${breaches.length > 1 ? 's' : ''} associated with this email address.`
      : 'No breaches detected. This email was not found in any known data breach databases.',
    breaches,
    recommendations,
    created_at: new Date().toISOString(),
    raw_result: {
      xposedornot: rawXposed,
      providers_queried: ['XposedOrNot'],
      scan_timestamp: new Date().toISOString(),
    },
  };
}


/**
 * Scan username — check platform existence via public endpoints.
 */
export async function scanUsernameClient(username: string): Promise<ClientScanResult> {
  const platforms = [
    { name: 'GitHub', url: `https://api.github.com/users/${encodeURIComponent(username)}` },
  ];

  const found: string[] = [];
  const notFound: string[] = [];

  for (const p of platforms) {
    try {
      const res = await fetch(p.url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) found.push(p.name);
      else notFound.push(p.name);
    } catch {
      notFound.push(p.name);
    }
  }

  // Also check XposedOrNot for the username
  let breachCount = 0;
  try {
    const res = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(username)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      const xBreaches = data?.breaches ?? data?.ExposedBreaches?.breaches_details ?? [];
      if (Array.isArray(xBreaches)) breachCount = xBreaches.length;
    }
  } catch { /* ignore */ }

  const { score, level } = computeRisk(breachCount);

  return {
    identifier_hint: username,
    risk_score: score,
    risk_level: level,
    exposure_count: breachCount,
    data_source: 'live_intelligence',
    summary: found.length > 0
      ? `Username "${username}" found on ${found.join(', ')}. ${breachCount > 0 ? `${breachCount} breach exposures detected.` : 'No breach exposures detected.'}`
      : `Username "${username}" not found on checked platforms. ${breachCount > 0 ? `${breachCount} breach exposures detected.` : 'No breach exposures detected.'}`,
    breaches: [],
    recommendations: breachCount > 0
      ? ['Change passwords on accounts using this username', 'Enable 2FA on all accounts', 'Avoid reusing this username on sensitive platforms']
      : ['Continue monitoring for new exposures', 'Use unique usernames for sensitive accounts'],
    created_at: new Date().toISOString(),
    raw_result: { platforms_found: found, platforms_not_found: notFound, breach_count: breachCount },
  };
}

/**
 * Analyze URL for phishing indicators — client-side heuristics.
 */
export async function analyzePhishingClient(url: string): Promise<Record<string, unknown>> {
  const indicators: string[] = [];
  let riskScore = 0;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // Check for IP address instead of domain
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      indicators.push('URL uses IP address instead of domain name');
      riskScore += 30;
    }

    // Check for suspicious TLDs
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.buzz', '.club'];
    if (suspiciousTlds.some(tld => host.endsWith(tld))) {
      indicators.push(`Suspicious TLD detected: .${host.split('.').pop()}`);
      riskScore += 20;
    }

    // Check for excessive subdomains
    const parts = host.split('.');
    if (parts.length > 4) {
      indicators.push(`Excessive subdomains (${parts.length} levels)`);
      riskScore += 15;
    }

    // Check for brand impersonation (homoglyphs)
    const brands = ['paypal', 'google', 'apple', 'microsoft', 'amazon', 'facebook', 'netflix', 'instagram', 'twitter'];
    for (const brand of brands) {
      if (host.includes(brand) && !host.endsWith(`${brand}.com`) && !host.endsWith(`${brand}.net`)) {
        indicators.push(`Possible brand impersonation: "${brand}" in non-official domain`);
        riskScore += 35;
        break;
      }
    }

    // Check for @ in URL (credential phishing)
    if (url.includes('@')) {
      indicators.push('URL contains @ symbol (potential credential harvesting)');
      riskScore += 25;
    }

    // Check for excessive path length
    if (parsed.pathname.length > 100) {
      indicators.push('Unusually long URL path');
      riskScore += 10;
    }

    // Check HTTPS
    if (parsed.protocol !== 'https:') {
      indicators.push('Not using HTTPS encryption');
      riskScore += 15;
    }

    // Check for numeric patterns in domain
    if (/\d{4,}/.test(host)) {
      indicators.push('Domain contains long numeric sequence');
      riskScore += 10;
    }

    // Check URLhaus for known malicious URL
    try {
      const formData = new URLSearchParams();
      formData.append('url', url);
      const uhRes = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(10000),
      });
      if (uhRes.ok) {
        const uhData = await uhRes.json();
        if (uhData.query_status === 'ok' && uhData.id) {
          indicators.push(`Listed in URLhaus threat database (ID: ${uhData.id})`);
          riskScore += 40;
        }
      }
    } catch { /* ignore */ }

  } catch {
    indicators.push('Invalid URL format');
    riskScore = 50;
  }

  riskScore = Math.min(100, riskScore);
  const level = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';

  return {
    url,
    risk_score: riskScore,
    risk_level: level,
    is_phishing: riskScore >= 50,
    indicators,
    data_source: 'live_intelligence',
    summary: indicators.length > 0
      ? `${indicators.length} phishing indicator${indicators.length > 1 ? 's' : ''} detected.`
      : 'No phishing indicators detected. URL appears safe.',
    recommendations: riskScore >= 50
      ? ['Do NOT enter any credentials on this site', 'Report this URL to your IT security team', 'Mark as phishing in your email client']
      : ['Always verify URLs before entering credentials', 'Look for HTTPS and valid certificates'],
    created_at: new Date().toISOString(),
  };
}

/**
 * Threat intelligence lookup for IP/domain/hash — queries free APIs.
 */
export async function lookupThreatClient(iocType: string, value: string): Promise<Record<string, unknown>> {
  const providers: Record<string, unknown>[] = [];
  let riskScore = 0;
  const indicators: string[] = [];

  // URLhaus check (works for URLs, domains, IPs)
  try {
    const formData = new URLSearchParams();
    if (iocType === 'url') formData.append('url', value);
    else if (iocType === 'domain' || iocType === 'host') formData.append('host', value);
    else formData.append('host', value);

    const uhRes = await fetch('https://urlhaus-api.abuse.ch/v1/host/', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(10000),
    });
    if (uhRes.ok) {
      const uhData = await uhRes.json();
      providers.push({ provider: 'URLhaus', status: 'queried', result: uhData.query_status, urls_count: uhData.urls?.length ?? 0 });
      if (uhData.query_status === 'ok' && (uhData.urls?.length ?? 0) > 0) {
        riskScore += 40;
        indicators.push(`Found in URLhaus with ${uhData.urls.length} malicious URL(s)`);
      }
    }
  } catch { /* ignore */ }

  // ip-api.com for geolocation (IP only)
  if (iocType === 'ip') {
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${encodeURIComponent(value)}?fields=status,country,city,isp,org,as,proxy,hosting`, {
        signal: AbortSignal.timeout(8000),
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        providers.push({ provider: 'ip-api.com', status: 'queried', data: geoData });
        if (geoData.proxy) { riskScore += 15; indicators.push('IP is a known proxy/VPN'); }
        if (geoData.hosting) { riskScore += 10; indicators.push('IP belongs to hosting/datacenter'); }
      }
    } catch { /* ignore */ }
  }

  riskScore = Math.min(100, riskScore);
  const level = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';

  return {
    ioc_type: iocType,
    ioc_value: value,
    risk_score: riskScore,
    risk_level: level,
    indicators,
    providers,
    data_source: 'live_intelligence',
    summary: indicators.length > 0
      ? `${indicators.length} threat indicator${indicators.length > 1 ? 's' : ''} found for this ${iocType}.`
      : `No threats detected for this ${iocType} in queried databases.`,
    created_at: new Date().toISOString(),
  };
}
