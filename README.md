# EduLoan — Gestion des prêts de PC

EduLoan est une application web de démonstration qui permet à des étudiants de consulter un catalogue de PC portables et de déposer une demande de prêt. Un administrateur peut gérer les comptes depuis une interface dédiée. Les comptes et les demandes sont conservés dans des fichiers CSV.

Ce dépôt correspond à un prototype pédagogique : il illustre un parcours web complet (interface, API, session et persistance simple), mais ne constitue pas un système prêt à être exposé sur Internet.

## Sommaire

- [Objectif et périmètre](#objectif-et-périmètre)
- [Fonctionnalités](#fonctionnalités)
- [Parcours utilisateur](#parcours-utilisateur)
- [Architecture technique](#architecture-technique)
- [Installation et lancement](#installation-et-lancement)
- [Comptes de test](#comptes-de-test)
- [Données et règles métier](#données-et-règles-métier)
- [API](#api)
- [Déploiement Docker](#déploiement-docker)
- [Scénario de démonstration](#scénario-de-démonstration)
- [Limites connues et améliorations](#limites-connues-et-améliorations)
- [Présentation orale](#présentation-orale)

## Objectif et périmètre

Le problème traité est la gestion des prêts de matériel informatique dans un établissement. L’application centralise la consultation des appareils, l’envoi d’une demande et le suivi des demandes d’un étudiant.

Le périmètre réalisé comprend :

1. l’inscription et l’authentification d’un étudiant ;
2. la consultation des disponibilités du catalogue ;
3. la création d’une demande avec un motif et une durée ;
4. l’enregistrement de cette demande dans un CSV ;
5. l’affichage des demandes propres à l’étudiant connecté ;
6. la création et la consultation de comptes par un administrateur.

Les statuts de prêt peuvent être changés directement dans le CSV. L’application n’a pas encore d’écran permettant à un administrateur d’accepter ou de refuser une demande.

## Fonctionnalités

### Étudiant

- créer un compte étudiant ;
- se connecter et se déconnecter ;
- consulter le catalogue de six PC ;
- filtrer et rechercher dans les appareils ;
- consulter le statut de chaque appareil ;
- envoyer une demande pour un PC disponible ;
- saisir un motif et une durée comprise entre 1 et 60 jours ;
- consulter ses demandes, leur statut et les prêts en cours.

Une demande envoyée reçoit le statut initial `en_attente`. Un étudiant ne peut avoir qu’une demande ou un emprunt actif à la fois ; un PC associé à une demande active n’est plus disponible.

### Administrateur

- accéder à l’espace d’administration après authentification ;
- consulter les comptes sans afficher leurs mots de passe ;
- créer un compte étudiant ou administrateur ;
- actualiser la liste des comptes.

La gestion des emprunts (acceptation, refus, clôture) n’est pas disponible dans cette interface.

## Parcours utilisateur

1. L’étudiant ouvre la page d’accueil, puis s’inscrit ou se connecte.
2. Le serveur vérifie les identifiants à partir de `data/etudiants.csv` et crée une session.
3. L’étudiant consulte le catalogue. Les statuts sont calculés à partir de `data/emprunts.csv`.
4. Il choisit un appareil disponible, indique le motif et le nombre de jours, puis envoie sa demande.
5. Le serveur valide les données et les règles métier, puis ajoute une ligne au CSV.
6. L’espace étudiant relit l’API et affiche les demandes du compte de la session.

## Architecture technique

| Partie | Technologies et rôle |
| --- | --- |
| Interface | HTML, CSS et JavaScript dans le navigateur |
| Serveur | Node.js et Express |
| API | Routes JSON pour l’authentification, les comptes, le catalogue et les demandes |
| Authentification | `express-session`, avec cookie de session `httpOnly` |
| Persistance | Fichiers CSV dans `data/` |
| Conteneurisation | Docker et Docker Compose |

Le navigateur ne lit pas les CSV directement. Il communique avec le serveur, qui lit et met à jour les fichiers. Les fichiers de données sont bloqués par le serveur statique afin d’éviter leur téléchargement direct.

### Organisation des fichiers

```text
Gestion_emprunt/
├── server.js                 # Serveur Express et API
├── package.json              # Dépendances et commandes npm
├── index.html                # Accueil
├── login.html                # Connexion
├── inscription.html          # Inscription
├── forgot-password.html      # Récupération (mode démonstration)
├── espace-etudiant.html      # Catalogue et suivi personnel
├── demande-pret.html         # Formulaire de demande
├── admin.html                # Gestion des comptes
├── js/                       # Logique JavaScript des pages
├── css/                      # Feuilles de style
├── assets/images/            # Logo et images du catalogue
├── data/
│   ├── etudiants.csv         # Comptes
│   └── emprunts.csv          # Demandes et statuts
├── Dockerfile
└── docker-compose.yml
```

## Installation et lancement

### Prérequis

- Node.js (Node.js 20 LTS est recommandé) ;
- npm, installé avec Node.js.

### Windows PowerShell

Dans PowerShell, placez-vous dans le dossier du projet. Si l’exécution de `npm.ps1` est bloquée, utilisez `npm.cmd` :

```powershell
cd .\Gestion_emprunt
npm.cmd install
npm.cmd start
```

Le serveur affiche qu’il est démarré sur `http://localhost:3000`. Ouvrez ensuite cette adresse dans le navigateur. Ne lancez pas les commandes npm depuis le dossier parent : `package.json` se trouve dans `Gestion_emprunt`.

### macOS, Linux ou terminal intégré compatible

```bash
cd Gestion_emprunt
npm install
npm start
```

### Pages principales

| Page | Adresse locale |
| --- | --- |
| Accueil | <http://localhost:3000/> |
| Inscription | <http://localhost:3000/inscription.html> |
| Connexion | <http://localhost:3000/login.html> |
| Espace étudiant | <http://localhost:3000/espace-etudiant.html> |
| Demande de prêt | <http://localhost:3000/demande-pret.html> |
| Administration | <http://localhost:3000/admin.html> |

Les pages étudiantes et administrateur vérifient la session. Pour tester leurs fonctions, il faut d’abord se connecter.

## Comptes de test

Les comptes présents dans le fichier fourni sont des données de démonstration. Ils peuvent être utilisés localement pour essayer la connexion. Consultez `data/etudiants.csv` pour les identifiants, et utilisez un compte dont la colonne `Role` vaut `admin` pour ouvrir l’administration.

Ne publiez pas ce fichier ni ses mots de passe. Pour une démonstration devant le professeur, créez si besoin un compte de test dédié et supprimez-le ensuite.

## Données et règles métier

### Comptes — `data/etudiants.csv`

Les colonnes sont séparées par des points-virgules :

```text
Nom;Prénom;Identifiant;MotDePasse;DateInscription;Role
```

Les rôles utilisés sont `etudiant` et `admin`. Les anciennes lignes sans colonne `Role` sont interprétées comme des comptes étudiants.

### Demandes et prêts — `data/emprunts.csv`

Le fichier est initialisé automatiquement s’il n’existe pas. Les colonnes sont :

```text
id;student_id;pc_id;motif;duree_jours;statut;date_demande
```

Exemple de ligne fictive :

```text
EM-EXEMPLE;2026123;EL-1042;Travail universitaire;7;en_attente;2026-10-05T10:00:00.000Z
```

| Statut | Signification | Disponibilité du PC |
| --- | --- | --- |
| `en_attente` | Demande déposée, à traiter | Réservé |
| `en_cours` | Prêt accepté et actif | Emprunté |
| `refusee` | Demande refusée | Disponible |
| `terminee` | Prêt clôturé / matériel rendu | Disponible |

Les statuts peuvent actuellement être modifiés manuellement dans le CSV. Respectez le séparateur `;`, l’ordre des colonnes et les valeurs de statut indiquées. Faites une copie de sauvegarde avant toute modification.

Les identifiants du catalogue et leurs caractéristiques sont définis dans le code. Le catalogue et le formulaire doivent rester cohérents avec ces identifiants.

## API

Toutes les API sont servies par le même serveur, sur le même domaine que l’interface.

| Méthode | Route | Accès | Description |
| --- | --- | --- | --- |
| `POST` | `/api/login` | Public | Vérifie les identifiants et ouvre une session |
| `POST` | `/api/logout` | Session | Ferme la session |
| `GET` | `/api/check-session` | Public | Indique si une session est active et retourne le profil de session |
| `POST` | `/api/inscription` | Public | Crée un compte étudiant |
| `GET` | `/api/admin/accounts` | Administrateur | Liste les comptes sans les mots de passe |
| `POST` | `/api/admin/accounts` | Administrateur | Crée un compte avec son rôle |
| `GET` | `/api/pcs` | Public | Retourne le statut des PC |
| `GET` | `/api/mes-emprunts` | Session | Retourne les demandes de l’étudiant connecté |
| `POST` | `/api/emprunts` | Session | Valide et enregistre une demande |
| `POST` | `/api/forgot-password` | Public | Simulation de récupération de mot de passe |

Exemple de demande :

```http
POST /api/emprunts
Content-Type: application/json

{
  "pc_id": "EL-1042",
  "motif": "Travail universitaire",
  "duree_jours": 7
}
```

Le serveur utilise la session pour déterminer `student_id` : le navigateur ne peut pas choisir l’identité à laquelle la demande sera attribuée. Les validations portent sur le PC, la longueur du motif, la durée et l’absence d’une demande active pour l’étudiant ou le PC.

## Déploiement Docker

Docker Compose expose l’application sur le port `3000` et monte le dossier local `data/` dans le conteneur pour conserver les CSV :

```bash
docker compose up --build
```

Accès : <http://localhost:3000/>

Arrêt :

```bash
docker compose down
```

Les fichiers d’aide Docker présents dans le dépôt peuvent ne pas tous correspondre à la configuration active : le `Dockerfile` et le `docker-compose.yml` ci-dessus décrivent le mode de lancement à privilégier.

## Scénario de démonstration

1. Démarrer l’application et montrer la page d’accueil.
2. Se connecter avec un compte étudiant de démonstration.
3. Parcourir le catalogue et montrer le statut issu des données.
4. Envoyer une demande sur un PC disponible avec un motif et une durée valides.
5. Montrer la référence affichée après envoi.
6. Ouvrir `data/emprunts.csv` dans l’éditeur pour constater la nouvelle ligne et le statut `en_attente`.
7. Recharger l’espace étudiant pour montrer la demande et le PC réservé.
8. Expliquer que le changement d’état vers `en_cours`, `refusee` ou `terminee` est actuellement manuel.
9. Si le temps le permet, se connecter avec un compte administrateur et montrer la gestion des comptes.

Pour refaire la démonstration, utiliser un étudiant et un PC sans demande active. Une même session étudiante ne peut pas créer plusieurs demandes actives ; il faut clôturer ou refuser la demande précédente dans le CSV, ou utiliser un autre compte de démonstration.

## Limites connues et améliorations

- Les mots de passe sont stockés en clair dans le CSV. La récupération de mot de passe est une simulation qui renvoie le mot de passe ; **ces mécanismes ne sont pas sûrs pour la production**.
- Le secret de session du code est une valeur de démonstration. Il doit être fourni par configuration et remplacé avant un déploiement.
- Le stockage standard d’`express-session` est en mémoire : les sessions ne sont pas partagées entre plusieurs instances et ne résistent pas au redémarrage du serveur.
- Un CSV convient à un prototype mono-instance, mais ne fournit ni transactions, ni gestion robuste des écritures concurrentes, ni requêtes évolutives.
- L’interface admin gère les comptes mais ne traite pas les demandes ; les statuts de prêt sont changés manuellement.
- Le serveur enregistre `en_cours` pour un prêt actif, mais l’affichage du catalogue ne traduit pas encore correctement ce statut. Après modification manuelle d’une demande en `en_cours`, vérifier le statut affiché dans le catalogue.
- Le champ justificatif indique le nom du fichier sélectionné dans l’interface, mais le fichier lui-même n’est pas téléversé ni enregistré.
- Le catalogue est défini dans le code et doit être maintenu en cohérence avec le formulaire.
- Il n’y a pas de suite de tests automatisés complète ni de commande `npm test` actuellement configurée.

Améliorations possibles : hacher les mots de passe (bcrypt/Argon2), mettre en place une vraie réinitialisation par jeton à usage unique, utiliser un stockage de sessions persistant, migrer les CSV vers une base de données, ajouter une interface de traitement des demandes, enregistrer les justificatifs de manière contrôlée, puis ajouter des tests automatisés et une limitation des tentatives de connexion.

## Présentation orale

### Résumé en une phrase

> EduLoan est une application web étudiant-serveur pour consulter la disponibilité de PC, déposer une demande de prêt et suivre son statut, avec une administration séparée pour les comptes.

### Points à expliquer au professeur

- **Besoin** : simplifier la réservation et le suivi du matériel prêté aux étudiants.
- **Utilisateurs** : étudiants et administrateurs, avec des droits différents contrôlés par la session côté serveur.
- **Choix technique** : interface HTML/CSS/JavaScript, API Express et CSV comme persistance simple pour le prototype.
- **Règle importante** : une demande `en_attente` réserve déjà le PC ; un prêt `en_cours` correspond au matériel remis à l’étudiant.
- **Flux des données** : formulaire → API → validations serveur → ajout au CSV → API de lecture → affichage dans le tableau de bord.
- **Limite assumée** : le CSV permet de démontrer le flux, mais devrait être remplacé pour une utilisation réelle multi-utilisateur.
- **Sécurité à améliorer** : mots de passe en clair, récupération non sécurisée et secret de session de démonstration ; ne pas présenter l’application comme prête pour la production.

Une bonne démonstration distingue explicitement une **demande de prêt** d’un **prêt accepté et en cours** : l’envoi du formulaire ne signifie pas que l’étudiant a déjà reçu le PC.
