all: down clean build up

# Variables
IMAGE_NAME=recipe-app
PORT=3000

.PHONY: build up down clean

build:
	docker build -t $(IMAGE_NAME) .

up:
	docker run -d -p $(PORT):80 --name $(IMAGE_NAME) $(IMAGE_NAME)

down:
	-docker stop $(IMAGE_NAME) && docker rm $(IMAGE_NAME)

clean:
	-docker rmi $(IMAGE_NAME)