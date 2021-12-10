FROM nginx:1.20.0-alpine as build

LABEL name="mia-microlc-notification-center" \
      description="Notification center web component" \
      eu.mia-platform.url="https://www.mia-platform.eu" \
      eu.mia-platform.version="0.1.0"

COPY nginx /etc/nginx

RUN touch ./off \
  && chmod o+rw ./off \
  && echo "micro-lc-notification-center: $COMMIT_SHA" >> /etc/nginx/commit.sha

WORKDIR /usr/static

COPY ./dist/micro-lc-notification-center .

USER nginx
