# Toolify SNS 自動投稿セットアップ

Buffer 経由で Twitter/X・LinkedIn 等に多言語自動投稿します。

## 1. Buffer アカウント設定

1. <https://buffer.com> でアカウント作成（無料プランで3チャネルまで連携可）
2. Twitter/X など対象アカウントを連携
3. <https://account.buffer.com/developers/applications> で Access Token を作成

## 2. プロジェクト側設定

`.env.local`（コミット禁止）に追記：

```env
BUFFER_TOKEN=...
BUFFER_CHANNEL_ID=...
```

`BUFFER_CHANNEL_ID` は Buffer ダッシュボード → Channels で対象アカウントを開いた URL から取得（例: `https://buffer.com/profile/abc123`）。

## 3. 単発実行

```bash
# DRY RUN（実投稿せず表示のみ）
BUFFER_DRY_RUN=1 node scripts/buffer-post.mjs

# 実投稿
node scripts/buffer-post.mjs
```

## 4. 定期実行（macOS launchd 例）

`~/Library/LaunchAgents/com.toolify365.buffer-post.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.toolify365.buffer-post</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/path/to/toolify365/scripts/buffer-post.mjs</string>
  </array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Hour</key><integer>8</integer></dict>
    <dict><key>Hour</key><integer>10</integer></dict>
    <dict><key>Hour</key><integer>12</integer></dict>
    <dict><key>Hour</key><integer>22</integer></dict>
  </array>
  <key>StandardOutPath</key><string>/tmp/toolify-buffer.log</string>
  <key>StandardErrorPath</key><string>/tmp/toolify-buffer.err</string>
</dict>
</plist>
```

ロード:

```bash
launchctl load ~/Library/LaunchAgents/com.toolify365.buffer-post.plist
```

## 5. 投稿スケジュール（言語別）

| 時刻（JST） | 言語 |
|---|---|
| 08:00 | ja |
| 09:00 | ko |
| 10:00 | zh-CN |
| 12:00 | id |
| 22:00 | en |

時刻に応じて自動的に該当言語の POSTS から選択されます。

## 6. 新しいツールを追加した時

`scripts/buffer-post.mjs` の `POSTS` オブジェクトに各言語1件ずつ投稿を追加してください。URL形式：
- en: `https://toolify365.com/en/tools/<slug>`
- ja: `https://toolify365.com/ja/tools/<slug>`

ハッシュタグは英語・各言語の検索に有効なものを2〜3個。
