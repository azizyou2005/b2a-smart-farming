# B2A Smart Farming

Application d'élevage gratuite, utilisable sans internet :
carnet du jour, prévisions de bénéfice, calendrier de vaccination, alertes automatiques, formules d'aliment, factures clients, rapports PDF, guide santé, en français, anglais, italien et espagnol.
L'IA (diagnostic photo et prévisions) se débloque avec un code d'accès B2A.

Elle existe en deux formes, construites automatiquement à partir des mêmes fichiers :

- **Site web installable** : on ouvre le lien une fois, puis « Ajouter à l'écran d'accueil ». Ensuite, il marche sans internet.
- **Application Android (APK)** : un fichier à installer, à partager par WhatsApp ou clé USB.

Tout est gratuit : hébergement GitHub Pages, compilation GitHub Actions, et synchronisation Firebase (offre gratuite « Spark »).

---

## Étape 1 : mettre l'application en ligne (environ 15 minutes, une seule fois)

1. Créez un compte gratuit sur **github.com**.
2. Cliquez sur **New repository**. Nom : `b2a-smart-farming`. Choisissez **Public**, puis **Create repository**.
3. Cliquez sur **uploading an existing file** et glissez **tout le contenu** de ce dossier (y compris le dossier `.github`). Validez avec **Commit changes**.
   - Si le dossier `.github` n'est pas envoyé (il est caché sur certains ordinateurs), créez le fichier à la main :
     **Add file > Create new file**, nom `.github/workflows/build.yml`, puis copiez-collez le contenu du fichier `build.yml`.
4. **Clé de signature de l'APK (facultatif pour le site, nécessaire pour l'APK)** : allez dans **Settings > Secrets and variables > Actions > New repository secret**.
   - Name : `ANDROID_KEYSTORE_B64`
   - Secret : ouvrez le fichier `ANDROID_KEYSTORE_B64.txt` (dossier `cle-secrete`, livré **à part**, jamais sur GitHub), copiez **tout** son contenu (une seule longue ligne) et collez-le.
   - Cliquez sur **Add secret**, puis onglet **Actions > Construire et publier B2A Smart Farming > Run workflow**.
   Sans ce secret, le site web est quand même publié ; seul l'APK n'est pas fabriqué (avertissement jaune dans Actions).
