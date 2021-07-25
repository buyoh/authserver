# authserver

# testing

```
# terminal 1
yarn
yarn start
```

```
# terminal 2
cd testing
./nginx-docker.sh
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
- access and login `app.localhost:4000/auth/login`
- access `app.localhost:4000` (ok)
- access `one.app.localhost:4000` (ok)
- access `app.localhost:4000/private/` (ok)
- access `one.app.localhost:4000/private/` (ok)
- access and logout `app.localhost:4000/auth/login`
- access `app.localhost:4000` (ok)
- access `one.app.localhost:4000` (ok)
- access `app.localhost:4000/private/` (403)
- access `one.app.localhost:4000/private/` (403)

```
# kill docker
docker kill my-nginx-docker
```
