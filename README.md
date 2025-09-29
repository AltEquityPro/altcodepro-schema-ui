# AltCodePro Schema UI

**AltCodePro Schema UI** is a **schema-driven React + TypeScript UI runtime**.
It enables you to define complete applications in **JSON/TypeScript schemas** and render them dynamically using Next.js or React.

This package is the foundation of **AltCodePro’s project generation system**: every project (web app, mobile app, portal) is generated as a schema (`UIProject`) and rendered via this library.

---

## ✨ Features

* **Schema-driven UI**: Define pages/screens using `UIProject`, `UIScreenDef`, `UIElement`, and `RouteList`.
* **Full TypeScript typings** for safe schema authoring.
* **Dynamic Actions** with `useActionHandler`:

  * REST (`api_call`, `crud_*`)
  * GraphQL (`query`, `mutation`, `subscription`)
  * WebSocket
  * AI-powered (`ai_generate`)
  * Audit logs, exports, wallet connect, etc.
* **File Upload Component**: Presigned PUT (S3/GCS/Azure Blob), progress tracking, concurrency, retries, previews, callbacks.
* **State & i18n Context**: `useAppState` + binding resolution for global/local state & translations.
* **Accessibility & Animations**: WCAG 2.1 compliance, Animate.css, Framer Motion, GSAP.
* **Composable**: Bring your own components, scripts, runtime integrations.
* **Multi-tenant ready**: Every AltCodePro project can load its own schema at runtime.

---

## 🚀 Installation

```bash
npm install @altcodepro/schema-ui
# or
yarn add @altcodepro/schema-ui
```

---

## 🛠 Usage

### Define a Project Schema

```ts
import { UIProject, UIScreenDef, ElementType } from "@altcodepro/schema-ui"

const project: UIProject = {
  version: "1.0.0",
  brand: { href: "/", name: "My App" },
  routeList: {
    metadata: { basePath: "/", generatedAt: new Date().toISOString(), totalRoutes: 1 },
    navStyle: {},
    routes: [
      { label: "Home", href: "/", icon: "HomeIcon", showInNavigation: true, file: "app/home/page.tsx", isDynamic: false, screenId: "home" }
    ]
  },
  translations: { en: { "hero.title": "Welcome to My App" } }
}
```

### Render Elements (Example: File Upload Input)

```tsx
import { FileUpload } from "@altcodepro/schema-ui"

<FileUpload
  presignUrl="/api/presign"
  accept="image/*"
  multiple
  onUploaded={(file) => console.log("Uploaded:", file)}
/>
```

### Handle Actions

```tsx
import { useActionHandler } from "@altcodepro/schema-ui"

const { runEventHandler } = useActionHandler({
  runtime: { navigate: (href) => router.push(href) }
})
```

---

## 📚 Examples

### Example 1: Landing Page Schema

```ts
const landingPage: UIProject = {
  version: "1.0.0",
  brand: { href: "/", name: "Acme Inc.", logoUrl: "/logo.png" },
  routeList: {
    metadata: { basePath: "/", totalRoutes: 2, generatedAt: new Date().toISOString() },
    navStyle: {},
    routes: [
      { label: "Home", href: "/", icon: "HomeIcon", showInNavigation: true, file: "app/home/page.tsx", isDynamic: false, screenId: "home" },
      { label: "Contact", href: "/contact", icon: "MailIcon", showInNavigation: true, file: "app/contact/page.tsx", isDynamic: false, screenId: "contact" }
    ]
  },
  screens: [
    {
      id: "home",
      version: "1.0.0",
      layoutType: "cover",
      route: "/",
      elements: [
        { id: "hero-title", type: "text", content: "translations.en.hero.title", tag: "h1", alignment: "center", styles: { className: "text-4xl font-bold" } },
        { id: "cta-button", type: "button", text: "translations.en.hero.cta", variant: "primary", onClick: { action: "navigation", params: { href: "/contact" } } }
      ],
      metadata: { title: "Home - Acme Inc.", description: "Welcome to Acme Inc." },
      translations: { en: { "hero.title": "Welcome to Acme Inc.", "hero.cta": "Contact Us" } }
    }
  ]
}
```

### Example 2: File Upload Integration

```tsx
<FileUpload
  presignUrl="https://example.com/api/presign"
  accept=".pdf,.docx"
  maxSize={10 * 1024 * 1024}
  multiple
  onUploaded={(item) => console.log("Uploaded:", item)}
  onComplete={({ successes, failures }) => console.log("Done:", successes, failures)}
/>
```

---

## ⚡ End-to-End Example: Render a Full Schema

```tsx
import * as React from "react"
import { UIScreenRenderer } from "@altcodepro/schema-ui"
import { landingPage } from "./example-schema"

export default function App() {
  return (
    <UIScreenRenderer
      project={landingPage}
      initialScreenId="home"
      runtime={{
        navigate: (href) => window.location.assign(href),
        toast: (msg, type) => alert(`${type}: ${msg}`),
      }}
    />
  )
}
```

* `UIScreenRenderer` walks the schema and renders each screen.
* Actions (`api_call`, `navigation`, `form submission`, etc.) are handled automatically.
* Runtime can be extended with custom integrations (modals, wallet connect, AI generation, etc.).

---

## 🧪 Try It Online

Play with a live starter on CodeSandbox:
👉 [Open in CodeSandbox](https://codesandbox.io/s/new?file=/src/App.tsx:@altcodepro/schema-ui-example)

Paste your own `UIProject` JSON into the sandbox and watch it render instantly.

---

## 📦 Development

```bash
# build
npm run build

# link locally
npm link

# test
npm test

# publish
npm publish --access public
```

---

## 📖 Documentation

* Full TypeScript schema → `src/types.d.ts`
* Runtime utilities → `src/schema/Actions.tsx`, `src/schema/StateContext.tsx`
* Components → `FileUpload`, `FileUploadRenderer`, `UIScreenRenderer`
* Hooks → `useActionHandler`, `useAppState`

---

## 📝 License

MIT © 2025 [Sireesh Pangaluri / AltCodePro]
