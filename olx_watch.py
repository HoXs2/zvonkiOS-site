#!/usr/bin/env python3
"""
OLX deal watcher — ищет объявления и подсвечивает те, что заметно дешевле медианы.

Только stdlib, без зависимостей. Публичный JSON API OLX, вежливые паузы между страницами.

Примеры:
    python3 olx_watch.py --query "rtx 3060" --max-price 25000
    python3 olx_watch.py --config config.json
    python3 olx_watch.py --config config.json --new-only --tg
    python3 olx_watch.py --query "playstation 5" --json
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shutil
import sqlite3
import statistics
import subprocess
import sys
import time
import urllib.parse
import urllib.request

UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
SITES = ("ua", "kz", "pl", "ro", "uz", "bg", "pt")
PAGE_LIMIT = 40

# ---------------------------------------------------------------- network


def api_get(site: str, params: dict, retries: int = 3) -> dict:
    url = f"https://www.olx.{site}/api/v1/offers/?" + urllib.parse.urlencode(params)
    last: Exception | None = None
    for attempt in range(retries):
        try:
            # OLX режет TLS-отпечаток Python, а curl проходит — используем его, если есть
            if CURL:
                return _curl_json(url)
            return _urllib_json(url)
        except Exception as exc:  # noqa: BLE001 - сеть бывает любой
            last = exc
            if attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"OLX API не ответил: {last}")


CURL = shutil.which("curl")


def _curl_json(url: str) -> dict:
    proc = subprocess.run(
        [
            CURL, "-sS", "--compressed", "--max-time", "25",
            "-A", UA,
            "-H", "Accept: application/json",
            "-H", "Accept-Language: uk,ru;q=0.9,en;q=0.8",
            url,
        ],
        capture_output=True,
        text=True,
        timeout=40,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or f"curl exit {proc.returncode}")
    if not proc.stdout.strip():
        raise RuntimeError("пустой ответ")
    return json.loads(proc.stdout)


def _urllib_json(url: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "application/json",
            "Accept-Language": "uk,ru;q=0.9,en;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        return json.load(resp)


# ---------------------------------------------------------------- parsing


def _price(offer: dict) -> tuple[int | None, str | None, bool]:
    for p in offer.get("params") or []:
        if p.get("key") == "price":
            val = p.get("value") or {}
            if isinstance(val, dict):
                return val.get("value"), val.get("currency"), bool(val.get("negotiable"))
    return None, None, False


def parse_offer(o: dict) -> dict:
    price, currency, negotiable = _price(o)
    params = {p.get("key"): p.get("value") for p in o.get("params") or []}
    state = (params.get("state") or {}).get("key") if isinstance(params.get("state"), dict) else None
    loc = o.get("location") or {}
    city = (loc.get("city") or {}).get("name")
    region = (loc.get("region") or {}).get("name")
    photos = o.get("photos") or []
    photo_count = len(photos) if isinstance(photos, (list, tuple)) else photos if isinstance(photos, int) else 0
    return {
        "id": o.get("id"),
        "title": (o.get("title") or "").strip(),
        "description": (o.get("description") or "").strip(),
        "price": price,
        "currency": currency,
        "negotiable": negotiable,
        "state": state,
        "city": city,
        "region": region,
        "url": o.get("url"),
        "created": o.get("created_time"),
        "updated": o.get("pushup_time") or o.get("last_refresh_time"),
        "photos": photo_count,
        "seller": (o.get("user") or {}).get("name"),
        "business": bool(o.get("business")),
        "promoted": bool((o.get("promotion") or {}).get("top_ad")),
    }


def search(site: str, query: str, pages: int, pause: float, category_id: int | None = None) -> list[dict]:
    items: list[dict] = []
    for page in range(pages):
        params = {
            "query": query,
            "limit": PAGE_LIMIT,
            "offset": page * PAGE_LIMIT,
            "sort_by": "created_at:desc",
        }
        if category_id:
            params["category_id"] = category_id
        payload = api_get(site, params)
        batch = payload.get("data") or []
        if not batch:
            break
        items.extend(parse_offer(o) for o in batch)
        if not (payload.get("links") or {}).get("next"):
            break
        time.sleep(pause)
    return items


# ---------------------------------------------------------------- filtering

WORD_RE = re.compile(r"[a-zа-яёіїєґ0-9]+", re.IGNORECASE)
STOP_TOKENS = {"для", "and", "the", "with", "на", "по", "в", "у", "и", "or", "с", "до"}


def normalize(text: str) -> str:
    return " ".join(WORD_RE.findall(text.lower()))


def query_tokens(query: str) -> list[str]:
    return [t for t in WORD_RE.findall(query.lower()) if t not in STOP_TOKENS and (len(t) >= 2 or t.isdigit())]


def _has_token(text: str, token: str) -> bool:
    if token.isdigit():
        # «3060» не должно находиться внутри «130600», но должно в «rtx3060»
        return re.search(rf"(?<!\d){re.escape(token)}(?!\d)", text) is not None
    return token in text


def relevant(item: dict, tokens: list[str], mode: str, title_only: bool) -> bool:
    """OLX ищет «мягко», поэтому сами требуем, чтобы в тексте были слова запроса."""
    if not tokens or mode == "off":
        return True
    text = normalize(item["title"] if title_only else f"{item['title']} {item['description']}")
    hits = [_has_token(text, t) for t in tokens]
    return all(hits) if mode == "all" else any(hits)


def _hit(text: str, tokens: list[str]) -> bool:
    """Стоп-слова: короткие ищем по границе слова, чтобы «дом» не ловил «дисководом»."""
    for token in tokens:
        key = token.lower().strip()
        if not key:
            continue
        if len(key) <= 4 and " " not in key:
            if re.search(rf"\b{re.escape(key)}\b", text):
                return True
        elif key in text:
            return True
    return False


def matches(item: dict, must: list[str], exclude: list[str], lo, hi) -> bool:
    title = item["title"].lower()
    text = f"{title} {item['description']}".lower()
    # обязательные слова ищем только в заголовке — в описании их пихают все подряд
    if must and not _hit(title, must):
        return False
    if _hit(text, exclude):
        return False
    price = item["price"]
    if price is not None:
        if lo is not None and price < lo:
            return False
        if hi is not None and price > hi:
            return False
    elif lo or hi:
        return False
    return True


BUCKET_PATTERNS = {
    "аксессуар": r"блок\s?живлен|блок\s?питани|зарядн|кабель|пульт|адаптер|джойстик|геймпад|переходник|кріпленн|чохол|корпус",
    "видеокарта": r"відеокарт|видеокарт|\bgpu\b|graphics",
    "ноутбук": r"ноутбук|laptop|ноут\b|macbook|макбук|katana|nitro|legion|ideapad|pavilion|aspire|inspiron|\bxps\b|\bomen\b|victus|thinkpad|probook|zenbook|vivobook|\brog\b|\btuf\b|gf\d{2}",
    "планшет": r"\bipad\b|айпад|планшет",
    "телефон": r"iphone|айфон|смартфон|\bтелефон",
    "консоль": r"playstation|\bps[45]\b|xbox|nintendo|\bswitch\b|консол",
    "тв-бокс": r"тв.?приставк|tv.?приставк|tv.?box|тв.?бокс|x96|tanix|h96|mx10|h313",
    "пк": r"системн|комп.?ютер|\bпк\b|\bpc\b|desktop|десктоп",
    "тв": r"телевізор|телевизор|smart.?tv|\boled\b|\bqled\b",
}

GPU_MODEL_RE = re.compile(r"\b(?:rtx|gtx|rx)\s?-?\s?\d{3,4}\s?(?:ti|super|xt|xtx)?\b")
CPU_MODEL_RE = re.compile(r"\b(?:i[3579]|ryzen\s?[3579])\s?-?\s?\d{4,5}\w*\b")


def bucket_of(item: dict) -> str:
    """Грубая категория по заголовку: видеокарту нельзя сравнивать с целым ПК."""
    text = item["title"].lower()
    for name, pattern in BUCKET_PATTERNS.items():
        if re.search(pattern, text):
            return name
    # голая видеокарта без слова «відеокарта»: «RTX 3060 12GB»
    if GPU_MODEL_RE.search(text):
        return "пк" if CPU_MODEL_RE.search(text) else "видеокарта"
    return "другое"


MODEL_PATTERNS = [
    r"\b(?:rtx|gtx|rx)\s?-?\s?\d{3,4}\s?(?:ti|super|xt|xtx)?\b",  # видеокарты
    r"\b(?:nintendo\s?)?switch\s?2\b|\b(?:nintendo\s?)?switch\s?lite\b|\b(?:nintendo\s?)?switch\s?oled\b|\bnintendo switch\b|\bswitch\b",
    r"\b(?:ps\s?5\s?(?:pro|slim)?|playstation\s?5\s?(?:pro|slim)?)\b",
    r"\b(?:ps\s?4\s?(?:pro|slim)?|playstation\s?4\s?(?:pro|slim)?)\b",
    r"\bxbox\s?(?:series\s?[xs]|one\s?[xs]|360)\b",
    r"\b(?:i[3579]|ryzen\s?[3579])\s?-?\s?\d{4,5}\w*\b",  # процессоры
    r"\b(?:iphone|ipad|macbook|galaxy)\s?[a-z]?\d+\w*\b",  # apple/samsung
]


def model_of(item: dict) -> str | None:
    text = f"{item['title']}".lower()
    for pattern in MODEL_PATTERNS:
        found = re.search(pattern, text)
        if found:
            return re.sub(r"\s+", " ", found.group(0)).strip()
    return None


def score(
    items: list[dict], threshold: float, min_ratio: float, min_peers: int = 2
) -> list[dict]:
    """Сравниваем цену с медианой: сначала модель внутри категории, потом категория."""
    buckets: dict[str, list[int]] = {}
    pairs: dict[tuple[str, str | None], list[int]] = {}
    for item in items:
        item["bucket"] = bucket_of(item)
        item["model"] = model_of(item)
        if item["price"] and item["price"] > 0:
            buckets.setdefault(item["bucket"], []).append(item["price"])
            pairs.setdefault((item["bucket"], item["model"]), []).append(item["price"])

    global_median = (
        statistics.median([p for group in buckets.values() for p in group]) if buckets else None
    )
    bucket_medians = {
        name: statistics.median(prices)
        for name, prices in buckets.items()
        if len(prices) >= 2 and name != "другое"
    }
    pair_medians = {
        key: statistics.median(prices) for key, prices in pairs.items() if len(prices) >= min_peers
    }

    for item in items:
        specific = pair_medians.get((item["bucket"], item["model"])) if item["model"] else None
        median = specific or bucket_medians.get(item["bucket"]) or global_median
        item["median"] = median
        item["confident"] = specific is not None
        item["ratio"] = None
        item["discount"] = None
        item["hot"] = False
        item["suspicious"] = False
        if median and item["price"]:
            ratio = item["price"] / median
            item["ratio"] = round(ratio, 3)
            item["discount"] = round((1 - ratio) * 100, 1)
            # «сделка» только если есть с чем сравнивать: 2+ объявления той же модели
            if item["confident"]:
                if ratio < min_ratio:
                    item["suspicious"] = True  # похоже на разводку/запчасть
                elif ratio <= threshold:
                    item["hot"] = True
    return items


# ---------------------------------------------------------------- storage


def db_connect(path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS seen ("
        " id INTEGER PRIMARY KEY,"
        " query TEXT,"
        " first_seen TEXT NOT NULL)"
    )
    conn.commit()
    return conn


def mark_seen(conn: sqlite3.Connection, query: str, items: list[dict]) -> None:
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    for item in items:
        cur = conn.execute("SELECT 1 FROM seen WHERE id = ?", (item["id"],))
        item["is_new"] = cur.fetchone() is None
        if item["is_new"]:
            conn.execute(
                "INSERT OR IGNORE INTO seen (id, query, first_seen) VALUES (?, ?, ?)",
                (item["id"], query, now),
            )
    conn.commit()


# ---------------------------------------------------------------- output


def fmt_age(iso: str | None) -> str:
    if not iso:
        return "?"
    try:
        then = dt.datetime.fromisoformat(iso)
    except ValueError:
        return "?"
    delta = dt.datetime.now(dt.timezone.utc) - then
    mins = int(delta.total_seconds() // 60)
    if mins < 60:
        return f"{mins}м"
    hours = mins // 60
    if hours < 24:
        return f"{hours}ч"
    return f"{hours // 24}д"


def fmt_price(item: dict) -> str:
    if not item["price"]:
        return "—"
    sym = {"UAH": "грн", "KZT": "тг", "PLN": "zł", "RON": "lei", "UZS": "сум", "EUR": "€"}.get(
        item["currency"] or "", item["currency"] or ""
    )
    return f"{item['price']:,}".replace(",", " ") + f" {sym}"


def print_table(items: list[dict], show_all: bool, empty_msg: str | None = None) -> None:
    shown = items if show_all else [i for i in items if i["hot"] or i["suspicious"]]
    if not shown:
        print(empty_msg or "  ничего интересного (все по рынку или дороже)")
        return
    shown.sort(key=lambda i: (not i["hot"], i["ratio"] if i["ratio"] is not None else 9))
    for it in shown:
        if it["suspicious"]:
            mark = "⚠️ "
        elif it["hot"]:
            mark = "🔥 "
        else:
            mark = "   "
        new = "NEW " if it.get("is_new") else ""
        if it["discount"] is None:
            disc = "   ?"
        else:
            sign = "-" if it["discount"] > 0 else "+"
            disc = f"{sign}{abs(it['discount']):.0f}%"
        med = f"мед.{it['median']:,.0f}".replace(",", " ") if it["median"] else "мед.—"
        print(
            f"{mark}{new}{fmt_price(it):>12}  {disc:>5}  {med:>11}  "
            f"{fmt_age(it['updated']):>3}  {(it['city'] or '?')[:14]:<14}  "
            f"{it['title'][:58]}"
        )
        tag = it.get("model") or it.get("bucket") or ""
        print(f"    [{tag}] {it['url']}")


def tg_send(text: str, token: str, chat_id: str) -> bool:
    data = urllib.parse.urlencode(
        {"chat_id": chat_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": "true"}
    ).encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage", data=data)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            resp.read()
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"  telegram: ошибка — {exc}", file=sys.stderr)
        return False


def tg_find_chats(token: str) -> dict[int, str]:
    """Находит chat_id по последним сообщениям боту: напиши ему /start, потом запусти."""
    url = f"https://api.telegram.org/bot{token}/getUpdates"
    with urllib.request.urlopen(url, timeout=20) as resp:
        data = json.load(resp)
    chats: dict[int, str] = {}
    for upd in data.get("result", []):
        msg = upd.get("message") or upd.get("edited_message") or upd.get("channel_post") or {}
        chat = msg.get("chat") or {}
        if chat.get("id"):
            chats[chat["id"]] = (
                chat.get("title") or chat.get("username") or chat.get("first_name") or "?"
            )
    return chats


def send_telegram(items: list[dict], token: str, chat_id: str) -> None:
    # новые объявления важнее старых, поэтому если их больше лимита — режем старые
    hot = [i for i in items if i["hot"]]
    if not hot:
        return
    hot.sort(key=lambda i: (not i.get("is_new"), i["ratio"] if i["ratio"] is not None else 9))
    lines = ["🔥 <b>OLX: похоже на хорошую цену</b>", ""]
    for it in hot[:15]:
        disc = f"-{it['discount']:.0f}%"
        lines.append(f"<b>{it['title'][:70]}</b>")
        lines.append(f"{fmt_price(it)} ({disc}) · {it['city'] or '?'}")
        lines.append(it["url"] or "")
        lines.append("")
    if len(hot) > 15:
        lines.append(f"…и ещё {len(hot) - 15}")
    if tg_send("\n".join(lines), token, chat_id):
        print(f"  telegram: отправлено {min(len(hot), 15)} шт.")


# ---------------------------------------------------------------- main


def run_one(site: str, spec: dict, args, conn: sqlite3.Connection) -> list[dict]:
    query = spec["query"]
    pages = spec.get("pages", args.pages)
    items = search(site, query, pages, args.pause, spec.get("category_id"))

    # OLX ищет «мягко» и подмешивает похожее — отсекаем нерелевантное сами.
    # По умолчанию смотрим только заголовок: продавцы спамят моделями в описании.
    mode = spec.get("match", args.match)
    title_only = not spec.get("desc", args.desc)
    tokens = query_tokens(query)
    total = len(items)
    items = [i for i in items if relevant(i, tokens, mode, title_only)]
    dropped = total - len(items)

    items = [
        i
        for i in items
        if matches(
            i,
            spec.get("must") or args.must,
            spec.get("exclude") or args.exclude,
            spec.get("min_price", args.min_price),
            spec.get("max_price", args.max_price),
        )
    ]
    # отсев древнего железа: «GTX 460 за 1 850» — не сделка, а музей
    require = spec.get("require")
    if require:
        items = [i for i in items if re.search(require, i["title"], re.IGNORECASE)]

    # один и тот же id может прийти дважды при пагинации
    uniq = {i["id"]: i for i in items if i["id"]}
    items = list(uniq.values())
    score(
        items,
        spec.get("threshold", args.threshold),
        spec.get("min_ratio", args.min_ratio),
        spec.get("min_peers", args.min_peers),
    )
    mark_seen(conn, query, items)
    found = len(items)
    new_items = [i for i in items if i.get("is_new")]

    # --repeat показывает всё, даже то, что уже было в базе
    if args.new_only and not args.repeat:
        items = new_items

    new_note = f"  новых: {len(new_items)}" if args.new_only or new_items else ""
    print(f"\n=== {spec.get('name') or query}  ({site})  найдено: {found}{new_note}")
    if dropped:
        print(f"    отсеяно нерелевантных: {dropped} (режим {mode}, {'только заголовок' if title_only else 'заголовок+описание'})")
    prices = [i["price"] for i in items if i["price"]]
    if prices:
        print(f"    медиана: {statistics.median(prices):,.0f}".replace(",", " "))
    else:
        print("    медиана: —")

    empty_msg = None
    if args.new_only and not args.repeat and found and not new_items:
        empty_msg = "  новых нет — всё уже видели (--repeat чтобы показать всё)"
    print_table(items, show_all=args.all, empty_msg=empty_msg)
    return items


def main() -> int:
    ap = argparse.ArgumentParser(description="OLX deal watcher")
    ap.add_argument("--site", choices=SITES, default="ua")
    ap.add_argument("--query", action="append", default=[])
    ap.add_argument("--config")
    ap.add_argument("--pages", type=int, default=1, help="страниц по 40 объявлений")
    ap.add_argument("--pause", type=float, default=0.8, help="пауза между страницами, сек")
    ap.add_argument("--min-price", type=float, default=None)
    ap.add_argument("--max-price", type=float, default=None)
    ap.add_argument("--must", action="append", default=[], help="обязательные слова")
    ap.add_argument("--exclude", action="append", default=[], help="стоп-слова")
    ap.add_argument("--threshold", type=float, default=0.75, help="доля от медианы = сделка")
    ap.add_argument("--min-ratio", type=float, default=0.15, help="ниже — подозрительно")
    ap.add_argument(
        "--min-peers",
        type=int,
        default=2,
        help="сколько объявлений той же модели нужно, чтобы верить в «сделку»",
    )
    ap.add_argument(
        "--match",
        choices=("all", "any", "off"),
        default="all",
        help="релевантность: all — все слова запроса, any — хотя бы одно, off — не фильтровать",
    )
    ap.add_argument(
        "--desc",
        action="store_true",
        help="искать слова запроса ещё и в описании (больше находок, но и мусора в разы больше)",
    )
    ap.add_argument("--tg-test", action="store_true", help="отправить тестовое сообщение и выйти")
    ap.add_argument("--tg-whoami", action="store_true", help="найти chat_id по сообщениям боту")
    ap.add_argument("--all", action="store_true", help="показывать всё, не только сделки")
    ap.add_argument("--new-only", action="store_true", help="только то, чего не было в базе")
    ap.add_argument(
        "--repeat",
        action="store_true",
        help="показать всё, включая уже виденное (перебивает --new-only)",
    )
    ap.add_argument("--db", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "seen.db"))
    ap.add_argument("--json", action="store_true", help="вывод в JSON")
    ap.add_argument("--tg", action="store_true", help="отправить находки в Telegram")
    args = ap.parse_args()

    token, chat = os.environ.get("TELEGRAM_BOT_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")

    if args.tg_whoami:
        if not token:
            print("нужен TELEGRAM_BOT_TOKEN", file=sys.stderr)
            return 2
        try:
            chats = tg_find_chats(token)
        except Exception as exc:  # noqa: BLE001
            print(f"не смог получить updates: {exc}", file=sys.stderr)
            return 1
        if not chats:
            print("пусто: напиши боту /start в Telegram и запусти снова")
            return 1
        for cid, title in chats.items():
            print(f"chat_id={cid}  ({title})")
        return 0

    if args.tg_test:
        if not (token and chat):
            print("нет TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID в окружении", file=sys.stderr)
            return 2
        ok = tg_send(
            "✅ <b>OLX watcher на связи</b>\nЕсли видишь это — бот настроен правильно.",
            token,
            chat,
        )
        print("тест отправлен" if ok else "тест не ушёл, смотри ошибку выше")
        return 0 if ok else 1

    specs: list[dict] = []
    if args.config:
        with open(args.config, encoding="utf-8") as fh:
            cfg = json.load(fh)
        args.site = cfg.get("site", args.site)
        specs = cfg.get("searches", [])
    specs += [{"name": q, "query": q} for q in args.query]
    if not specs:
        ap.error("нужен --query или --config")

    conn = db_connect(args.db)
    everything: list[dict] = []
    for spec in specs:
        everything += run_one(args.site, spec, args, conn)

    if args.json:
        print(json.dumps(everything, ensure_ascii=False, indent=2))
    if args.tg:
        if token and chat:
            # --repeat нужен, чтобы посмотреть базу, а не заново заспамить старыми находками
            to_send = [i for i in everything if i.get("is_new")] if args.repeat else everything
            send_telegram(to_send, token, chat)
        else:
            print("  telegram: нет TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
