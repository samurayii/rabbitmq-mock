# RabbitMQ mock

## Информация

Мок сервер для rabbitmq. Принцип состоит в том, что rabbitmq-mock подключается к очереди rabbitmq как конечная точка, отвечающая на запросы в указанную очередь.

## Оглавление:
- [Установка](#install)
- [Ключи запуска](#launch)
- [Конфигурация](#configuration)
- [HTTP API](API.md)
- [Состояние](STATE.md)
- [Маршруты](ROUTES.md)
- [Обработчики](HANDLERS.md)
- [Docker](DOCKER.md)
- [Примеры](../examples)

## <a name="install"></a> Установка и использование

установка: `npm install rabbitmq-mock -g`

использование: `rabbitmq-mock -с config.toml`

## <a name="launch"></a> Таблица ключей запуска
Ключ | Описание
------------ | -------------
--version, -v | вывести номер версии приложения
--help, -h | вызвать справку по ключам запуска
--config, -c | путь к файлу конфигурации в формате toml или json, (переменная среды: RABBITMQ_MOCK_CONFIG_PATH)

## <a name="configuration"></a> Конфигурация

Программа настраивается через файл конфигурации двух форматов TOML, JSON или YML. Так же можно настраивать через переменные среды, которые будут считаться первичными.

### Секции файла конфигурации:

- **logger** - настройка логгера (переменная среды: RABBITMQ_MOCK_LOGGER)
- **authorization** - настройка авторизации (переменная среды: RABBITMQ_MOCK_AUTHORIZATION)
- **api** - настройка API (переменная среды: RABBITMQ_MOCK_API)
- **api.parsing** - настройка паркинга (пакет: https://github.com/dlau/koa-body#readme, переменная среды: RABBITMQ_MOCK_API_PARSING)
- **mock** - массив настроек mock серверов (переменная среды: RABBITMQ_MOCK_MOCK)
- **mock[].input** - настройка входа
- **mock[].input.queue** - массив настроек mock серверов
- **mock[].input.exchange** - настройки точки обмена не обязательно (НЕ ОБЯЗЯТЕЛЬНА)
- **mock[].output** - настройка выхода
- **mock[].output.default** - значения по умолчанию для маршрутов

### Пример файла конфигурации config.toml
```toml
[logger]                # настройка логгера
    mode = "prod"       # режим (prod или dev или debug)
    enable = true       # активация логгера
    timestamp = false   # выводить время лога (true или false)
    type = true         # выводить тип лога (true или false)

[authorization]                     # настройка авторизации
    [[authorization.users]]         # массив пользователей
        username = "username"       # имя пользователя
        password = "password"       # пароль пользователя
    [[authorization.users]]
        token = "xxxxxxxxxxxx"      # токен доступа

[api]                                   # настройка API
    enable = false                      # активация API
    auth = false                        # активация авторизации
    listening = "*:3001"                # настройка слушателя
    prefix = "/api"                     # префикс
    proxy = false                       # когда поле заголовка true proxy будут доверенным
    subdomain_offset = 2                # смещение от поддомена для игнорирования
    proxy_header = "X-Forwarded-For"    # заголовок IP прокси
    ips_count = 0                       # максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность)
    env = "development"                 # среда для сервера koa
    #keys = []                          # массив подписанных ключей cookie
    [api.parsing]                       # настройка парсинга (пакет: https://github.com/dlau/koa-body#readme)
        enable = false                  # активация парсинга
        encoding = "utf-8"              # кодировка парсинга
        form_limit = "56kb"             # лимит для форм
        json_limit = "1mb"              # лимит для json
        text_limit = "1mb"              # лимит для raw
        text = true                     # парсинг raw
        json = true                     # парсинг json
        multipart = false               # парсинг составных частей
        include_unparsed = false        # добавить исходное тело запроса в переменную ctx.request.body
        urlencoded = true               # парсинг данных urlencoded
        json_strict = true              # строгий режим парсинга json
        methods = ["POST"]              # список методов для парсинга

[[mock]]                                    # массив настроек mock серверов
    name = "my_name_mock"                   # имя mock сервера, должно быть уникальным
    enable = true                           # активация mock сервера
    thread = ""                             # имя потока (НЕ ОБЯЗЯТЕЛЬНА)
    state_path = "state"                    # папка/файл в формате json/toml/yml начального состояния сервера (НЕ ОБЯЗЯТЕЛЬНА)
    routes_path = "routes"                  # папка с маршрутами
    handlers_path = "handlers"              # папка с процессорами
    v_host = "/"                            # виртуальный хост
    reconnect_interval = 10                 # интервал переподключения
    url = "user:password@localhost:5672"    # строка подключения
    heartbeat = 30                          # сердцебиение
    [mock.input]                                # настройка входа
        parallel = 1                            # количество параллельных запросов
        codec = "json"                          # кодек разбора сообщения (json, text или buffer)
        fast_ack = true                         # подтверждение сразу после получения сообщения
        #v_host = "/"                           # виртуальный хост
        #reconnect_interval = 10                # интервал переподключения
        #url = "user:password@localhost:5672"   # строка подключения
        #heartbeat = 30                         # сердцебиение
        [mock.input.queue]                      # настройка очереди
            name = ""                           # имя очереди
            pattern = ""                        # паттерт для маршрутизации
            [mock.input.queue.options]          # параметры rabbitmq для очереди
                autoDelete = false             
                durable = true                 
        [mock.input.exchange]                   # настройки точки обмена не обязательно (НЕ ОБЯЗЯТЕЛЬНА)
            name = "logs"                       # имя точки обмена
            type = "fanout"                     # тип точки обмена
            [mock.input.exchange.options]       # параметры точки обмена для rabbitmq
                durable = true
                autoDelete = false
    [mock.output]                               # настройка выхода
        #v_host = "/"                           # виртуальный хост
        #reconnect_interval = 10                # интервал переподключения
        #url = "user:password@localhost:5672"   # строка подключения
        #heartbeat = 30                         # сердцебиение
        [mock.output.default]                   # значения по умолчанию
            type = "exchange"                       # тип точки назначения (queue или exchange)
            destination = ""                        # имя точки назначения
            routing_key = ""                        # ключ маршрутизации
            [mock.output.default.options]           # настройки сообщений
                persistent = true
```

### Таблица параметров конфигурации

| Параметр | Тип | Значение | Описание |
| ----- | ----- | ----- | ----- |
| logger.mode | строка | prod | режим отображения prod, dev или debug |
| logger.enable | логический | true | активация логгера |
| logger.timestamp | логический | false | выводить время лога (true или false) |
| logger.type | логический | true | выводить тип лога (true или false) |
| authorization.users | массив | [] | массив пользователей |
| api.enable | логический | false | активация API (true или false) |
| api.auth | логический | false | активация авторизации (true или false) |
| api.listening | строка | *:3001 | настройка слушателя, формат <хост>:<порт> |
| api.prefix | строка | /api | префикс |
| api.proxy | логический | false | когда поле заголовка true proxy будут доверенным |
| api.subdomain_offset | число | 2 | смещение от поддомена для игнорирования |
| api.proxy_header | строка | X-Forwarded-For | заголовок IP прокси |
| api.ips_count | число | 0 | максимальное количество IP прочитанное из заголовка прокси, по умолчанию 0 (означает бесконечность) |
| api.env | строка | development | среда для сервера [koa](https://www.npmjs.com/package/koa) |
| api.keys | строка[] |  | массив подписанных ключей cookie |
| api.parsing.enable | логический | false | активация парсинга (true или false) |
| api.parsing.encoding | строка | utf-8 | кодировка парсинга |
| api.parsing.form_limit | строка | 56kb | лимит для форм |
| api.parsing.json_limit | строка | 1mb | лимит для json |
| api.parsing.text_limit | строка | 1mb | лимит для raw |
| api.parsing.text | логический | true | парсинг raw |
| api.parsing.json | логический | true | парсинг json |
| api.parsing.multipart | логический | false | парсинг составных частей |
| api.parsing.include_unparsed | логический | false | добавить исходное тело запроса в переменную ctx.request.body |
| api.parsing.urlencoded | логический | true | парсинг данных urlencoded |
| api.parsing.json_strict | логический | true | строгий режим парсинга json |
| api.parsing.methods | строка[] | ["POST"] | список методов для парсинга POST, PUT и/или PATCH |
| mock[].name | строка |  | имя mock сервера, должно быть уникальным |
| mock[].enable | логический | true | активация mock сервера |
| mock[].thread | строка | prod | имя потока (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].state_path | строка |  | папка/файл в формате json/toml/yml начального состояния сервера (НЕ ОБЯЗЯТЕЛЬНА) [подробнее](STATE.md) |
| mock[].routes_path | строка | routes | папка с маршрутами [подробнее](ROUTES.md) |
| mock[].handlers_path | строка | handlers | папка с процессорами [подробнее](HANDLERS.md) |
| mock[].v_host | строка | / | виртуальный хост по умолчанию (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].reconnect_interval | число | 10 | интервал переподключения по умолчанию (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].url | строка | guest:guest@localhost:5672 | строка подключения по умолчанию (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].heartbeat | число | 30 | сердцебиение по умолчанию (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].input.parallel | число | 1 | количество параллельных запросов |
| mock[].input.codec | строка | json | кодек разбора сообщения (json, text или buffer) |
| mock[].input.fast_ack | логический | true | подтверждение сразу после получения сообщения |
| mock[].input.v_host | строка | | виртуальный хост для входа (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].input.reconnect_interval | число | | интервал переподключения для входа  (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].input.url | строка | | строка подключения для входа (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].input.heartbeat | число | | сердцебиение для входа (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].input.queue.name | строка | | имя очереди |
| mock[].input.queue.pattern | строка | | паттерт для маршрутизации |
| mock[].input.queue.options | объект | {} | параметры rabbitmq для очереди |
| mock[].input.exchange.name | строка | | имя точки обмена |
| mock[].input.exchange.type | строка | fanout | тип точки обмена |
| mock[].input.exchange.options | объект | {} | параметры точки обмена для rabbitmq |
| mock[].output.v_host | строка | | виртуальный хост для выхода (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].output.reconnect_interval | число | | интервал переподключения для выхода  (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].output.url | строка | | строка подключения для выхода (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].output.heartbeat | число | | сердцебиение для выхода (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].output.default.type | строка | exchange | тип точки назначения (queue или exchange) |
| mock[].output.default.destination | строка | | имя точки назначения |
| mock[].output.default.routing_key | строка | | ключ маршрутизации (НЕ ОБЯЗЯТЕЛЬНА) |
| mock[].output.default.options | объект | {} | настройки сообщений |

### Настройка через переменные среды

Ключи конфигурации можно задать через переменные среды ОС. Имя переменной среды формируется из двух частей, префикса `RABBITMQ_MOCK_` и имени переменной в верхнем реестре. Если переменная вложена, то это обозначается символом `_`. Переменные среды имеют высший приоритет.

пример для переменной **logger.mode**: `RABBITMQ_MOCK_LOGGER_MODE`

пример для переменной **api.ips_count**: `RABBITMQ_MOCK_API_IPS_COUNT`