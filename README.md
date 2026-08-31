# Analysis Board

Power BI相当の可視化（基本チャート・テーブル・スライサー）を、サインイン不要のGitHub Pagesで公開する自分専用ダッシュボードです。

- チャート描画: [ECharts](https://echarts.apache.org/)
- データ: `public/data/sales.csv` に置いたCSVをブラウザ側でfetch＋パースして表示（サーバー・DB不要）
- 公開: GitHub Actionsでmainブランチへのpushのたびに自動ビルド・GitHub Pagesへデプロイ

## 開発

```bash
npm install
npm run dev      # http://localhost:5173 でローカル起動
npm run build    # 本番ビルド（dist/）
npm run preview  # ビルド成果物をローカルで確認
```

## データの更新方法

`public/data/sales.csv` を直接編集してcommit・pushするだけです。列は以下の6列（ヘッダー行必須）。

| 列名 | 内容 | 例 |
|---|---|---|
| date | 日付 (YYYY-MM-DD) | 2026-06-01 |
| region | 地域 | 関東 |
| category | カテゴリ | 家電 |
| product | 商品名 | ノートPC |
| amount | 売上額（円、数値） | 553278 |
| quantity | 数量（数値） | 17 |

列を追加・変更する場合は `src/types/sales.ts`（型定義）と `src/data/useSalesData.ts`（パース処理）を合わせて更新してください。

## GitHub Pagesへの公開手順（初回のみ）

1. GitHubで新しいリポジトリを作成し、このプロジェクトをpushする。
   ```bash
   git remote add origin <あなたのリポジトリURL>
   git push -u origin main
   ```
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定する。
3. 上記push後、Actionsタブでワークフロー（`Deploy to GitHub Pages`）が成功すると、`https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される。
4. 以後は `main` にpushするたびに自動で再デプロイされる。

## 現在の機能（MVP）

- 棒グラフ（地域別売上合計）
- 折れ線グラフ（日別売上推移）
- ドーナツグラフ（カテゴリ別売上構成比）
- 明細テーブル（列ソート・ページネーション）
- スライサー（地域・カテゴリで全チャート/テーブルを絞り込み）

## 今後の拡張候補

- チャート種類の追加（複合グラフ、ヒストグラム、散布図、地図など）
- KPIカード／ゲージ
- ダークモード対応
- 複数データセットへの対応
