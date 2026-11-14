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
const ADMIN = { email: "azizyou2005@yahoo.fr", firebase: { sign_in_provider: "password" } };
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
    for (const u of ["alice", "bob", "vendeur", "pro", "alice00000", "admin00000"]) await db.doc("inscriptions/" + u).set({ prenom: u, nom: "X", ville: "Ouaga", pays: "BF", elevage: "Volaille", taille: "", statut: "approuve" });
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

test("doublons : on lit une empreinte précise, jamais la liste ; on n'écrit que la sienne, une fois inscrit", async () => {
  await setup();
  const K = "n_" + "a".repeat(32), D = "d_" + "b".repeat(32);
  await assertSucceeds(as("alice").doc("doublons/" + K).set({ uid: "alice", mail: false }));
  await assertSucceeds(as("bob").doc("doublons/" + K).get());
  await assertFails(anon().doc("doublons/" + K).get());
  await assertFails(as("bob").collection("doublons").get());
  await assertSucceeds(as("x", ADMIN).collection("doublons").get());
  await assertFails(as("bob").doc("doublons/" + D).set({ uid: "alice", mail: false }));
  await assertFails(as("carol").doc("doublons/" + D).set({ uid: "carol", mail: false }));
  await assertFails(as("bob").doc("doublons/autre").set({ uid: "bob", mail: false }));
  await assertFails(as("bob").doc("doublons/" + D).set({ uid: "bob", mail: "oui" }));
  await assertFails(as("bob").doc("doublons/" + D).set({ uid: "bob", mail: true, nom: "Bob" }));
  await assertSucceeds(as("bob").doc("doublons/" + K).set({ uid: "bob", mail: true }));
  await assertFails(as("bob").doc("doublons/" + K).delete());
});

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
  // position arrondie autorisée, position mal formée refusée
  await assertSucceeds(as("vendeur").doc("marche_annonces/g").set(annonce({ geo: { lat: 12.36, lon: -1.52 } })));
  await assertFails(as("vendeur").doc("marche_annonces/h").set(annonce({ geo: { lat: 200, lon: -1.52 } })));
  await assertFails(as("vendeur").doc("marche_annonces/h").set(annonce({ geo: { lat: 12.3, lon: -1.5, adresse: "x" } })));
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
  // la position exacte du vendeur n'est donnée qu'à l'acceptation
  await assertFails(as("vendeur").doc("marche_commandes/c1").update({ vendeurPos: { lat: 12.37123, lon: -1.51987 } }));
  await assertSucceeds(as("vendeur").doc("marche_commandes/c1").update({ statut: "acceptee", commission: 250, accepteLe: 1, vendeurPos: { lat: 12.37123, lon: -1.51987 } }));
  await assertFails(as("bob").doc("marche_commandes/c1").get());
});

