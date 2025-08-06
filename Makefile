all: down clean build up

# Variables
IMAGE_NAME=recipe-app
PORT=3000

.PHONY: build up down clean

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down


clean:
	docker-compose down --rmi all --volumes --remove-orphans