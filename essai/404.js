/* Revenir à la racine du site, quel que soit le chemin (GitHub Pages sert cette page pour tout fichier manquant) */
(function(){var parts=location.pathname.split("/");var root=location.hostname.endsWith("github.io")&&parts[1]?"/"+parts[1]+"/":"/";document.getElementById("back").href=root})();
