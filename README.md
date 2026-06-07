# Reading List Pro

Умный менеджер закладок — браузерное расширение для Chrome с облачной синхронизацией.

> Тестовое задание на стажировку «Система.Поток» · MVP за 7 дней

---

## Идея

У большинства людей сотни закладок без структуры и поиска. Reading List Pro решает это прямо в браузере: сохраняй страницы в один клик, организуй по тегам, пиши заметки и следи за статистикой чтения. Данные не теряются при переустановке — всё синхронизируется через облачный бэкенд.

**Ключевые фичи:**
- Сохранение текущей вкладки в 1 клик с автозахватом title, favicon и Open Graph превью
- Контекстное меню: правый клик → «Сохранить в Reading List»
- Поиск и фильтрация по тегам, фильтр «Непрочитанные»
- Заметки к каждой закладке
- Статистика: топ доменов, динамика сохранений по дням
- Тёмная / светлая тема
- Управление тегами (цвет, переименование) на странице настроек

---

## Стек

| Слой | Технологии | Обоснование |
|------|-----------|-------------|
| Extension | React 18 + Vite + Tailwind CSS + Manifest V3 | Vite даёт быстрый dev-loop; Tailwind — utility-first без лишнего CSS; MV3 — актуальный стандарт Chrome |
| Backend | NestJS + TypeORM + PostgreSQL | Модульная архитектура NestJS хорошо масштабируется; TypeORM даёт типобезопасную работу с БД |
| Auth | JWT (access 15 min + refresh 7 days) | Stateless, подходит для расширения; refresh-ротация защищает от утечки токена |
| OG-парсинг | Cheerio (сервер) | Парсинг на бэкенде — не раскрывает серверную логику в публичном коде расширения |
| Деплой | Render.com (backend) + Docker | Бесплатный тир, managed PostgreSQL, один `render.yaml` разворачивает весь стек |
| Контейнеры | Docker + docker-compose | Один `docker-compose up` поднимает postgres + backend локально |

---

## Быстрый старт (локально)

### Требования
- Docker + Docker Compose
- Node.js 20+ (только для сборки расширения)
- Google Chrome

### 1. Клонируй репозиторий

```bash
git clone https://github.com/GoEntry/reading-list-pro.git
cd reading-list-pro
```

### 2. Создай `.env` из примера

```bash
cp .env.example .env
```

Отредактируй `.env` при необходимости (дефолтные значения работают «из коробки»):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=reading_list_pro
JWT_ACCESS_SECRET=change-me-access-secret-must-be-32-chars-long
JWT_REFRESH_SECRET=change-me-refresh-secret-must-be-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=3000
```

### 3. Запусти бэкенд

```bash
docker compose up --build
```

Готово. Backend доступен на `http://localhost:3000`.  
Swagger UI: `http://localhost:3000/api/docs`

### 4. Собери расширение

```bash
cd extension
cp .env.example .env          # VITE_API_URL=http://localhost:3000
npm install
npm run build                 # собирает в extension/dist/
```

### 5. Загрузи расширение в Chrome

1. Открой `chrome://extensions`
2. Включи **Developer mode** (переключатель в правом верхнем углу)
3. Нажми **Load unpacked**
4. Выбери папку `extension/dist/`

Иконка расширения появится в панели браузера.

---

## Деплой на Render.com

Репозиторий содержит `render.yaml` — Blueprint для одного клика:

