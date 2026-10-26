# Publier B2A Smart Farming sur Google Play

## Le fichier à envoyer

À chaque construction (onglet **Actions**), GitHub crée une **Release** avec :
- `b2a-smart-farming-<version>-<n>.aab` : le fichier à envoyer dans **Google Play Console** ;
- `b2a-smart-farming.apk` : l'installation directe sur Android (WhatsApp, clé USB).

Page des fichiers : https://github.com/azizyou2005/b2a-smart-farming/releases/latest

Le numéro de version Android (`versionCode`) augmente tout seul à chaque construction : Google Play exige un numéro plus grand à chaque mise à jour.

L'application vise Android 16 (API 36), exigé par Google Play depuis le 31 août 2026 (Capacitor 8).

## Clé de signature : à régler AVANT la première publication

**Important.** Des personnes ont déjà installé l'APK (fichier `b2a-smart-farming.apk`), signé avec **votre** clé (secret `ANDROID_KEYSTORE_B64`).
Si Google Play signe l'application avec une autre clé (l'option proposée par défaut), Android refusera d'installer la version Play par-dessus l'APK :
ces personnes devront désinstaller, et elles perdront les données gardées dans le téléphone (sauf sauvegarde).
Pour que la version Play remplace l'APK comme une simple mise à jour, en gardant les données, Google Play doit signer avec **la même clé** que l'APK.

Ce choix se fait une seule fois, **avant** toute publication en test ouvert ou en production. Ensuite, il n'est presque plus modifiable.

### Ce qu'il faut

- Un ordinateur avec Java installé.
- Le fichier `ANDROID_KEYSTORE_B64.txt` (dossier `cle-secrete`) et les mots de passe `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_PASSWORD` et l'alias `ANDROID_KEY_ALIAS` (= `b2a`).

### Étapes

1. Recréer le fichier de clé à partir du texte :
   - Windows : `certutil -decode ANDROID_KEYSTORE_B64.txt b2a.keystore`
   - Mac ou Linux : `base64 -d ANDROID_KEYSTORE_B64.txt > b2a.keystore`
2. Dans Play Console, ouvrez l'application, puis **Protégé avec Play > Distribution sur le Play Store > Accéder à la signature d'application Play** (en anglais : *Protected with Play > Play Store distribution > Go to Play app signing*).
3. Touchez **Changer la clé de signature d'application** (*Change the app signing key*), puis **Fournir une copie de votre clé de signature d'application** (*Provide a copy of your app signing key*), option « exporter et importer une clé depuis un keystore Java ».
4. La Console vous fait télécharger l'outil **PEPK** et une clé de chiffrement, et affiche la commande exacte à lancer. Copiez **cette** commande, en remplaçant le nom du keystore par `b2a.keystore` et l'alias par `b2a`. Elle ressemble à :
   `java -jar pepk.jar --keystore=b2a.keystore --alias=b2a --output=b2a-cle.zip --include-cert --rsa-aes-encryption --encryption-key-path=encryption_public_key.pem`
   Tapez les mots de passe quand ils sont demandés.
5. Importez le fichier `b2a-cle.zip` créé, puis **Enregistrer**.
6. Vérifiez sur la page « Signature d'application » que l'empreinte **SHA-256** du certificat de signature est la même que celle affichée dans l'onglet **Actions** de GitHub (étape « Clé de signature », ligne `SHA256`).
7. Envoyez ensuite le fichier `.aab` de la dernière Release, comme avant.

L'AAB construit par GitHub reste signé avec la même clé : elle sert aussi de clé d'importation. Google conseille d'avoir une clé d'importation différente ; ce n'est pas nécessaire pour démarrer. Si la Console refuse l'AAB après ce réglage, ne publiez rien en production et demandez de l'aide avant d'aller plus loin.

**Ne mettez jamais `b2a.keystore`, `b2a-cle.zip` ni les mots de passe sur GitHub.** Gardez-en une copie en lieu sûr : sans cette clé, plus aucune mise à jour de l'APK n'est possible.

### Si vous avez déjà accepté la clé créée par Google

Si la clé a été choisie mais que rien n'est encore publié en test ouvert ou en production, vous pouvez encore la changer (étapes ci-dessus).
Sinon, prévenez les utilisateurs de l'APK avant la sortie sur Play : **Réglages > Télécharger une sauvegarde**, désinstaller l'APK, installer la version Play, puis **Réglages > Importer une sauvegarde**.
Les fermes partagées (équipe) ne perdent rien : leurs données sont dans Firebase.

## Politique de confidentialité

En ligne ici (lien à coller dans Play Console) :
https://azizyou2005.github.io/b2a-smart-farming/confidentialite.html


## Mise à jour octobre 2026 : prêt pour la publication
Tous les textes à copier (fiche, Data safety, accès examinateur, URL de suppression) sont dans `store/FICHE-GOOGLE-PLAY.md`.
À faire dans la Play Console : Contenu de l'application > Suppression du compte (coller l'URL `suppression-compte.html`), Sécurité des données, Public cible 18+, Classification, puis envoyer le fichier .aab de la dernière Release.
La demande de suppression faite dans l'app arrive dans la page d'administration (Marché > Demandes de suppression de compte) : à traiter sous 30 jours.
