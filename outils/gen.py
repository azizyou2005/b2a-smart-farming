# -*- coding: utf-8 -*-
"""Générateur des formations B2A Smart Farming : vidéos verticales narrées + fiches PDF + catalogue.json.
Usage : python3 gen.py [id ...]   (sans argument : toutes les formations)
Sortie : sortie/videos/<id>.mp4, sortie/pdf/<id>.pdf, sortie/catalogue.json"""
import os, re, sys, json, math, subprocess, tempfile, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from contenus import F
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.environ.get("SORTIE", os.path.join(HERE, "sortie"))); os.makedirs(OUT + "/videos", exist_ok=True); os.makedirs(OUT + "/pdf", exist_ok=True)
BASE_URL = "https://azizyou2005.github.io/b2a-smart-farming/formations/"
LOGO = os.environ.get("B2A_LOGO", os.path.join(HERE, "b2a-logo.png") if os.path.exists(os.path.join(HERE, "b2a-logo.png")) else "/home/claude/b2a-smart-farming/www/icons/b2a-logo.png")
NOM = os.environ.get("B2A_NOM", os.path.join(HERE, "b2a-nom.png") if os.path.exists(os.path.join(HERE, "b2a-nom.png")) else "/home/claude/b2a-smart-farming/www/icons/b2a-nom.png")
TTS_DIR = os.environ.get("B2A_TTS", os.path.expanduser("~/tts") if os.path.exists(os.path.expanduser("~/tts/kokoro.onnx")) else "/home/claude/tts")
W, H, FPS = 720, 1280, 30
NAVY, DEEP, GREEN, GREENL, GOLD, INK, MUTED, BG = (27, 46, 76), (18, 31, 53), (95, 168, 63), (140, 203, 96), (222, 171, 80), (20, 33, 58), (91, 104, 128), (245, 247, 251)
FD = "/usr/share/fonts/opentype/inter/"
def font(n, s): return ImageFont.truetype(FD + n, s)
F_TITLE, F_BIG, F_PT, F_CAP, F_SMALL, F_SUB = font("InterDisplay-ExtraBold.otf", 56), font("InterDisplay-ExtraBold.otf", 118), font("Inter-SemiBold.otf", 36), font("Inter-SemiBold.otf", 33), font("Inter-Bold.otf", 22), font("Inter-Bold.otf", 40)

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

_logo = Image.open(LOGO).convert("RGB"); _nom = Image.open(NOM).convert("RGBA")
def brand(img, dark):
    d = ImageDraw.Draw(img)
    # pastille blanche en haut à droite : logo B2A original + nom
    lg = _logo.resize((64, 64)); nm = _nom.resize((int(_nom.width * 46 / _nom.height), 46))
    pw = 64 + 12 + nm.width + 28; x0 = W - 30 - pw; y0 = 30
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + 84], radius=24, fill=(255, 255, 255))
    m = Image.new("L", (64, 64), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, 63, 63], radius=14, fill=255)
    img.paste(lg, (x0 + 12, y0 + 10), m); img.paste(nm, (x0 + 12 + 64 + 12, y0 + 19), nm)
    d.text((34, 52), "FORMATION", font=F_SMALL, fill=GOLD)
    d.text((34, 80), "B2A SMART FARMING", font=F_SMALL, fill=(255, 255, 255) if dark else (200, 212, 230))

def caption(img, text):
    d = ImageDraw.Draw(img); lines = wrap(d, text, F_CAP, W - 120)[:4]
    lh = 44; h = lh * len(lines) + 36; y0 = H - 80 - h
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    od.rounded_rectangle([30, y0, W - 30, y0 + h], radius=22, fill=(10, 18, 32, 215)); img.alpha_composite(ov)
    d = ImageDraw.Draw(img)
    for i, l in enumerate(lines):
        tw = d.textlength(l, font=F_CAP); d.text(((W - tw) / 2, y0 + 18 + i * lh), l, font=F_CAP, fill=(255, 255, 255))

