#!/usr/bin/env python3
"""
Opta（Stats Perform）の生イベントログ（1行=1プレー）から、ダッシュボード表示用の
3つの軽量CSVを1回の走査で生成するスクリプト。

生ログは数GB単位（1行=タックル/キャリー/トライ等の1プレー）でリポジトリには
含めない。このスクリプトを手元で実行し、出力される3つの小さいCSVだけをコミットする。

新しい試合データが増えたときは、このスクリプトを再実行してCSVを差し替える。

使い方:
    python3 scripts/build_summaries.py --input /path/to/Opta_Total_Merged.csv

出力（デフォルトの出力先、いずれも public/data/ 配下）:
    match_team_summary.csv    試合×チーム単位の集計（従来どおり）
    match_player_summary.csv  試合×選手単位の集計（新規）
    kick_events.csv           キックイベント1行=1行の生座標データ（新規、キッキングチャート用）

指標の定義（データ定義書 "Rugby Union - BI Event Data 2.0.0" に基づく）は
README.md の「集計指標の定義」を参照。
"""
import argparse
import csv
import os
from collections import defaultdict

NEEDED_COLUMNS = [
    "FXID", "PLID", "teamName", "playerName", "Opposision",
    "datePlayed", "season", "roundNumber", "isHome", "result",
    "hometeamFTscore", "awayteamFTscore", "competitionName",
    "actionName", "ActionResultName", "ActionTypeName", "qualifier3Name",
    "Metres2", "playerpositionName", "playerShirtNumber", "PlayerGameTimeMinutes",
    "x_coord", "y_coord", "x_coord_end", "y_coord_end",
    "ps_timestamp", "ps_endstamp",
]

TEAM_FIELDNAMES = [
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
    "possession_seconds", "line_breaks", "entries_22", "entries_22_tries",
]

PLAYER_FIELDNAMES = [
    "match_id", "date", "season", "round", "team", "opponent",
    "player", "position", "shirt_number", "minutes_played",
    "tries",
    "tackles_attempted", "tackles_made", "tackle_success_rate",
    "turnovers_forced",
    "carries", "carry_metres",
    "penalties_conceded", "yellow_cards", "red_cards",
]

KICK_FIELDNAMES = [
    "match_id", "date", "season", "round", "team", "opponent", "player",
    "x", "y", "x_end", "y_end", "kick_type", "phase", "outcome", "metres",
]


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", required=True, help="生イベントログCSVのパス（ローカルのみ、リポジトリ外）")
    parser.add_argument("--competition", default="Japan Rugby League One D1", help="対象大会名（competitionName列と完全一致）")
    parser.add_argument("--output-dir", default="public/data", help="出力先ディレクトリ")
    return parser.parse_args()


def to_iso_date(date_str: str) -> str:
    """'26/10/2024' (DD/MM/YYYY) -> '2024-10-26'。想定外の形式はそのまま返す。"""
    parts = date_str.split("/")
    if len(parts) == 3:
        day, month, year = parts
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    return date_str


def safe_float(value: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def new_team_stat():
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
        "possession_seconds": 0.0, "line_breaks": 0, "entries_22": 0, "entries_22_tries": 0,
    }


def new_player_stat():
    return {
        "date": None, "season": None, "round": None, "team": None, "opponent": None,
        "player": None, "position": None, "shirt_number": None, "minutes_played": None,
        "tries": 0,
        "tackles_attempted": 0, "tackles_missed": 0, "turnovers_forced": 0,
        "carries": 0, "carry_metres": 0.0,
        "penalties_conceded": 0, "yellow_cards": 0, "red_cards": 0,
    }


