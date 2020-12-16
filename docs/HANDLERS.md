# Обработчики

## Информация

Для сложных обработок итогового сообщения предусмотрены обработчики. Обработчик это модуль написанный на языке JavaScript, который является функцией в которую передаются аргументы для обработки. Источник обработчиков настраивается в секции [маршрута](ROUTES.md) **body.handler**. Каждый обработчик имеет свой идентификатор в каждом мок сервере, он равен относительному пути файла модуля без расширения файла. Например если файл обработчика имеет относительный адрес `sub/handler.js`, его идентификатор будет равен `sub/handler`.

### Объекты передаваемые в обработчик

В функцию обработчика передаются три json объекта.

- итоговое сообщение
- исходное сообщение
- текущее состояние сервере

Пример итогового сообщения:

```js
{
    "headers": { 
        "header1": "header1-val",
        "header2": "header2-val"
    },
    "properties": { 
        "replyTo": "second_q" 
    },
    "body": "тело сообщения (может быть text, json или buffer)",
    "destination": "имя точки назначения",
    "type": "exchange",
    "routing_key": "ключ маршрутизации (если нужен)"
}
```

Пример исходного сообщения:

```js
{
    "properties": { 
        "deliveryMode": 1 
    }, 
    "headers": {
        "header1": "header1-val"
    }, 
    "body": "тело сообщения (может быть text, json или buffer)"
}

Пример текущего состояния сервера:

```js
{
    "key3": "key3-val",
    "key1": "key1-val",
    "key4": {
        "sub-key4-key1": "sub-key4-key1-val",
        "sub-key4-key2": "sub-key4-key2-val"
    },
    "key2": "key2-val"
}
```

### Примеры обработчиков

Пример обработчика #1:

```js
module.exports = (result_message, original_message, current_stage) => {
    
    console.log(JSON.stringify(result_message, null, 2));
    console.log(JSON.stringify(original_message, null, 2));
    console.log(JSON.stringify(current_stage, null, 2));

};
```

Пример обработчика #2:

```js
module.exports = (result_message, original_message, current_stage) => {
    
    result_message.body.new_key = "hello";                  // установить/изменить тело запроса
    result_message.headers.new_header = "new-header=val";   // установить/изменить заголовок
    result_message.destination = "new_destination";         // установить/изменить точку назначения

};
```