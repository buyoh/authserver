# authserver

# testing

shutdown port80 if you are using

```
sudo service nginx stop
sudo service apache2 stop
```

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

- access `app.localhost` (ok)
- access `one.app.localhost` (ok)
- access `app.localhost/private/` (403)
- access `one.app.localhost/private/` (403)
- access and login `app.localhost/auth/login`
- access `app.localhost` (ok)
- access `one.app.localhost` (ok)
- access `app.localhost/private/` (ok)
- access `one.app.localhost/private/` (ok)
- access and logout `app.localhost/auth/login`
- access `app.localhost` (ok)
- access `one.app.localhost` (ok)
- access `app.localhost/private/` (403)
- access `one.app.localhost/private/` (403)

```
# kill docker
docker kill my-nginx-docker
```
