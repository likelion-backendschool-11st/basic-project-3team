// Converts downloaded Stitch screens (.stitch/designs/*.html) into React pages.
// Each screen gets its own scoped Tailwind config, because Stitch generated a different
// config per screen (139 conflicting tokens) and merging them would change the visuals.
// Usage: node scripts/stitch-to-react.mjs
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { parse } from 'parse5'

const root = path.resolve(import.meta.dirname, '..')
const designs = path.join(root, '.stitch/designs')
const pagesDir = path.join(root, 'src/pages')
const { screens } = JSON.parse(fs.readFileSync(path.join(root, '.stitch/screens.json'), 'utf8'))

const slugById = {
  '6b50aaa3b9764717a560dbf53ef18d1a': 'login',
  '9be632de287347b09d48cb3b6a1929bb': 'login-failed-modal',
  'a325a7b416484edfacf35d8f124d2277': 'find-id',
  'a9c0f3268c6c46ec8708c753aeedbe84': 'find-password',
  '10601936399347cda1caffc777e72f92': 'questions',
  '97b8d4ad9644464bb6d9a5d50c9946c3': 'prototype',
  'ee8b5d18fe864e2fb69e1574000356d8': 'search-focus-dropdown',
  '5c71344dec5542088393f5c5a18be387': 'notification-popover',
  'e95e1bb6bfa448d485f6e68a9a1c7b50': 'nickname-menu-dropdown',
  'ce7a72e08a46431499f2a428fb4c1b7e': 'search-results',
  '1583de884a7f4203b6a6f107544ec80d': 'tag-search-results',
  '50f2fdf3834049b7b5be56aac1c1015d': 'admin-reports',
  'c4ae7710a1db4641815fbf39cc48b6d0': 'admin-members',
  '1fc9d835004a4e06ac69e9fe42944361': 'member-ban-modal',
  '0ec54a7d7fc44cdeb062f6c1399a8d6d': 'signup',
  '2975f653064b464db98b930d4b7cdb3f': 'nickname-check-modal',
  '2e57a173bf1045759cd6bcc2e1476087': 'signup-complete-modal',
  'cf5111d9c66847948c10482de8b4ad14': 'mypage',
  'ffc16dac3577418ea10d8d34dd960a15': 'profile-edit',
  '8afd33f52c3d486a8ea882836f91447a': 'grades-badges',
  'e6170958775841a6a23f9d2f0783ef12': 'ask',
  '7eba581395294d21a1525153ae058ecd': 'account-edit',
  'b608382e05d647b4b41bcbac05ab8c58': 'question-edit',
  '567e93da9c7c4c88beba5717d9649489': 'question-detail',
  '9e6d5bbe0cdc4a2e9affd6aa0c1bece4': 'answers',
  'd27ed29c292f43428406ea15c20dd366': 'replies',
  '283a545c76fc4dbfb09936accad24614': 'reply-editing',
  '6da2e381939749dd9e12f7d052c54840': 'delete-accept-modal',
  'e9d395735a334b72881e1eb65424a49f': 'report-modal',
  '207cc27a8be14455940fc8cd953c34c1': 'author-popover',
  '0288cae787a348e9b015712e15a9d97c': 'system-status',
}

const pascal = (s) => s.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())
const camel = (s) => s.replace(/[-:](\w)/g, (_, c) => c.toUpperCase())
const ATTR = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly',
  maxlength: 'maxLength', minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan',
  autocomplete: 'autoComplete', autofocus: 'autoFocus', novalidate: 'noValidate',
  crossorigin: 'crossOrigin', spellcheck: 'spellCheck', contenteditable: 'contentEditable',
  datetime: 'dateTime', srcset: 'srcSet', inputmode: 'inputMode', enctype: 'encType',
  frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', referrerpolicy: 'referrerPolicy',
}
const BOOL = new Set(['required', 'disabled', 'readonly', 'multiple', 'hidden', 'autofocus', 'novalidate', 'open', 'allowfullscreen'])
const NUM = new Set(['maxLength', 'minLength', 'rows', 'cols', 'tabIndex', 'colSpan', 'rowSpan', 'size', 'span'])
const VOID =new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

