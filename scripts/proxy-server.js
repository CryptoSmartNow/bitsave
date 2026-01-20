const express = require('express');
const cors = require('cors');
// using global fetch
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const TIMEOUT_MS = 30000;
const MAX_RETRIES = 3;
const ALLOWED_DOMAINS = [
    'api.coinbase.com',
    'api.developer.coinbase.com',
    'base.org',
    'mainnet.base.org',
    'sepolia.base.org',
    'rpc.ankr.com',
    'base-mainnet.g.alchemy.com',
    'keys.coinbase.com',
    'pay.coinbase.com',
    'bc.coinbase.com'
];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: '*/*' }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Retry Logic
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
        options.signal = controller.signal;

        const response = await fetch(url, options);
        clearTimeout(id);

        if (!response.ok && retries > 0 && response.status >= 500) {
            console.log(`[Proxy] Retrying ${url} (${retries} left)`);
            await new Promise(r => setTimeout(r, 1000 * (MAX_RETRIES - retries + 1)));
            return fetchWithRetry(url, options, retries - 1);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.log(`[Proxy] Retry network error (${retries} left):`, error.message);
            await new Promise(r => setTimeout(r, 1000 * (MAX_RETRIES - retries + 1)));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

// Proxy Handler
app.use('/proxy', async (req, res) => {
    const targetUrlStr = req.query.url;
    
    if (!targetUrlStr) {
        return res.status(400).json({ error: 'Missing "url" query parameter' });
    }

    let targetUrl;
    try {
        targetUrl = new URL(targetUrlStr);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    if (!ALLOWED_DOMAINS.some(domain => targetUrl.hostname.endsWith(domain))) {
        return res.status(403).json({ error: 'Domain not allowed' });
    }

    try {
        // Forward headers (excluding host)
        const headers = {};
        Object.entries(req.headers).forEach(([key, value]) => {
            if (key !== 'host' && key !== 'content-length') {
                headers[key] = value;
            }
        });

        const method = req.method;
        const body = (method === 'GET' || method === 'HEAD') ? undefined : JSON.stringify(req.body);

        console.log(`[Proxy] ${method} ${targetUrlStr}`);

        const response = await fetchWithRetry(targetUrlStr, {
            method,
            headers,
            body: typeof req.body === 'object' ? JSON.stringify(req.body) : req.body
        });

        // Set response headers
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        const responseBody = await response.buffer();
        res.status(response.status).send(responseBody);

    } catch (error) {
        console.error('[Proxy] Error:', error);
        res.status(502).json({ error: 'Proxy error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
