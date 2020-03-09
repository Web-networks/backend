# Backend-part of application 

## Содержание
1. [Настройка окружения и установка необходмых пакетов для разработки (Linux, MacOS)](#settings-env)
2. [Разработка](#dev-rules)
3. [Контейнеризация](#docker) 
4. [Проверки pre-commit](#commit-checks)
5. [CI](#CI)
6. [Архитектура](#architecture)
7. [Тестирование](#testing)
8. [API](#api)

<a name="settings-env"></a>

### Настройка окружения и установка необходмых пакетов для разработки (Linux, MacOS)
Серверная часть будет писаться на TS. Чтобы вести разработку необходимо уставноить `nvm` и `node`.
```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
nvm install 10
nvm alias default 10
```
Также нужно установить утилиту `yarn`: https://yarnpkg.com/

После этого можно устанвливать пакеты зависимотей для данного проекта, выполнив команду:
```
yarn
```

В проекте используются токены и пароли сторонних сервисов, чтобы получить доступ к ним нужно будет прислать разработчику свои сгенерированный gpg-ключ (публичный) в виде файла. Подробнее как его сгенировать можно почитать здесь: https://help.github.com/en/github/authenticating-to-github/generating-a-new-gpg-key

<a name="dev-rules"></a>

## Разработка
Если на предыдущих шагах все прошло успешно, можно начинать разработку. Для этого нужно запустить следующую команду:
```
yarn start-dev
```
Она запустит сервер в режими _development_ и любые изменения в коде сервера автоматически будут приводить к его перезапуску. В консоле появится информация о хосте, на котором запущен сервер. С другими командами можно ознакомиться в `package.json`.

Типичный **workflow разработки**:
1. Отводится ветка от master **<surname>_<short_task_description>**
2. Пишутся необходимые сервисы в директории `services`
3. Заводится, если нужно ручки в `api`
4. После написания функционала - пишутся тесты (директория `tests`)
5. Далее пишется документация на API в отдельных файлах `api/**/*.docs.ts`

<a name="docker"></a>

## Контейнеризация 
Чтобы запустить приложение в _docker контейнере_ нужно сделать следующие:
```
docker build . -t <name of image>
docker run -p 5050:5050 <name of image>
```
Можно запустить так же образ который находится в удаленном репозитории (см ниже). Пример запуска последней стабильной версии:
```
docker run -p 8000:5050 networksidea/backend:latest
```
**Важно указать правильную проброску портов!**: `-p <port on your host>:5050`, важно что в контейнере сервер слушает порт `5050`!
Контейнер запускает сервер в режиме _production_.

Также к git-репозиторию привязан docker hub oraganisation: https://hub.docker.com/orgs/networksidea.
Нужно подать заявку для членства в организации, чтобы иметь доступ к `push` своих свобственных кастомных образов.
Сейчас образы собираются по следующим правилам автоматически (реагируют на гитовые web хуки):
1. На каждое обновление `master`, при этом образ собирается из последнего коммита и доступен под тегом `latest`:
```
docker pull networksidea/backend:latest
``` 
2. На каждый релизный тэг в мастер: `tag=0.10.1` => образ можно получить под тегом: `release-0.10.1`:
```
docker pull networksidea/backend:release-0.10.1
```
3. На каждый _push_ в произвольную ветку => соответсвующий тэг будет иметь имя ветки
```
docker pull networksidea/backend:<branch-name> 
```

Если хочется запушить свой собственный _docker_ образ (например он нужен другим разработчикам для интеграции), то
запушить свой образ можно так:
```
docker push networksidea/backend:<tagname>
```
_tagname_ **не должен быть**: `latest`, `<branch-name>`, `release-<...>` в силу правил описанных выше.
Соответственно другому разработчику можно получить образ выполнив команду:
```
docker pull networksidea/backend:<tagname>
```

<a name="commit-checks"></a>

## Проверки pre-commit
Перед тем как сделать коммит прогонится линтер: `yarn lint`. В случае нарушения Code Style или соверешния ошибок, видимых при статической обработке кода, коммит не удасться сделать. В этом случае необходимо поправить код в тех местах, где ошибки и повторить попытку коммита.

<a name="CI"></a>

## CI
Процесс CI проверко представляет из себя следующее:
1. _Lint checking_: Eslint проверки (статическая проверка линеторм нв code-style + мелкие синтаксические ошибки)
2. _TS checking_: проверка на типизацию TypeScript
3. _Server tests_: серверные тесты на API

<a name="architecture"></a>

## Архитектура
Взял за основу эту статью: https://dev.to/santypk4/bulletproof-node-js-project-architecture-4epf
Выделю основные моменты из нее.
Структура проекта: 
```
- app.js    # входная точка проекта
- /api      # папка с контроллерами 
- /config   # папка с конфигами и определением переменных окружения (секретами)
- /loaders  # подключение всех необходмых модулей и middlewares на этапе старта приложения
- /models   # databse models
- /services # описание классов со всей бизнесс-логикой 
```
В каждой из директорий может также распологаться папка с тестами: `tests`. Точно будем тестировать всю бизес логику. Поэтому после написания очередной бизнес сущности необходимо написать тесты на нее.

В архитектуре будет присутствовать 3 слоя: 

1. Слой контроллеров `Controllers` - верхний слой. Принимает заброс и вызывает соответствующую обработку бизнесс логики из `/services`. Это верхний слой приложения, он принимает непосредственно запросы. В этом слое не должно быть ни в коем случае описания любой бизнесс логики. Этот слой просто принимает запрос и решает какая функция/класс будет обрабатываеть его из слоя 2. Пример:
```
  route.post('/', 
    validators.userSignup, // this middleware take care of validation
    async (req, res, next) => {
      // The actual responsability of the route layer.
      const userDTO = req.body;

      // Call to service layer.
      // Abstraction on how to access the data layer and the business logic.
      const { user, company } = await UserService.Signup(userDTO);

      // Return a response to client.
      return res.json({ user, company });
    });
```

2. Слой с описанием бизнес логики приложения: `Services` - средний слой. Тут описание каких-то классов (бизнес сущностей), которые непосредественно занимаются уже бизнес логикой приложения. Пример класс `User` (очень упрещенный без тайпингов):

```
  import UserModel from '../models/user';
  import CompanyModel from '../models/company';

  export default class UserService {

    async Signup(user) {
      const userRecord = await UserModel.create(user);
      const companyRecord = await CompanyModel.create(userRecord); // needs userRecord to have the database id 
      const salaryRecord = await SalaryModel.create(userRecord, companyRecord); // depends on user and company to be created

      ...whatever

      await EmailService.startSignupSequence(userRecord)

      ...do more stuff

      return { user: userRecord, company: companyRecord };
    }
  }
```

3. Слой с описанием работы с базой данной: `Data Acess Layer`. Это самый низкий слой, он занимается взаимодействием с базой данной. База данных будет `MongoDB`: https://www.mongodb.com/. Фреймворк для взаимодействия будет использоваться [mongoose](https://mongoosejs.com/).  

Важные замечения: если класс из service слоя использует какие-то модели из слоя data acess layer. То нужно вводить dependency injection (для дальнейшего тестировния). Пользуемся этой библиотекой для этого [typeDI](https://www.npmjs.com/package/typedi). 

За эталон берем архитектуру из этого репозитория: https://github.com/santiq/bulletproof-nodejs

<a name="testing"></a>

## Тестирование
Процесс тестирования API устроен следующим образом: все тесты находятся в директории `test` и представляют из себя тестирование уже существующих написанных ручек бэкенда. Перед запуском этих тестов (а также перед запуском бэкенда в режиме _development_) в БД наливаются _fixtures_ (фиктивные наборы данных). Сами фикстуры находятся в папке `fixtures`. БД в режиме _development_, а также в режиме _testing_ поднимается локально из-под docker-контейнера.

При написании тестов можно добавлять нужные фикстуры, а также если они нужны в режиме разработки. Все тесты следует писать независимыми друг от друга (это значит что результат выполнения тестов не зависит от последовательности выполнения этих тестов, а также в случае их произвольного распараллеливания).

<a name="api"></a>

## API
Ссылка на документацию по API: https://web-networks.github.io/backend/index.html с описанием работы всех ручек.