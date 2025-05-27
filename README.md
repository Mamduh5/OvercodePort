# OvercodePort
A full-stack project using next and node showcasing my skills.

## Database is auto schema
Table will create automatically when run

## Project Setup 

```sh
npm i
```

## Run backend localhost

```sh
npm run localhost
```

## Docker setup

### Build all image

```sh
docker-compose up --build
```

### Run specific image

```sh
docker-compose build backend
```

### Stop and remove containers include volumes

```sh
docker-compose down -v
```

### Start containers in detached mode

```sh
docker-compose up -d
```

### Clean Rebuild

```sh
docker-compose down -v --remove-orphans
```