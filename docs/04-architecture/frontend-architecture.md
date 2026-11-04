# Frontend Architecture
React/Vite/JavaScript, React Router, plain CSS/CSS Modules and Axios. Feature folders own pages/components/hooks/API functions. Global context is limited to auth and genuinely global UI preferences; server state remains in feature hooks/cache and must be invalidated after mutations. Route guards improve UX only; backend authorization is authoritative.

Routes: public `/`, `/tournaments`, `/tournaments/:slug`, `/g/:slug`, `/o/:slug`, `/login`, `/register`; gamer `/app/*`; organizer `/organizer/*`; admin `/admin/*`. Every data page defines loading, empty, error, forbidden and success states.
