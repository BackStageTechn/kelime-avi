"""
Kelime Avı - Store Asset Generator
Logo, ekran görüntüleri ve özellik görseli oluşturur
"""

from PIL import Image, ImageDraw, ImageFont
import os
import math

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
STORE_DIR = os.path.join(BASE_DIR, "store-assets")
os.makedirs(STORE_DIR, exist_ok=True)

# Renkler
BG_DARK = (15, 15, 45)
BG_LIGHT = (25, 25, 65)
PRIMARY = (110, 90, 230)
PRIMARY_DARK = (80, 60, 200)
ACCENT = (255, 215, 61)
SUCCESS = (76, 175, 80)
WHITE = (255, 255, 255)
TEXT_SEC = (180, 180, 210)
SURFACE = (35, 35, 75)
GRID_CELL = (45, 45, 90)
GRID_HIGHLIGHT = (110, 90, 230)
GRID_FOUND = (76, 175, 80)
PINK = (233, 30, 99)

def get_font(size):
    """Try to get a good font, fallback to default"""
    font_paths = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            return ImageFont.truetype(fp, size)
    return ImageFont.load_default()

def get_bold_font(size):
    font_paths = [
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            return ImageFont.truetype(fp, size)
    return get_font(size)

def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def draw_gradient_rect(img, xy, color1, color2, radius=0):
    x1, y1, x2, y2 = xy
    w = x2 - x1
    h = y2 - y1
    for i in range(h):
        ratio = i / max(h - 1, 1)
        r = int(color1[0] + (color2[0] - color1[0]) * ratio)
        g = int(color1[1] + (color2[1] - color1[1]) * ratio)
        b = int(color1[2] + (color2[2] - color1[2]) * ratio)
        draw = ImageDraw.Draw(img)
        draw.line([(x1, y1 + i), (x2, y1 + i)], fill=(r, g, b))

def draw_search_icon(draw, cx, cy, size, color=ACCENT):
    """Draw a magnifying glass icon"""
    r = size * 0.35
    # Glass circle
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=max(3, int(size * 0.08)))
    # Handle
    hx = cx + r * 0.7
    hy = cy + r * 0.7
    hx2 = cx + r * 1.4
    hy2 = cy + r * 1.4
    draw.line([hx, hy, hx2, hy2], fill=color, width=max(3, int(size * 0.1)))

