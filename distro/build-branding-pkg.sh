#!/usr/bin/env bash
# Собирает пакет zvonkios-branding из файлов профиля — без makepkg и fakeroot.
# Пакет кладётся в out/ и внутрь профиля, чтобы live-система могла забрендировать
# установленный Arch командой: zvonkiOS-brand /mnt
set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

PROFILE="${PROFILE:-profile}"
PKGNAME="zvonkios-branding"
PKGVER="${PKGVER:-1.0.0-1}"
OUT_DIR="${OUT_DIR:-out}"
AIIROOTFS="$PROFILE/airootfs"
PKG_DEST="$AIIROOTFS/usr/share/zvonkios"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

root="$STAGE/root"

stage() { # stage <path-в-airootfs> <mode>
  install -Dm"$2" "$AIIROOTFS/$1" "$root/$1"
}

stage "etc/os-release" 644
stage "etc/issue" 644
stage "etc/motd" 644
stage "etc/skel/.bashrc" 644
stage "etc/fastfetch/config.jsonc" 644
stage "usr/share/zvonkios/logo.txt" 644
stage "usr/local/bin/zvonk" 755
stage "usr/local/bin/zvonkiOS-welcome" 755

size="$(find "$root" -type f -printf '%s\n' | awk '{s+=$1} END {print s+0}')"

cat >"$root/.PKGINFO" <<EOF
pkgname = ${PKGNAME}
pkgbase = ${PKGNAME}
pkgver = ${PKGVER}
pkgdesc = ZvonkiOS branding: os-release, motd, fastfetch logo, zvonk
url = https://hoxs2.github.io/zvonkiOS-site/
builddate = $(date +%s)
packager = zvonkiOS <https://hoxs2.github.io/zvonkiOS-site/>
size = ${size}
arch = any
optdepend = fastfetch: показывать логотип ZвонкиОС в терминале
EOF

pkgfile="${PKGNAME}-${PKGVER}-any.pkg.tar.zst"

(
  cd "$root"
  bsdtar -czf .MTREE --format=mtree \
    --options='!all,use-set,type,uid,gid,mode,time,size,md5,sha256,link' \
    .PKGINFO etc usr
  bsdtar -cf - .PKGINFO .MTREE etc usr | zstd -q -c -T0 -19 >"$STAGE/$pkgfile"
)

mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR/${PKGNAME}-"*.pkg.tar.zst
cp -f "$STAGE/$pkgfile" "$OUT_DIR/$pkgfile"

mkdir -p "$PKG_DEST"
rm -f "$PKG_DEST/${PKGNAME}-"*.pkg.tar.zst
cp -f "$OUT_DIR/$pkgfile" "$PKG_DEST/$pkgfile"

echo "пакет: $OUT_DIR/$pkgfile"
echo "в live-системе: /usr/share/zvonkios/$pkgfile"
