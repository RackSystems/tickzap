up:
	docker compose -f docker-compose.evolution.yml up -d
	docker compose -f docker-compose.ai.yml up -d
	docker compose up -d --build

down:
	docker compose down
	docker compose -f docker-compose.ai.yml down
	docker compose -f docker-compose.evolution.yml down
