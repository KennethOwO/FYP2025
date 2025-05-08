# Stage 1: Builder Stage
FROM ubuntu:20.04 AS builder
WORKDIR /app


# Install dependencies
RUN apt-get update && apt-get install -y curl wget xz-utils

# Download and extract Node.js 20.11.1
RUN wget https://nodejs.org/dist/v20.11.1/node-v20.11.1-linux-x64.tar.xz
RUN tar -xf node-v20.11.1-linux-x64.tar.xz

# Move Node.js binaries to /usr/local
RUN cp -r node-v20.11.1-linux-x64/* /usr/local/

# Verify the Node.js version
RUN node -v
RUN npm -v

# Copy  package.json and package-lock.json
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application using the environment file (like .env.staging)
RUN npm run build

RUN apt-get install -y openssh-server

RUN useradd -rm -d /home/neuon -s /bin/bash -g root -G sudo -u 1000 neuon
RUN echo 'neuon:jason2024' | chpasswd
RUN apt-get -y install sudo
RUN apt-get -y install nano
RUN adduser neuon sudo
RUN mkdir /var/run/sshd
EXPOSE 22
EXPOSE 5173  

RUN apt-get install -y dos2unix
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN dos2unix /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]


# entrypoint.sh
# Start the SSH daemon
# entrypoint.sh
# Start the SSH daemon
# CMD [ "/usr/sbin/sshd", "&", "npm", "run", "dev"]

# Start Nginx in the foreground
# CMD ["nginx", "-g", "daemon off;"]