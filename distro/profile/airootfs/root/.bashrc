# ~/.bashrc — ZвонкиОС
# звонки не отменяются

[[ $- != *i* ]] && return

HISTCONTROL=ignoreboth
HISTSIZE=10000
HISTFILESIZE=20000
shopt -s histappend checkwinsize

PS1='\[\e[1;32m\][\u@\h \W]\[\e[0m\]\$ '

alias ls='ls --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'
alias ff='fastfetch'
alias zv='zvonk'

if shopt -q login_shell && [[ -z ${ZVONKIOS_BANNER:-} ]]; then
  export ZVONKIOS_BANNER=1
  command -v zvonkiOS-welcome >/dev/null && zvonkiOS-welcome
fi