1. Форкни или запушь репо на GitHub
2. На [render.com](https://render.com) → **New** → **Blueprint**
3. Подключи репозиторий — Render прочитает `render.yaml` и создаст:
   - Web Service (NestJS в Docker)
   - Managed PostgreSQL
4. После успешного деплоя скопируй URL сервиса (вида `https://reading-list-pro.onrender.com`)
5. Обнови `extension/.env.production`:
   ```env
   VITE_API_URL=https://your-service.onrender.com
   ```
6. Пересобери расширение: `npm run build`

**Задеплоенный бэкенд:** `https://reading-list-pro.onrender.com`  
**Swagger (prod):** `https://reading-list-pro.onrender.com/api/docs`

> Первый запрос может занять ~30 сек — Render усыпляет бесплатный сервис после 15 мин неактивности.

---

## Архитектура

```
┌─────────────────────────────────────────────┐
│              Chrome Extension               │
│                                             │
│  popup.html ──► React UI                   │
│  options.html ──► Settings / Tags           │
│  background.js ──► Service Worker           │
│     └── context menu handler               │
│     └── chrome.storage.local (JWT)         │
└───────────────────┬─────────────────────────┘
                    │ HTTPS REST
                    ▼
┌─────────────────────────────────────────────┐
│            NestJS Backend                   │
│                                             │
│  /auth      ── JWT register/login/refresh   │
│  /bookmarks ── CRUD + search + OG scrape    │
│  /tags      ── tag management               │
│  /stats     ── aggregated statistics        │
│  /api/docs  ── Swagger UI                   │
└───────────────────┬─────────────────────────┘
                    │ TypeORM
                    ▼
┌─────────────────────────────────────────────┐
│            PostgreSQL                        │
│  users · bookmarks · tags · bookmark_tags   │
└─────────────────────────────────────────────┘
```

### Ключевые решения

**JWT хранится в `chrome.storage.local`**, а не в `localStorage` — Service Worker в MV3 не имеет доступа к `localStorage`.

**OG-парсинг на бэкенде** (`GET /bookmarks/og?url=`) через Cheerio — расширение не раскрывает логику парсинга, а бэкенд может кэшировать результаты в будущем.

**Refresh-ротация** — при каждом `/auth/refresh` выдаётся новая пара токенов; старый refresh-токен инвалидируется.

**`synchronize: true`** в TypeORM — допустимо для MVP, схема создаётся автоматически при старте.

---

## API — краткий справочник

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register` | Регистрация |
| POST | `/auth/login` | Вход, возвращает access + refresh token |
| POST | `/auth/refresh` | Обновить access token |
| POST | `/auth/logout` | Выход |
| GET | `/bookmarks` | Список закладок (`?search=`, `?tagIds=`, `?isRead=`, `?page=`, `?limit=`) |
| POST | `/bookmarks` | Создать закладку |
| GET | `/bookmarks/og` | Получить OG-метаданные по URL (`?url=`) |
| PATCH | `/bookmarks/:id` | Обновить заметки / теги / isRead |
| DELETE | `/bookmarks/:id` | Удалить |
| GET | `/tags` | Все теги пользователя |
| POST | `/tags` | Создать тег |
| PATCH | `/tags/:id` | Переименовать / сменить цвет |
| DELETE | `/tags/:id` | Удалить |
| GET | `/stats` | Статистика (`?days=30`) |

Полная интерактивная документация: **[Swagger UI](https://reading-list-pro.onrender.com/api/docs)**

---

## Структура проекта

```
reading-list-pro/
├── backend/
│   ├── src/
│   │   ├── auth/          # JWT auth (register/login/refresh/logout)
│   │   ├── users/         # User entity + service
│   │   ├── bookmarks/     # CRUD + OG scraping (cheerio)
│   │   ├── tags/          # Tags CRUD
│   │   ├── stats/         # Aggregated reading stats
│   │   └── main.ts        # Bootstrap (CORS, Swagger, ValidationPipe)
│   ├── Dockerfile
│   └── package.json
│
├── extension/
│   ├── src/
│   │   ├── popup/         # Main UI (bookmarks list, search, filters)
│   │   ├── options/       # Settings page (profile, tags, theme)
│   │   ├── background/    # Service Worker (context menu)
│   │   ├── api/           # REST client (axios)
│   │   └── lib/           # Auth context, storage, OG extractor
│   ├── public/
│   │   └── manifest.json  # Manifest V3
│   └── .env.production    # VITE_API_URL for production build
│
├── docker-compose.yml     # postgres + backend
├── render.yaml            # Render.com Blueprint
└── .env.example
```

---

## Тестирование

```bash
cd extension
npm run test:run
```

```
✓ src/lib/storage.test.ts       (4 tests)
✓ src/lib/og-extractor.test.ts  (7 tests)
✓ src/api/tags.test.ts          (2 tests)
✓ src/api/bookmarks.test.ts     (7 tests)
✓ src/api/auth.test.ts          (5 tests)

Test Files  5 passed (5)
Tests       25 passed (25)
```

---

## Чеклист ТЗ

### Функциональность
- [x] Регистрация и вход (email + пароль, JWT)
- [x] Сохранение текущей вкладки в 1 клик
- [x] Контекстное меню «Сохранить в Reading List»
- [x] Автозахват title, favicon, Open Graph превью (на бэкенде через cheerio)
- [x] Список закладок с поиском по title / URL
- [x] Фильтрация по тегам и статусу «Непрочитанное»
- [x] Пагинация / бесконечная прокрутка
- [x] Заметки к закладке
- [x] Пометить как прочитанное / непрочитанное
- [x] Удаление закладки
- [x] Управление тегами (создать, переименовать, сменить цвет, удалить)
- [x] Статистика: total / read / unread, топ-5 доменов, динамика по дням (recharts)
- [x] Тёмная / светлая тема с сохранением настройки
- [x] Синхронизация через облачный бэкенд

### Архитектура
- [x] Manifest V3 (актуальный стандарт)
- [x] JWT хранится в `chrome.storage.local`
- [x] Refresh-ротация токенов
- [x] OG-парсинг на бэкенде (не в расширении)
- [x] CORS настроен с первого дня
- [x] Docker + docker-compose (один `docker-compose up`)
- [x] Swagger / OpenAPI документация
- [x] Деплой на Render.com с managed PostgreSQL

### Качество кода
- [x] TypeScript strict mode (backend + extension)
- [x] DTO с валидацией (`class-validator`)
- [x] 25 unit-тестов (extension API + утилиты)
- [x] Состояния загрузки, ошибок и пустого экрана во всех списках
- [x] Optimistic update при toggle read / delete

---

## Демо-видео

**[▶ Смотреть демо](https://disk.yandex.ru/i/mpcpYMwCmwAYEQ)**

