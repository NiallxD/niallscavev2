#!/usr/bin/env python3
"""
GPS Tagger — visually geotag site images for the photo map.

Images are grouped by gallery so you can drop pins in the same region
for a whole set without jumping around. Already-tagged images are
skipped automatically (re-checked live against imageGPS.json).

Requirements:
    pip install pillow tkintermapview

Usage:
    python3 geotag.py                # untagged images only, gallery order
    python3 geotag.py --retag        # include already-tagged (shows existing pin)
"""

import json
import re
import argparse
import sys
from pathlib import Path
import tkinter as tk
from tkinter import messagebox

try:
    from PIL import Image, ImageTk
except ImportError:
    print("Pillow is required.  Run: pip install pillow")
    sys.exit(1)

try:
    import tkintermapview
except ImportError:
    print("tkintermapview is required.  Run: pip install tkintermapview")
    sys.exit(1)


REPO_ROOT   = Path(__file__).parent
IMAGES_DIR  = REPO_ROOT / "static" / "images"
GPS_FILE    = REPO_ROOT / "_data" / "imageGPS.json"
GALLERY_ROOT = REPO_ROOT / "3.0 - 📷 Photography"

SKIP_DIRS = {"96 - Hidden Notes", "99 - Not For Publish", "node_modules", ".git", "_site"}

ACCENT  = "#e07b39"
BG      = "#111111"
BG2     = "#1a1a1a"
BG3     = "#2a2a2a"
FG      = "#ffffff"
FG_DIM  = "#777777"
FG_MED  = "#aaaaaa"

IMG_RE = re.compile(r'/static/images/([A-Za-z0-9_\-]+\.(?:webp|jpg|jpeg|png))', re.IGNORECASE)


# ── Image collection ──────────────────────────────────────────────────────────

def collect_gallery_order():
    """
    Walk gallery markdown files in filesystem order and return
    [(gallery_title, image_path), ...] preserving the order images
    appear in each gallery file.  Images not found in any gallery
    are appended at the end under 'Ungrouped'.
    """
    seen     = {}   # filename -> (gallery_title, path) — first occurrence wins
    ordered  = []   # [(gallery_title, path), ...]

    if not GALLERY_ROOT.exists():
        return ordered

    # Collect all .md files sorted by path so numbering (3.1.1, 3.1.2…) gives order
    md_files = sorted(
        p for p in GALLERY_ROOT.rglob("*.md")
        if not any(part in SKIP_DIRS for part in p.parts)
    )

    for md in md_files:
        try:
            text = md.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        if "Type: Gallery" not in text:
            continue

        title_m = re.search(r'^title:\s*(.+)$', text, re.MULTILINE)
        gallery_title = title_m.group(1).strip() if title_m else md.stem

        for filename in IMG_RE.findall(text):
            if filename in seen:
                continue
            img_path = IMAGES_DIR / filename
            if not img_path.exists():
                continue
            seen[filename] = True
            ordered.append((gallery_title, img_path))

    # Append any images not referenced by any gallery
    for img_path in sorted(IMAGES_DIR.glob("*.webp")):
        if img_path.name not in seen:
            ordered.append(("Ungrouped", img_path))

    return ordered


# ── Main app ──────────────────────────────────────────────────────────────────

