# Портфолио Владислава Бредихина

Одностраничное портфолио веб-разработчика. Чистые HTML, CSS и JavaScript, без сборки.

- Первый экран: страницы проектов собираются из блоков над сеткой и разлетаются, в цикле (three.js).
- Работы: 3D-модели MacBook и iPhone, на экранах настоящие страницы и записи приложений: Villa Jaconda, MomentumX, Avtotime, Контур права, Aura Scanner.
- Линия процесса, которая рисуется при прокрутке, счётчик кофе, контакты плитками (почта и телефон не лежат в коде открытым текстом).
- Без WebGL и при настройке «уменьшить движение» страница показывает статичные скриншоты.

## Запуск

Откройте `index.html` через любой статический сервер, например:

```bash
python3 -m http.server 8000
```

Сайт публикуется на Cloudflare Workers: сборка `node scripts/prepare-dist.js` складывает файлы в `dist/`, `wrangler.jsonc` отдаёт их как статику.

## Структура

```
index.html     вся разметка, стили и скрипты
img/           скриншоты и текстуры экранов
media/         записи экранов приложений (mp4 и webm)
models/        3D-модели в формате glTF (JSON) и их текстуры
resume/        резюме на русском и английском, HTML и PDF
scripts/       сборка для Cloudflare
```

## Сторонние материалы

- [three.js](https://threejs.org) r128, лицензия MIT, подключается с CDN.
- iPhone 15 Pro Max от [polyman](https://sketchfab.com/Polyman_3D), лицензия [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Модель уменьшена и пересжата.
- MacBook из [pmndrs/examples](https://github.com/pmndrs/examples), лицензия MIT.
