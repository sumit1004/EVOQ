# Design System
Proposed tokens; validate brand direction before visual implementation.
```css

/* EVOQ — NEBULA Design System */

:root,
[data-theme="dark"] {
  color-scheme: dark;

  --bg-primary: #0B1020;
  --bg-secondary: #10172A;
  --bg-card: #151C30;
  --bg-elevated: #1D2840;

  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-muted: #8491A8;

  --border-color: #2B3650;

  --brand-primary: #8B5CF6;
  --brand-secondary: #22D3EE;
  --accent-coral: #FB7185;
  --accent-lime: #A3E635;

  --color-success: #A3E635;
  --color-warning: #FBBF24;
  --color-error: #F87171;
  --color-info: #22D3EE;

  --button-primary: #8B5CF6;
  --button-primary-hover: #7C3AED;
  --button-primary-text: #FFFFFF;

  --focus-ring: #A78BFA;
}

[data-theme="light"] {
  color-scheme: light;

  --bg-primary: #F6F7FB;
  --bg-secondary: #EEF1F7;
  --bg-card: #FFFFFF;
  --bg-elevated: #FFFFFF;

  --text-primary: #17172B;
  --text-secondary: #475569;
  --text-muted: #64748B;

  --border-color: #E2E8F0;

  --brand-primary: #7C3AED;
  --brand-secondary: #0891B2;
  --accent-coral: #E11D48;
  --accent-lime: #4D7C0F;

  --color-success: #4D7C0F;
  --color-warning: #B45309;
  --color-error: #DC2626;
  --color-info: #0891B2;

  --button-primary: #7C3AED;
  --button-primary-hover: #6D28D9;
  --button-primary-text: #FFFFFF;

  --focus-ring: #A78BFA;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
}

```
Use legible sans-serif typography; body 14–16px, page headings 24–32px, metadata 12–13px. Components: primary/secondary/destructive buttons; labelled forms; responsive tables; cards; accessible dialogs; text-labelled status chips; inline errors and toasts. Proposed breakpoints 640/768/1024/1280px; test at 360/768/1440px. Use React + plain CSS/CSS Modules; no Tailwind.
