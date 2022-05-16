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
- `docker-compose/nginx-sample` を参考にしてください。

## launch with docker-compose and docker (sample implementation)

```sh
cd docker-compose/nginx-sample
docker-compose up
```

cleanup

```sh
docker-compose down --rmi all --volumes --remove-orphans
```

## testing (docker-compose/nginx-sample)

TODO: FIXME: obsolated!!!

```sh
cd docker-compose/nginx-sample
docker-compose up
```

login username: `root`, password: `pass`

- access `app.localhost:4000` (ok)
- access `one.app.localhost:4000` (ok)
- access `app.localhost:4000/private/` (403/401)
- access `one.app.localhost:4000/private/` (403/401)
- access and login `app.localhost:4000/auth-portal/`
- access `app.localhost:4000` (ok)
- access `one.app.localhost:4000` (ok)
- access `app.localhost:4000/private/` (ok)
- access `one.app.localhost:4000/private/` (ok)
- access and logout `app.localhost:4000/auth-portal/`
- access `app.localhost:4000` (ok)
- access `one.app.localhost:4000` (ok)
- access `app.localhost:4000/private/` (403/401)
- access `one.app.localhost:4000/private/` (403/401)


## launch stand alone(developer use)

```bash
yarn start --storage memory --create-user-admin-crypto=nopass --frontend=webpack
```
