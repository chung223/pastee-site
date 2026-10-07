# 貼貼 Pastee 網站

[貼貼 Pastee](https://chung223.github.io/pastee-site/)（iPhone、iPad、Mac 的剪貼簿歷史）的官網，用 GitHub Pages 從 `main` 分支的根目錄發佈。

| 路徑 | 內容 |
|---|---|
| `index.html` | 首頁 |
| `support/` | 支援與常見問題 |
| `404.html` | 找不到頁面（用的是 `/pastee-site/` 開頭的絕對路徑） |
| `assets/site.css`、`assets/site.js` | 樣式與互動 |
| `assets/vendor/` | GSAP 3.13 與 ScrollTrigger（[GSAP 標準授權](https://gsap.com/standard-license)，免費） |
| `assets/fonts/` | 標題字 LINE Seed TW Bold 的子集（SIL OFL 1.1，見 `OFL.txt`） |
| `assets/screens/` | App 實際畫面（從 App 的 `AppStoreScreenshots/base/zh` 轉成 WebP） |
| `assets/og.png` | 分享預覽圖，原稿是 `tools/og.html` |

隱私政策沿用 <https://chung223.github.io/pastee-privacy/>（App Store Connect 填的是那個網址），這裡只連過去，不另放一份。

App Store：<https://apps.apple.com/tw/app/%E8%B2%BC%E8%B2%BC-pastee/id6814187982>

## 設計

方向叫「週三的剪貼簿」：首屏是一個人一天複製過的東西，連結、色票、程式碼、截圖、被遮罩的卡號並排在一起，內容本身就是畫面。
顏色和 App 的柿墨 Persimmon Ink 同一組（八種內容色、柿子色強調），淺色、深色都有。
標題用 LINE Seed TW Bold，內文用系統字（蘋方／SF），時間與程式碼用系統等寬字。
所有檔案都在這個 repo 裡，**不向任何第三方載入字型、腳本或追蹤**，跟 App 的隱私立場一致。

會動的地方：

- 首屏：卡片照時間順序像紙一樣放到桌上，「47」從 0 數上來。
- 自動分類：47 筆從一堆亂放，隨捲動排進八種類型（GSAP ScrollTrigger，往回捲就倒放）。
- 搜尋：跟 App 一樣的排序規則（完全相同 > 開頭 > 詞首 > 中間，命中太少時比對縮寫），可以自己打字。
- 在頁面上複製任何東西：會被分類、偵測敏感內容並遮罩、重複的提到最前面，標題的次數跟著加一。只存在分頁的記憶體裡。
- 系統開了「減少動態效果」時，全部直接顯示結果。

Mac 版還沒上架前，頁面上的 Mac 標著「即將推出」（`index.html` 與 `support/index.html` 搜尋 `即將推出`）。上架後拿掉那幾個標籤即可。

## 本機預覽

```bash
python3 -m http.server 4321 --directory ..
```

打開 http://localhost:4321/pastee-site/ （和線上一樣在 `/pastee-site/` 底下，`404.html` 用的是絕對路徑）。

## 改了標題文字之後

標題字型只收了用得到的字，改了 h1–h3、價格、品牌名稱之後要重做子集，否則新字會退回系統字：

```bash
pip install fonttools brotli
python3 tools/subset-font.py ~/Library/Fonts/LINESeedTW_TTF_Bd.ttf
```

## 分享預覽圖

改了 `tools/og.html` 之後，重做 `assets/og.png`（1200×630）：

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=4000 --screenshot=assets/og.png http://localhost:4321/pastee-site/tools/og.html
```

## 授權

網站的文字、圖片與設計 © 2026 貼貼 Pastee，保留所有權利。字型與 GSAP 依各自授權。