def draw_grid_preview(draw, x, y, cell_size, grid_size, letters, highlights=None, founds=None):
    """Draw a word search grid"""
    font = get_bold_font(int(cell_size * 0.5))
    gap = 3
    for row in range(grid_size):
        for col in range(grid_size):
            cx = x + col * (cell_size + gap)
            cy = y + row * (cell_size + gap)

            is_highlight = highlights and (row, col) in highlights
            is_found = founds and (row, col) in founds

            if is_found:
                bg = GRID_FOUND
            elif is_highlight:
                bg = GRID_HIGHLIGHT
            else:
                bg = GRID_CELL

            draw_rounded_rect(draw, [cx, cy, cx + cell_size, cy + cell_size],
                            radius=int(cell_size * 0.15), fill=bg)

            idx = (row * grid_size + col) % len(letters)
            letter = letters[idx]

            text_color = WHITE if (is_highlight or is_found) else TEXT_SEC
            bbox = draw.textbbox((0, 0), letter, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            draw.text((cx + (cell_size - tw) / 2, cy + (cell_size - th) / 2 - 2),
                      letter, fill=text_color, font=font)


# ============================================================
# 1. APP ICON (1024x1024)
# ============================================================
def create_app_icon():
    size = 1024
    img = Image.new('RGB', (size, size), BG_DARK)
    draw = ImageDraw.Draw(img)

    # Background gradient
    for i in range(size):
        ratio = i / size
        r = int(BG_DARK[0] + (BG_LIGHT[0] - BG_DARK[0]) * ratio)
        g = int(BG_DARK[1] + (BG_LIGHT[1] - BG_DARK[1]) * ratio)
        b = int(BG_DARK[2] + (BG_LIGHT[2] - BG_DARK[2]) * ratio)
        draw.line([(0, i), (size, i)], fill=(r, g, b))

    # Decorative grid cells in background
    cell_s = 65
    gap = 5
    grid_letters = "KELİMEAVITÜRKÇEBULMACA"
    small_font = get_bold_font(28)
    positions = [
        (80, 80), (150, 80), (220, 80),
        (80, 150), (150, 150), (220, 150),
        (730, 80), (800, 80), (870, 80),
        (730, 150), (800, 150), (870, 150),
        (80, 800), (150, 800), (220, 800),
        (80, 870), (150, 870), (220, 870),
        (730, 800), (800, 800), (870, 800),
        (730, 870), (800, 870), (870, 870),
    ]
    for idx, (px, py) in enumerate(positions):
        draw_rounded_rect(draw, [px, py, px + cell_s, py + cell_s],
                         radius=10, fill=(40, 40, 80))
        letter = grid_letters[idx % len(grid_letters)]
        bbox = draw.textbbox((0, 0), letter, font=small_font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((px + (cell_s - tw) / 2, py + (cell_s - th) / 2),
                  letter, fill=(80, 80, 120), font=small_font)

    # Center magnifying glass
    draw_search_icon(draw, 512, 350, 280, ACCENT)

    # "KA" text (Kelime Avı abbreviation)
    title_font = get_bold_font(220)
    text = "KA"
    bbox = draw.textbbox((0, 0), text, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, 480), text, fill=WHITE, font=title_font)

    # Subtitle line
    sub_font = get_bold_font(64)
    sub = "KELİME AVI"
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, 720), sub, fill=ACCENT, font=sub_font)

    # Accent line under title
    line_w = 300
    draw.rounded_rectangle([(size - line_w) / 2, 810, (size + line_w) / 2, 818],
                           radius=4, fill=PRIMARY)

    img.save(os.path.join(ASSETS_DIR, "icon.png"))
    img.save(os.path.join(STORE_DIR, "icon-1024.png"))
    print("  App icon created")
    return img


# ============================================================
# 2. ADAPTIVE ICON (foreground/background/monochrome)
# ============================================================
def create_adaptive_icons():
    size = 1024
    # Foreground (with safe zone padding - 66% visible)
    fg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(fg)

    # Center content within safe zone (inner 66%)
    padding = int(size * 0.17)

    # Magnifying glass
    draw_search_icon(draw, 512, 360, 220, ACCENT)

    # KA text
    title_font = get_bold_font(180)
    text = "KA"
    bbox = draw.textbbox((0, 0), text, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, 470), text, fill=WHITE, font=title_font)

    # Small subtitle
    sub_font = get_bold_font(48)
    sub = "KELİME AVI"
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, 680), sub, fill=ACCENT, font=sub_font)

    fg.save(os.path.join(ASSETS_DIR, "android-icon-foreground.png"))

    # Background
    bg = Image.new('RGB', (size, size), BG_DARK)
    draw = ImageDraw.Draw(bg)
    for i in range(size):
        ratio = i / size
        r = int(BG_DARK[0] + (BG_LIGHT[0] - BG_DARK[0]) * ratio)
        g = int(BG_DARK[1] + (BG_LIGHT[1] - BG_DARK[1]) * ratio)
        b = int(BG_DARK[2] + (BG_LIGHT[2] - BG_DARK[2]) * ratio)
        draw.line([(0, i), (size, i)], fill=(r, g, b))

    # Subtle grid pattern
    cell_s = 50
    for row in range(0, size, cell_s + 4):
        for col in range(0, size, cell_s + 4):
            draw_rounded_rect(draw, [col, row, col + cell_s, row + cell_s],
                            radius=6, fill=(35, 35, 70))

    bg.save(os.path.join(ASSETS_DIR, "android-icon-background.png"))

    # Monochrome
    mono = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(mono)
    draw_search_icon(draw, 512, 360, 220, WHITE)
    title_font = get_bold_font(180)
    text = "KA"
    bbox = draw.textbbox((0, 0), text, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, 470), text, fill=WHITE, font=title_font)
    sub_font = get_bold_font(48)
    sub = "KELİME AVI"
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, 680), sub, fill=WHITE, font=sub_font)
    mono.save(os.path.join(ASSETS_DIR, "android-icon-monochrome.png"))

    print("  Adaptive icons created")


