# bar2917-back-end

API суши-бара Bar2917. Отдаёт каталог товаров с ценами по точкам, управление пользователями и заказами, guard'ы для админки.

## Стек

- NestJS 10 + TypeScript
- PostgreSQL + Prisma 5
- JWT-авторизация (passport-jwt)
- Оплата — YooKassa (сейчас выключена, см. `ORDERS_ENABLED`)

## Запуск

```bash
npm install
cp env.example .env        # заполнить значения
npx prisma generate
npx prisma migrate deploy  # на пустой базе применит схему
npm run start:dev          # дев-режим, http://localhost:4200/api
npm run build && npm run start:prod   # прод
```

На существующей базе, созданной раньше через `db push`, миграции нужно один раз пометить применёнными (таблицы уже есть):

```bash
npx prisma migrate resolve --applied 0_init
```

## Переменные окружения

Полный список в `env.example`. Обязательные: `DATABASE_URL`, `JWT_SECRET`

`ORDERS_ENABLED` - флаг доставки. Пока `false`, эндпоинты `POST /orders` и webhook `POST /orders/status` отвечают 503. Перед включением прочитать TODO в `src/order/order.service.ts` (верификация платежа).

## Структура

```
src/
  auth/        логин, регистрация, JWT (access 1ч / refresh 30д), guard'ы
  user/        профиль
  product/     каталог, CRUD товаров (только админ)
  category/    категории
  location/    точки (рестораны), цены товаров задаются per-локация
  order/       заказы и YooKassa — за флагом ORDERS_ENABLED
  feedback/    обратная связь
  statistics/  сводка для админки
  common/      глобальный фильтр Prisma-ошибок
  config/      Joi-валидация env, конфиг JWT
prisma/        схема и миграции
assets/        картинки товаров, раздаются по /assets
```

## Полезное инфо

- Цена заказа считается на сервере по ценам из БД, клиентские цены игнорируются.
- Роут `GET /api/products` требует `locationId`; пагинация опциональна (`page`, `perPage`).
- Ошибки Prisma переводятся в HTTP глобальным фильтром: дубль уникального поля — 409, «не найдено» — 404.
- Rate-limit на `/auth/login` и `/auth/register` — 5 запросов в минуту.
