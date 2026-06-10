# Homepage Entry Points Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clear applicant login and submission entry points to the public homepage without adding admin or direct payment links.

**Architecture:** Keep the current public homepage structure and add simple route links in the existing header and hero. Reuse current translation strings and button/link styling; only add small header-specific CSS needed to fit the new account actions on desktop and mobile.

**Tech Stack:** Vue 3 single-file components, Vue Router path links, TypeScript, existing CSS modules, Vite build.

---

## File Structure

- Modify `src/components/SiteHeader.vue`: add applicant account links next to the language switcher.
- Modify `src/components/HeroSection.vue`: change the primary CTA from `#` to the login route with dashboard redirect.
- Modify `src/styles/header.css`: style the new compact account links in the fixed header.
- Modify `src/styles/responsive.css`: keep the new account links readable in the mobile header layout.
- Do not modify admin pages, payment pages, backend APIs, or route guards.
- Do not add an admin homepage link.

---

### Task 1: Add Homepage Applicant Entry Links

**Files:**
- Modify: `src/components/SiteHeader.vue`
- Modify: `src/components/HeroSection.vue`
- Modify: `src/styles/header.css`
- Modify: `src/styles/responsive.css`

- [ ] **Step 1: Update hero CTA target**

In `src/components/HeroSection.vue`, replace:

```vue
<a href="#" class="btn btn-primary">{{ t('ctaEntry') }}</a>
```

with:

```vue
<a href="/login?redirect=/dashboard" class="btn btn-primary">{{ t('ctaEntry') }}</a>
```

- [ ] **Step 2: Add header account links**

In `src/components/SiteHeader.vue`, add this block after `</nav>` and before `<div class="lang-switcher"...>`:

```vue
<div class="header-entry-links" :aria-label="t('ctaEntry')">
  <a class="header-entry-link" href="/login">{{ t('loginLink') }}</a>
  <a class="header-entry-link header-entry-link-primary" href="/login?redirect=/dashboard">
    {{ t('ctaEntry') }}
  </a>
</div>
```

The header must not include an `/admin` link.

- [ ] **Step 3: Add desktop header link styles**

In `src/styles/header.css`, add after `.header-actions`:

```css
.header-entry-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-entry-link {
  border: 1px solid rgba(237, 21, 102, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  color: var(--text-main);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  padding: 9px 14px;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.header-entry-link:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.header-entry-link-primary {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.header-entry-link-primary:hover {
  color: #fff;
  filter: brightness(0.96);
}
```

- [ ] **Step 4: Add mobile header link styles**

In `src/styles/responsive.css`, inside `@media (max-width: 992px)` after `.header-actions { display: contents; }`, add:

```css
.header-entry-links {
  order: 2;
  display: flex;
  flex: 1 0 100%;
  gap: 8px;
  margin-inline: -14px;
  overflow-x: auto;
  padding: 0 14px 2px;
  scrollbar-width: none;
}

.header-entry-links::-webkit-scrollbar {
  display: none;
}

.header-entry-link {
  font-size: 12px;
  padding: 8px 12px;
}
```

Then change the existing mobile `nav` rule from:

```css
nav {
  order: 2;
```

to:

```css
nav {
  order: 3;
```

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 6: Inspect for forbidden admin/payment links**

Run:

```bash
rg -n 'href="/admin|href="/payment|href="/submissions/.*/payment|href="#"' src/components/SiteHeader.vue src/components/HeroSection.vue
```

Expected: no matches.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/SiteHeader.vue src/components/HeroSection.vue src/styles/header.css src/styles/responsive.css
git commit -m "feat: add homepage entry points"
```

---

### Task 2: Verify Homepage Entry Points

**Files:**
- Review: `src/components/SiteHeader.vue`
- Review: `src/components/HeroSection.vue`
- Review: `src/styles/header.css`
- Review: `src/styles/responsive.css`

- [ ] **Step 1: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run test:typecheck
```

Expected: typecheck exits 0.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 4: Review final diff**

Run:

```bash
git status --short --branch
git diff --stat HEAD~1..HEAD
git show --stat --oneline HEAD
```

Expected:

- Working tree is clean.
- The latest commit only changes homepage entry point files and header responsive styles.
- No admin or direct payment homepage link was added.

---

## Self-Review

- Spec coverage: Task 1 adds header Login/Submit links, updates hero CTA, excludes admin links, excludes direct payment links, and preserves existing route guards.
- Placeholder scan: no implementation step contains TBD, TODO, or vague follow-up text.
- Type consistency: no new TypeScript types are introduced; all translation keys already exist.
