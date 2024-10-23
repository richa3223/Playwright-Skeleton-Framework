#The version of the image should always match the playwright version from package.json
FROM mcr.microsoft.com/playwright:v1.46.0-jammy  

#Copy all the files to the container
COPY . /app

#Grant permissions to the entrypoint script
RUN chmod u+x /app/docker-entrypoint.sh &&\
    chmod -R 777 /app

#Switch to the pwuser user
USER pwuser
WORKDIR /app

ENTRYPOINT [ "./docker-entrypoint.sh" ]