# ============================================================
# 3. SPLASH ICON
# ============================================================
def create_splash_icon():
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw_search_icon(draw, 256, 180, 200, ACCENT)

    title_font = get_bold_font(80)
    text = "KELİME AVI"
    bbox = draw.textbbox((0, 0), text, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, 320), text, fill=WHITE, font=title_font)

    sub_font = get_font(28)
    sub = "Harflerin Arasinda Kelimeleri Bul!"
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, 420), sub, fill=TEXT_SEC, font=sub_font)

    img.save(os.path.join(ASSETS_DIR, "splash-icon.png"))
    print("  Splash icon created")


# ============================================================
# 4. FAVICON
# ============================================================
def create_favicon():
    size = 48
    img = Image.new('RGB', (size, size), BG_DARK)
    draw = ImageDraw.Draw(img)
    draw_search_icon(draw, 24, 18, 28, ACCENT)
    font = get_bold_font(16)
    draw.text((10, 30), "KA", fill=WHITE, font=font)
    img.save(os.path.join(ASSETS_DIR, "favicon.png"))
    print("  Favicon created")


# ============================================================
# 5. PHONE SCREENSHOTS (1080x1920) - Play Store
# ============================================================

def create_phone_bg(width=1080, height=1920):
    img = Image.new('RGB', (width, height), BG_DARK)
    draw = ImageDraw.Draw(img)
    for i in range(height):
        ratio = i / height
        r = int(BG_DARK[0] + (BG_LIGHT[0] - BG_DARK[0]) * ratio * 0.5)
        g = int(BG_DARK[1] + (BG_LIGHT[1] - BG_DARK[1]) * ratio * 0.5)
        b = int(BG_DARK[2] + (BG_LIGHT[2] - BG_DARK[2]) * ratio * 0.5)
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    return img, draw