def slide(sc, idx, n, cap, intro=False, titre_global=""):
    img = Image.new("RGBA", (W, H), BG + (255,)); d = ImageDraw.Draw(img)
    if intro:
        for y in range(H):  # dégradé bleu nuit
            t = y / H; d.line([(0, y), (W, y)], fill=tuple(int(NAVY[i] * (1 - t) + DEEP[i] * t) for i in range(3)) + (255,))
        brand(img, True); d = ImageDraw.Draw(img)
        lg = _logo.resize((170, 170)); m = Image.new("L", (170, 170), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, 169, 169], radius=36, fill=255)
        img.paste(lg, (60, 260), m)
        y = 480
        for l in wrap(d, titre_global, font("InterDisplay-ExtraBold.otf", 64), W - 120):
            d.text((60, y), l, font=font("InterDisplay-ExtraBold.otf", 64), fill=(255, 255, 255)); y += 78
        if sc.get("sub"): d.text((60, y + 18), sc["sub"], font=F_SUB, fill=GREENL)
    else:
        d.rectangle([0, 0, W, 150], fill=NAVY + (255,)); brand(img, True); d = ImageDraw.Draw(img)
        y = 200
        for l in wrap(d, sc["t"], F_TITLE, W - 110):
            d.text((56, y), l, font=F_TITLE, fill=NAVY); y += 66
        d.rectangle([56, y + 12, 136, y + 20], fill=GREEN + (255,)); y += 50
        if sc.get("big"):
            d.text((56, y), sc["big"], font=F_BIG, fill=GREEN); y += 150
        for p in sc.get("pts", []):
            lines = wrap(d, p, F_PT, W - 112 - 70); h = 46 * len(lines) + 34
            d.rounded_rectangle([46, y, W - 46, y + h], radius=20, fill=(255, 255, 255), outline=(227, 232, 240), width=2)
            d.ellipse([70, y + 24, 104, y + 58], fill=GREEN); d.line([(79, y + 41), (86, y + 49), (97, y + 33)], fill=(255, 255, 255), width=5)
            for i, l in enumerate(lines): d.text((124, y + 17 + i * 46), l, font=F_PT, fill=INK)
            y += h + 16
        if sc.get("fin"):
            d.text((56, min(y + 10, H - 330)), "Conseils généraux : à adapter avec votre vétérinaire.", font=F_SMALL, fill=MUTED)
    # barre de progression
    d.rectangle([0, H - 14, W, H], fill=(227, 232, 240, 255)); d.rectangle([0, H - 14, int(W * (idx + 1) / n), H], fill=GREEN + (255,))
    if cap: caption(img, cap)
    return img.convert("RGB")

_k = None
def tts(text):
    global _k
    if _k is None:
        from kokoro_onnx import Kokoro
        _k = Kokoro(TTS_DIR + "/kokoro.onnx", TTS_DIR + "/voices.bin")
    s, sr = _k.create(text, voice="ff_siwis", speed=0.97, lang="fr-fr"); return s, sr

def sentences(t):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", t.strip()) if s.strip()]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: raise RuntimeError(" ".join(cmd[:6]) + "\n" + r.stderr[-1500:])

