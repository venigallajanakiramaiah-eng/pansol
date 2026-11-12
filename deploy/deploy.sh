#!/bin/bash
# Runs ON the EC2 instance (installed to /opt/pansol by Terraform user data).
# Called by the GitHub Actions pipeline through AWS SSM:
#   /opt/pansol/deploy.sh <image-tag>
# Roll back by running it again with an older commit SHA.
set -euo pipefail
cd /opt/pansol

set -a
# shellcheck source=/dev/null
source /opt/pansol/app.env
set +a

export IMAGE_TAG="${1:-latest}"
SESSION_SECRET="$(aws ssm get-parameter --name "$SESSION_PARAM" --with-decryption \
  --query Parameter.Value --output text --region "$AWS_REGION")"
export SESSION_SECRET

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${ECR_URL%%/*}"

docker compose pull app
docker compose up -d --remove-orphans

# Wait for the container's own HEALTHCHECK to report healthy.
for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q app)" 2>/dev/null || echo starting)"
  if [ "$status" = "healthy" ]; then
    echo "Deployed ${ECR_URL}:${IMAGE_TAG} (healthy)"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 3
done

echo "Container did not become healthy" >&2
docker compose logs --tail 50 app >&2
exit 1
