"""把 LINE Seed TW Bold 裁成網站標題用得到的字，輸出 assets/fonts/pastee-display.woff2。

改了任何標題（h1–h3、.display、.brand、價格）之後重跑一次：

    pip install fonttools brotli
    python3 tools/subset-font.py ~/Library/Fonts/LINESeedTW_TTF_Bd.ttf

字型：LINE Seed TW（© LY Corporation，SIL Open Font License 1.1），授權全文在 assets/fonts/OFL.txt。
"""
import string
import sys
from html.parser import HTMLParser
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "support/index.html", "404.html", "tools/og.html"]
DISPLAY_TAGS = {"h1", "h2", "h3"}
DISPLAY_CLASSES = {"display", "brand", "num", "soon", "tag"}


class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.depth = []  # 每層是不是標題字
        self.chars = set()

    def handle_starttag(self, tag, attrs):
        cls = set((dict(attrs).get("class") or "").split())
        inside = bool(self.depth and self.depth[-1])
        if tag in ("img", "br", "meta", "link", "input", "use", "path", "circle", "rect"):
            return
        self.depth.append(inside or tag in DISPLAY_TAGS or bool(cls & DISPLAY_CLASSES))

    def handle_endtag(self, tag):
        if tag in ("img", "br", "meta", "link", "input", "use", "path", "circle", "rect"):
            return
        if self.depth:
            self.depth.pop()

    def handle_data(self, data):
        if self.depth and self.depth[-1]:
            self.chars.update(data)


def main():
    src = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path("~/Library/Fonts/LINESeedTW_TTF_Bd.ttf").expanduser()
    text = set(string.printable) | set("，。、：；！？「」『』（）…—–·・→←↩⌘⇧×％")
    for page in PAGES:
        path = ROOT / page
        if path.exists():
            c = Collector()
            c.feed(path.read_text(encoding="utf-8"))
            text |= c.chars
    text = "".join(sorted(ch for ch in text if not ch.isspace() or ch == " "))
    out = ROOT / "assets/fonts/pastee-display.woff2"
    out.parent.mkdir(parents=True, exist_ok=True)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "palt", "halt", "vert"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    font = subset.load_font(str(src), opts)
    s = subset.Subsetter(opts)
    s.populate(text=text)
    s.subset(font)
    subset.save_font(font, str(out), opts)
    print(f"{len(text)} 字 → {out.relative_to(ROOT)}（{out.stat().st_size // 1024} KB）")


if __name__ == "__main__":
    main()
