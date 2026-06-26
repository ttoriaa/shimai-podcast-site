#!/usr/bin/env python3
"""RSS parser for 时髦小姨 Podcast (Python version).

Generates episodes.json from RSS source, compatible with existing site data shape.
"""

from __future__ import annotations

import argparse
import html
import json
import pathlib
import re
import sys
import urllib.request
from datetime import datetime
from email.utils import parsedate_to_datetime

RSS_URL = "https://feed.xyzfm.space/udvfuub6rpkp"
OUTPUT_FILE = "episodes.json"
CATEGORY_RULES_FILE = "category-rules.json"


def decode_html_entities(text: str) -> str:
    text = re.sub(r"<[^>]*>", "", str(text or ""))
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_text(text: str) -> str:
    text = str(text or "").lower()
    return re.sub(r"[\s\-_.|｜,:;!?()\[\]{}'\"“”‘’、，。！？：；·]+", "", text)


def get_default_category_rules() -> dict:
    return {
        "defaultCategory": "个人成长|碎碎念",
        "rules": [
            {
                "category": "何以丰荣|城市切片",
                "keywords": [
                    "何以丰荣",
                    "城市",
                    "北京",
                    "巴黎",
                    "罗马",
                    "成都",
                    "重庆",
                    "巴厘岛",
                    "夏威夷",
                    "德国",
                    "意大利",
                    "伯克利",
                    "车展",
                    "北影节",
                ],
            },
            {
                "category": "对谈Talk",
                "keywords": ["对谈", "访谈", "聊天", "talk", "学术对谈", "大谈特谈", "x "],
            },
            {
                "category": "个人成长|碎碎念",
                "keywords": [
                    "人生",
                    "世界观",
                    "存在主义",
                    "社会时钟",
                    "亲密关系",
                    "高敏感",
                    "秩序",
                    "熵增",
                    "自驱力",
                    "职场",
                    "fomo",
                    "无聊",
                    "自由",
                    "焦虑",
                    "成长",
                ],
            },
        ],
    }


def load_category_rules(cwd: pathlib.Path) -> dict:
    default_rules = get_default_category_rules()
    file_path = cwd / CATEGORY_RULES_FILE

    if not file_path.exists():
        file_path.write_text(json.dumps(default_rules, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"[warn] {CATEGORY_RULES_FILE} not found, created default file")
        return default_rules

    try:
        parsed = json.loads(file_path.read_text(encoding="utf-8"))
        if not isinstance(parsed, dict) or not isinstance(parsed.get("rules"), list):
            raise ValueError("rules missing or not array")
        return parsed
    except Exception as e:
        print(f"[warn] failed to read {CATEGORY_RULES_FILE}, using defaults: {e}")
        return default_rules


def classify_by_title(title: str, category_config: dict) -> str:
    normalized_title = normalize_text(title)
    rules = category_config.get("rules", []) if isinstance(category_config, dict) else []

    for rule in rules:
        category = rule.get("category") if isinstance(rule, dict) else None
        keywords = rule.get("keywords") if isinstance(rule, dict) else []
        if not category or not isinstance(keywords, list):
            continue

        for kw in keywords:
            normalized_kw = normalize_text(kw)
            if normalized_kw and normalized_kw in normalized_title:
                return category

    return category_config.get("defaultCategory", "个人成长|碎碎念")


def parse_xml(xml_text: str, category_config: dict) -> list[dict]:
    episodes: list[dict] = []

    item_regex = re.compile(r"<item>([\s\S]*?)</item>", re.IGNORECASE)
    for item_content in item_regex.findall(xml_text):
        title_match = re.search(r"<title>([\s\S]*?)</title>", item_content, re.IGNORECASE)
        desc_match = re.search(r"<description><!\[CDATA\[([\s\S]*?)\]\]></description>", item_content, re.IGNORECASE)
        guid_match = re.search(r"<guid[^>]*>(.*?)</guid>", item_content, re.IGNORECASE)
        pubdate_match = re.search(r"<pubDate>([\s\S]*?)</pubDate>", item_content, re.IGNORECASE)
        duration_match = re.search(r"<itunes:duration>([\s\S]*?)</itunes:duration>", item_content, re.IGNORECASE)
        enclosure_match = re.search(r"<enclosure\s+url=\"([^\"]*)\"", item_content, re.IGNORECASE)

        if not (title_match and enclosure_match):
            continue

        title = decode_html_entities(title_match.group(1))
        url = enclosure_match.group(1)
        if "media.xyzcdn.net" in url:
            media_idx = url.index("media.xyzcdn.net")
            url = "https://" + url[media_idx:]

        guid = guid_match.group(1).strip() if guid_match else ""
        pub_date = pubdate_match.group(1).strip() if pubdate_match else ""
        duration = duration_match.group(1).strip() if duration_match else "00:00:00"

        description = ""
        if desc_match:
            description = decode_html_entities(desc_match.group(1))[:150].strip()

        date_iso = ""
        if pub_date:
            try:
                dt = parsedate_to_datetime(pub_date)
                date_iso = dt.date().isoformat()
            except Exception:
                date_iso = ""

        episodes.append(
            {
                "id": len(episodes),
                "guid": guid,
                "title": title,
                "description": description,
                "duration": duration,
                "date": date_iso,
                "audio": url,
                "category": classify_by_title(title, category_config),
            }
        )

    return episodes


def fetch_rss(rss_url: str) -> str:
    req = urllib.request.Request(rss_url, method="GET")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def main() -> int:
    parser = argparse.ArgumentParser(description="Parse podcast RSS to episodes.json")
    parser.add_argument("--rss-url", default=RSS_URL)
    parser.add_argument("--output", default=OUTPUT_FILE)
    args = parser.parse_args()

    cwd = pathlib.Path.cwd()
    output = cwd / args.output

    try:
        print("Fetching RSS feed...")
        category_config = load_category_rules(cwd)
        xml_text = fetch_rss(args.rss_url)
        episodes = parse_xml(xml_text, category_config)

        if not episodes:
            print("No episodes parsed from RSS", file=sys.stderr)
            return 1

        output.write_text(json.dumps(episodes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        print(f"Parsed and saved {len(episodes)} episodes to {args.output}")
        print(f"Category rules: {CATEGORY_RULES_FILE} ({len(category_config.get('rules', []))} groups)")

        for ep in episodes[:3]:
            audio = (ep.get("audio") or "")
            print(f" - [{ep.get('category','')}] {ep.get('title','')}")
            print(f"   URL: {audio[:80]}...")

        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
