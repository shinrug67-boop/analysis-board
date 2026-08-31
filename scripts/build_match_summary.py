#!/usr/bin/env python3
"""
Opta（Stats Perform）の生イベントログ（1行=1プレー）を、試合×チーム単位の
集計CSVに変換するスクリプト。

生ログは数GB単位（1行=タックル/キャリー/トライ等の1プレー）でリポジトリには
含めない。このスクリプトを手元で実行し、出力される小さい集計CSV
（public/data/match_team_summary.csv）だけをコミットする。

新しい試合データが増えたときは、このスクリプトを再実行してCSVを差し替える。

使い方:
    python3 scripts/build_match_summary.py --input /path/to/Opta_Total_Merged.csv

指標の定義（データ定義書 "Rugby Union - BI Event Data 2.0.0" に基づく）:
    tries                  actionName=="Try" の件数
    tackle_success_rate    (Tackle件数 - ActionResultName=="Missed"件数) / Tackle件数
                           ※別イベント "Missed Tackle" は同一ミスの二重記録と判断し無視
    carry_metres           actionName=="Carry" の Metres2（保持開始〜終了の実移動距離）合計
    lineout_success_rate   Lineout Throwのうち ActionResultName が "Won" で始まる件数の割合
    scrum_success_rate     Offensive Scrum（自チーム投入、Reset除く）のうち
                           ActionResultName が "Won" で始まる件数の割合
    turnovers_conceded/won conceded = 自チームの Turnover×"Error on Attack" 件数
                           won = 同一試合の相手チームのconceded件数
    penalties_conceded     actionName=="Penalty Conceded" の件数
    yellow_cards/red_cards actionName=="Card" かつ ActionTypeName が Yellow/Red Card
"""
import argparse
import csv
from collections import defaultdict

NEEDED_COLUMNS = [
    "FXID", "teamName", "Opposision", "datePlayed", "season", "roundNumber",
    "isHome", "result", "hometeamFTscore", "awayteamFTscore", "competitionName",
    "actionName", "ActionResultName", "ActionTypeName", "Metres2",
]

OUTPUT_FIELDNAMES = [
    "match_id", "date", "season", "round", "team", "opponent", "is_home",
    "own_score", "opp_score", "result",
    "tries",
    "tackles_attempted", "tackles_made", "tackle_success_rate",
    "carries", "carry_metres",
    "lineout_throws", "lineout_won", "lineout_success_rate",
    "scrum_attempts", "scrum_won", "scrum_success_rate",
    "turnovers_conceded", "turnovers_won",
    "penalties_conceded",
    "yellow_cards", "red_cards",
]


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", required=True, help="生イベントログCSVのパス（ローカルのみ、リポジトリ外）")
    parser.add_argument("--competition", default="Japan Rugby League One D1", help="対象大会名（competitionName列と完全一致）")
    parser.add_argument("--output", default="public/data/match_team_summary.csv", help="出力先CSVパス")
    return parser.parse_args()


def to_iso_date(date_str: str) -> str:
    """'26/10/2024' (DD/MM/YYYY) -> '2024-10-26'。想定外の形式はそのまま返す。"""
    parts = date_str.split("/")
    if len(parts) == 3:
        day, month, year = parts
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    return date_str


def new_match_stat():
    return {
        "date": None, "season": None, "round": None, "opponent": None,
        "is_home": None, "own_score": None, "opp_score": None, "result": None,
        "tries": 0,
        "tackles_attempted": 0, "tackles_missed": 0,
        "carries": 0, "carry_metres": 0.0,
        "lineout_throws": 0, "lineout_won": 0,
        "scrum_attempts": 0, "scrum_won": 0,
        "turnovers_conceded": 0,
        "penalties_conceded": 0,
        "yellow_cards": 0, "red_cards": 0,
    }


