#!/usr/bin/env python3
"""
Download all Imgur images referenced in the site and rewrite URLs to local paths.

Usage:
    python3 download_images.py                        # dry run
    python3 download_images.py --go                   # download + rewrite
    python3 download_images.py --go --skip-rewrite    # download only
    python3 download_images.py --compress             # dry run compress pass
    python3 download_images.py --compress --go        # resize + compress all images in static/images/
    python3 download_images.py --webp                 # dry run: re-download originals + convert to WebP
    python3 download_images.py --webp --go            # re-download originals, convert to WebP, rewrite refs
"""

import os
import re
import sys
import time
import argparse
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

# ── Config ────────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent
IMAGES_DIR = REPO_ROOT / "static" / "images"

SCAN_EXTENSIONS = {".md", ".njk", ".js"}
SKIP_DIRS = {"node_modules", "_site", ".obsidian", ".git", "96 - Hidden Notes", "99 - Not For Publish"}

# Only rewrite imgur photo URLs — not Amazon/Goodreads book covers etc.
IMGUR_RE = re.compile(
    r'https?://i\.imgur\.com/([A-Za-z0-9]+\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP))',
    re.IGNORECASE,
)

# Matches local /static/images/ references with original extensions
LOCAL_IMG_RE = re.compile(
    r'/static/images/([A-Za-z0-9]+)\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)',
    re.IGNORECASE,
)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; niallbell-image-migration/1.0)",
    "Referer": "https://niallbell.com",
}

DELAY_BETWEEN_REQUESTS = 0.3  # seconds — be polite to Imgur


# ── Helpers ───────────────────────────────────────────────────────────────────

def scan_files(root: Path):
    """Yield all scannable files under root, skipping excluded dirs."""
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for filename in filenames:
            if Path(filename).suffix in SCAN_EXTENSIONS:
                yield Path(dirpath) / filename


def collect_urls(files) -> dict[str, list[Path]]:
    """Return {url: [files that reference it]} for all imgur URLs found."""
    url_files: dict[str, list[Path]] = {}
    for filepath in files:
        try:
            text = filepath.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            print(f"  [WARN] Could not read {filepath}: {e}")
            continue
        for match in IMGUR_RE.finditer(text):
            url = match.group(0).rstrip(")")  # strip accidental trailing )
            url_files.setdefault(url, [])
            if filepath not in url_files[url]:
                url_files[url].append(filepath)
    return url_files


def local_path_for(url: str) -> Path:
    """Return the local path where this URL's image should be saved."""
    match = IMGUR_RE.search(url)
    filename = match.group(1) if match else Path(url).name
    return IMAGES_DIR / filename


def local_url_for(url: str) -> str:
    """Return the site-relative URL for a downloaded image."""
    return "/static/images/" + local_path_for(url).name


def download(url: str, dest: Path, dry_run: bool, force: bool = False) -> bool:
    """Download url to dest. Returns True on success."""
    if dest.exists() and not force:
        return True  # already downloaded

    if dry_run:
        print(f"    would download → {dest.name}")
        return True

    try:
        req = Request(url, headers=HEADERS)
        with urlopen(req, timeout=20) as resp:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(resp.read())
        return True
    except (HTTPError, URLError, OSError) as e:
        print(f"    [FAIL] {url}  —  {e}")
        return False


def compress_images(images_dir: Path, max_px: int = 1920, quality: int = 82, dry_run: bool = True):
    """Resize and compress all JPEG/PNG images in images_dir in-place."""
    try:
        from PIL import Image
    except ImportError:
        print("Pillow is required for --compress. Run: pip3 install Pillow")
        return

    image_files = [
        p for p in images_dir.iterdir()
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    ]

    total_before = sum(p.stat().st_size for p in image_files)
    total_after = 0
    skipped = 0
    processed = 0

    for i, path in enumerate(sorted(image_files), 1):
        size_before = path.stat().st_size
        try:
            img = Image.open(path)
            w, h = img.size
            needs_resize = w > max_px or h > max_px

            if needs_resize:
                img.thumbnail((max_px, max_px), Image.LANCZOS)

            # Estimate output size without writing (for dry run)
            if dry_run:
                import io
                buf = io.BytesIO()
                save_fmt = "JPEG" if path.suffix.lower() in {".jpg", ".jpeg"} else img.format or "PNG"
                save_kwargs = {"quality": quality, "optimize": True} if save_fmt == "JPEG" else {"optimize": True}
                img.convert("RGB" if save_fmt == "JPEG" else img.mode).save(buf, format=save_fmt, **save_kwargs)
                size_after = buf.tell()
            else:
                save_fmt = "JPEG" if path.suffix.lower() in {".jpg", ".jpeg"} else img.format or "PNG"
                save_kwargs = {"quality": quality, "optimize": True} if save_fmt == "JPEG" else {"optimize": True}
                save_img = img.convert("RGB") if save_fmt == "JPEG" else img
                save_img.save(path, format=save_fmt, **save_kwargs)
                size_after = path.stat().st_size

            saving_kb = (size_before - size_after) / 1024
            resize_note = f" {w}x{h}→{img.size[0]}x{img.size[1]}" if needs_resize else ""
            print(f"  [{i}/{len(image_files)}] {path.name}{resize_note}  {size_before/1024:.0f}KB → {size_after/1024:.0f}KB  (saved {saving_kb:.0f}KB)")
            total_after += size_after
            processed += 1

        except Exception as e:
            print(f"  [SKIP] {path.name}: {e}")
            total_after += size_before
            skipped += 1

    print(f"\n  {'Would save' if dry_run else 'Saved'} {(total_before - total_after) / 1024 / 1024:.1f} MB  "
          f"({total_before / 1024 / 1024:.1f} MB → {total_after / 1024 / 1024:.1f} MB)  "
          f"  {processed} processed, {skipped} skipped")


