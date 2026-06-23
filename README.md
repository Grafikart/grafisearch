# GrafiSearch

Un moteur de recherche personnalisé pour correspondre à mes besoins (pensé pour un usage personnel en local et pas pour être hébergé en ligne).

## Pourquoi ?

Chacun a sa vision du moteur de recherche perso, mes points importants sont les suivants :

- Avoir un joli fond d'écran en homepage (à la bing)
- La page doit s'afficher rapidement
- La recherche doit supporter les bangs (!rt, !wrenfr...)
- Le thème doit être personnalisable
- Des réponses instantanées pour des cas simples (timer, calculatrice)
- Remplir la totalité de l'écran (souvent l'espace à droite n'est pas utilisé)
- Supprimer les sites poubelles ou les sites "pay to view" (pinterest, allocine, jeuxvideos.com...)
- Pas de publicité

## Comment ?

L'objectif est donc d'avoir un binaire qui lance un serveur web (pour que ça soit rapide) qui servira de moteur de recherche.
Ce serveur web récupèrera les résultats des différents moteur de recherche pour les reformater.

## Déploiement avec Docker

```bash
docker compose up -d --build
```
