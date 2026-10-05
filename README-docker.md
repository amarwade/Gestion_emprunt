# Démarrer EduLoan avec Docker

## Prérequis
- Docker avec Docker Compose

## Démarrage
À la racine du projet :

```bash
docker compose up --build
```

Ouvrez http://localhost:8080. Le conteneur exécute le serveur Express et sert
à la fois les pages web et les routes API.

Les fichiers CSV se trouvent dans le volume Docker `eduloan_data` : les comptes
et les demandes restent conservés après l’arrêt ou la recréation du conteneur.

## Arrêt

```bash
docker compose down
```

`docker compose down` conserve le volume. Pour repartir de zéro et effacer les
données CSV, supprimez explicitement le volume avec `docker compose down -v`.

Si le port 8080 est déjà utilisé, changez la partie gauche du mapping
`8080:3000` dans `docker-compose.yml`.
