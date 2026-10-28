#!/usr/bin/env bash
# shellcheck disable=SC2034

iso_name="zvonkiOS"
iso_label="ZVONKIOS_$(date --date="@${SOURCE_DATE_EPOCH:-$(date +%s)}" +%Y%m)"
iso_publisher="zvonkiOS <https://hoxs2.github.io/zvonkiOS-site/>"
iso_application="zvonkiOS live ISO"
iso_version="${ISO_VERSION:-$(date --date="@${SOURCE_DATE_EPOCH:-$(date +%s)}" +%Y.%m.%d)}"
install_dir="zvonkios"
bootmodes=('bios.syslinux'
           'uefi.systemd-boot')
pacman_conf="pacman.conf"
airootfs_image_type="squashfs"
airootfs_image_tool_options=('-comp' 'xz' '-Xbcj' 'x86' '-b' '1M' '-Xdict-size' '1M')
bootstrap_tarball_compression=('zstd' '-c' '-T0' '--auto-threads=logical' '--long' '-19')
kernel_params_aarch64="clk_ignore_unused pd_ignore_unused arm64.nopauth"
file_permissions=(
  ["/etc/shadow"]="0:0:400"
  ["/root"]="0:0:750"
  ["/root/.automated_script.sh"]="0:0:755"
  ["/root/.gnupg"]="0:0:700"
  ["/usr/local/bin/choose-mirror"]="0:0:755"
  ["/usr/local/bin/zvonk"]="0:0:755"
  ["/usr/local/bin/zvonkiOS-welcome"]="0:0:755"
  ["/usr/local/bin/zvonkiOS-brand"]="0:0:755"
  ["/usr/local/bin/zvonkios-live-user"]="0:0:755"
  ["/usr/local/bin/zvonkios-final"]="0:0:755"
  ["/usr/local/bin/zvonkios-de-xfce"]="0:0:755"
  ["/usr/local/bin/zvonkios-de-hyprland"]="0:0:755"
  ["/usr/local/bin/zvonkios-plasma-look"]="0:0:755"
  ["/usr/local/bin/zvonkios-xfce-look"]="0:0:755"
  ["/usr/local/bin/zvonkios-installer"]="0:0:755"
  ["/usr/local/bin/zvonkios-sddm-greeter"]="0:0:755"
  ["/usr/share/zvonkios/install-zvonkios.desktop"]="0:0:755"
  ["/usr/local/bin/Installation_guide"]="0:0:755"
  ["/usr/local/bin/livecd-sound"]="0:0:755"
)
