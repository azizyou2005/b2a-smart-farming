/* ===== Configuration B2A Smart Farming =====
   Tout est facultatif : avec les deux valeurs à null, l'application marche seule
   sur chaque téléphone, gratuitement et sans internet. Voir LISEZ-MOI.md. */

/* 1. Synchronisation entre téléphones (Firebase, gratuit).
   Remplacez null par la configuration de votre projet, par exemple :
   window.B2A_FIREBASE = { apiKey: "AIza...", authDomain: "xxx.firebaseapp.com", projectId: "xxx",
                           storageBucket: "xxx.appspot.com", messagingSenderId: "123", appId: "1:123:web:abc" }; */
window.B2A_FIREBASE = {
  apiKey: "AIzaSyD6vKcdBn_SQ-z6SzxCu9A5igDw5hHvwRs",
  authDomain: "b2a-smart-farming.firebaseapp.com",
  projectId: "b2a-smart-farming",
  storageBucket: "b2a-smart-farming.firebasestorage.app",
  messagingSenderId: "9797420984",
  appId: "1:9797420984:web:1843c4054c43a899c9714d"
};

/* 2. IA avec code d'accès (serveur Cloudflare B2A).
   Remplacez null par l'adresse de votre serveur, par exemple :
   window.B2A_IA_URL = "https://b2a-ia.votre-nom.workers.dev"; */
window.B2A_IA_URL = null;

/* 3. Accès sur autorisation : quand Firebase est configuré (point 1), chaque nouvel utilisateur
   doit être accepté dans la page utilisateurs.html. Un e-mail est envoyé à cette adresse pour
   chaque nouvelle demande (la première fois, confirmez l'activation dans l'e-mail de FormSubmit). */
window.B2A_NOTIFY_EMAIL = "azizyou2005@yahoo.fr";
