# ZвонкиОС сайт

Сайт для рофлового дистро ZвонкиОС на Arch-основе.

## Локальный запуск

```bash
cd website
npm install
npm run dev
```

Откроется на http://localhost:3000

## Билд

```bash
cd website
npm run build
```

Статика будет в `website/out/`

## Деплой на GitHub Pages

1. Создай репозиторий на GitHub
2. Запушь этот проект целиком
3. Заходи в Settings > Pages
4. Source: GitHub Actions
5. При пуше в `main` автоматом задеплоится