5. La construction (onglet **Actions**) publie le site dans la branche `gh-pages`. Si le site n'apparaît pas après quelques minutes : **Settings > Pages > Source : Deploy from a branch**, branche `gh-pages`, dossier `/ (root)`, **Save**.
6. Votre application est à l'adresse :
   `https://VOTRE-NOM-GITHUB.github.io/b2a-smart-farming/`
   L'APK Android (une fois le secret ajouté) se télécharge depuis l'application (Réglages > Télécharger l'application Android), ou directement :
   `https://VOTRE-NOM-GITHUB.github.io/b2a-smart-farming/b2a-smart-farming.apk`

Partagez ce lien aux éleveurs. Chaque modification envoyée sur GitHub met à jour le site et l'APK.

**Installer l'APK** : sur le téléphone Android, ouvrez le fichier puis autorisez « Installer des applications inconnues » quand Android le demande.

---

## Étape 2 (facultative) : partager les données entre plusieurs téléphones

Sans cette étape, chaque téléphone garde ses propres données (sauvegarde possible par fichier dans Réglages).
Avec cette étape, toute l'équipe d'une ferme voit les mêmes lots et saisies. Hors connexion, les saisies sont gardées dans le téléphone et envoyées automatiquement au retour du réseau.

1. Allez sur **console.firebase.google.com** avec un compte Google. **Créer un projet** (nom : `b2a-smart-farming`). Google Analytics n'est pas nécessaire.
2. Menu **Build > Authentication > Commencer**. Onglet **Sign-in method** : activez **Anonyme**.
3. Menu **Build > Firestore Database > Créer une base de données**. Emplacement : `eur3 (europe-west)`. Démarrez en **mode production**.
4. Onglet **Règles** de Firestore : remplacez tout par le contenu du fichier `firestore.rules`, puis **Publier**.
5. Roue dentée **Paramètres du projet > Vos applications > icône Web `</>`**. Nom : `B2A`. Copiez l'objet `firebaseConfig` affiché.
6. Sur GitHub, ouvrez `www/config.js`, cliquez sur le crayon, et remplacez `window.B2A_FIREBASE = null;` par :
   ```js
   window.B2A_FIREBASE = { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
   ```
   Validez. Le site et l'APK se reconstruisent tout seuls.

**Utilisation** : dans l'application, **Réglages (roue dentée en haut à droite) > Créer une ferme**. Un code de 10 caractères apparaît (ex. `K7QH2MXP9A`).
Envoyez-le à l'équipe (bouton WhatsApp). Chacun fait **Réglages > Rejoindre une ferme** avec ce code.
Le premier lien avec la ferme demande internet, ensuite tout marche hors connexion.

**Limites de l'offre gratuite Firebase** : 50 000 lectures et 20 000 écritures par jour, 1 Go de données. C'est largement suffisant pour des dizaines de fermes. Au-delà, Firebase propose un paiement à l'usage.

**Sécurité** : le code de la ferme sert de clé. Les règles Firebase empêchent de lister les fermes : il faut connaître le code exact. Ne le partagez qu'avec votre équipe. En cas de doute, créez une nouvelle ferme.

---

## Étape 2 bis : inscription obligatoire, retrait d'accès et nombre d'utilisateurs

Quand Firebase est configuré (étape 2), **chaque nouvelle personne doit s'inscrire** (prénom, nom, ville, pays, type et taille d'élevage) avant d'ouvrir l'application.
L'accès est accordé tout de suite. Vous recevez un e-mail pour chaque inscription et vous pouvez **retirer l'accès** à une personne à tout moment dans la page des utilisateurs : l'application se bloque alors chez elle.
Tant que Firebase n'est pas configuré, rien n'est bloqué.

