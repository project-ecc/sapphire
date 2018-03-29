FROM electronuserland/builder:wine

RUN mkdir /sapphire && \
    npm install -g yarn --loglevel error

# Install node_modules
COPY package.json /tmp
WORKDIR /tmp
RUN yarn
RUN mv /tmp/node_modules /sapphire

COPY . /sapphire
WORKDIR /sapphire

CMD ["yarn", "package-all"]

