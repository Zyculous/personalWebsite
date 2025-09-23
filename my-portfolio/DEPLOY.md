# Docker Deployment Commands for Fresh Build

## 1. Stop and remove existing containers
docker-compose down

## 2. Remove old images to force rebuild
docker-compose down --rmi all

## 3. Build with no cache to ensure fresh build
docker-compose build --no-cache

## 4. Start the new container
docker-compose up -d

## Alternative: One command to rebuild everything
docker-compose down --rmi all && docker-compose build --no-cache && docker-compose up -d

## 5. Check if it's running
docker-compose ps

## 6. View logs if needed
docker-compose logs -f

## 7. Clean up Docker system (removes unused images, containers, networks)
docker system prune -f