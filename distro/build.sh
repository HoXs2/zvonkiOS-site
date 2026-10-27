#!/usr/bin/env bash
# Сборка ISO ZвонкиОС. Требует root (mkarchiso монтирует и делает chroot).
set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

OUT_DIR="${OUT_DIR:-out}"
WORK_DIR="${WORK_DIR:-work}"

if (( EUID != 0 )); then
  echo "нужен root: sudo $0" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
rm -rf "$WORK_DIR"

mkarchiso -v -w "$WORK_DIR" -o "$OUT_DIR" profile

(
  cd "$OUT_DIR"
  sha256sum ./*.iso > sha256sums.txt
)

echo
echo "готово:"
ls -lh "$OUT_DIR"/*.iso
cat "$OUT_DIR/sha256sums.txt"
