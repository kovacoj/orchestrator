## Install on wsl cloudflared

curl -L -o /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i /tmp/cloudflared.deb
cloudflared --version

## Run opencode server

opencode serve \
                                 --port 4096 \
                                 --hostname 127.0.0.1 \
                                 --cors https://insight-buddy-702.lovable.app

## Give loveable the url of cloudflared to communicate
