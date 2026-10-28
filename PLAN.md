# Verity MVP — План

## Архитектура

```
[UI: Выбор демо / вставка текста]
      │
      ▼
[POST /api/analyze]  ← { documents, useCached }
      │
      ├─ useCached → cached-result.json
      ├─ Список бесплатных моделей OpenRouter (кэш 5 мин)
      ├─ Вызов модели с fallback-цепочкой
      ├─ Устойчивый парсинг JSON
      ├─ Верификация цитат в источниках
      └─ SSE-стрим шагов → результат
```

## Структура папок

- `app/` — layout, page, API route
- `components/` — UploadScreen, AnalyzingScreen, ResultScreen, ScoreDisplay, FlagCard, etc.
- `lib/` — types, openrouter, json-parser, quote-verifier, prompts, demo-data
- `data/demo-company/` — 5 синтетических документов
- `data/cached-result.json` — записанный результат для видео

## Таймлайн (60 мин)

| Мин   | Этап                      |
|-------|---------------------------|
| 0-5   | Scaffold проекта          |
| 5-15  | Демо-данные               |
| 15-25 | API: OpenRouter + fallback|
| 25-35 | JSON-парсер + промпты     |
| 35-50 | UI: 3 экрана              |
| 50-55 | Кэш + записанный прогон   |
| 55-60 | README + деплой           |

## Риски

- Бесплатные модели нестабильны → fallback-цепочка + записанный прогон
- Короткий контекст → документы < 4000 слов
- Плохой JSON от моделей → парсер + повторный запрос
- Vercel Hobby 300s таймаут → SSE-стрим, один вызов
- Данные логируются провайдером → только синтетика

## Что НЕ в MVP

Регистрация, БД, загрузка PDF, реальные данные (ЕГРЮЛ/ФНС), история проверок, роли, платежи, мобильная вёрстка, i18n.
