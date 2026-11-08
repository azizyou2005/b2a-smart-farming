#!/usr/bin/env python3
"""Mise à jour du fichier marche/prix.json (étude du marché B2A, prix relevés sur internet).

Usage :
  python3 outils/prix_maj.py                 → contrôle le fichier, recalcule les médianes, ajoute le point du jour à l'historique
  python3 outils/prix_maj.py --ajout F.json  → ajoute les relevés du fichier F.json (liste d'objets, voir PRIX.md) puis recalcule

Chaque relevé : {"produit": "<id>", "prix": 2500, "source": "CoinAfrique", "url": "https://…", "ville": "Ouagadougou",
                 "type": "annonce" | "officiel" | "presse" | "boutique", "date": "AAAA-MM-JJ"}
Règles : un relevé par URL et par produit (le plus récent gagne) ; relevés de plus de 180 jours retirés,
sauf s'il n'en resterait aucun pour le produit (on garde alors les 5 plus récents).
"""
import json, sys, datetime, statistics
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
F = RACINE / "marche" / "prix.json"
GARDE_JOURS = 180
TYPES = {"annonce", "officiel", "presse", "boutique"}


def charger():
    return json.loads(F.read_text(encoding="utf-8"))


def controler(d):
    ids = set()
    for p in d["produits"]:
        assert p["id"] not in ids, "id en double : " + p["id"]
        ids.add(p["id"])
        for k in ("cat", "unite", "nom", "mots"):
            assert k in p, f"{p['id']} : champ {k} manquant"
        for l in ("fr", "en", "it", "es"):
            assert p["nom"].get(l), f"{p['id']} : nom {l} manquant"
    for r in d["releves"]:
        assert r["produit"] in ids, "produit inconnu : " + r["produit"]
        assert isinstance(r["prix"], (int, float)) and r["prix"] > 0, r
        assert r.get("url", "").startswith("https://"), "URL https obligatoire : " + str(r)
        assert r.get("type") in TYPES, "type inconnu : " + str(r)
        datetime.date.fromisoformat(r["date"])
    return ids


def nettoyer(d):
    # un relevé par (produit, url, prix) : le plus récent
    vus = {}
    for r in sorted(d["releves"], key=lambda r: r["date"]):
        vus[(r["produit"], r["url"], r.get("variante", ""))] = r
    rel = list(vus.values())
    lim = (datetime.date.today() - datetime.timedelta(days=GARDE_JOURS)).isoformat()
    out = []
    for p in d["produits"]:
        R = sorted([r for r in rel if r["produit"] == p["id"]], key=lambda r: r["date"], reverse=True)
        recents = [r for r in R if r["date"] >= lim]
        out += recents if recents else R[:5]
    d["releves"] = sorted(out, key=lambda r: (r["produit"], r["date"]))


def historique(d):
    jour = datetime.date.today().isoformat()
    H = d.setdefault("historique", {})
    for p in d["produits"]:
        P = sorted(r["prix"] for r in d["releves"] if r["produit"] == p["id"])
        if not P:
            continue
        h = [x for x in H.get(p["id"], []) if x["date"] != jour]
        h.append({"date": jour, "med": round(statistics.median(P)), "n": len(P)})
        H[p["id"]] = h[-60:]


def main():
    d = charger()
    if "--ajout" in sys.argv:
        nouv = json.loads(Path(sys.argv[sys.argv.index("--ajout") + 1]).read_text(encoding="utf-8"))
        d["releves"] += nouv
    controler(d)
    nettoyer(d)
    historique(d)
    d["maj"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ")
    F.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    n = {p["id"]: sum(1 for r in d["releves"] if r["produit"] == p["id"]) for p in d["produits"]}
    print("prix.json à jour :", len(d["produits"]), "produits,", len(d["releves"]), "relevés")
    print("Produits avec moins de 3 relevés :", ", ".join(k for k, v in n.items() if v < 3) or "aucun")


if __name__ == "__main__":
    main()
