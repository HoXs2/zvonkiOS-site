#!/usr/bin/env python3
"""Ждёт первое сообщение боту, записывает chat_id в .env и шлёт тестовое сообщение."""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = os.path.join(HERE, ".env")
WAIT_SECONDS = int(os.environ.get("TG_WAIT", "600"))


def load_env() -> dict[str, str]:
    data = {}
    with open(ENV, encoding="utf-8") as fh:
        for line in fh:
            m = re.match(r'([A-Z_]+)="?(.*?)"?$', line.strip())
            if m:
                data[m.group(1)] = m.group(2)
    return data


def api(token: str, method: str, **params) -> dict:
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = urllib.parse.urlencode(params).encode() if params else None
    with urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=20) as r:
        return json.load(r)


def main() -> int:
    env = load_env()
    token = env.get("TELEGRAM_BOT_TOKEN")
    if not token:
        print("нет TELEGRAM_BOT_TOKEN в .env", file=sys.stderr)
        return 2

    deadline = time.time() + WAIT_SECONDS
    offset = 0
    while time.time() < deadline:
        try:
            data = api(token, "getUpdates", offset=offset, timeout=5)
        except Exception as exc:  # noqa: BLE001
            print("ошибка getUpdates:", exc, file=sys.stderr)
            time.sleep(3)
            continue
        for upd in data.get("result", []):
            offset = max(offset, upd.get("update_id", 0) + 1)
            msg = upd.get("message") or upd.get("edited_message") or {}
            chat = msg.get("chat") or {}
            if not chat.get("id"):
                continue
            chat_id = str(chat["id"])
            who = chat.get("username") or chat.get("first_name") or chat.get("title") or "?"
            with open(ENV, encoding="utf-8") as fh:
                text = fh.read()
            text = re.sub(r'TELEGRAM_CHAT_ID="?[^"\n]*"?', f'TELEGRAM_CHAT_ID="{chat_id}"', text)
            with open(ENV, "w", encoding="utf-8") as fh:
                fh.write(text)
            os.chmod(ENV, 0o600)
            api(
                token,
                "sendMessage",
                chat_id=chat_id,
                text="✅ <b>OLX watcher на связи</b>\nТеперь сюда будут падать находки.",
                parse_mode="HTML",
            )
            print(f"chat_id={chat_id} ({who}) — записан в .env, тест отправлен")
            return 0
        time.sleep(2)
    print("не дождался сообщения боту за отведённое время", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