1. Firebase, menu **Build > Authentication > Sign-in method** : activez **Anonyme** (déjà fait à l'étape 2) **et E-mail/Mot de passe**.
2. Onglet **Users > Ajouter un utilisateur** : e-mail `azizyou2005@yahoo.fr` et un mot de passe solide. C'est le seul compte qui peut gérer les utilisateurs (il est écrit dans `firestore.rules`).
3. **Authentication > Settings > Domaines autorisés** : ajoutez `azizyou2005.github.io` (`localhost` y est déjà, il sert pour l'APK).
4. **Firestore > Règles** : remplacez tout par le contenu du fichier `firestore.rules`, puis **Publier**.
5. Vérifiez que `www/config.js` contient votre configuration Firebase (étape 2) et `window.B2A_NOTIFY_EMAIL = "azizyou2005@yahoo.fr";`.
6. **E-mails** : à la première inscription, FormSubmit envoie un e-mail « Activate form » à cette adresse. Cliquez une fois sur le bouton d'activation ; ensuite chaque inscription arrive par e-mail (regardez aussi dans les spams).

**Voir les utilisateurs, leur nombre, et retirer un accès** : https://azizyou2005.github.io/b2a-smart-farming/utilisateurs.html
Connectez-vous avec l'e-mail et le mot de passe du point 2. La page affiche le nombre d'utilisateurs, les nouvelles inscriptions, les personnes actives sur 7 et 30 jours, et la répartition par pays. Pour chaque personne : retirer l'accès, le rendre, ou effacer l'inscription (la personne devra se réinscrire).

**À savoir**
- Internet est nécessaire pour l'inscription. Ensuite, l'application marche sans internet ; le retrait d'accès s'applique dès que le téléphone se reconnecte.
- Une personne qui efface les données de l'application ou change de téléphone doit se réinscrire.
- Une personne dont l'accès est retiré peut se réinscrire en effaçant les données de l'application : vous la verrez réapparaître dans la liste et pourrez retirer l'accès à nouveau.
- **Google Play** : l'équipe de Google peut s'inscrire et tester sans attendre.

---

## Étape 2 ter : équipe de la ferme (propriétaire et employés)

Le téléphone qui **crée** la ferme en devient le **propriétaire**. Les employés installent l'application, s'inscrivent, puis **Réglages > Rejoindre une ferme** avec le code (bouton « Envoyer par WhatsApp »). Tout le monde voit les saisies des autres en temps réel ; hors connexion, les saisies sont gardées et envoyées au retour du réseau. Chaque saisie garde le nom de la personne qui l'a faite.

Dans **Réglages > Partager avec l'équipe**, le propriétaire voit l'équipe et peut :
- **Retirer** un employé (il ne voit plus rien et ne peut plus rien saisir), puis le **réintégrer** ;
- cocher **« J'accepte moi-même chaque nouveau membre »** : les nouveaux arrivants restent en attente jusqu'à ce qu'il appuie sur **Accepter**. Conseillé : sans cette case, quelqu'un qui garde le code peut réinstaller l'application et revenir.

Ferme créée avant cette version : ouvrez Réglages sur le téléphone du propriétaire et appuyez sur **« Devenir propriétaire de cette ferme »** (à faire en premier, avant les employés).

**À faire une fois** : Firebase > Firestore > **Règles** : remplacez tout par le nouveau contenu de `firestore.rules`, puis **Publier**. Sans cela, l'application continue de marcher comme avant, mais sans propriétaire ni retrait d'employés.

## Étape 3 (facultative) : l'IA avec code d'accès

L'application reste gratuite pour tous. Les clients et partenaires B2A reçoivent en plus un **code d'accès** (ex. `B2A-K7QH-2MXP`) qui débloque, quand il y a internet :

- le **diagnostic photo par IA** (onglet Photo IA) : race, potentiel de croissance, santé, plan de suivi ;
- l'**analyse et les prévisions par l'IA** dans le tableau de bord de chaque lot.

Chaque code a un **quota d'analyses par mois** (ex. 30). Le compteur repart à zéro le 1er du mois.
C'est B2A qui paie les analyses à Anthropic, via un petit serveur qui garde la clé secrète.

### 3a. Compte Anthropic (la clé IA)

1. Allez sur **console.anthropic.com** et créez un compte.
2. **Billing** : ajoutez un moyen de paiement et un petit crédit (5 à 10 $ suffisent pour démarrer).
   Une analyse photo coûte en général quelques FCFA. Vérifiez le tarif actuel sur docs.claude.com.
   Conseil : réglez une **limite de dépense mensuelle** dans Billing > Limits.
3. **API Keys > Create Key**. Copiez la clé (elle commence par `sk-ant-`). Ne la donnez à personne et ne la mettez jamais dans l'application.

### 3b. Serveur IA gratuit (Cloudflare Workers)

1. Créez un compte gratuit sur **dash.cloudflare.com**.
2. Menu **Storage & Databases > KV > Create** : nom `B2A_KV`.
3. Menu **Compute (Workers) > Create > Hello World > Deploy**. Nom : `b2a-ia`.
4. **Edit code** : effacez tout, collez le contenu de `serveur-ia/worker.js`, puis **Deploy**.
5. Dans le Worker, onglet **Settings** :
   - **Bindings > Add > KV namespace** : nom de variable `B2A_KV`, espace `B2A_KV`.
   - **Variables and Secrets > Add** (type **Secret**) : `ANTHROPIC_API_KEY` = votre clé `sk-ant-…`.
   - **Variables and Secrets > Add** (type **Secret**) : `ADMIN_KEY` = un mot de passe long, inventé par vous.
   - Facultatif, type **Text** : `MODEL` = `claude-haiku-5-5` pour des analyses moins chères (par défaut : `claude-sonnet-5-5`, plus précis).
6. Copiez l'adresse du Worker, par exemple `https://b2a-ia.votre-nom.workers.dev`.
   En l'ouvrant dans un navigateur, vous devez voir `{"service":"B2A Smart Farming IA","ok":true}`.
7. Sur GitHub, dans `www/config.js`, remplacez `window.B2A_IA_URL = null;` par :
   ```js
   window.B2A_IA_URL = "https://b2a-ia.votre-nom.workers.dev";
   ```
   Le site et l'APK se reconstruisent tout seuls. La carte « Diagnostic photo par IA » apparaît dans l'onglet Photo IA.

L'offre gratuite de Cloudflare permet 100 000 requêtes par jour, largement assez.

### 3c. Créer et gérer les codes

Ouvrez la page d'administration (elle n'apparaît pas dans l'application) :
`https://VOTRE-NOM-GITHUB.github.io/b2a-smart-farming/admin.html`

1. Entrez l'adresse du serveur IA et votre `ADMIN_KEY`.
2. **Nouveau code** : nom du client et nombre d'analyses par mois, puis **Créer le code**.
3. Envoyez le code au client avec le bouton **WhatsApp**. Il le saisit dans l'onglet **Photo IA > Activer**.
4. Dans la liste, vous voyez la consommation de chaque code ce mois-ci. Vous pouvez changer le quota, **désactiver** un code (client qui ne paie plus, code partagé à tort) ou le supprimer.

### Sans internet

Le code reste enregistré dans le téléphone. Sans réseau, les boutons IA attendent le retour de la connexion, et tout le reste de l'application (dont le guide santé) continue de fonctionner.

---

## Mettre à jour l'application plus tard

1. Remplacez sur GitHub les fichiers modifiés (en général `www/index.html` et parfois les autres fichiers de `www`).
2. Dans `www/sw.js`, augmentez le numéro de version : `const CACHE = "b2a-v2";` devient `"b2a-v3"`, puis `"b2a-v4"`, etc.
3. GitHub reconstruit le site et l'APK. Les téléphones reçoivent la nouvelle version à la prochaine ouverture avec internet. Les données des utilisateurs restent sur leur téléphone.
4. Pour l'APK, les utilisateurs installent le nouveau fichier par-dessus l'ancien. Ne supprimez jamais le secret `ANDROID_KEYSTORE_B64` sur GitHub, et gardez une copie du dossier `cle-secrete` en lieu sûr (clé USB, Drive privé) : c'est cette clé qui permet l'installation par-dessus sans perdre les données.

**Ne mettez jamais la clé de signature (`.keystore`) sur GitHub** : le dépôt est public, et quelqu'un pourrait s'en servir pour fabriquer un faux APK qui s'installerait par-dessus le vrai chez les éleveurs.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `www/index.html` | L'application complète |
| `www/shim.js`, `www/extra.js`, `www/guide.js`, `www/dict-extra.js` | Données sur le téléphone, réglages, code IA, guide santé, traductions |
| `www/libs/` | Fabrication des PDF sans internet |
| `www/sw.js` | Fonctionnement sans internet |
| `www/manifest.json`, `www/icons/` | Installation sur l'écran d'accueil, icônes B2A |
| `www/config.js` | Configuration : synchronisation Firebase et adresse du serveur IA |
| `www/admin.html` | Page B2A pour créer et gérer les codes d'accès IA |
| `serveur-ia/worker.js` | Serveur IA à coller dans Cloudflare Workers |
| `capacitor.config.json`, `package.json`, `assets/` | Fabrication de l'APK Android |
| `.github/workflows/build.yml` | Construction automatique du site et de l'APK |
| `firestore.rules` | Règles de sécurité Firebase (sans le code exact, impossible de voir une ferme ni la liste des fermes) |

La clé de signature de l'APK n'est **pas** dans ce dossier : elle est dans le dossier `cle-secrete`, à garder en privé, et sur GitHub uniquement sous forme de secret (étape 1, point 4).

## Gratuit ou IA : qui a quoi

| | Sans code | Avec code B2A |
|---|---|---|
| Carnet, bénéfice, prévisions, calendrier, alertes | Oui | Oui |
| Guide santé hors ligne | Oui | Oui |
| Conseils automatiques | Oui | Oui |
| Diagnostic photo par IA | Non | Oui (internet) |
| Analyse et prévisions par IA | Non | Oui (internet) |
| Prix pour l'éleveur | 0 F | Fixé par B2A |

Le guide et l'IA aident à réagir vite mais ne remplacent pas un vétérinaire.
