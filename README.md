# projet-jmdrrr

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Jeu de données de démonstration

Au premier lancement, l'app injecte un jeu de données généré avec [faker](https://fakerjs.dev/) :
3 campagnes (une terminée, une en cours, une pas commencée), 4 à 5 chapitres chacune, 8 à 12 quêtes
par chapitre, plus les lieux, objets, indices et 9 joueurs. Le tirage est déterministe.

L'injection ([`src/main.js`](src/main.js)) n'a lieu que si la clé `rpg:campaigns` est absente du
`localStorage`. Supprimer ses campagnes depuis l'app laisse la clé en place : rien n'est réinjecté
par-dessus le travail en cours.

Pour rejouer l'injection, vider cette clé puis recharger la page. Générateur :
[`src/data/seed.js`](src/data/seed.js).
