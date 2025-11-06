# 🕒 Pokédoro — Pomodoro App con Pokémon

¡Bienvenido a **Pokédoro**!  
Una app Pomodoro desarrollada en **React + TypeScript + Vite**, con temática Pokémon.  
Cada sesión de concentración invoca a un Pokémon diferente que te acompaña mientras trabajás o estudiás.  
Cuando termina el tiempo... 🔔 suena un aviso, vibra tu dispositivo y tu Pokémon celebra contigo.

<div align="center">
  <img src="https://play.pokemonshowdown.com/sprites/ani/pikachu.gif" height="80" />
  <img src="https://play.pokemonshowdown.com/sprites/ani/psyduck.gif" height="80" />
  <img src="https://play.pokemonshowdown.com/sprites/ani/fearow.gif" height="80" />
  <img src="https://play.pokemonshowdown.com/sprites/ani/snorlax.gif" height="80" />
</div>

---

## 🚀 Stack técnico

**Frontend:**

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Ant Design](https://ant.design/) (UI Components)
- [Day.js](https://day.js.org/) (manejo de tiempo)

**Lógica de negocio:**

- Hook personalizado `usePomodoro()` con control de tiempo, pausa y reinicio.
- Sonido y vibración al finalizar cada ciclo.
- Configuración dinámica de sesión (nombre, Pokémon, duración).
- Almacenamiento de sesiones con **Context API** (`TimersContext`).

---

## 🧩 Estructura básica

src/
├── components/
│ ├── pokemon/
│ │ ├── PokemonSprite.tsx ← muestra al Pokémon animado
│ │ └── PokemonSelector.tsx ← selector con miniaturas
│ └── ui/
├── hooks/
│ └── usePomodoro.ts ← lógica principal del temporizador
├── pages/
│ ├── TimerListPage.tsx ← lista de timers
│ └── ActiveTimerPage.tsx ← pantalla activa de Pomodoro
├── contexts/
│ └── TimersContext.tsx
├── styles/
│ ├── ActiveTimerPage.module.css
│ └── global.css
└── main.tsx

---

## ⚙️ Instalación y ejecución

````bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

Abrí http://localhost:5173
 para ver la app.

🔔 Funcionalidades clave

🕒 Ciclos Pomodoro personalizables (duración configurable).

🧠 Persistencia de sesiones en contexto global.

🎵 Notificación sonora y vibración al completar un ciclo.

🧩 Interfaz responsiva y dark mode.

🐾 Pokémon animado que te acompaña en cada sesión.

🧰 Desarrollo y linting

Este proyecto sigue la plantilla oficial de Vite con ESLint y soporte para React + TypeScript.
Podés ampliar las reglas de ESLint para proyectos grandes siguiendo las recomendaciones de Vite:

import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'


Configuraciones avanzadas disponibles en la guía oficial
.

💫 Créditos

Sprites de Pokémon cortesía de Pokémon Showdown
.

Sonidos libres de Freesound.org
.

Inspirado por el clásico método Pomodoro, con un toque de nostalgia Pokémon.

<div align="center">

🎯 “La concentración es tu mejor ataque. ¡Atrápalos a todos, uno por uno!”
<img src="https://play.pokemonshowdown.com/sprites/ani/lucario.gif" height="90" />

</div> ```
````
