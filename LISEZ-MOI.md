# Formations B2A Smart Farming (version Pro)

Cette branche contient les **vidéos** et les **fiches PDF** de formation créées pour l'application, et le fichier `catalogue.json` que l'application lit (onglet **Formation** de chaque lot).

- `videos/` : vidéos verticales narrées en français (720 × 1280), avec sous-titres et logo B2A.
- `pdf/` : fiches PDF A4 du même sujet.
- `catalogue.json` : liste des formations (espèces, semaines d'âge, durée, taille, adresse).
- `outils/` : générateur (`gen.py`, contenus dans `contenus.py`) et `programme.json` (sujets des prochaines semaines).

Publication : à chaque modification de cette branche, le dossier `formations/` du site est mis à jour
(https://azizyou2005.github.io/b2a-smart-farming/formations/catalogue.json), sans reconstruire l'application ni l'APK.

Une tâche programmée ajoute chaque semaine une nouvelle vidéo et une nouvelle fiche, en suivant `outils/programme.json`.
Pour retirer une formation : mettez `"publie": false` dans `catalogue.json` (ou supprimez la ligne et les fichiers).

Les conseils sont généraux et doivent être adaptés avec le vétérinaire.