class GPSTagger:
    def __init__(self, retag: bool = False):
        self.retag    = retag
        self.all_imgs = collect_gallery_order()   # [(gallery, path), ...]
        self.index    = 0
        self.pending  = None    # (lat, lng) from map click
        self._tk_img  = None    # prevent GC
        self._marker  = None
        self._pil_img = None

        # Skip already-tagged on first pass (checked again live in _show_current)
        if not retag:
            gps = self._read_gps()
            self.all_imgs = [(g, p) for g, p in self.all_imgs if p.name not in gps]

        if not self.all_imgs:
            print("No images to tag. Run with --retag to revisit tagged images.")
            sys.exit(0)

        self._build_ui()
        self._show_current()
        self.root.mainloop()

    # ── GPS file ──────────────────────────────────────────────────────────────

    def _read_gps(self):
        return json.loads(GPS_FILE.read_text()) if GPS_FILE.exists() else {}

    def _write_gps(self, data):
        GPS_FILE.write_text(json.dumps(data, indent=2) + "\n")

    # ── UI ────────────────────────────────────────────────────────────────────

    def _build_ui(self):
        self.root = tk.Tk()
        self.root.title("GPS Tagger")
        self.root.configure(bg=BG)
        self.root.geometry("1500x880")
        self.root.minsize(1000, 600)

        # Header
        hdr = tk.Frame(self.root, bg=BG, pady=10)
        hdr.pack(fill="x", padx=20)

        self.lbl_progress = tk.Label(hdr, text="", bg=BG, fg=FG_DIM, font=("Helvetica", 12))
        self.lbl_progress.pack(side="left")

        self.lbl_gallery = tk.Label(hdr, text="", bg=BG, fg=ACCENT, font=("Helvetica", 12, "bold"))
        self.lbl_gallery.pack(side="left", padx=(14, 4))

        tk.Label(hdr, text="·", bg=BG, fg=FG_DIM, font=("Helvetica", 12)).pack(side="left")

        self.lbl_filename = tk.Label(hdr, text="", bg=BG, fg=FG_MED, font=("Helvetica", 11))
        self.lbl_filename.pack(side="left", padx=(4, 20))

        self.lbl_coords = tk.Label(
            hdr, text="Click the map to drop a pin",
            bg=BG, fg=FG_DIM, font=("Helvetica", 12)
        )
        self.lbl_coords.pack(side="left")

        # Content panes
        panes = tk.Frame(self.root, bg=BG)
        panes.pack(fill="both", expand=True, padx=20)
        panes.columnconfigure(0, weight=1)
        panes.columnconfigure(1, weight=1)
        panes.rowconfigure(0, weight=1)

        # Image canvas
        img_outer = tk.Frame(panes, bg=BG2)
        img_outer.grid(row=0, column=0, sticky="nsew", padx=(0, 6))
        self.canvas = tk.Canvas(img_outer, bg=BG2, highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)
        self.canvas.bind("<Configure>", lambda _: self._redraw_image())

        # Map
        self.map_w = tkintermapview.TkinterMapView(panes, corner_radius=0)
        self.map_w.grid(row=0, column=1, sticky="nsew")
        self.map_w.set_position(30, 10)
        self.map_w.set_zoom(2)
        self.map_w.add_left_click_map_command(self._on_map_click)

        # Footer
        ftr = tk.Frame(self.root, bg=BG, pady=12)
        ftr.pack(fill="x", padx=20)

        btn = dict(font=("Helvetica", 13, "bold"), bd=0, padx=22, pady=9, cursor="hand2", relief="flat")

        self.btn_save = tk.Button(
            ftr, text="Save & Next  →", bg=ACCENT, fg=FG,
            activebackground="#c96a2d", activeforeground=FG,
            state="disabled", command=self._save_next, **btn
        )
        self.btn_save.pack(side="right")

        tk.Button(
            ftr, text="Skip", bg=BG3, fg=FG_MED,
            activebackground="#3a3a3a", activeforeground=FG,
            command=self._skip, **btn
        ).pack(side="right", padx=(0, 10))

        tk.Button(
            ftr, text="Clear pin", bg=BG3, fg=FG_MED,
            activebackground="#3a3a3a", activeforeground=FG,
            command=self._clear, **btn
        ).pack(side="right", padx=(0, 10))

        # Remaining count (left side of footer)
        self.lbl_remaining = tk.Label(ftr, text="", bg=BG, fg=FG_DIM, font=("Helvetica", 11))
        self.lbl_remaining.pack(side="left")

        # Search bar
        tk.Label(ftr, text="Search:", bg=BG, fg=FG_DIM, font=("Helvetica", 11)).pack(side="left", padx=(24, 6))
        self.search_var = tk.StringVar()
        search_entry = tk.Entry(
            ftr, textvariable=self.search_var,
            bg=BG3, fg=FG, insertbackground=FG,
            font=("Helvetica", 12), bd=0, relief="flat",
            width=28
        )
        search_entry.pack(side="left", ipady=6, padx=(0, 6))
        tk.Button(
            ftr, text="Go", bg=BG3, fg=FG_MED,
            activebackground="#3a3a3a", activeforeground=FG,
            font=("Helvetica", 12, "bold"), bd=0, padx=12, pady=6,
            cursor="hand2", relief="flat", command=self._search
        ).pack(side="left")

        # Bind Enter on the search entry only (doesn't bubble to global Save binding)
        search_entry.bind("<Return>", lambda _: (self._search(), "break"))

        # Global keyboard shortcuts (only active when search entry not focused)
        self.root.bind("<Return>", lambda _: self._save_next() if self.pending else None)
        self.root.bind("<Escape>", lambda _: self._skip())
        self.root.bind("<Right>",  lambda _: self._skip())

    # ── Map ───────────────────────────────────────────────────────────────────

    def _on_map_click(self, coords):
        lat, lng = coords
        self.pending = (lat, lng)
        self.lbl_coords.config(text=f"📍  {lat:.5f},  {lng:.5f}")
        self.btn_save.config(state="normal")
        if self._marker:
            self._marker.delete()
        self._marker = self.map_w.set_marker(lat, lng, text="")

    def _search(self):
        query = self.search_var.get().strip()
        if query:
            self.map_w.set_address(query)

    def _clear(self):
        if self._marker:
            self._marker.delete()
            self._marker = None
        self.pending = None
        self.lbl_coords.config(text="Click the map to drop a pin")
        self.btn_save.config(state="disabled")

    # ── Navigation ────────────────────────────────────────────────────────────

    def _show_current(self):
        # Advance past any images that got tagged externally since startup
        while self.index < len(self.all_imgs):
            gallery, path = self.all_imgs[self.index]
            if not self.retag and path.name in self._read_gps():
                print(f"  ⟳  {path.name}  (already tagged, skipping)")
                self.index += 1
            else:
                break

        if self.index >= len(self.all_imgs):
            self._done()
            return

        gallery, path = self.all_imgs[self.index]
        remaining = len(self.all_imgs) - self.index

        self.lbl_progress.config(text=f"{self.index + 1}  /  {len(self.all_imgs)}")
        self.lbl_gallery.config(text=gallery)
        self.lbl_filename.config(text=path.name)
        self.lbl_remaining.config(text=f"{remaining} remaining")

        # Pre-fill existing GPS when retagging
        existing = self._read_gps().get(path.name)
        if existing:
            lat, lng = existing["lat"], existing["lng"]
            self.pending = (lat, lng)
            self.lbl_coords.config(text=f"📍  {lat:.5f},  {lng:.5f}  (already tagged)")
            self.btn_save.config(state="normal")
            if self._marker:
                self._marker.delete()
            self._marker = self.map_w.set_marker(lat, lng, text="")
            self.map_w.set_position(lat, lng)
            self.map_w.set_zoom(7)
        else:
            self._clear()

        try:
            self._pil_img = Image.open(path)
        except Exception as e:
            print(f"  [skip] {path.name}: {e}")
            self._advance()
            return

        self._redraw_image()

    def _redraw_image(self):
        if self._pil_img is None:
            return
        w = self.canvas.winfo_width()
        h = self.canvas.winfo_height()
        if w < 10 or h < 10:
            return
        img = self._pil_img.copy()
        img.thumbnail((w, h), Image.LANCZOS)
        self._tk_img = ImageTk.PhotoImage(img)
        self.canvas.delete("all")
        self.canvas.create_image(w // 2, h // 2, anchor="center", image=self._tk_img)

    def _save_next(self):
        if not self.pending:
            return
        _, path = self.all_imgs[self.index]
        lat, lng = self.pending
        gps = self._read_gps()
        gps[path.name] = {"lat": round(lat, 6), "lng": round(lng, 6)}
        self._write_gps(gps)
        print(f"  ✓  {path.name}  →  {lat:.5f}, {lng:.5f}")
        self._advance()

    def _skip(self):
        _, path = self.all_imgs[self.index]
        print(f"  —  {path.name}  (skipped)")
        self._advance()

    def _advance(self):
        self.index += 1
        if self._marker:
            self._marker.delete()
            self._marker = None
        self.pending  = None
        self._pil_img = None
        self._show_current()

    def _done(self):
        total_tagged = len(self._read_gps())
        msg = f"All done!\n\n{total_tagged} image{'s' if total_tagged != 1 else ''} tagged in total.\n\nRebuild the site to update the map."
        print(f"\n✓ Finished. {total_tagged} images tagged in imageGPS.json.")
        messagebox.showinfo("Done!", msg)
        self.root.destroy()


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="Visually geotag images for the photo map.")
    ap.add_argument("--retag", action="store_true", help="Include already-tagged images (shows existing pin)")
    args = ap.parse_args()
    GPSTagger(retag=args.retag)


if __name__ == "__main__":
    main()