test("marché : la pièce d'identité reste privée", async () => {
  await setup(db => db.doc("marche_pieces/vendeur").set({ type: "cnib", titulaire: "X", cnib: "B1234567", rccm: "", ifu: "", photo: JPEG, statut: "attente", motif: "" }));
  await assertSucceeds(as("vendeur").doc("marche_pieces/vendeur").get());
  await assertFails(as("alice").doc("marche_pieces/vendeur").get());
  await assertSucceeds(as("x", ADMIN).doc("marche_pieces/vendeur").get());
  await assertFails(as("vendeur").doc("marche_pieces/vendeur").update({ statut: "validee" }));
  // la position exacte du vendeur est dans sa fiche privée, illisible par les autres
  await assertSucceeds(as("vendeur").doc("marche_vendeurs/vendeur").update({ pos: { lat: 12.37123, lon: -1.51987 } }));
  await assertFails(as("alice").doc("marche_vendeurs/vendeur").get());
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
  await assertSucceeds(pro.doc("services_pros/pro").update({ geo: { lat: 12.36, lon: -1.52 }, geoExacte: true, majLe: 2 }));
  await assertFails(pro.doc("services_pros/pro").update({ geo: { lat: "12", lon: -1.52 }, majLe: 3 }));
  await assertFails(pro.doc("services_pros/pro").update({ geoExacte: "oui", majLe: 3 }));
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

test("ferme sans propriétaire : il faut être membre actif ; admin seulement avec mot de passe", async () => {
  await setup(async db => {
    await db.doc("farms/OLDFARM123/members/alice").set({ name: "A", role: "employe", statut: "actif" });
    await db.doc("farms/OLDFARM123/lots/l1").set({ nom: "Lot" });
  });
  await assertSucceeds(as("alice").doc("farms/OLDFARM123/lots/l1").get());
  // bob connaît le code mais n'est pas dans l'équipe : refusé tant qu'il ne s'est pas inscrit comme membre
  await assertFails(as("bob").doc("farms/OLDFARM123/lots/l1").get());
  await assertFails(as("bob").doc("farms/OLDFARM123/lots/l2").set({ nom: "Pirate" }));
  // même adresse e-mail, mais connexion d'un autre type : pas administrateur
  await assertFails(as("y", { email: "azizyou2005@yahoo.fr", firebase: { sign_in_provider: "google.com" } }).doc("inscriptions/alice").update({ statut: "bloque" }));
  await assertSucceeds(as("x", ADMIN).doc("inscriptions/alice").update({ statut: "bloque" }));
});

test("signalements : tout inscrit signale en son nom ; seul B2A lit et efface", async () => {
  await setup();
  const ok = { type: "annonce", cible: "a1", vendeur: "vendeur", nom: "Boutique", titre: "Œufs", motif: "arnaque", detail: "Prix trop bas", auteur: "alice", creeLe: new Date() };
  await assertSucceeds(as("alice").collection("signalements").add(ok));
  await assertFails(as("alice").collection("signalements").add({ ...ok, auteur: "bob" }));
  await assertFails(as("alice").collection("signalements").add({ ...ok, motif: "n'importe" }));
  await assertFails(as("alice").collection("signalements").add({ ...ok, extra: 1 }));
  await assertFails(anon().collection("signalements").add(ok));
  await assertFails(as("alice").collection("signalements").get());
  await assertSucceeds(as("b2a", ADMIN).collection("signalements").get());
});

test("version Pro : la validation vétérinaire demande un abonnement Pro en cours (vérifié par le serveur)", async () => {
  const { Timestamp } = await import("firebase/firestore");
  const demande = o => ({ eleveur: "alice", eleveurNom: "Alice", eleveurTel: "70000001", cle: "u_alice00000", lotId: "l1", lot: { nom: "Lot 1" },
    vaccins: [{ produit: "Newcastle" }], veto: "pro", vetoNom: "Dr Test", statut: "attente", message: "", ...o });
  await setup(async db => {
    await db.doc("services_pros/pro").set({ ...fiche(), statut: "actif" });
    await db.doc("pro_fermes/u_bob0000000").set({ finLe: Timestamp.fromMillis(Date.now() + 30 * 864e5), formule: "m1" });
    await db.doc("pro_fermes/u_carol00000").set({ finLe: Timestamp.fromMillis(Date.now() - 864e5), formule: "m1" });
  });
  // sans abonnement : refusé
  await assertFails(as("alice00000").collection("veto_demandes").add(demande({ eleveur: "alice00000", cle: "u_alice00000" })));
  // abonnement de quelqu'un d'autre : refusé
  await assertFails(as("alice00000").collection("veto_demandes").add(demande({ eleveur: "alice00000", cle: "u_bob0000000" })));
  // abonnement terminé : refusé
  await env.withSecurityRulesDisabled(async c => { await c.firestore().doc("inscriptions/carol00000").set({ prenom: "c", nom: "X", ville: "O", pays: "BF", elevage: "V", taille: "", statut: "approuve" }); await c.firestore().doc("inscriptions/bob0000000").set({ prenom: "b", nom: "X", ville: "O", pays: "BF", elevage: "V", taille: "", statut: "approuve" }); });
  await assertFails(as("carol00000").collection("veto_demandes").add(demande({ eleveur: "carol00000", cle: "u_carol00000" })));
  // compte B2A (administrateur) : version Pro gratuite, sans abonnement
  await assertSucceeds(as("admin00000", ADMIN).collection("veto_demandes").add(demande({ eleveur: "admin00000", cle: "u_admin00000" })));
  // abonnement Pro en cours : accepté
  await assertSucceeds(as("bob0000000").collection("veto_demandes").add(demande({ eleveur: "bob0000000", cle: "u_bob0000000" })));
});

test("personnel : salaires, paie et évaluations réservés au propriétaire ; tâches partagées avec l'équipe", async () => {
  await setup(async db => {
    await db.doc("farms/ABCDE12345").set({ owner: "alice", approbation: false });
    await db.doc("farms/ABCDE12345/members/alice").set({ name: "A", role: "proprietaire", statut: "actif" });
    await db.doc("farms/ABCDE12345/members/bob").set({ name: "B", role: "employe", statut: "actif" });
    await db.doc("farms/ABCDE12345/evaluations/e1").set({ pid: "p1", moyenne: 4 });
    await db.doc("farms/ABCDE12345/taches/t1").set({ titre: "Nourrir", faits: {} });
  });
  await assertSucceeds(as("alice").doc("farms/ABCDE12345/evaluations/e1").get());
  await assertSucceeds(as("alice").doc("farms/ABCDE12345/paies/x1").set({ pid: "p1", montant: 30000 }));
  await assertSucceeds(as("alice").doc("farms/ABCDE12345/rh_contrats/p1").set({ salaire: 30000 }));
  await assertFails(as("bob").doc("farms/ABCDE12345/evaluations/e1").get());
  await assertFails(as("bob").doc("farms/ABCDE12345/rh_contrats/p1").get());
  await assertFails(as("bob").doc("farms/ABCDE12345/paies/x2").set({ pid: "p1", montant: 999999 }));
  await assertFails(as("bob").collection("farms/ABCDE12345/paies").get());
  await assertSucceeds(as("bob").doc("farms/ABCDE12345/taches/t1").update({ faits: { "2026-11-14": { par: "B" } } }));
  await assertFails(as("vendeur").doc("farms/ABCDE12345/taches/t1").get());
});

test("statistiques nationales : résumé anonyme par l'éleveur, rapports lus seulement par le ministère autorisé", async () => {
  await setup(async db => { await db.doc("ministere_acces/mini").set({ nom: "DGSV" }); });
  const { serverTimestamp } = await import("firebase/firestore");
  const MIN = { email: "dgsv@agriculture.gov.bf", firebase: { sign_in_provider: "password" } };
  const res = o => ({ pays: "Burkina Faso", ville: "Ouaga", province: "Kadiogo", cle: "", nbLots: 2, version: "60.32",
    especes: { pondeuse: { lots: 1, effectif: 500, morts30: 3, oeufs30: 9000, lait30: 0, vaccDus: 2, vaccFaits: 2, alerte: 0 } }, cultures: {}, majLe: serverTimestamp(), ...o });
  // l'éleveur inscrit envoie et relit SON résumé ; jamais celui d'un autre, jamais avec un nom ou un téléphone
  await assertSucceeds(as("alice").doc("stats_contrib/alice").set(res()));
  await assertSucceeds(as("alice").doc("stats_contrib/alice").get());
  await assertFails(as("bob").doc("stats_contrib/alice").get());
  await assertFails(as("bob").collection("stats_contrib").get());
  await assertFails(as("bob").doc("stats_contrib/alice").set(res()));
  await assertFails(as("carol").doc("stats_contrib/carol").set(res()));            // pas inscrit
  await assertFails(as("bob").doc("stats_contrib/bob").set(res({ nom: "Bob" })));
  await assertFails(as("bob").doc("stats_contrib/bob").set(res({ tel: "70000000" })));
  await assertFails(as("bob").doc("stats_contrib/bob").set(res({ cle: "CODEFERME1" })));   // jamais le code de la ferme en clair
  await assertSucceeds(as("bob").doc("stats_contrib/bob").set(res({ cle: "a".repeat(32) })));
  // retrait de l'accord
  await assertSucceeds(as("alice").doc("stats_contrib/alice").delete());
  // B2A lit tous les résumés et publie ; le ministère ne lit que les rapports
  await assertSucceeds(as("x", ADMIN).collection("stats_contrib").get());
  await assertSucceeds(as("x", ADMIN).doc("ministere_rapports/r1").set({ titre: "Rapport", nbFermes: 5 }));
  await assertSucceeds(as("mini", MIN).doc("ministere_rapports/r1").get());
  await assertSucceeds(as("mini", MIN).collection("ministere_rapports").get());
  await assertFails(as("mini", MIN).doc("ministere_rapports/r2").set({ titre: "Faux" }));
  await assertFails(as("mini", MIN).collection("stats_contrib").get());
  await assertFails(as("mini", MIN).doc("inscriptions/alice").get());
  await assertFails(as("mini", MIN).doc("ministere_acces/autre").set({ nom: "moi" }));
  // un éleveur, un compte sans accès ou un compte anonyme ne lisent pas les rapports
  await assertFails(as("alice").doc("ministere_rapports/r1").get());
  await assertFails(as("autre", MIN).doc("ministere_rapports/r1").get());
  await assertFails(as("mini").doc("ministere_rapports/r1").get());               // même uid mais sans mot de passe
  await assertFails(anon().doc("ministere_rapports/r1").get());
  await assertSucceeds(as("x", ADMIN).doc("ministere_acces/nouveau").set({ nom: "DPA" }));
});
