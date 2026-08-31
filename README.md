# Analysis Board

ラグビー分析のための、サインイン不要のGitHub Pagesダッシュボードです（対象: Japan Rugby League One D1、全シーズン）。

- チャート描画: [ECharts](https://echarts.apache.org/)
- データ: `public/data/match_team_summary.csv`（試合×チーム単位の集計、656行）をブラウザ側でfetch＋パースして表示（サーバー・DB不要）
- 公開: GitHub Actionsでmainブランチへのpushのたびに自動ビルド・GitHub Pagesへデプロイ

## 開発

```bash
npm install
npm run dev      # http://localhost:5173 でローカル起動
npm run build    # 本番ビルド（dist/）
npm run preview  # ビルド成果物をローカルで確認
```

## データについて

### 生データと集計データの2段構成

分析の元になっているのはStats Perform（Opta）の生イベントログ（1行=1プレー、数GB単位）です。これは巨大すぎてブラウザにもGitHubにも載せられないため、**手元で試合×チーム単位に集計したCSVだけをコミットする**構成になっています。

```
生イベントログ（数GB、ローカルのみ・リポジトリ非対象）
        │  scripts/build_match_summary.py
        ▼
public/data/match_team_summary.csv（656行、これだけをコミット）
        │  ブラウザでfetch
        ▼
ダッシュボード表示
```

新しい試合データが増えたら、生ログを更新した上で以下を再実行してCSVを差し替えてください。

```bash
python3 scripts/build_match_summary.py --input /path/to/生イベントログ.csv
```

- `--competition`: 対象大会名（デフォルト `Japan Rugby League One D1`）。生データの`competitionName`列と完全一致する必要があります。
- `--output`: 出力先（デフォルト `public/data/match_team_summary.csv`）

### 集計指標の定義

出典: Stats Perform「Rugby Union - BI Event Data 2.0.0」データ定義書。

| 指標 | 算出方法 |
|---|---|
| tries | `actionName=="Try"` の件数 |
| tackle_success_rate | (Tackle件数 − `ActionResultName=="Missed"`件数) / Tackle件数 |
| carry_metres | `actionName=="Carry"` の `Metres2`（保持開始〜終了の実移動距離）合計 |
| lineout_success_rate | Lineout Throwのうち`ActionResultName`が`"Won"`で始まる件数の割合 |
| scrum_success_rate | 自チーム投入のOffensive Scrum（Reset除く）のうち`"Won"`で始まる件数の割合 |
| turnovers_conceded / won | conceded=自チームの`Turnover×"Error on Attack"`件数、won=同一試合の相手チームのconceded件数 |
| penalties_conceded | `actionName=="Penalty Conceded"` の件数 |
| yellow_cards / red_cards | `actionName=="Card"` かつ `ActionTypeName` がYellow/Red Card |

列を追加・変更する場合は `scripts/build_match_summary.py`（集計ロジック）、`src/types/match.ts`（型定義）、`src/data/useMatchData.ts`（パース処理）を合わせて更新してください。

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

- 棒グラフ（チーム別トライ数合計）
- 折れ線グラフ（日別タックル成功率推移）
- ドーナツグラフ（勝敗内訳）
- 明細テーブル（試合×チーム成績、列ソート・ページネーション）
- スライサー（チーム・シーズンで全チャート/テーブルを絞り込み）

## 今後の拡張候補

- キャリー獲得メートル・スクラム/ラインアウト成功率などのチーム比較チャート
- 選手単位の個人成績（生ログのPlayer*列を使えば追加可能）
- 他大会・他シーズンの追加（`--competition`を変えて再集計）
- ダークモード対応