const jsxStr = (v) => (/["&{}\\\n]/.test(v) ? `{${JSON.stringify(v)}}` : `"${v}"`)

function styleObj(css) {
  const out = {}
  // split on ';' outside parentheses (url(...) / gradients can contain ';')
  let depth = 0, cur = ''
  for (const ch of css + ';') {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ';' && depth === 0) {
      const i = cur.indexOf(':')
      if (i > 0) {
        const k = cur.slice(0, i).trim()
        out[k.startsWith('--') ? k : camel(k.toLowerCase())] = cur.slice(i + 1).trim()
      }
      cur = ''
    } else cur += ch
  }
  return `{${JSON.stringify(out)}}`
}

function attrs(node) {
  const tag = node.tagName
  const type = node.attrs.find((a) => a.name === 'type')?.value
  const parts = []
  for (const { name, value, prefix } of node.attrs) {
    if (/^on/.test(name)) continue // inline JS handlers are not portable
    if (name === 'style') { parts.push(`style=${styleObj(value)}`); continue }
    let key = prefix ? `${prefix}:${name}` : name
    if (tag === 'input' && key === 'value' && type !== 'checkbox' && type !== 'radio') key = 'defaultValue'
    else if (tag === 'input' && key === 'checked') { parts.push('defaultChecked'); continue }
    else if (tag === 'option' && key === 'selected') continue // handled on <select>
    if (BOOL.has(key) && (value === '' || value === key)) { parts.push(ATTR[key] ?? key); continue }
    if (ATTR[key]) key = ATTR[key]
    else if (!/^(data|aria)-/.test(key) && /[-:]/.test(key)) key = camel(key)
    parts.push(`${key}=${NUM.has(key) && /^-?\d+$/.test(value) ? `{${value}}` : jsxStr(value)}`)
  }
  if (tag === 'form' && !node.attrs.some((a) => a.name === 'action')) parts.push('onSubmit={(e) => e.preventDefault()}')
  if (tag === 'select') {
    const sel = node.childNodes.find((c) => c.tagName === 'option' && c.attrs.some((a) => a.name === 'selected'))
    if (sel) parts.push(`defaultValue=${jsxStr(sel.attrs.find((a) => a.name === 'value')?.value ?? text(sel))}`)
  }
  return parts.length ? ' ' + parts.join(' ') : ''
}

const INLINE = new Set(['a', 'abbr', 'b', 'button', 'code', 'em', 'i', 'img', 'input', 'kbd', 'label', 'mark', 's', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'textarea', 'time', 'u'])
// Is this whitespace node next to inline content (where HTML renders it as a space)?
function touchesInline(node) {
  const sib = node.parentNode.childNodes
  const i = sib.indexOf(node)
  const near = (step) => {
    for (let j = i + step; j >= 0 && j < sib.length; j += step) {
      const n = sib[j]
      if (n.nodeName === '#comment') continue
      return n.nodeName === '#text' || INLINE.has(n.tagName)
    }
    return false
  }
  return near(-1) && near(1)
}

const text = (n) => (n.nodeName === '#text' ? n.value : (n.childNodes ?? []).map(text).join(''))

function jsx(node, pre = false) {
  if (node.nodeName === '#text') {
    if (!pre && !node.value.trim() && !touchesInline(node)) return '' // whitespace between blocks never renders
    const v = pre ? node.value : node.value.replace(/\s+/g, ' ')
    if (!pre && v && v === v.trim() && !/[{}<>&]/.test(v)) return v // safe as bare JSX text
    return v ? `{${JSON.stringify(v)}}` : ''
  }
  if (node.nodeName === '#comment') return `{/* ${node.data.trim().replace(/\*\//g, '* /')} */}`
  const tag = node.tagName
  if (!tag || tag === 'script' || tag === 'style') return ''
  if (tag === 'textarea') {
    return `<textarea${attrs(node)} defaultValue={${JSON.stringify(text(node))}} />`
  }
  if (VOID.has(tag)) return `<${tag}${attrs(node)} />`
  const kids = (node.content ?? node).childNodes.map((c) => jsx(c, pre || tag === 'pre')).join('\n')
  return `<${tag}${attrs(node)}>${kids}</${tag}>`
}

const find = (n, pred) => {
  if (pred(n)) return n
  for (const c of n.childNodes ?? []) { const r = find(c, pred); if (r) return r }
}
const findAll = (n, pred, acc = []) => {
  if (pred(n)) acc.push(n)
  for (const c of n.childNodes ?? []) findAll(c, pred, acc)
  return acc
}

fs.mkdirSync(pagesDir, { recursive: true })
const routes = []
const fontLinks = new Set()

for (const s of screens) {
  const id = s.name.split('/').pop()
  const slug = slugById[id]
  const file = path.join(designs, `${id}.html`)
  if (!slug || !fs.existsSync(file)) continue
  const html = fs.readFileSync(file, 'utf8')
  const doc = parse(html)
  const head = find(doc, (n) => n.tagName === 'head')
  const body = find(doc, (n) => n.tagName === 'body')
  const Name = pascal(slug)

  for (const l of findAll(head, (n) => n.tagName === 'link')) {
    const a = Object.fromEntries(l.attrs.map((x) => [x.name, x.value]))
    if (a.rel === 'stylesheet') fontLinks.add(a.href)
  }

  // Tailwind config: evaluate the object literal from the page's inline script.
  const cfgSrc = html.match(/tailwind\.config\s*=\s*([\s\S]*?)<\/script>/)?.[1].trim().replace(/;\s*$/, '')
  const cfg = cfgSrc ? vm.runInNewContext(`(${cfgSrc})`) : {}
  fs.writeFileSync(path.join(pagesDir, `${Name}.tailwind.cjs`),
`// Generated from Stitch screen "${s.title}". Scoped to #page-${slug} so it can't clash with other screens.
module.exports = {
  important: '#page-${slug}',
  // 공통 컴포넌트도 같은 빌드에서 만들어야 화면 클래스와 우선순위·반응형 순서가 맞는다.
  content: ['./src/pages/${Name}.tsx', './src/components/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  plugins: [require('@tailwindcss/container-queries')],
  ...${JSON.stringify(cfg, null, 2).replace(/\n/g, '\n  ')},
}
`)
  fs.writeFileSync(path.join(pagesDir, `${Name}.css`),
    `@config "./${Name}.tailwind.cjs";\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`)

  const css = findAll(head, (n) => n.tagName === 'style').map(text).join('\n').trim()
  const bodyAttrs = attrs({ ...body, tagName: 'div', attrs: body.attrs })
  const scripts = findAll(body, (n) => n.tagName === 'script').map((n) => n.attrs.find((a) => a.name === 'data-purpose')?.value ?? 'inline')
  const children = body.childNodes.map((c) => jsx(c)).filter(Boolean).join('\n')

  fs.writeFileSync(path.join(pagesDir, `${Name}.tsx`),
`// Generated by scripts/stitch-to-react.mjs from Stitch screen "${s.title}" (${id}).
${scripts.length ? `// shortcut: original inline scripts (${scripts.join(', ')}) were not ported; add React state/hooks when wiring real behaviour.\n` : ''}import './${Name}.css'

${css ? `// Page-local styles from the Stitch <head>; mounted only while this page is shown.\nconst css = ${JSON.stringify(css)}\n\n` : ''}export default function ${Name}() {
  return (
    <div id="page-${slug}">
${css ? '      <style>{css}</style>\n' : ''}      <div${bodyAttrs}>
${children}
      </div>
    </div>
  )
}
`)
  routes.push({ slug, Name, title: s.title })
}

routes.sort((a, b) => a.slug.localeCompare(b.slug))
fs.writeFileSync(path.join(root, 'src/routes.ts'),
`// Generated by scripts/stitch-to-react.mjs
${routes.map((r) => `import ${r.Name} from './pages/${r.Name}'`).join('\n')}

export const routes = [
${routes.map((r) => `  { path: '/${r.slug}', title: ${JSON.stringify(r.title)}, Component: ${r.Name} },`).join('\n')}
]
`)
fs.writeFileSync(path.join(root, '.stitch/font-links.json'), JSON.stringify([...fontLinks], null, 2))
console.log(`generated ${routes.length} pages, ${fontLinks.size} stylesheet links`)
