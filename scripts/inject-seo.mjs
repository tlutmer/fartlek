import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const indexPath = path.join(root, 'dist', 'index.html')

const SITE_URL = 'https://fartlek.xyz/'
const TITLE = 'Fartlek — Interval Timer for Set-Based Workouts'
const DESCRIPTION =
  'A minimal interval timer for set-based workouts. Configure your sets, work, and rest, then press play — one screen, no clutter.'

const tags = `
  <meta name="description" content="${DESCRIPTION}" />
  <meta name="theme-color" content="#232426" />
  <link rel="canonical" href="${SITE_URL}" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}" />
  <meta property="og:title" content="${TITLE}" />
  <meta property="og:description" content="${DESCRIPTION}" />
  <meta property="og:image" content="${SITE_URL}og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${TITLE}" />
  <meta name="twitter:description" content="${DESCRIPTION}" />
  <meta name="twitter:image" content="${SITE_URL}og-image.png" />
`

let html = readFileSync(indexPath, 'utf8')
html = html.replace(/<title>.*<\/title>/, `<title>${TITLE}</title>`)
html = html.replace('</head>', `${tags}</head>`)
writeFileSync(indexPath, html)

console.log('Injected SEO tags into dist/index.html')
