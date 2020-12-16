# HTTP API

## Информация

Сервис предоставляет API, который настраивается в секции файла настройки **api**. API доступно по протоколу HTTP.

### Примеры применения

проверить доступность сервера: `curl -i http://localhost:3001/api/healthcheck` или `curl -i http://localhost:3001/api/`  

### API информации сервиса

| URL | Метод | Код | Описание | Пример ответа/запроса |
| ----- | ----- | ----- | ----- | ----- |
| / | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck | GET | 200 | проверить здоровье сервиса | OK |
| /healthcheck/status | GET | 200 | получить статус здоровья | [пример](#v1_status) |
| /_ping | GET | 200 | проверить доступность сервиса | OK |
| /v1/mocks | GET | 200 | получить список мок серверов | [пример](#v1_mocks_list) |
| /v1/mock/${name}/exist | GET | 200 | проверить существование сервера по имени | [пример](#v1_mocks_exist) |
| /v1/mock/${name}/info | GET | 200 | получить информацию о сервере по имени | [пример](#v1_mocks_info) |
| /v1/mock/${name}/handlers | GET | 200 | получить список обработчиков на сервере | [пример](#v1_mocks_handlers) |
| /v1/mock/${name}/state | GET | 200 | получить состояние сервера | [пример](#v1_mocks_state) |
| /v1/mock/${name}/reset | GET | 200 | сбросить состояние сервера | [пример](#v1_mocks_reset) |
| /v1/mock/${name}/state/change | POST | 200 | изменить состояние сервера | [пример](#v1_mocks_change_state) |
| /v1/mock/${name}/state/delete | POST | 200 | удалить состояние сервера | [пример](#v1_mocks_delete_state) |


## Примеры ответов/запросов

### Базовый ответ провала

Этот ответ возвращается при отказе выполнения запроса. Пример:

```js
{
    "status": "fail",
    "message": "Причина отказа"
}
```

### Базовый ответ ошибки

Этот ответ возвращается при ошибке на сервере. Пример:

```js
{
    "status": "error",
    "message": "Причина ошибки"
}
```

### <a name="v1_status"></a> Получить статус здоровья: /healthcheck/status

**Тело ответа**
```js
{
    "healthy": true,
    "work_time": 21,
    "human_work_time": "21s"
}
```

### <a name="v1_mocks_list"></a> Получить список мок серверов: /v1/mocks

**Тело ответа**
```js
{
    "status": "success",
    "data": [
        "sads",
        "asdasd"
    ]
}
```

### <a name="v1_mocks_exist"></a> Проверить существование сервера по имени: /v1/mock/${name}/exist

**Тело ответа**
```js
{
    "status": "success",
    "data": true
}
```

### <a name="v1_mocks_info"></a> Получить информацию о сервере по имени: /v1/mock/${name}/info

**Тело ответа**
```js
{
    "status": "success",
    "data": {
        "name": "mock1",
        "enable": true
    }
}
```

### <a name="v1_mocks_handlers"></a> Получить список обработчиков на сервере: /v1/mock/${name}/handlers

**Тело ответа**
```js
{
    "status": "success",
    "data": [
        "asdasd",
        "asdasd",
        "asdasd"
    ]
}
```

### <a name="v1_mocks_state"></a> Получить состояние сервера: /v1/mock/${name}/state

**Тело ответа**
```js
{
    "status": "success",
    "data": {
        "key1": "key1-val",
        "key2": "key2-val",
        "key3": "key3-val"
    }
}
```

> В теле возвращается начальное состояние

### <a name="v1_mocks_reset"></a> Cбросить состояние сервера: /v1/mock/${name}/reset

**Тело ответа**
```js
{
    "status": "success",
    "data": {
        "key1": "key1-val",
        "key2": "key2-val",
        "key3": "key3-val"
    }
}
```

> В теле возвращается начальное состояние

### <a name="v1_mocks_change_state"></a> Изменить состояние сервера: /v1/mock/${name}/state/change

**Тело запроса**
```js
{
    "key1": "key1-val",
    "key2": "key2-val",
    "key3": "key3-val"
}
```

**Тело ответа**
```js
{
    "status": "success",
    "data": {
        "key1": "key1-val",
        "key2": "key2-val",
        "key3": "key3-val"
    }
}
```

> В теле возвращается начальное состояние

### <a name="v1_mocks_delete_state"></a> Изменить состояние сервера: /v1/mock/${name}/state/delete

**Тело запроса**
```js
[
    "key1",
    "key2",
    "key3"
]
```

**Тело ответа**
```js
{
    "status": "success",
    "data": {}
}
```

> В теле возвращается начальное состояние