def video(f, tmp):
    import numpy as np, soundfile as sf
    segs, audio, sr = [], [], 24000
    n = len(f["scenes"])
    for i, sc in enumerate(f["scenes"]):
        ss = sentences(sc["voix"])
        for j, s in enumerate(ss):
            a, sr = tts(s)
            gap = 0.75 if j == len(ss) - 1 else 0.3
            if i == 0 and j == 0: a = np.concatenate([np.zeros(int(0.25 * sr), dtype=a.dtype), a])
            dur = len(a) / sr + gap; nf = math.ceil(dur * FPS); dur = nf / FPS
            a = np.concatenate([a, np.zeros(int(round(dur * sr)) - len(a), dtype=a.dtype)]); audio.append(a)
            png = f"{tmp}/s{i:02d}_{j:02d}.png"; slide(sc, i, n, s, intro=(i == 0), titre_global=f["titre"]).save(png)
            mp4 = f"{tmp}/s{i:02d}_{j:02d}.mp4"; part = mp4[:-4] + ".part.mp4"
            run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", png, "-vf", f"format=yuv420p,loop=-1:1,trim=duration={dur:.4f}",
                 "-c:v", "libx264", "-crf", "24", "-preset", "veryfast", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", str(FPS), part])
            os.rename(part, mp4); segs.append(mp4)
    with open(f"{tmp}/list.txt", "w") as L: L.write("".join(f"file '{s}'\n" for s in segs))
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{tmp}/list.txt", "-c", "copy", f"{tmp}/v.mp4"])
    sf.write(f"{tmp}/a.wav", np.concatenate(audio), sr)
    out = f"{OUT}/videos/{f['id']}.mp4"; part = out[:-4] + ".part.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{tmp}/v.mp4", "-i", f"{tmp}/a.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "96k", "-ar", "48000", "-movflags", "+faststart", "-shortest", part])
    os.rename(part, out)
    return out, sum(len(a) for a in audio) / sr

def pdf(f):
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem, KeepTogether
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    try: pdfmetrics.getFont("DV")
    except KeyError:
        pdfmetrics.registerFont(TTFont("DV", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")); pdfmetrics.registerFont(TTFont("DVB", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
    nv, gr = colors.Color(*[c / 255 for c in NAVY]), colors.Color(*[c / 255 for c in GREEN])
    st = dict(t=ParagraphStyle("t", fontName="DVB", fontSize=19, leading=24, textColor=nv, spaceAfter=4),
              s=ParagraphStyle("s", fontName="DV", fontSize=10.5, leading=14, textColor=colors.Color(.36, .41, .5), spaceAfter=10),
              h=ParagraphStyle("h", fontName="DVB", fontSize=13, leading=17, textColor=gr, spaceBefore=10, spaceAfter=5),
              p=ParagraphStyle("p", fontName="DV", fontSize=10.5, leading=14.5, textColor=colors.Color(.08, .13, .23)),
              c=ParagraphStyle("c", fontName="DV", fontSize=10, leading=13), cb=ParagraphStyle("cb", fontName="DVB", fontSize=10, leading=13, textColor=colors.white))
    esp = {"pondeuse": "Pondeuses", "chair": "Poulets de chair", "local": "Volaille locale et pintades", "porc": "Porcs", "petitsrum": "Moutons et chèvres", "bovin": "Bovins",
           "vachelait": "Vaches laitières", "chevrelait": "Chèvres laitières", "poisson": "Poissons", "tous": "Toutes les espèces"}
    age = f"Semaines {f['semDe']} à {f['semA']}" if f.get("semDe") is not None else None
    def deco(c, doc):
        c.saveState(); c.setFillColor(nv); c.rect(0, A4[1] - 22 * mm, A4[0], 22 * mm, fill=1, stroke=0)
        c.drawImage(LOGO, 14 * mm, A4[1] - 18 * mm, 14 * mm, 14 * mm)
        c.setFillColor(colors.white); c.setFont("DVB", 12); c.drawString(32 * mm, A4[1] - 10.5 * mm, "B2A Smart Farming")
        c.setFont("DV", 9); c.setFillColor(colors.Color(.87, .67, .31)); c.drawString(32 * mm, A4[1] - 15.5 * mm, "FICHE DE FORMATION · VERSION PRO")
        c.setFillColor(colors.Color(.36, .41, .5)); c.setFont("DV", 7.5)
        c.drawString(14 * mm, 10 * mm, "B2A-HIGH-TECHNOLOGY-AUTOMATION · Ouagadougou · b2a-tech.com — Conseils généraux, à adapter avec votre vétérinaire.")
        c.drawRightString(A4[0] - 14 * mm, 10 * mm, f"page {doc.page}"); c.restoreState()
    out = f"{OUT}/pdf/{f['id']}.pdf"
    doc = SimpleDocTemplate(out + ".part", pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=30 * mm, bottomMargin=18 * mm, title=f["titre"], author="B2A Smart Farming")
    el = [Paragraph(f["titre"], st["t"]), Paragraph(" · ".join([", ".join(esp.get(e, e) for e in f["especes"])] + ([age] if age else [])) + "<br/>" + f["desc"], st["s"])]
    for s in f["pdf"]:
        blk = [Paragraph(s["h"], st["h"])]
        if "pts" in s:
            blk.append(ListFlowable([ListItem(Paragraph(p, st["p"]), leftIndent=12, value="•") for p in s["pts"]], bulletType="bullet", start="•", leftIndent=12, bulletColor=gr))
        if "table" in s:
            rows = [[Paragraph(c, st["cb"] if i == 0 else st["c"]) for c in r] for i, r in enumerate(s["table"])]
            t = Table(rows, colWidths=None, hAlign="LEFT", repeatRows=1)
            t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), nv), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.Color(.96, .97, .98)]),
                                   ("GRID", (0, 0), (-1, -1), .4, colors.Color(.86, .89, .93)), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                                   ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
            blk.append(t)
        el.append(KeepTogether(blk))
    el += [Spacer(1, 10), Paragraph("La vidéo de cette formation est dans l'application B2A Smart Farming, onglet <b>Formation</b> de vos lots. "
                                     "Notez vos soins, vaccins et mesures dans l'application ; en cas de doute, appelez votre vétérinaire.", st["s"])]
    doc.build(el, onFirstPage=deco, onLaterPages=deco); os.replace(out + ".part", out); return out