def rewrite_file(filepath: Path, url_map: dict[str, str], dry_run: bool) -> int:
    """Replace all occurrences of keys in url_map with their values. Returns change count."""
    try:
        original = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        print(f"  [WARN] Could not read {filepath}: {e}")
        return 0

    updated = original
    for old, new in url_map.items():
        updated = updated.replace(old, new)

    changes = sum(1 for old in url_map if old in original)
    if changes and not dry_run:
        filepath.write_text(updated, encoding="utf-8")

    return changes


def redownload_as_webp(images_dir: Path, max_px: int = 2500, quality: int = 82, dry_run: bool = True):
    """
    For every JPEG/PNG in images_dir:
      1. Reconstruct the original Imgur URL from the filename
      2. Re-download the original
      3. Convert + resize to WebP
      4. Delete the old file
    Returns a dict of {old_local_path_str: new_local_path_str} for source rewriting.
    """
    try:
        from PIL import Image
    except ImportError:
        print("Pillow is required for --webp. Run: pip3 install Pillow")
        return {}

    import io

    source_files = sorted([
        p for p in images_dir.iterdir()
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".gif"}
    ])

    print(f"  {len(source_files)} images to process\n")

    rename_map = {}  # old /static/images/X.jpeg → new /static/images/X.webp
    failed = []
    skipped = 0

    for i, path in enumerate(source_files, 1):
        stem = path.stem
        ext = path.suffix.lower()
        imgur_url = f"https://i.imgur.com/{stem}{ext}"
        webp_path = images_dir / f"{stem}.webp"

        if webp_path.exists() and not dry_run:
            # Already converted — just record the rename
            rename_map[f"/static/images/{path.name}"] = f"/static/images/{stem}.webp"
            skipped += 1
            continue

        print(f"  [{i}/{len(source_files)}] {path.name} → {stem}.webp", end="  ", flush=True)

        if dry_run:
            print("(dry run)")
            rename_map[f"/static/images/{path.name}"] = f"/static/images/{stem}.webp"
            continue

        # Download fresh copy to a temp buffer
        try:
            req = Request(imgur_url, headers=HEADERS)
            with urlopen(req, timeout=30) as resp:
                data = resp.read()
        except (HTTPError, URLError, OSError) as e:
            print(f"[FAIL download] {e}")
            failed.append(path.name)
            continue

        # Convert to WebP
        try:
            img = Image.open(io.BytesIO(data))
            w, h = img.size
            if w > max_px or h > max_px:
                img.thumbnail((max_px, max_px), Image.LANCZOS)
            img = img.convert("RGB")
            img.save(webp_path, format="WEBP", quality=quality, method=6)
            size_orig = len(data)
            size_webp = webp_path.stat().st_size
            print(f"{size_orig/1024:.0f}KB → {size_webp/1024:.0f}KB  (saved {(size_orig-size_webp)/1024:.0f}KB)")
        except Exception as e:
            print(f"[FAIL convert] {e}")
            failed.append(path.name)
            if webp_path.exists():
                webp_path.unlink()
            continue

        # Delete original now that WebP exists
        path.unlink()
        rename_map[f"/static/images/{path.name}"] = f"/static/images/{stem}.webp"

        time.sleep(DELAY_BETWEEN_REQUESTS)

    print(f"\n  Converted : {len(rename_map) - skipped}")
    print(f"  Skipped (already done) : {skipped}")
    if failed:
        print(f"  Failed    : {len(failed)}")
        for f in failed:
            print(f"    {f}")

    return rename_map


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Download Imgur images and rewrite URLs.")
    parser.add_argument("--go", action="store_true", help="Actually apply changes (default is dry run)")
    parser.add_argument("--skip-rewrite", action="store_true", help="Download images but don't edit source files")
    parser.add_argument("--compress", action="store_true", help="Resize + compress images in static/images/ (skips download/rewrite)")
    parser.add_argument("--webp", action="store_true", help="Re-download originals from Imgur, convert to WebP, rewrite source refs")
    parser.add_argument("--max-px", type=int, default=2500, help="Max long edge when converting (default 2500)")
    parser.add_argument("--quality", type=int, default=82, help="WebP/JPEG quality (default 82)")
    args = parser.parse_args()

    dry_run = not args.go

    # ── WebP re-download mode ─────────────────────────────────────────────────
    if args.webp:
        if dry_run:
            print("DRY RUN (webp) — pass --go to apply\n")
        print(f"Re-downloading originals from Imgur and converting to WebP  (max {args.max_px}px, quality {args.quality})\n")
        rename_map = redownload_as_webp(IMAGES_DIR, max_px=args.max_px, quality=args.quality, dry_run=dry_run)

        if not rename_map:
            return

        if dry_run:
            print(f"\nWould rewrite {len(rename_map)} filename references across source files.")
            print("Run with --go to apply.")
            return

        # Rewrite source files
        print(f"\nRewriting source files...")
        all_files = list(scan_files(REPO_ROOT))
        files_changed = 0
        for filepath in all_files:
            n = rewrite_file(filepath, rename_map, dry_run=False)
            if n:
                rel = filepath.relative_to(REPO_ROOT)
                print(f"  {rel}  ({n} ref{'s' if n != 1 else ''} updated)")
                files_changed += 1
        print(f"\n  {files_changed} files updated")
        return

    # ── Compress-only mode ────────────────────────────────────────────────────
    if args.compress:
        if dry_run:
            print("DRY RUN (compress) — pass --go to apply\n")
        print(f"Compressing images in {IMAGES_DIR}  (max {args.max_px}px, quality {args.quality})")
        compress_images(IMAGES_DIR, max_px=args.max_px, quality=args.quality, dry_run=dry_run)
        return

    do_rewrite = args.go and not args.skip_rewrite

    if dry_run:
        print("DRY RUN — pass --go to apply changes\n")

    # ── 1. Scan ───────────────────────────────────────────────────────────────
    print("Scanning files...")
    all_files = list(scan_files(REPO_ROOT))
    url_files = collect_urls(all_files)

    unique_urls = sorted(url_files.keys())
    already_local = [u for u in unique_urls if local_path_for(u).exists()]
    to_download = [u for u in unique_urls if not local_path_for(u).exists()]

    print(f"  {len(unique_urls)} unique Imgur URLs across {len(all_files)} files")
    print(f"  {len(already_local)} already downloaded, {len(to_download)} to fetch\n")

    # ── 2. Download ───────────────────────────────────────────────────────────
    failed_urls = set()
    for i, url in enumerate(to_download, 1):
        dest = local_path_for(url)
        status = "would fetch" if dry_run else "downloading"
        print(f"  [{i}/{len(to_download)}] {status}: {url}")
        ok = download(url, dest, dry_run)
        if not ok:
            failed_urls.add(url)
        elif not dry_run and i < len(to_download):
            time.sleep(DELAY_BETWEEN_REQUESTS)

    # ── 3. Build URL map (exclude failed downloads) ───────────────────────────
    url_map = {
        url: local_url_for(url)
        for url in unique_urls
        if url not in failed_urls
    }

    # ── 4. Rewrite files ──────────────────────────────────────────────────────
    if do_rewrite:
        print(f"\nRewriting {len(all_files)} files...")
        files_changed = 0
        for filepath in all_files:
            n = rewrite_file(filepath, url_map, dry_run=False)
            if n:
                rel = filepath.relative_to(REPO_ROOT)
                print(f"  {rel}  ({n} URL{'s' if n != 1 else ''} replaced)")
                files_changed += 1
        print(f"\n  {files_changed} files updated")
    elif dry_run:
        print(f"\nWould rewrite {sum(len(v) for v in url_files.values())} references across "
              f"{len(set(f for files in url_files.values() for f in files))} files")

    # ── 5. Summary ────────────────────────────────────────────────────────────
    print(f"\n{'─'*50}")
    print(f"  Total unique images : {len(unique_urls)}")
    print(f"  Downloaded          : {len(to_download) - len(failed_urls)}")
    print(f"  Already existed     : {len(already_local)}")
    if failed_urls:
        print(f"  Failed              : {len(failed_urls)}")
        for u in sorted(failed_urls):
            print(f"    {u}")
    if dry_run:
        print("\nRun with --go to apply.")


if __name__ == "__main__":
    main()
