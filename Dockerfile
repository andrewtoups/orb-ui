From ubuntu:latest
Run apt update && apt install -y python3 wget
Run wget https://github.com/sass/dart-sass/releases/download/1.32.5/dart-sass-1.32.5-linux-x64.tar.gz
Run tar xvf dart-sass-1.32.5-linux-x64.tar.gz
ENV PATH="/dart-sass:$PATH"
Add . /server
Workdir /server
Run sass styles/main.scss styles/main.css
Cmd python3 -m http.server 8080
