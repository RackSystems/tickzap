up:
	docker compose -f docker-compose.evolution.yml up -d
	docker compose -f docker-compose.ai.yml up -d
	docker compose up -d --build

up-portainer:
	docker compose -f docker-compose.portainer.yml up -d

down:
	docker compose down
	docker compose -f docker-compose.ai.yml down
	docker compose -f docker-compose.evolution.yml down

down-portainer:
	docker compose -f docker-compose.portainer.yml down
