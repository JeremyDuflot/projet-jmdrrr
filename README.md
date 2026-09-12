# Projet outil pour Jeu de rôle

## Groupe 4
- Gautier De Mauroy
- Mickaël Desclaut
- Jérémy Duflot
- Solène Gouin

## Lancer le projet
```sh
npm ci
```
```sh
npm run dev
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

## Bonus
Système de santé
- Points de vie (HP) : maxHp, currentHp pour les joueurs
- Barre de vie visuelle : composant LifeBar avec couleurs dynamiques selon le pourcentage de points de vie
- Édition interactive : boutons +/-1, +/-10, édition directe, validation/annulation
- État automatique : passage automatique à "mort" si HP = 0

Interface utilisateur avancée
- Modale de succès : popup animé avec icône Check lors de la résolution
- Navigation : boutons Retour/Accueil flottants
- Panneau latéral MJ : CampaignPlayersPanel fixé en bas à droite expandable avec HP des joueurs
- Recherche de lieux : PlaceNavigator avec filtre pour les déplacements

Création de personnages pour joueur
- Modal de création : PlayerCreateModal avec formulaire complet
- Inventaire initial : possibilité d'ajouter des objets lors de la création
- Sélection de campagne : choix de la campagne cible lors de la création

Gestion des erreurs
- Alerte de persistance : message d'erreur si localStorage échoue
- Feedback import/export : messages de succès/erreur visibles
- Validation de formulaires : messages d'erreur inline

Aspects techniques
- Remapping d'ID : lors de duplication/import pour éviter les conflits
- Jeu de données à l'installation avec Faker-js

UI/UX améliorée
- Thème graphique complet JDR médiévale avec TailwindCSS v4 + DaisyUI + Lucide Vue + images personnalisées
- Responsive
- Collapse/expand : chapitres et quêtes en accordéon
- Badges d'état : badges colorés selon les états
- Compteurs : nombre de chapitres, quêtes, joueurs, lieux, objets, indices
- Détail des quêtes : modal avec informations complètes
- Filtre visibilité : les joueurs ne voient que les chapitres actifs/complétés
- Auto-activation : premier chapitre activé automatiquement
- Auto-progression : chapitre suivant activé quand le précédent est terminé
- Abandon automatique : quêtes non résolues abandonnées quand chapitre terminé
