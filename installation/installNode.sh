#!/bin/bash

# Check if domain name and email were provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide a domain name and email address"
    exit 1
fi

# Vérifier si l'utilisateur a les droits d'administration
if [ "$EUID" -ne 0 ]
  then echo "Ce script doit être exécuté en tant qu'administrateur."
  exit
fi

# Vérifier le système d'exploitation
if [ -f /etc/debian_version ]; then
    OS="debian"
    PKG_MANAGER="apt-get"
    # Installer les dépendances pour Certbot
    $PKG_MANAGER update
    $PKG_MANAGER install -y software-properties-common
    add-apt-repository ppa:certbot/certbot
    $PKG_MANAGER update
elif [ -f /etc/redhat-release ]; then
    OS="centos"
    PKG_MANAGER="yum"
    # Installer les dépendances pour Certbot
    $PKG_MANAGER install -y epel-release
    $PKG_MANAGER install -y certbot python2-certbot-apache
else
    OS="ubuntu"
    PKG_MANAGER="apt-get"
    # Installer les dépendances pour Certbot
    $PKG_MANAGER update
    $PKG_MANAGER install -y software-properties-common
    add-apt-repository ppa:certbot/certbot
    $PKG_MANAGER update
fi

# Vérifier si Node.js et npm sont installés et installer si nécessaire
if ! command -v node >/dev/null; then
    echo "Node.js n'est pas installé. Installation..."
    curl -sL https://deb.nodesource.com/setup_18.x | bash -
    $PKG_MANAGER install -y nodejs
fi

if ! command -v npm >/dev/null; then
    echo "npm n'est pas installé. Installation..."
    $PKG_MANAGER install -y npm
fi

# Vérifier si la version de Node.js est >= 18.12.1
if node -v | grep -vqE "v1[0-8]\.|v1[0-7]$|v1[0-6]\."; then
    echo "Node.js version >= 18.12.1 trouvée."
else
    echo "Node.js version >= 18.12.1 n'est pas trouvée. Installation..."
    curl -sL https://deb.nodesource.com/setup_18.x | bash -
    $PKG_MANAGER install -y nodejs
fi

# Vérifier si la version de npm est >= 18.12.1
if npm -v | grep -vqE "6\.([0-9]|[1-9][0-9])\."; then
    echo "npm version >= 6.0.0 trouvée."
else
    echo "npm version >= 6.0.0 n'est pas trouvée. Installation..."
    $PKG_MANAGER install -y npm
fi

# Générer le certificat SSL avec Certbot
## test si ubuntu sudo sinon su -s
certbot certonly --standalone --agree-tos --non-interactive --email $2 -d $1



# Afficher les informations nécessaires pour le projet Node.js avec Express
echo "Certificat SSL généré avec succès."
echo "Le chemin vers le certificat est : /etc/letsencrypt/live/$1/fullchain.pem"
echo "Le chemin vers la clé privée est : /etc/letsencrypt/live/$1/privkey.pem"
