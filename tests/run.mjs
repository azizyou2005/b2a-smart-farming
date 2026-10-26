// Lance une commande de test ; en cas d'échec, recopie les lignes utiles dans une annotation GitHub
// (visible dans l'onglet Actions et lisible sans télécharger tout le journal).
// Usage : node tests/run.mjs "Titre" commande arguments…
import { spawn } from "node:child_process";
const [title, ...cmd] = process.argv.slice(2);
const out = [];
const p = spawn(cmd.join(" "), { shell: true, stdio: ["inherit", "pipe", "pipe"] });
for (const s of [p.stdout, p.stderr]) s.on("data", d => { process.stdout.write(d); out.push(...String(d).split("\n")); });
p.on("close", code => {
  if (code) {
    const keep = [];
    out.forEach((l, i) => { if (/not ok|ÉCHEC|Error|✖|expected|actual|AssertionError|FAIL|denied|PERMISSION|^\s*-\s/i.test(l)) keep.push(...out.slice(i, i + 3)); });
    const lines = [...new Set((keep.length ? keep : out.slice(-40)).map(l => l.trim()).filter(Boolean))].slice(0, 80);
    const esc = s => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
    console.log(`::error title=${esc(title)}::${esc(lines.join("\n"))}`);
  }
  process.exit(code ?? 1);
});
