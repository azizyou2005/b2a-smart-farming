# Mise à jour quotidienne des prix du marché (étude du marché B2A)

Le fichier `marche/prix.json` alimente l'onglet « Prix du marché » de la version Pro et la carte « Étude du marché » de Marché > Vendre.
Les prix viennent **uniquement d'internet** (annonces en ligne, prix officiels, presse, boutiques en ligne), jamais des annonces de l'app.

## Étapes (chaque jour)

1. Relevez les prix récents au Burkina Faso, en priorité :
   - CoinAfrique Burkina : https://bf.coinafrique.com/categorie/poules-lapins-et-pigeons , https://bf.coinafrique.com/categorie/materiel-pour-animaux , https://bf.coinafrique.com/categorie/animaux
   - Rodwoko (rubrique Volaille & Bétail), EspaceAgro, boutiques en ligne d'aliments
   - Prix officiels : communiqués du ministère du Commerce (prix plafonds / planchers), INSD, SONAGESS, SIM bétail
   - Presse : Burkina 24, Sidwaya, LeFaso.net, L'Économiste du Faso (marchés à bétail, œufs, céréales, aliments)
2. Pour chaque prix trouvé, faites un relevé (fichier temporaire `nouveaux.json`, une liste) :
   `{"produit": "<id du produit>", "prix": 2500, "source": "CoinAfrique", "url": "https://…", "ville": "Ouagadougou", "type": "annonce", "date": "AAAA-MM-JJ"}`
   - `type` : `annonce` (petite annonce), `officiel` (prix fixé ou relevé par l'État), `presse` (article), `boutique` (boutique en ligne, site de prix).
   - `date` : date de l'annonce ou de l'article si elle est connue, sinon la date du relevé.
   - Le prix doit correspondre à l'**unité du produit** (tête, plateau de 30, kg, litre, sac de 50 kg, sac de 100 kg, unité). Convertissez si besoin (ex. 12 œufs → 30) et dites-le dans `source`. Ignorez les prix « sur demande » et les lots dont on ne connaît pas le nombre d'animaux.
   - Ne mettez jamais un prix inventé ou estimé de mémoire : chaque relevé doit avoir l'URL où il a été lu.
3. Un produit manque ? Ajoutez-le dans `produits` (id, cat, unite, nom en fr/en/it/es, mots-clés sans accents). Catégories : aliment, animaux, oeufs, poussins, viande, lait, recoltes, plants, fourrage, fumier, materiel, autre.
4. Lancez `python3 outils/prix_maj.py --ajout nouveaux.json` (contrôle, doublons retirés, relevés de plus de 180 jours retirés, historique du jour ajouté), puis supprimez `nouveaux.json`.
5. Commit sur la branche `formations` uniquement (« Prix du marché : mise à jour du JJ/MM/AAAA »), puis push. La publication sur le site est automatique.

Ne touchez ni au code de l'application ni aux autres branches.