def screenshot_1_home():
    """Ana ekran screenshot'ı"""
    w, h = 1080, 1920
    img, draw = create_phone_bg(w, h)

    # Status bar area
    draw.rectangle([0, 0, w, 80], fill=(10, 10, 35))

    # Magnifying glass icon
    draw_search_icon(draw, 540, 320, 200, ACCENT)

    # Title
    title_font = get_bold_font(96)
    text = "KELiME AVI"
    bbox = draw.textbbox((0, 0), text, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 460), text, fill=WHITE, font=title_font)

    # Subtitle
    sub_font = get_font(32)
    sub = "Harflerin Arasinda Kelimeleri Bul!"
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 580), sub, fill=TEXT_SEC, font=sub_font)

    # Stats bar
    draw_rounded_rect(draw, [60, 660, w - 60, 780], radius=20, fill=SURFACE)
    stat_font = get_bold_font(42)
    stat_label_font = get_font(22)
    stats = [("1250", "Toplam Puan"), ("48", "Kelime Bulundu"), ("12", "Oyun Oynandi")]
    for i, (val, label) in enumerate(stats):
        cx = 60 + (w - 120) / 3 * (i + 0.5)
        bbox = draw.textbbox((0, 0), val, font=stat_font)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw / 2, 685), val, fill=PRIMARY, font=stat_font)
        bbox = draw.textbbox((0, 0), label, font=stat_label_font)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw / 2, 740), label, fill=TEXT_SEC, font=stat_label_font)

    # OYNA button
    draw_rounded_rect(draw, [60, 840, w - 60, 1050], radius=24, fill=PRIMARY)
    btn_font = get_bold_font(56)
    text = "OYNA"
    bbox = draw.textbbox((0, 0), text, font=btn_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 905), text, fill=WHITE, font=btn_font)
    sub_font2 = get_font(28)
    sub2 = "Kategori Sec ve Basla!"
    bbox = draw.textbbox((0, 0), sub2, font=sub_font2)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 975), sub2, fill=(200, 200, 255), font=sub_font2)

    # Secondary buttons
    draw_rounded_rect(draw, [60, 1100, 520, 1260], radius=18, fill=(40, 20, 50),
                     outline=PINK, width=2)
    draw_rounded_rect(draw, [560, 1100, w - 60, 1260], radius=18, fill=(40, 40, 30),
                     outline=ACCENT, width=2)

    btn_font2 = get_bold_font(32)
    draw.text((195, 1165), "Istatistikler", fill=PINK, font=btn_font2)
    draw.text((700, 1165), "Ayarlar", fill=ACCENT, font=btn_font2)

    # Promo text at bottom
    promo_font = get_bold_font(40)
    draw.text((w // 2 - 200, 1700), "8 Kategori  |  160 Seviye", fill=ACCENT, font=promo_font)

    img.save(os.path.join(STORE_DIR, "screenshot-1-home.png"))
    print("  Screenshot 1 (Home) created")

def screenshot_2_categories():
    """Kategoriler ekranı"""
    w, h = 1080, 1920
    img, draw = create_phone_bg(w, h)

    # Header
    draw.rectangle([0, 0, w, 80], fill=(10, 10, 35))
    header_font = get_bold_font(40)
    draw.text((420, 120), "Kategoriler", fill=WHITE, font=header_font)

    sub_font = get_font(30)
    draw.text((380, 180), "Bir Kategori Sec", fill=TEXT_SEC, font=sub_font)

    # Category cards
    categories = [
        ("Hayvanlar", (76, 175, 80), "8 Seviye"),
        ("Meyveler", (233, 30, 99), "20 Seviye"),
        ("Ulkeler", (33, 150, 243), "20 Seviye"),
        ("Meslekler", (255, 152, 0), "20 Seviye"),
        ("Spor", (156, 39, 176), "20 Seviye"),
        ("Yiyecekler", (121, 85, 72), "20 Seviye"),
        ("Sehirler", (96, 125, 139), "20 Seviye"),
        ("Doga", (0, 150, 136), "20 Seviye"),
    ]

    card_w = (w - 180) // 2
    card_h = 200
    gap = 20
    start_y = 260

    for i, (name, color, progress) in enumerate(categories):
        col = i % 2
        row = i // 2
        x = 60 + col * (card_w + gap + 20)
        y = start_y + row * (card_h + gap)

        # Card with color
        c_fill = (color[0] // 2, color[1] // 2, color[2] // 2)
        draw_rounded_rect(draw, [x, y, x + card_w, y + card_h], radius=18, fill=c_fill,
                         outline=color, width=2)

        # Category name
        name_font = get_bold_font(34)
        bbox = draw.textbbox((0, 0), name, font=name_font)
        tw = bbox[2] - bbox[0]
        draw.text((x + (card_w - tw) / 2, y + 60), name, fill=WHITE, font=name_font)

        # Progress
        prog_font = get_font(22)
        bbox = draw.textbbox((0, 0), progress, font=prog_font)
        tw = bbox[2] - bbox[0]
        draw.text((x + (card_w - tw) / 2, y + 110), progress, fill=(200, 200, 200, 180), font=prog_font)

        # Progress bar
        bar_w = card_w - 60
        bar_x = x + 30
        bar_y = y + card_h - 35
        draw_rounded_rect(draw, [bar_x, bar_y, bar_x + bar_w, bar_y + 8], radius=4,
                         fill=(255, 255, 255, 50))
        fill_w = int(bar_w * (0.4 if i < 3 else 0.1))
        if fill_w > 0:
            draw_rounded_rect(draw, [bar_x, bar_y, bar_x + fill_w, bar_y + 8], radius=4,
                             fill=WHITE)

    # Bottom promo
    promo_font = get_bold_font(44)
    text = "8 Farkli Kategori!"
    bbox = draw.textbbox((0, 0), text, font=promo_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 1750), text, fill=ACCENT, font=promo_font)

    img.save(os.path.join(STORE_DIR, "screenshot-2-categories.png"))
    print("  Screenshot 2 (Categories) created")

def screenshot_3_gameplay():
    """Oyun ekranı screenshot'ı"""
    w, h = 1080, 1920
    img, draw = create_phone_bg(w, h)

    # Header
    draw.rectangle([0, 0, w, 80], fill=(10, 10, 35))

    # Back button
    draw_rounded_rect(draw, [30, 100, 80, 150], radius=12, fill=SURFACE)
    back_font = get_bold_font(28)
    draw.text((44, 110), "<", fill=WHITE, font=back_font)

    # Title
    title_font = get_bold_font(30)
    draw.text((370, 115), "Hayvanlar - Seviye 3", fill=WHITE, font=title_font)

    # Score
    draw_rounded_rect(draw, [900, 95, 1030, 155], radius=14, fill=SURFACE)
    score_font = get_bold_font(36)
    draw.text((930, 100), "120", fill=ACCENT, font=score_font)
    score_label = get_font(18)
    draw.text((950, 138), "Puan", fill=TEXT_SEC, font=score_label)

    # Timer and word count
    timer_font = get_bold_font(32)
    draw.text((380, 185), "01:24", fill=WHITE, font=timer_font)
    draw_rounded_rect(draw, [560, 175, 680, 215], radius=16, fill=(76, 175, 80, 50))
    draw.text((590, 182), "3/8", fill=SUCCESS, font=get_bold_font(28))

    # Grid (8x8)
    grid_size = 8
    cell_size = 105
    gap = 4
    grid_x = (w - grid_size * (cell_size + gap)) // 2
    grid_y = 260

    # Grid background
    grid_total = grid_size * (cell_size + gap)
    draw_rounded_rect(draw, [grid_x - 16, grid_y - 16, grid_x + grid_total + 12, grid_y + grid_total + 12],
                     radius=20, fill=(20, 20, 50))

    letters = "KEDİTAKUŞLINEKOYFBALIKGEYEŞKARGAKBCMFHTAVUKDÖRÇPASLANZVYRBJĞWÜİ"

    # Highlighted cells (simulating a selection: KEDI across row 0)
    highlights = {(0, 0), (0, 1), (0, 2), (0, 3)}
    # Found cells
    founds = {(2, 0), (2, 1), (2, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7)}

    font = get_bold_font(int(cell_size * 0.48))
    for row in range(grid_size):
        for col in range(grid_size):
            cx = grid_x + col * (cell_size + gap)
            cy = grid_y + row * (cell_size + gap)

            is_highlight = (row, col) in highlights
            is_found = (row, col) in founds

            if is_found:
                bg = GRID_FOUND
            elif is_highlight:
                bg = GRID_HIGHLIGHT
            else:
                bg = GRID_CELL

            draw_rounded_rect(draw, [cx, cy, cx + cell_size, cy + cell_size],
                            radius=int(cell_size * 0.15), fill=bg)

            idx = (row * grid_size + col) % len(letters)
            letter = letters[idx]
            text_color = WHITE if (is_highlight or is_found) else TEXT_SEC
            bbox = draw.textbbox((0, 0), letter, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            draw.text((cx + (cell_size - tw) / 2, cy + (cell_size - th) / 2 - 2),
                     letter, fill=text_color, font=font)

    # Word list
    word_y = grid_y + grid_total + 40
    words = ["KEDi", "KOPEK", "KUS", "BALIK", "AT", "iNEK", "KOYUN", "TAVUK"]
    found_words = [True, True, True, False, False, False, False, False]

    word_font = get_bold_font(28)
    cols = 2
    col_w = (w - 120) // cols
    for i, (word, found) in enumerate(zip(words, found_words)):
        c = i % cols
        r = i // cols
        wx = 60 + c * col_w
        wy = word_y + r * 50

        color = SUCCESS if found else TEXT_SEC
        draw.text((wx + 30, wy), word, fill=color, font=word_font)
        if found:
            # Strikethrough
            bbox = draw.textbbox((wx + 30, wy), word, font=word_font)
            mid_y = (bbox[1] + bbox[3]) // 2
            draw.line([(bbox[0], mid_y), (bbox[2], mid_y)], fill=SUCCESS, width=2)

    # Bottom promo
    promo_font = get_bold_font(40)
    text = "Kelimeleri Bul ve Surukle!"
    bbox = draw.textbbox((0, 0), text, font=promo_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 1780), text, fill=ACCENT, font=promo_font)

    img.save(os.path.join(STORE_DIR, "screenshot-3-gameplay.png"))
    print("  Screenshot 3 (Gameplay) created")

def screenshot_4_levels():
    """Seviye seçim ekranı"""
    w, h = 1080, 1920
    img, draw = create_phone_bg(w, h)

    # Header
    draw.rectangle([0, 0, w, 80], fill=(10, 10, 35))
    header_font = get_bold_font(40)
    draw.text((400, 120), "Hayvanlar", fill=WHITE, font=header_font)

    # Level cards
    for i in range(10):
        y = 220 + i * 130
        is_completed = i < 4
        is_locked = i > 6

        alpha = 100 if is_locked else 255
        card_fill = SURFACE if not is_locked else (30, 30, 55)

        draw_rounded_rect(draw, [50, y, w - 50, y + 110], radius=18, fill=card_fill)

        if is_completed:
            draw_rounded_rect(draw, [50, y, w - 50, y + 110], radius=18, fill=SURFACE,
                            outline=(76, 175, 80, 80), width=2)

        # Level badge
        badge_color = SUCCESS if is_completed else (PRIMARY if not is_locked else TEXT_SEC)
        draw_rounded_rect(draw, [80, y + 25, 140, y + 85], radius=14, fill=badge_color)

        badge_font = get_bold_font(32)
        badge_text = "V" if is_completed else str(i + 1)
        bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
        tw = bbox[2] - bbox[0]
        draw.text((110 - tw / 2, y + 38), badge_text, fill=WHITE, font=badge_font)

        # Level info
        level_font = get_bold_font(30)
        level_color = WHITE if not is_locked else TEXT_SEC
        draw.text((170, y + 28), f"Seviye {i + 1}", fill=level_color, font=level_font)

        info_font = get_font(22)
        grid_s = 7 + i
        word_c = 5 + i
        draw.text((170, y + 68), f"{word_c} kelime  |  {grid_s}x{grid_s} grid",
                 fill=TEXT_SEC, font=info_font)

        # Right icon
        if is_locked:
            draw.text((960, y + 42), "X", fill=TEXT_SEC, font=get_bold_font(28))
        elif is_completed:
            draw.text((955, y + 38), "*", fill=ACCENT, font=get_bold_font(36))
        else:
            draw.text((960, y + 42), ">", fill=PRIMARY, font=get_bold_font(30))

    # Bottom promo
    promo_font = get_bold_font(40)
    text = "Her Kategoride 20 Seviye!"
    bbox = draw.textbbox((0, 0), text, font=promo_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 1780), text, fill=ACCENT, font=promo_font)

    img.save(os.path.join(STORE_DIR, "screenshot-4-levels.png"))
    print("  Screenshot 4 (Levels) created")

def screenshot_5_completion():
    """Seviye tamamlama ekranı"""
    w, h = 1080, 1920
    img, draw = create_phone_bg(w, h)

    # Semi-transparent overlay
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 150))
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Success card
    card_x, card_y = 80, 400
    card_w, card_h = w - 160, 900
    draw_rounded_rect(draw, [card_x, card_y, card_x + card_w, card_y + card_h],
                     radius=28, fill=(25, 25, 65))
    draw_rounded_rect(draw, [card_x, card_y, card_x + card_w, card_y + card_h],
                     radius=28, fill=None, outline=(110, 90, 230, 80), width=3)

    # Celebration emoji area
    emoji_font = get_bold_font(100)
    draw.text((440, 430), "!!!", fill=ACCENT, font=emoji_font)

    # TEBRIKLER
    title_font = get_bold_font(64)
    text = "TEBRIKLER!"
    bbox = draw.textbbox((0, 0), text, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 560), text, fill=ACCENT, font=title_font)

    # Subtitle
    sub_font = get_font(32)
    sub = "Seviye 3 Tamamlandi!"
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 650), sub, fill=TEXT_SEC, font=sub_font)

    # Stats
    stat_font = get_bold_font(52)
    stat_label = get_font(24)
    stats = [("350", "Puan"), ("1:24", "Sure"), ("8", "Kelime")]
    stat_w = card_w // 3
    for i, (val, label) in enumerate(stats):
        cx = card_x + stat_w * (i + 0.5)
        bbox = draw.textbbox((0, 0), val, font=stat_font)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw / 2, 740), val, fill=PRIMARY, font=stat_font)
        bbox = draw.textbbox((0, 0), label, font=stat_label)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw / 2, 805), label, fill=TEXT_SEC, font=stat_label)

    # Buttons
    btn_y = 880
    draw_rounded_rect(draw, [card_x + 40, btn_y, card_x + card_w - 40, btn_y + 70],
                     radius=16, fill=PRIMARY)
    btn_font = get_bold_font(32)
    text = "Sonraki Seviye >"
    bbox = draw.textbbox((0, 0), text, font=btn_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, btn_y + 15), text, fill=WHITE, font=btn_font)

    draw_rounded_rect(draw, [card_x + 40, btn_y + 90, card_x + card_w - 40, btn_y + 155],
                     radius=16, fill=SURFACE)
    text = "Seviye Secimi"
    bbox = draw.textbbox((0, 0), text, font=btn_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, btn_y + 105), text, fill=TEXT_SEC, font=btn_font)

    draw_rounded_rect(draw, [card_x + 40, btn_y + 175, card_x + card_w - 40, btn_y + 240],
                     radius=16, fill=SURFACE)
    text = "Ana Menu"
    bbox = draw.textbbox((0, 0), text, font=btn_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, btn_y + 190), text, fill=TEXT_SEC, font=btn_font)

    img = img.convert('RGB')
    img.save(os.path.join(STORE_DIR, "screenshot-5-completion.png"))
    print("  Screenshot 5 (Completion) created")


