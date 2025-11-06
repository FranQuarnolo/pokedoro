<h1 align="center">🕒 Pokédoro — Pomodoro App con Pokémon</h1>

<p align="center">
  <strong>Tu compañero Pokémon para mantenerte enfocado 🎯</strong><br>
  Desarrollado en <b>React + TypeScript + Vite</b>
</p>

<p align="center">
  <img src="https://play.pokemonshowdown.com/sprites/ani/pikachu.gif" height="80" />
  <img src="https://play.pokemonshowdown.com/sprites/ani/psyduck.gif" height="80" />
  <img src="https://play.pokemonshowdown.com/sprites/ani/fearow.gif" height="80" />
  <img src="https://play.pokemonshowdown.com/sprites/ani/snorlax.gif" height="80" />
</p>

---

## 🧭 Descripción

**Pokédoro** es una aplicación Pomodoro con temática Pokémon.  
Cada sesión de concentración invoca a un Pokémon distinto que te acompaña mientras trabajás o estudiás.  
Cuando termina el tiempo... 🔔 suena un aviso, tu dispositivo vibra y tu Pokémon celebra con vos.

---

## 🚀 Stack técnico

### 🧱 Frontend

- ⚛️ [React 18](https://react.dev/)
- 🧩 [TypeScript](https://www.typescriptlang.org/)
- ⚡ [Vite](https://vite.dev/)
- 🎨 [Ant Design](https://ant.design/) (UI Components)
- ⏱️ [Day.js](https://day.js.org/) (manejo de tiempo)

### 🧠 Lógica de negocio

- Hook personalizado `usePomodoro()` para control de tiempo, pausa y reinicio.
- Sonido y vibración al finalizar cada ciclo.
- Configuración dinámica de sesión (nombre, Pokémon, duración).
- Persistencia de datos mediante **Context API** (`TimersContext`).

---

## 🗂️ Estructura del proyecto

```
src/
├── components/
│   ├── pokemon/
│   │   ├── PokemonSprite.tsx        # Muestra al Pokémon animado
│   │   └── PokemonSelector.tsx      # Selector con miniaturas
│   └── ui/
├── hooks/
│   └── usePomodoro.ts               # Lógica principal del temporizador
├── pages/
│   ├── TimerListPage.tsx            # Lista de timers
│   └── ActiveTimerPage.tsx          # Pantalla activa del Pomodoro
├── contexts/
│   └── TimersContext.tsx
├── styles/
│   ├── ActiveTimerPage.module.css
│   └── global.css
└── main.tsx
```

---

## ⚙️ Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

Abrí 👉 [http://localhost:5173](http://localhost:5173) para ver la app.

---

## 🔔 Funcionalidades clave

✅ **Ciclos Pomodoro personalizables** (duración configurable)  
💾 **Persistencia de sesiones** en contexto global  
🎵 **Sonido y vibración** al completar un ciclo  
🖥️ **Interfaz responsiva** con modo oscuro  
🐾 **Pokémon animado** que te acompaña durante el trabajo

---

## 🧰 Desarrollo y linting

Este proyecto sigue la plantilla oficial de **Vite** con soporte para **React + TypeScript + ESLint**.

Podés ampliar las reglas de linting para proyectos más grandes:

```js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";
```

> Más detalles en la [guía oficial de Vite](https://vite.dev/guide/).

---

## 💫 Créditos

- 🎨 Sprites de Pokémon cortesía de [Pokémon Showdown](https://play.pokemonshowdown.com/)
- 🔊 Sonidos libres de [Freesound.org](https://freesound.org/)
- ⏳ Inspirado en el método **Pomodoro**, con un toque nostálgico Pokémon

---

<div align="center">
  <h3>🎯 “La concentración es tu mejor ataque. ¡Atrápalos a todos, uno por uno!”</h3>
  <img src="https://play.pokemonshowdown.com/sprites/ani/lucario.gif" height="100" />
</div>
