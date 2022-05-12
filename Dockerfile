FROM nginx:1.20.0-alpine as build

LABEL name="mia-microlc-notification-center" \
      description="Notification center web component" \
      eu.mia-platform.url="https://www.mia-platform.eu" \
      eu.mia-platform.version="0.1.0"

ARG RELEASE_MODE=release

RUN touch ./off \
  && chmod o+rw ./off \
  && echo "micro-lc-notification-center: $COMMIT_SHA" >> /etc/nginx/commit.sha

COPY nginx /etc/nginx

WORKDIR /etc/nginx/conf.d
RUN mv website.${RELEASE_MODE}.conf website.conf

WORKDIR /usr/static
COPY ./dist/unpkg .

USER nginx
