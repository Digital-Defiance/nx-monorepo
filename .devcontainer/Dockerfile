# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=16-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo tee /usr/share/keyrings/cloud.google.gpg

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
     && apt-get -y install --no-install-recommends apt-transport-https ca-certificates gnupg google-cloud-cli

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list -here>"

#RUN cd /workspaces/nx-monorepo/digital-defiance && yarn
#RUN cd /workspaces/nx-monorepo/digital-defiance/libs/stargate-256-core && yarn
#RUN cd /workspaces/nx-monorepo/digital-defiance/libs/stargate-N-core && yarn
#RUN cd /workspaces/nx-monorepo/digital-defiance/apps/stargate-256 && yarn
#RUN cd /workspaces/nx-monorepo/digital-defiance/apps/stargate-N && yarn
#RUN cd /workspaces/nx-monorepo/digital-defiance && npx nx build