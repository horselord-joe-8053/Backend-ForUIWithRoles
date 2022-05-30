FROM node:16.3.0-alpine

# set working directory for the docker container
WORKDIR /backend

# add `/app/node_modules/.bin` to $PATH
ENV PATH /backend/node_modules/.bin:$PATH

# install app dependencies
COPY package*.json ./
RUN npm ci

# add app
COPY . ./

# expose the port for the container
EXPOSE 8080

# start app
# ENTRYPOINT v.s. CMD: https://stackoverflow.com/a/39408777
CMD [ "npm", "start" ]