def entries(f, v, dur, p):
    common = dict(especes=f["especes"], semDe=f.get("semDe"), semA=f.get("semA"), publie=True)
    return [dict(id=f["id"] + "-video", type="video", titre=f["titre"], desc=f["desc"], duree=max(1, round(dur / 60)), taille=os.path.getsize(v),
                 url=BASE_URL + "videos/" + os.path.basename(v), ordre=f.get("ordre", 0) * 2, **common),
            dict(id=f["id"] + "-pdf", type="pdf", titre="Fiche : " + f["titre"], desc=f["desc"], taille=os.path.getsize(p),
                 url=BASE_URL + "pdf/" + os.path.basename(p), ordre=f.get("ordre", 0) * 2 + 1, **common)]

def save_cat(items, cat, cat_path):
    cat["formations"] = sorted(items.values(), key=lambda x: (x["especes"][0], x.get("semDe") or 0, x["ordre"]))
    json.dump(cat, open(cat_path + ".part", "w"), ensure_ascii=False, indent=1); os.replace(cat_path + ".part", cat_path)

def main(ids):
    cat_path = f"{OUT}/catalogue.json"
    cat = json.load(open(cat_path)) if os.path.exists(cat_path) else {"version": 1, "formations": []}
    items = {x["id"]: x for x in cat["formations"]}
    # formations déjà produites mais absentes du catalogue (reprise après interruption)
    for f in F:
        v, p = f"{OUT}/videos/{f['id']}.mp4", f"{OUT}/pdf/{f['id']}.pdf"
        if f["id"] + "-video" not in items and os.path.exists(v) and os.path.exists(p) and (not ids or f["id"] not in ids):
            d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", v], capture_output=True, text=True).stdout or 0)
            for e in entries(f, v, d, p): items[e["id"]] = e
    for f in F:
        if ids and f["id"] not in ids: continue
        if not ids and os.path.exists(f"{OUT}/videos/{f['id']}.mp4") and f["id"] + "-video" in items: continue
        tmp = tempfile.mkdtemp(prefix="fo-")
        try:
            v, dur = video(f, tmp); p = pdf(f)
        finally: shutil.rmtree(tmp, ignore_errors=True)
        for e in entries(f, v, dur, p): items[e["id"]] = e
        save_cat(items, cat, cat_path)
        print(f"{f['id']}: vidéo {dur:.0f} s, {os.path.getsize(v) / 1e6:.1f} Mo ; PDF {os.path.getsize(p) / 1e3:.0f} ko", flush=True)
    save_cat(items, cat, cat_path)

if __name__ == "__main__":
    main(sys.argv[1:])
