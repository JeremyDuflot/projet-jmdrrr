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
