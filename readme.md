# authserver

an authentication server for subrequest-authentication

## overview

ログイン認証を行うためのサーバです。

- セッションの維持
- アカウントの管理
- 簡易な web インターフェース

## with nginx

https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/

- `auth_request` に `/auth` を割り当てると、nginx への特定のリクエストに対して、認証が出来ます。

## launch

```
docker-compsose up
```

cleanup

```
docker-compose down --rmi all --volumes --remove-orphans
```

## TODO

- replace oss
- dockerize-compose
- unittest

## testing

```
# terminal 1
yarn
ADMIN_USERNAME=authroot yarn start
```

```
# terminal 2
cd testing
./nginx-docker.sh
```

```
# terminal 3
cd testing
./mongodb-docker.sh
```

check that the container is working

```
$ docker ps
CONTAINER ID   IMAGE           COMMAND                  CREATED         STATUS         PORTS                      NAMES
280ceab516d1   nginx           "/docker-entrypoint.…"   3 seconds ago   Up 2 seconds                              my-nginx-docker
```

- access `app.localhost:4000` (ok)
- access `one.app.localhost:4000` (ok)
- access `app.localhost:4000/private/` (403)
- access `one.app.localhost:4000/private/` (403)
- access and login `app.localhost:4000/auth-portal/`
- access `app.localhost:4000` (ok)
- access `one.app.localhost:4000` (ok)
- access `app.localhost:4000/private/` (ok)
- access `one.app.localhost:4000/private/` (ok)
- access and logout `app.localhost:4000/auth-portal/`
- access `app.localhost:4000` (ok)
- access `one.app.localhost:4000` (ok)
- access `app.localhost:4000/private/` (403)
- access `one.app.localhost:4000/private/` (403)

```
# kill docker
docker kill my-nginx-docker
```
