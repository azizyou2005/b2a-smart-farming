// Tests des règles de sécurité Firestore (firestore.rules), lancés avec l'émulateur Firebase :
//   cd tests && npx firebase emulators:exec --only firestore --project demo-b2a "node --test rules.test.mjs"
// Chaque test vérifie qu'une action permise passe et qu'une action interdite est refusée.
import { test, before, after, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";

const HERE = dirname(fileURLToPath(import.meta.url));
let env;
const ADMIN = { email: "azizyou2005@yahoo.fr" };
const JPEG = "data:image/jpeg;base64," + "A".repeat(150000);

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-b2a",
    firestore: { rules: readFileSync(join(HERE, "..", "firestore.rules"), "utf8"), host: "127.0.0.1", port: 8085 },
  });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

/** Données de départ écrites sans règles : utilisateurs inscrits, vendeur actif, configuration. */
async function setup(extra) {
  await env.withSecurityRulesDisabled(async c => {
    const db = c.firestore();
    for (const u of ["alice", "bob", "vendeur", "pro"]) await db.doc("inscriptions/" + u).set({ prenom: u, nom: "X", ville: "Ouaga", pays: "BF", elevage: "Volaille", taille: "", statut: "approuve" });
    await db.doc("marche_config/global").set({ taux: 5, telPaiement: "70000000", svcM1: 2500, svcM3: 6000, svcM12: 20000 });
    await db.doc("marche_vendeurs/vendeur").set({ statut: "actif", nom: "Boutique", tel: "70111111", ville: "Ouaga", taux: 5 });
    await db.doc("marche_annonces/a1").set({ devise: "XOF", vendeur: "vendeur", vendeurNom: "Boutique", vendeurTel: "", ville: "Ouaga", cat: "oeufs", titre: "Œufs", desc: "", prix: 2500, unite: "plateau de 30", qte: null, photo: "", statut: "actif" });
    if (extra) await extra(db);
  });
}
const as = (uid, token) => env.authenticatedContext(uid, token).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const annonce = o => ({ devise: "XOF", vendeur: "vendeur", vendeurNom: "Boutique", vendeurTel: "", ville: "Ouaga", cat: "oeufs", titre: "Œufs frais", desc: "", prix: 2500, unite: "plateau de 30", qte: 10, photo: "", statut: "actif", ...o });
const fiche = o => ({ nom: "Dr Test", metier: "veto", specialites: "", ville: "Ouaga", quartier: "", zones: "", tel: "70123456", wa: "", horaires: "", deplace: true, agrement: "", desc: "", photo: "", ...o });

test("inscriptions : on ne lit que la sienne ; personne ne se met « bloqué » ou un autre statut", async () => {
  await setup();
  await assertSucceeds(as("alice").doc("inscriptions/alice").get());
  await assertFails(as("alice").doc("inscriptions/bob").get());
  await assertFails(anon().doc("inscriptions/alice").get());
  await assertFails(as("carol").doc("inscriptions/carol").set({ prenom: "C", nom: "D", ville: "V", pays: "P", elevage: "E", taille: "", statut: "admin" }));
  await assertSucceeds(as("carol").doc("inscriptions/carol").set({ prenom: "C", nom: "D", ville: "V", pays: "P", elevage: "E", taille: "", statut: "approuve" }));
  await assertFails(as("alice").doc("inscriptions/alice").update({ statut: "approuve", prenom: "Autre" }));
});

test("marché : seul un vendeur actif publie, avec une photo intégrée (jamais une adresse web)", async () => {
  await setup();
  await assertFails(as("alice").doc("marche_annonces/x").set(annonce({ vendeur: "alice" })));
  await assertSucceeds(as("vendeur").doc("marche_annonces/x").set(annonce()));
  await assertSucceeds(as("vendeur").doc("marche_annonces/y").set(annonce({ photo: JPEG })));
  await assertFails(as("vendeur").doc("marche_annonces/z").set(annonce({ photo: "https://exemple.com/suivi.png" })));
  await assertFails(as("vendeur").doc("marche_annonces/z").set(annonce({ vendeurTel: "70111111" })));
  await assertFails(as("vendeur").doc("marche_annonces/z").set(annonce({ prix: -5 })));
  await assertFails(as("vendeur").doc("marche_annonces/z").set(annonce({ champInconnu: 1 })));
  await assertFails(as("vendeur").doc("marche_annonces/z").set(annonce({ devise: "BTC" })));
});

test("marché : l'acheteur ne peut pas changer le prix ni le vendeur d'une commande", async () => {
  await setup();
  const cmd = o => ({ annonce: "a1", titre: "Œufs", vendeur: "vendeur", vendeurNom: "Boutique", acheteur: "alice", acheteurVille: "Ouaga", qte: 2, unite: "plateau de 30", prix: 2500, total: 5000, devise: "XOF", statut: "demande", ...o });
  const db = as("alice");
  await assertSucceeds(db.doc("marche_commandes/c1").set(cmd()));
  await assertFails(db.doc("marche_commandes/c2").set(cmd({ prix: 100, total: 200 })));
  await assertFails(db.doc("marche_commandes/c3").set(cmd({ total: 10 })));
  await assertFails(db.doc("marche_commandes/c4").set(cmd({ vendeur: "bob" })));
  await assertFails(db.doc("marche_commandes/c5").set(cmd({ acheteur: "bob" })));
  await assertFails(db.doc("marche_commandes/c6").set(cmd({ commission: 0 })));
  // le vendeur accepte avec la commission au bon taux, pas en dessous
  await assertFails(as("vendeur").doc("marche_commandes/c1").update({ statut: "acceptee", commission: 1, accepteLe: 1 }));
  await assertSucceeds(as("vendeur").doc("marche_commandes/c1").update({ statut: "acceptee", commission: 250, accepteLe: 1 }));
  await assertFails(as("bob").doc("marche_commandes/c1").get());
});

