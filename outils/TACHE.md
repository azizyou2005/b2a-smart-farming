# Ajout hebdomadaire d'une formation (instructions pour la tâche programmée)

1. Cloner la branche : `git clone --depth 1 -b formations https://github.com/azizyou2005/b2a-smart-farming fo`
2. Outils : `pip install --break-system-packages kokoro-onnx soundfile reportlab pillow numpy` ;
   voix : télécharger dans `$B2A_TTS` les fichiers
   https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx (renommé kokoro.onnx) et
   https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin (renommé voices.bin).
   Logo : `outils/b2a-logo.png` et `outils/b2a-nom.png` (variables `B2A_LOGO`, `B2A_NOM`). Polices : Inter (vidéo) et DejaVu Sans (PDF).
3. Prendre le premier sujet de `outils/programme.json` avec `"fait": false`.
4. Écrire la formation dans `outils/contenus.py` (même structure que les autres : 7 à 8 scènes de vidéo, narration en mots simples,
   chiffres écrits en toutes lettres dans la narration, et 3 à 4 sections de fiche PDF). Conseils prudents, reconnus, à adapter avec le vétérinaire.
5. Générer : `cd outils && SORTIE=.. python3 gen.py <id>` (met à jour `../videos`, `../pdf` et `../catalogue.json`).
6. Vérifier quelques images de la vidéo et la fiche PDF, puis marquer le sujet `"fait": true` (ajouter de nouveaux sujets s'il en reste moins de 5).
7. Commit et push sur la branche `formations` : la publication sur le site est automatique.
