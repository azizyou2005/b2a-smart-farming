/* ===== Configuration B2A Smart Farming =====
   Tout est facultatif : avec les deux valeurs à null, l'application marche seule
   sur chaque téléphone, gratuitement et sans internet. Voir LISEZ-MOI.md. */

/* 1. Synchronisation entre téléphones (Firebase, gratuit).
   Remplacez null par la configuration de votre projet, par exemple :
   window.B2A_FIREBASE = { apiKey: "AIza...", authDomain: "xxx.firebaseapp.com", projectId: "xxx",
                           storageBucket: "xxx.appspot.com", messagingSenderId: "123", appId: "1:123:web:abc" }; */
window.B2A_FIREBASE = null;

/* 2. IA avec code d'accès (serveur Cloudflare B2A).
   Remplacez null par l'adresse de votre serveur, par exemple :
   window.B2A_IA_URL = "https://b2a-ia.votre-nom.workers.dev"; */
window.B2A_IA_URL = null;
