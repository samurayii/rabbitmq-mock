# Состояние

## Информация

Состояние сервера настраивается файлом или файлами в формате json/yml/toml, который настраивается в секции файла настройки **mock[].state_path**. Ключи состояния можно использовать в шаблонизации [маршрутов](ROUTES.md) или в работе [обработчиков](HANDLERS.md). Состояние сервера можно менять во время работы [обработчика](HANDLERS.md) или с помощью [HTTP API](API.md).

## Примеры

### Пример с одним файлом

В секции файла настройки **mock[].state_path** указан путь к файлу **./state.json**

Содержание файла **./state.json**:

```js
{
    "key1": 1,
    "key2": true,
    "key3": {
        "sub-key3-key1": "sub-key3-key1-val",
        "sub-key3-key2": "sub-key3-key2-val"
    }
}
```

Результирующее состояние:

```js
{
    "key1": 1,
    "key2": true,
    "key3": {
        "sub-key3-key1": "sub-key3-key1-val",
        "sub-key3-key2": "sub-key3-key2-val"
    }
}
```

### Пример с папкой

В секции файла настройки **mock[].state_path** указан путь к папке **./states**. Папка содержит три файла состояния **state1.toml**, **sub/state2.yml** и **state3.json**. Если в файлах есть одноимённые ключи, то принимается последнее считанное значение.

Содержание файла **state1.toml**:

```toml
key = 1
```

Содержание файла **sub/state2.yml**:

```yml
key2: true
```

Содержание файла **state3.json**:

```js
"key3": {
    "sub-key3-key1": "sub-key3-key1-val",
    "sub-key3-key2": "sub-key3-key2-val"
}
```

Результирующее состояние:

```js
{
    "key1": 1,
    "key2": true,
    "key3": {
        "sub-key3-key1": "sub-key3-key1-val",
        "sub-key3-key2": "sub-key3-key2-val"
    }
}