def process(input_path: str, competition: str):
    team_matches: dict[tuple[str, str], dict] = defaultdict(new_team_stat)
    player_matches: dict[tuple[str, str], dict] = defaultdict(new_player_stat)
    kicks: list[dict] = []

    with open(input_path, encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        header = next(reader)
        idx = {name: i for i, name in enumerate(header)}
        missing = [c for c in NEEDED_COLUMNS if c not in idx]
        if missing:
            raise SystemExit(f"入力CSVに想定する列がありません: {missing}")

        i_comp = idx["competitionName"]
        i_fxid, i_plid, i_team, i_player, i_opp = (
            idx["FXID"], idx["PLID"], idx["teamName"], idx["playerName"], idx["Opposision"],
        )
        i_date, i_season, i_round = idx["datePlayed"], idx["season"], idx["roundNumber"]
        i_home, i_result = idx["isHome"], idx["result"]
        i_hft, i_aft = idx["hometeamFTscore"], idx["awayteamFTscore"]
        i_action, i_aresult, i_atype, i_q3 = (
            idx["actionName"], idx["ActionResultName"], idx["ActionTypeName"], idx["qualifier3Name"],
        )
        i_metres2 = idx["Metres2"]
        i_pos, i_shirt, i_mins = idx["playerpositionName"], idx["playerShirtNumber"], idx["PlayerGameTimeMinutes"]
        i_x, i_y, i_xe, i_ye = idx["x_coord"], idx["y_coord"], idx["x_coord_end"], idx["y_coord_end"]
        i_ps, i_pe = idx["ps_timestamp"], idx["ps_endstamp"]

        max_idx = max(idx.values())
        row_count = 0
        for row in reader:
            row_count += 1
            if row_count % 1_000_000 == 0:
                print(f"  ...{row_count:,}行処理済み")
            if len(row) <= max_idx or row[i_comp] != competition:
                continue

            fxid = row[i_fxid]
            team = row[i_team]
            player_name = row[i_player]
            action = row[i_action]
            result = row[i_aresult]

            # --- チーム集計 ---
            ts = team_matches[(fxid, team)]
            if ts["date"] is None:
                is_home = row[i_home] == "Y"
                ts["date"] = to_iso_date(row[i_date])
                ts["season"] = row[i_season]
                ts["round"] = row[i_round]
                ts["opponent"] = row[i_opp]
                ts["is_home"] = "Y" if is_home else "N"
                ts["own_score"] = row[i_hft] if is_home else row[i_aft]
                ts["opp_score"] = row[i_aft] if is_home else row[i_hft]
                ts["result"] = row[i_result]

            if action == "Try":
                ts["tries"] += 1
            elif action == "Tackle":
                ts["tackles_attempted"] += 1
                if result == "Missed":
                    ts["tackles_missed"] += 1
            elif action == "Carry":
                ts["carries"] += 1
                ts["carry_metres"] += safe_float(row[i_metres2])
            elif action == "Lineout Throw":
                ts["lineout_throws"] += 1
                if result.startswith("Won"):
                    ts["lineout_won"] += 1
            elif action == "Offensive Scrum":
                if result != "Reset":
                    ts["scrum_attempts"] += 1
                    if result.startswith("Won"):
                        ts["scrum_won"] += 1
            elif action == "Turnover":
                if result == "Error on Attack":
                    ts["turnovers_conceded"] += 1
            elif action == "Penalty Conceded":
                ts["penalties_conceded"] += 1
            elif action == "Card":
                atype = row[i_atype]
                if atype == "Yellow Card":
                    ts["yellow_cards"] += 1
                elif atype == "Red Card":
                    ts["red_cards"] += 1
            elif action == "Possession":
                dur = safe_float(row[i_pe]) - safe_float(row[i_ps])
                if dur > 0:
                    ts["possession_seconds"] += dur
            elif action == "Attacking Qualities" and row[i_atype] == "Initial Break":
                ts["line_breaks"] += 1
            elif action == "Attacking 22 Entry":
                ts["entries_22"] += 1
                if row[i_atype] == "22 Entry Outcome - Try":
                    ts["entries_22_tries"] += 1

            # --- 選手集計（選手が紐付くイベントのみ） ---
            if player_name:
                ps = player_matches[(fxid, row[i_plid])]
                if ps["date"] is None:
                    ps["date"] = ts["date"] if ts["date"] is not None else to_iso_date(row[i_date])
                    ps["season"] = row[i_season]
                    ps["round"] = row[i_round]
                    ps["team"] = team
                    ps["opponent"] = row[i_opp]
                    ps["player"] = player_name
                    ps["position"] = row[i_pos]
                    ps["shirt_number"] = row[i_shirt]
                    ps["minutes_played"] = row[i_mins]

                if action == "Try":
                    ps["tries"] += 1
                elif action == "Tackle":
                    ps["tackles_attempted"] += 1
                    if result == "Missed":
                        ps["tackles_missed"] += 1
                    elif result == "Turnover Won":
                        ps["turnovers_forced"] += 1
                elif action == "Carry":
                    ps["carries"] += 1
                    ps["carry_metres"] += safe_float(row[i_metres2])
                elif action == "Penalty Conceded":
                    ps["penalties_conceded"] += 1
                elif action == "Card":
                    atype = row[i_atype]
                    if atype == "Yellow Card":
                        ps["yellow_cards"] += 1
                    elif atype == "Red Card":
                        ps["red_cards"] += 1

            # --- キックイベント抽出 ---
            if action == "Kick" and player_name:
                kicks.append({
                    "match_id": fxid,
                    "date": ts["date"],
                    "season": row[i_season],
                    "round": row[i_round],
                    "team": team,
                    "opponent": row[i_opp],
                    "player": player_name,
                    "x": row[i_x], "y": row[i_y],
                    "x_end": row[i_xe], "y_end": row[i_ye],
                    "kick_type": row[i_atype],
                    "phase": row[i_q3],
                    "outcome": result,
                    "metres": row[i_metres2],
                })

    return team_matches, player_matches, kicks


def rate(numerator: int, denominator: int):
    return round(numerator / denominator, 4) if denominator else ""


def finalize_team_rows(team_matches: dict) -> list[dict]:
    conceded_by_match: dict[str, dict[str, int]] = defaultdict(dict)
    for (fxid, team), s in team_matches.items():
        conceded_by_match[fxid][team] = s["turnovers_conceded"]

    rows = []
    for (fxid, team), s in team_matches.items():
        turnovers_won = conceded_by_match[fxid].get(s["opponent"], 0)
        tackles_made = s["tackles_attempted"] - s["tackles_missed"]
        rows.append({
            "match_id": fxid, "date": s["date"], "season": s["season"], "round": s["round"],
            "team": team, "opponent": s["opponent"], "is_home": s["is_home"],
            "own_score": s["own_score"], "opp_score": s["opp_score"], "result": s["result"],
            "tries": s["tries"],
            "tackles_attempted": s["tackles_attempted"],
            "tackles_made": tackles_made,
            "tackle_success_rate": rate(tackles_made, s["tackles_attempted"]),
            "carries": s["carries"], "carry_metres": round(s["carry_metres"], 1),
            "lineout_throws": s["lineout_throws"], "lineout_won": s["lineout_won"],
            "lineout_success_rate": rate(s["lineout_won"], s["lineout_throws"]),
            "scrum_attempts": s["scrum_attempts"], "scrum_won": s["scrum_won"],
            "scrum_success_rate": rate(s["scrum_won"], s["scrum_attempts"]),
            "turnovers_conceded": s["turnovers_conceded"], "turnovers_won": turnovers_won,
            "penalties_conceded": s["penalties_conceded"],
            "yellow_cards": s["yellow_cards"], "red_cards": s["red_cards"],
            "possession_seconds": round(s["possession_seconds"], 1),
            "line_breaks": s["line_breaks"],
            "entries_22": s["entries_22"],
            "entries_22_tries": s["entries_22_tries"],
        })
    rows.sort(key=lambda r: (r["date"] or "", r["team"]))
    return rows


def finalize_player_rows(player_matches: dict) -> list[dict]:
    rows = []
    for (_fxid, _plid), s in player_matches.items():
        tackles_made = s["tackles_attempted"] - s["tackles_missed"]
        rows.append({
            "match_id": _fxid, "date": s["date"], "season": s["season"], "round": s["round"],
            "team": s["team"], "opponent": s["opponent"],
            "player": s["player"], "position": s["position"],
            "shirt_number": s["shirt_number"], "minutes_played": s["minutes_played"],
            "tries": s["tries"],
            "tackles_attempted": s["tackles_attempted"],
            "tackles_made": tackles_made,
            "tackle_success_rate": rate(tackles_made, s["tackles_attempted"]),
            "turnovers_forced": s["turnovers_forced"],
            "carries": s["carries"], "carry_metres": round(s["carry_metres"], 1),
            "penalties_conceded": s["penalties_conceded"],
            "yellow_cards": s["yellow_cards"], "red_cards": s["red_cards"],
        })
    rows.sort(key=lambda r: (r["date"] or "", r["team"], r["player"]))
    return rows


def write_csv(path: str, fieldnames: list[str], rows: list[dict]):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    args = parse_args()
    print(f"読み込み中: {args.input}")
    team_matches, player_matches, kicks = process(args.input, args.competition)

    team_rows = finalize_team_rows(team_matches)
    player_rows = finalize_player_rows(player_matches)
    kicks.sort(key=lambda r: (r["date"] or "", r["team"], r["player"]))

    os.makedirs(args.output_dir, exist_ok=True)
    team_path = os.path.join(args.output_dir, "match_team_summary.csv")
    player_path = os.path.join(args.output_dir, "match_player_summary.csv")
    kick_path = os.path.join(args.output_dir, "kick_events.csv")

    write_csv(team_path, TEAM_FIELDNAMES, team_rows)
    write_csv(player_path, PLAYER_FIELDNAMES, player_rows)
    write_csv(kick_path, KICK_FIELDNAMES, kicks)

    match_count = len({r["match_id"] for r in team_rows})
    print(f"完了:")
    print(f"  {team_path}: {len(team_rows)}行（{match_count}試合分）")
    print(f"  {player_path}: {len(player_rows)}行")
    print(f"  {kick_path}: {len(kicks)}行")


if __name__ == "__main__":
    main()