# ============================================================
# 6. FEATURE GRAPHIC (1024x500) - Play Store
# ============================================================
def create_feature_graphic():
    w, h = 1024, 500
    img = Image.new('RGB', (w, h), BG_DARK)
    draw = ImageDraw.Draw(img)

    # Gradient background
    for i in range(h):
        ratio = i / h
        r = int(BG_DARK[0] + (BG_LIGHT[0] - BG_DARK[0]) * ratio)
        g = int(BG_DARK[1] + (BG_LIGHT[1] - BG_DARK[1]) * ratio)
        b = int(BG_DARK[2] + (BG_LIGHT[2] - BG_DARK[2]) * ratio)
        draw.line([(0, i), (w, i)], fill=(r, g, b))

    # Small grid decoration on left
    cell_s = 48
    gap_s = 4
    grid_letters = "KELiMEAVITR"
    small_font = get_bold_font(22)
    for row in range(5):
        for col in range(4):
            px = 40 + col * (cell_s + gap_s)
            py = 80 + row * (cell_s + gap_s)
            is_hl = (row == 0 and col < 4) or (row == 2 and col < 3)
            bg = GRID_HIGHLIGHT if is_hl else GRID_CELL
            draw_rounded_rect(draw, [px, py, px + cell_s, py + cell_s], radius=8, fill=bg)
            letter = grid_letters[(row * 4 + col) % len(grid_letters)]
            bbox = draw.textbbox((0, 0), letter, font=small_font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            text_color = WHITE if is_hl else TEXT_SEC
            draw.text((px + (cell_s - tw) / 2, py + (cell_s - th) / 2),
                     letter, fill=text_color, font=small_font)

    # Small grid decoration on right
    for row in range(5):
        for col in range(4):
            px = w - 260 + col * (cell_s + gap_s)
            py = 80 + row * (cell_s + gap_s)
            is_found = (row == 1) or (col == 2 and row > 1)
            bg = GRID_FOUND if is_found else GRID_CELL
            draw_rounded_rect(draw, [px, py, px + cell_s, py + cell_s], radius=8, fill=bg)
            letter = "BULHAYVANMSR"[(row * 4 + col) % 12]
            bbox = draw.textbbox((0, 0), letter, font=small_font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            text_color = WHITE if is_found else TEXT_SEC
            draw.text((px + (cell_s - tw) / 2, py + (cell_s - th) / 2),
                     letter, fill=text_color, font=small_font)

    # Center: Search icon
    draw_search_icon(draw, 512, 140, 120, ACCENT)

    # Title
    title_font = get_bold_font(72)
    text = "KELiME AVI"
    bbox = draw.textbbox((0, 0), text, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 210), text, fill=WHITE, font=title_font)

    # Subtitle
    sub_font = get_bold_font(28)
    sub = "Turkce Kelime Bulmaca Oyunu"
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 300), sub, fill=TEXT_SEC, font=sub_font)

    # Features line
    feat_font = get_bold_font(22)
    feats = "8 Kategori  |  160 Seviye  |  Turkce"
    bbox = draw.textbbox((0, 0), feats, font=feat_font)
    tw = bbox[2] - bbox[0]

    # Feature badge
    badge_w = tw + 40
    badge_x = (w - badge_w) / 2
    draw_rounded_rect(draw, [badge_x, 360, badge_x + badge_w, 400], radius=20,
                     fill=(110, 90, 230, 40), outline=PRIMARY, width=2)
    draw.text(((w - tw) / 2, 367), feats, fill=ACCENT, font=feat_font)

    # Bottom accent line
    draw.rounded_rectangle([(w // 2 - 100, 460), (w // 2 + 100, 466)], radius=3, fill=PRIMARY)

    img.save(os.path.join(STORE_DIR, "feature-graphic-1024x500.png"))
    print("  Feature graphic created")


# ============================================================
# RUN ALL
# ============================================================
if __name__ == "__main__":
    print("Kelime Avi - Asset Generation")
    print("=" * 40)

    print("\n1. App Icon:")
    create_app_icon()

    print("\n2. Adaptive Icons:")
    create_adaptive_icons()

    print("\n3. Splash Icon:")
    create_splash_icon()

    print("\n4. Favicon:")
    create_favicon()

    print("\n5. Phone Screenshots:")
    screenshot_1_home()
    screenshot_2_categories()
    screenshot_3_gameplay()
    screenshot_4_levels()
    screenshot_5_completion()

    print("\n6. Feature Graphic:")
    create_feature_graphic()

    print("\n" + "=" * 40)
    print("Tum gorseller olusturuldu!")
    print(f"  Store assets: {STORE_DIR}")
    print(f"  App assets: {ASSETS_DIR}")
