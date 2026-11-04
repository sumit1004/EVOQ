# Design System
Proposed tokens; validate brand direction before visual implementation.
```css
:root {
  --bg:#0B0D12; --surface:#131722; --surface-raised:#1A2030;
  --border:#2A3242; --text:#F4F6FA; --muted:#9AA4B2;
  --primary:#7C5CFC; --success:#27AE78; --warning:#D99A35; --danger:#D6535B;
  --radius-sm:6px; --radius-md:10px; --radius-lg:16px;
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-6:24px; --space-8:32px;
}
```
Use legible sans-serif typography; body 14–16px, page headings 24–32px, metadata 12–13px. Components: primary/secondary/destructive buttons; labelled forms; responsive tables; cards; accessible dialogs; text-labelled status chips; inline errors and toasts. Proposed breakpoints 640/768/1024/1280px; test at 360/768/1440px. Use React + plain CSS/CSS Modules; no Tailwind.
