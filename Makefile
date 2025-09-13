up:
	docker compose -f docker-compose.evolution.yml up -d
	docker compose up -d

down:
	docker compose down
	docker compose -f docker-compose.evolution.yml down

