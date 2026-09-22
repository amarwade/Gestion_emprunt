# Lancer l'application (pour le testeur)

## Prérequis
- Docker + Docker Compose installés

## Démarrage
```bash
docker compose up --build
```

L'app est servie sur http://localhost:8080

## Arrêt
```bash
docker compose down
```

## Notes
- Site statique HTML/CSS/JS servi par nginx, pas de base de données.
- Si le port 8080 est déjà pris sur ta machine, change la partie gauche du mapping dans `docker-compose.yml` (ex: `"8081:80"`).
- Pour voir les logs : `docker compose logs -f app`
