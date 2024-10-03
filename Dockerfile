FROM node:latest as builder

WORKDIR /build

COPY package*.json .

RUN npm install

COPY ./src/ ./src

COPY ./tsconfig.json .

RUN npm run build

FROM ubuntu:latest as workspace

ENV USERNAME devil
ENV NODE_VERSION 20.15.0
ENV NVM_DIR /home/$USERNAME/.nvm
ENV RUN_IN_CONTAINER=true

RUN apt update && apt install -qy \
    curl \
    build-essential \
    python3 \
    python3-pip \
    sudo \
    vim

# Create a new user and add to sudo group
RUN useradd -m -s /bin/bash $USERNAME && \
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

RUN mkdir $NVM_DIR

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

RUN . $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm use $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    ln -s $NVM_DIR/versions/node/v$NODE_VERSION/bin/node /usr/bin/node && \
    ln -s $NVM_DIR/versions/node/v$NODE_VERSION/bin/npm /usr/bin/npm

# Add NVM to PATH
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN chown -R $USERNAME:$USERNAME $NVM_DIR

WORKDIR /workspace

RUN chown -R $USERNAME:$USERNAME /workspace

USER $USERNAME

COPY --chown=$USERNAME:$USERNAME --from=builder /build/package*.json .

RUN npm i

COPY --chown=$USERNAME:$USERNAME --from=builder /build/dist ./dist

CMD ["npm", "start"]