def safe_float(value: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def build_summary(input_path: str, competition: str):
    matches: dict[tuple[str, str], dict] = defaultdict(new_match_stat)

    with open(input_path, encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        header = next(reader)
        idx = {name: i for i, name in enumerate(header)}
        missing = [c for c in NEEDED_COLUMNS if c not in idx]
        if missing:
            raise SystemExit(f"入力CSVに想定する列がありません: {missing}")

        comp_i = idx["competitionName"]
        fxid_i, team_i, opp_i = idx["FXID"], idx["teamName"], idx["Opposision"]
        date_i, season_i, round_i = idx["datePlayed"], idx["season"], idx["roundNumber"]
        home_i, result_i = idx["isHome"], idx["result"]
        hft_i, aft_i = idx["hometeamFTscore"], idx["awayteamFTscore"]
        action_i, aresult_i, atype_i = idx["actionName"], idx["ActionResultName"], idx["ActionTypeName"]
        metres2_i = idx["Metres2"]

        row_count = 0
        for row in reader:
            row_count += 1
            if row_count % 1_000_000 == 0:
                print(f"  ...{row_count:,}行処理済み")
            if len(row) <= max(idx.values()) or row[comp_i] != competition:
                continue

            key = (row[fxid_i], row[team_i])
            s = matches[key]

            if s["date"] is None:
                is_home = row[home_i] == "Y"
                s["date"] = to_iso_date(row[date_i])
                s["season"] = row[season_i]
                s["round"] = row[round_i]
                s["opponent"] = row[opp_i]
                s["is_home"] = "Y" if is_home else "N"
                s["own_score"] = row[hft_i] if is_home else row[aft_i]
                s["opp_score"] = row[aft_i] if is_home else row[hft_i]
                s["result"] = row[result_i]

            action = row[action_i]
            result = row[aresult_i]

            if action == "Try":
                s["tries"] += 1
            elif action == "Tackle":
                s["tackles_attempted"] += 1
                if result == "Missed":
                    s["tackles_missed"] += 1
            elif action == "Carry":
                s["carries"] += 1
                s["carry_metres"] += safe_float(row[metres2_i])
            elif action == "Lineout Throw":
                s["lineout_throws"] += 1
                if result.startswith("Won"):
                    s["lineout_won"] += 1
            elif action == "Offensive Scrum":
                if result != "Reset":
                    s["scrum_attempts"] += 1
                    if result.startswith("Won"):
                        s["scrum_won"] += 1
            elif action == "Turnover":
                if result == "Error on Attack":
                    s["turnovers_conceded"] += 1
            elif action == "Penalty Conceded":
                s["penalties_conceded"] += 1
            elif action == "Card":
                atype = row[atype_i]
                if atype == "Yellow Card":
                    s["yellow_cards"] += 1
                elif atype == "Red Card":
                    s["red_cards"] += 1

    return matches


def rate(numerator: int, denominator: int):
    return round(numerator / denominator, 4) if denominator else ""


def finalize_rows(matches: dict) -> list[dict]:
    conceded_by_match: dict[str, dict[str, int]] = defaultdict(dict)
    for (fxid, team), s in matches.items():
        conceded_by_match[fxid][team] = s["turnovers_conceded"]

    rows = []
    for (fxid, team), s in matches.items():
        turnovers_won = conceded_by_match[fxid].get(s["opponent"], 0)
        tackles_made = s["tackles_attempted"] - s["tackles_missed"]

        rows.append({
            "match_id": fxid,
            "date": s["date"],
            "season": s["season"],
            "round": s["round"],
            "team": team,
            "opponent": s["opponent"],
            "is_home": s["is_home"],
            "own_score": s["own_score"],
            "opp_score": s["opp_score"],
            "result": s["result"],
            "tries": s["tries"],
            "tackles_attempted": s["tackles_attempted"],
            "tackles_made": tackles_made,
            "tackle_success_rate": rate(tackles_made, s["tackles_attempted"]),
            "carries": s["carries"],
            "carry_metres": round(s["carry_metres"], 1),
            "lineout_throws": s["lineout_throws"],
            "lineout_won": s["lineout_won"],
            "lineout_success_rate": rate(s["lineout_won"], s["lineout_throws"]),
            "scrum_attempts": s["scrum_attempts"],
            "scrum_won": s["scrum_won"],
            "scrum_success_rate": rate(s["scrum_won"], s["scrum_attempts"]),
            "turnovers_conceded": s["turnovers_conceded"],
            "turnovers_won": turnovers_won,
            "penalties_conceded": s["penalties_conceded"],
            "yellow_cards": s["yellow_cards"],
            "red_cards": s["red_cards"],
        })

    rows.sort(key=lambda r: (r["date"] or "", r["team"]))
    return rows


def main():
    args = parse_args()
    print(f"読み込み中: {args.input}")
    matches = build_summary(args.input, args.competition)
    rows = finalize_rows(matches)

    with open(args.output, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=OUTPUT_FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)

    match_count = len({r["match_id"] for r in rows})
    print(f"完了: {len(rows)}行（{match_count}試合分）を {args.output} に書き出しました")


if __name__ == "__main__":
    main()
