FROM twentycrm/twenty:latest

ENV NODE_PORT=3000 \
    PORT=3000 \
    DISABLE_DB_MIGRATIONS=true \
    DISABLE_CRON_JOBS_REGISTRATION=true \
    NODE_OPTIONS="--max-old-space-size=400"
