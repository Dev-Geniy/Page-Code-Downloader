// Переключение темы
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
const icon = toggleButton.querySelector('.icon');

const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
icon.textContent = savedTheme === 'light' ? '☀️' : '🌙';

toggleButton.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    icon.textContent = newTheme === 'light' ? '☀️' : '🌙';
});

// Логика загрузки кода страницы
const fetchButton = document.getElementById('fetch-code');
const pageUrlInput = document.getElementById('page-url');
const codeStatusOutput = document.getElementById('code-status');
const downloadHtmlButton = document.getElementById('download-html');
const downloadCssButton = document.getElementById('download-css');
const downloadJsButton = document.getElementById('download-js');

let fetchedHtml = '';
let fetchedCss = ''; // Заглушка для CSS
let fetchedJs = '';  // Заглушка для JS

fetchButton.addEventListener('click', () => {
    const pageUrl = pageUrlInput.value.trim();

    if (!pageUrl || !isValidUrl(pageUrl)) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }

    codeStatusOutput.textContent = 'Fetching page code...';
    downloadHtmlButton.disabled = true;
    downloadCssButton.disabled = true;
    downloadJsButton.disabled = true;

    // Используем прокси для обхода CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(pageUrl)}`;

    fetch(proxyUrl, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
        return response.text();
    })
    .then(data => {
        fetchedHtml = data || '<!-- No HTML content available -->';
        fetchedCss = extractCssFromHtml(data) || '/* No CSS extracted */';
        fetchedJs = extractJsFromHtml(data) || '/* No JS extracted */';

        codeStatusOutput.textContent = 'Page code fetched successfully!';
        downloadHtmlButton.disabled = false;
        downloadCssButton.disabled = false;
        downloadJsButton.disabled = false;
    })
    .catch(err => {
        codeStatusOutput.textContent = `Error: Failed to fetch page. ${err.message}. Try a different URL or check the site’s availability.`;
        console.error('Fetch error:', err);
    });
});

// Извлечение CSS из HTML (упрощённая версия)
function extractCssFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const styles = Array.from(doc.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => {
            if (el.tagName === 'STYLE') return el.textContent;
            if (el.href) return `/* CSS from ${el.href} not fetched due to client-side limitations */`;
            return '';
        })
        .join('\n');
    return styles || '/* No inline CSS found */';
}

// Извлечение JS из HTML (упрощённая версия)
function extractJsFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const scripts = Array.from(doc.querySelectorAll('script'))
        .map(script => script.textContent || `/* Script from ${script.src || 'inline'} not fetched */`)
        .join('\n');
    return scripts || '/* No inline JS found */';
}

// Скачивание файлов
function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

downloadHtmlButton.addEventListener('click', () => {
    if (fetchedHtml) downloadFile(fetchedHtml, 'page.html', 'text/html');
});

downloadCssButton.addEventListener('click', () => {
    if (fetchedCss) downloadFile(fetchedCss, 'styles.css', 'text/css');
});

downloadJsButton.addEventListener('click', () => {
    if (fetchedJs) downloadFile(fetchedJs, 'script.js', 'text/javascript');
});

// Проверка валидности URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Копирование Bitcoin-адреса
const copyBtcButton = document.querySelector('.btc-address .copy-btn');
copyBtcButton.addEventListener('click', () => {
    const btcCode = document.getElementById('btc-code').textContent;
    navigator.clipboard.writeText(btcCode).then(() => {
        copyBtcButton.textContent = 'Copied!';
        setTimeout(() => {
            copyBtcButton.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});
