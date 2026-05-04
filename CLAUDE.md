# Claude Code - Session Context

## Gallery Caption Project

### What We Are Doing
Going through every photography gallery `.md` file and adding a **title** and **caption** to each image that currently only has a placeholder (`## Photo N`) or no caption at all.

**Caption format:**
- Title: a few words describing the image (e.g. `## Fly Agaric`)
- Caption: ~45 words, 3 lines when rendered. Factual, about the subject's biology or behaviour. No personal anecdotes or first-person language.
- Image URL follows on the next line after the caption.

**Example of finished format:**
```markdown
## Fly Agaric
Two fly agaric mushrooms (Amanita muscaria) glow red against dark woodland moss. One of Britain's most recognisable fungi, the fly agaric is toxic but forms important mycorrhizal relationships with birch and pine. The white spots are remnants of the universal veil that enclosed the developing mushroom.
https://i.imgur.com/1WnqV0R.jpeg
```

**How to view images:**
`i.imgur.com` URLs cannot be fetched directly via WebFetch. Workaround: download with `curl` to `/tmp/gallery_imgs/` then use the Read tool to view the image file.

```bash
mkdir -p /tmp/gallery_imgs
curl -s "https://i.imgur.com/XXXXX.jpeg" -o /tmp/gallery_imgs/img1.jpg &
# ... repeat for all images, then wait
wait
```

---

### Gallery Audit Status

**Galleries with full captions already (skip these):**
- 3.1.1.x - British Birds ✅
- 3.1.2.1 - Bengal Tiger ✅
- 3.1.5.x - Astrophotography ✅
- 3.1.2.5 - Brown Bear ✅ (completed this session)
- 3.1.4.7 - The Zoo ✅ (completed this session)
- 3.1.6.2 - Canadian Wildlife ✅ (completed this session)
- 3.1.3.1 - Fungi ✅ (completed this session)
- 3.1.2.2 - UK Deer ✅ (completed earlier)
- 3.1.2.3 - Red Squirrel ✅ (completed earlier)
- 3.1.2.4 - Grey Seal ✅ (completed earlier)

**Galleries with different formats (HTML/iframe — no caption work needed):**
- 3.1.4.3 - Architecture
- 3.1.4.5 - 360 Panoramas

**Galleries still needing captions:**
- 3.1.4.1 - Photomicrography (13 photos) — **IN PROGRESS** — images downloaded to `/tmp/gallery_imgs/micro1.jpg` through `micro13.jpg`, all 13 viewed, file not yet edited
- 3.1.4.2 - Film Photography (17 photos)
- 3.1.4.4 - Street Photography (8 photos)
- 3.1.4.6 - Drone Photography (5 photos)
- 3.1.4.8 - Environments (17 photos)
- 3.1.4.9 - Macro Photography (14 photos)
- 3.1.6.1 - Canadian Landscapes (13 photos)

---

### Notes
- Work one gallery at a time, user reviews between each.
- User will edit captions afterwards — write good drafts but don't agonise over perfection.
- Some galleries have a mix of imgur URLs and local `/static/images/` paths — caption local files based on the heading/context since they can't be fetched.
