# Analysis Board

ラグビー分析のための、サインイン不要のGitHub Pagesダッシュボードです（対象: Japan Rugby League One D1、全シーズン）。

- チャート描画: [ECharts](https://echarts.apache.org/)
- データ: `public/data/*.csv`（試合×チーム集計・試合×選手集計・キックイベント）をブラウザ側でfetch＋パースして表示（サーバー・DB不要）
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

分析の元になっているのはStats Perform（Opta）の生イベントログ（1行=1プレー、数GB単位）です。これは巨大すぎてブラウザにもGitHubにも載せられないため、**手元で集計したCSVだけをコミットする**構成になっています。

```
生イベントログ（数GB、ローカルのみ・リポジトリ非対象）
        │  scripts/build_summaries.py
        ▼
public/data/match_team_summary.csv   （656行、試合×チーム）
public/data/match_player_summary.csv （約14,900行、試合×選手）
public/data/kick_events.csv          （約20,400行、キック1本=1行）
        │  ブラウザでfetch
        ▼
ダッシュボード表示
```

新しい試合データが増えたら、生ログを更新した上で以下を再実行してCSVを差し替えてください（1回の走査で3ファイルすべてを再生成します）。

```bash
python3 scripts/build_summaries.py --input /path/to/生イベントログ.csv
```

- `--competition`: 対象大会名（デフォルト `Japan Rugby League One D1`）。生データの`competitionName`列と完全一致する必要があります。
- `--output-dir`: 出力先ディレクトリ（デフォルト `public/data`）

### 集計指標の定義

出典: Stats Perform「Rugby Union - BI Event Data 2.0.0」データ定義書。

**試合×チーム／試合×選手 共通**

| 指標 | 算出方法 |
|---|---|
| tries | `actionName=="Try"` の件数 |
| tackle_success_rate | (Tackle件数 − `ActionResultName=="Missed"`件数) / Tackle件数 |
| carry_metres | `actionName=="Carry"` の `Metres2`（保持開始〜終了の実移動距離）合計 |
| penalties_conceded | `actionName=="Penalty Conceded"` の件数 |
| yellow_cards / red_cards | `actionName=="Card"` かつ `ActionTypeName` がYellow/Red Card |

**試合×チームのみ**

| 指標 | 算出方法 |
|---|---|
| lineout_success_rate | Lineout Throwのうち`ActionResultName`が`"Won"`で始まる件数の割合 |
| scrum_success_rate | 自チーム投入のOffensive Scrum（Reset除く）のうち`"Won"`で始まる件数の割合 |
| turnovers_conceded / won | conceded=自チームの`Turnover×"Error on Attack"`件数、won=同一試合の相手チームのconceded件数 |
| possession_seconds | `actionName=="Possession"` の `ps_endstamp - ps_timestamp` 合計（ボール保持時間）。勝敗差分析では相手チームとの合計に対する比率（ボール保持率）として使用 |
| line_breaks | `actionName=="Attacking Qualities" AND ActionTypeName=="Initial Break"` の件数（ラインブレイク数） |
| entries_22 / entries_22_tries | `actionName=="Attacking 22 Entry"` の件数（敵陣22m侵入回数）。tries はそのうち`ActionTypeName=="22 Entry Outcome - Try"`の件数（22m侵入→トライ転換率の分子） |
| tackles_dominant | Tackle件数のうち `qualifier4Name=="Dominant Tackle"` の件数（ドミナントタックル。多くは`ActionResultName=="Sack"`と対応） |
| offload_allowed_tackles | Tackle件数のうち `ActionResultName=="Offload Allowed"` の件数（タックルはしたがボールをオフロードされた回数） |
| jackal_attempts / jackal_won | `actionName=="Collection" AND ActionTypeName=="Jackal"` の件数（ブレイクダウンでのボール奪取試行）。wonはそのうち`ActionResultName=="Success"`の件数 |
| turnovers_won_tackle | `actionName=="Tackle" AND ActionResultName=="Turnover Won"` の件数（タックルからそのままターンオーバーを奪った回数） |
| penalties_conceded_defence | Penalty Concededのうち `qualifier3Name=="Defence"` の件数（自陣防御中に犯したペナルティ。攻撃側のオフサイド等は含まない） |

**試合×選手のみ**

| 指標 | 算出方法 |
|---|---|
| turnovers_forced | `actionName=="Tackle" AND ActionResultName=="Turnover Won"` の件数（そのタックルでボールを奪った選手に帰属） |

**キックイベント（`kick_events.csv`）**

`actionName=="Kick"` の行をそのまま1行=1キックで抽出。座標系はOpta定義どおり `x`:0(自陣ゴールライン)〜100(相手ゴールライン)、`y`:0〜68（タッチライン間、自チーム視点で正規化済み）。`kick_type`=ActionTypeName（キック種別）、`phase`=qualifier3Name（Kick in Play/Own22/Penalty Kick）、`outcome`=ActionResultName、`metres`=Metres2（キック距離）。

列を追加・変更する場合は `scripts/build_summaries.py`（集計ロジック）、`src/types/match.ts`（型定義）、`src/data/use*.ts`（パース処理）を合わせて更新してください。

## GitHub Pagesへの公開手順（初回のみ）

1. GitHubで新しいリポジトリを作成し、このプロジェクトをpushする。
   ```bash
   git remote add origin <あなたのリポジトリURL>
   git push -u origin main
   ```
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定する。
3. 上記push後、Actionsタブでワークフロー（`Deploy to GitHub Pages`）が成功すると、`https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される。
4. 以後は `main` にpushするたびに自動で再デプロイされる。

## 現在の機能

- 棒グラフ（チーム別トライ数合計・平均キャリー獲得m・スクラム/ラインアウト成功率）
- 折れ線グラフ（日別タックル成功率推移）
- ドーナツグラフ（勝敗内訳）
- 明細テーブル（試合×チーム成績、列ソート・ページネーション）
- 選手成績ランキング表（期間合計、列ソート・ページネーション）
- キッキングチャート（シーズン/チーム/ラウンドを選んで、キックの軌道を矢印でフィールド上に表示）
- チーム別ディフェンス集計表（タックル成功率・ドミナントタックル・ジャッカル・ペナルティ等、順位付き。末尾に全チーム合計行）
- グローバルスライサー（チーム・シーズン・対戦相手）で上記の大半のチャート/テーブルを連動して絞り込み

## 今後の拡張候補

- キッキングチャートの結果別色分け（成功/エラー等）
- 他大会・他シーズンの追加（`--competition`を変えて再集計）
- ダークモード対応
- バンドルサイズの最適化（現状 echarts込みで約270KB gzip、コード分割の余地あり）