test("marché : la pièce d'identité reste privée", async () => {
  await setup(db => db.doc("marche_pieces/vendeur").set({ type: "cnib", titulaire: "X", cnib: "B1234567", rccm: "", ifu: "", photo: JPEG, statut: "attente", motif: "" }));
  await assertSucceeds(as("vendeur").doc("marche_pieces/vendeur").get());
  await assertFails(as("alice").doc("marche_pieces/vendeur").get());
  await assertSucceeds(as("x", ADMIN).doc("marche_pieces/vendeur").get());
  await assertFails(as("vendeur").doc("marche_pieces/vendeur").update({ statut: "validee" }));
});

test("services : fiche en attente, mise en ligne seulement par B2A", async () => {
  await setup();
  const pro = as("pro");
  await assertFails(pro.doc("services_pros/pro").set({ ...fiche(), statut: "actif" }));
  await assertFails(pro.doc("services_pros/pro").set({ ...fiche(), statut: "attente", finLe: 9e12 }));
  await assertFails(pro.doc("services_pros/pro").set({ ...fiche({ photo: "https://exemple.com/a.png" }), statut: "attente" }));
  await assertSucceeds(pro.doc("services_pros/pro").set({ ...fiche({ photo: "data:image/jpeg;base64,AAAA" }), statut: "attente" }));
  // un éleveur ne voit pas une fiche en attente, mais voit les fiches en ligne
  await assertFails(as("alice").doc("services_pros/pro").get());
  await assertSucceeds(as("alice").collection("services_pros").where("statut", "==", "actif").get());
  await assertFails(as("alice").collection("services_pros").get());
  // le prestataire ne peut pas se mettre en ligne ni se marquer vérifié
  await assertFails(pro.doc("services_pros/pro").update({ statut: "actif" }));
  await assertFails(pro.doc("services_pros/pro").update({ verifie: true }));
  await assertSucceeds(pro.doc("services_pros/pro").update({ ville: "Koudougou", majLe: 1 }));
  // paiement déclaré, validé par B2A
  const pay = { pro: "pro", nom: "Dr Test", formule: "m3", mois: 3, montant: 6000, ref: "CI2410.1530", telPayeur: "70123456", statut: "attente" };
  await assertSucceeds(pro.doc("services_paiements/p1").set(pay));
  await assertFails(pro.doc("services_paiements/p2").set({ ...pay, statut: "valide" }));
  await assertFails(as("alice").doc("services_paiements/p3").set({ ...pay }));
  await assertFails(pro.doc("services_paiements/p1").update({ statut: "valide" }));
  await assertFails(as("alice").doc("services_paiements/p1").get());
  const admin = as("x", ADMIN);
  await assertSucceeds(admin.doc("services_pros/pro").update({ statut: "actif", finLe: 9e12 }));
  await assertSucceeds(admin.doc("services_paiements/p1").update({ statut: "valide" }));
  await assertSucceeds(as("alice").doc("services_pros/pro").get());
});

test("erreurs : chacun peut signaler, seul B2A lit", async () => {
  await setup();
  const e = { msg: "TypeError: x", src: "app.js:1:2", pile: "", version: "v48", plateforme: "android (web)", langue: "fr", ecran: "tableau", nb: 1 };
  await assertSucceeds(as("alice").collection("erreurs").add(e));
  await assertFails(as("alice").collection("erreurs").add({ ...e, telephone: "70000000" }));
  await assertFails(as("alice").collection("erreurs").add({ ...e, msg: "x".repeat(400) }));
  await assertFails(anon().collection("erreurs").add(e));
  await assertFails(as("alice").collection("erreurs").get());
  await assertSucceeds(as("x", ADMIN).collection("erreurs").get());
});

test("fermes : les données ne sont lisibles qu'avec le bon code et l'accord du propriétaire", async () => {
  await setup(async db => {
    await db.doc("farms/ABCDE12345").set({ owner: "alice", approbation: true });
    await db.doc("farms/ABCDE12345/members/alice").set({ name: "A", role: "proprietaire", statut: "actif" });
    await db.doc("farms/ABCDE12345/members/bob").set({ name: "B", role: "employe", statut: "attente" });
    await db.doc("farms/ABCDE12345/lots/l1").set({ nom: "Lot" });
  });
  await assertSucceeds(as("alice").doc("farms/ABCDE12345/lots/l1").get());
  await assertFails(as("bob").doc("farms/ABCDE12345/lots/l1").get());
  await assertFails(as("vendeur").doc("farms/ABCDE12345/lots/l1").get());
  await assertFails(as("alice").collection("farms").get());
  await assertFails(as("bob").doc("farms/ABCDE12345/members/bob").update({ statut: "actif" }));
  await assertSucceeds(as("alice").doc("farms/ABCDE12345/members/bob").update({ statut: "actif" }));
  await assertSucceeds(as("bob").doc("farms/ABCDE12345/lots/l1").get());
});
