# Publier B2A Smart Farming sur Google Play

## Le fichier à envoyer

À chaque construction (onglet **Actions**), GitHub crée une **Release** avec :
- `b2a-smart-farming-<version>-<n>.aab` : le fichier à envoyer dans **Google Play Console** ;
- `b2a-smart-farming.apk` : l'installation directe sur Android (WhatsApp, clé USB).

Page des fichiers : https://github.com/azizyou2005/b2a-smart-farming/releases/latest

Le numéro de version Android (`versionCode`) augmente tout seul à chaque construction : Google Play exige un numéro plus grand à chaque mise à jour.

L'application vise Android 16 (API 36), exigé par Google Play depuis le 31 août 2026 (Capacitor 8).

## Clé

L'AAB est signé avec la clé du secret `ANDROID_KEYSTORE_B64`. Dans Google Play Console, cette clé devient la **clé d'importation** et Google signe l'application finale (« Signature d'application par Google Play » : laissez l'option par défaut).

Si la construction affiche « La clé actuelle est une clé de débogage », il faut une nouvelle clé :
1. Sur un ordinateur avec Java : `keytool -genkeypair -v -keystore b2a-upload.keystore -alias b2a -keyalg RSA -keysize 2048 -validity 10000`
2. Convertir en une ligne : `base64 -w0 b2a-upload.keystore > ANDROID_KEYSTORE_B64.txt`
3. Sur GitHub, **Settings > Secrets and variables > Actions** : remplacer `ANDROID_KEYSTORE_B64`, et ajouter `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (= `b2a`) et `ANDROID_KEY_PASSWORD`.

Gardez toujours une copie de la clé et des mots de passe en lieu sûr, jamais sur GitHub.

## Politique de confidentialité

En ligne ici (lien à coller dans Play Console) :
https://azizyou2005.github.io/b2a-smart-farming/confidentialite.html


## Mise à jour octobre 2026 : prêt pour la publication
Tous les textes à copier (fiche, Data safety, accès examinateur, URL de suppression) sont dans `store/FICHE-GOOGLE-PLAY.md`.
À faire dans la Play Console : Contenu de l'application > Suppression du compte (coller l'URL `suppression-compte.html`), Sécurité des données, Public cible 18+, Classification, puis envoyer le fichier .aab de la dernière Release.
La demande de suppression faite dans l'app arrive dans la page d'administration (Marché > Demandes de suppression de compte) : à traiter sous 30 jours.
