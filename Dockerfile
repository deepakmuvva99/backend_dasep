# Use Node 20 as the base image
FROM node:20-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# We use --omit=dev to keep the image small
RUN npm install --omit=dev

# Copy the rest of the backend code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD [ "npm", "start" ]
