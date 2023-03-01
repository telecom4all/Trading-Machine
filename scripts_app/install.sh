#!/bin/bash
echo ""
echo -e "\e[33m***********************************\e[0m"
echo -e "\e[33m* INSTALLATION DE TRADING-MACHINE *\e[0m"
echo -e "\e[33m***********************************\e[0m"
echo ""

# Vérifier le système d'exploitation
if [ -f /etc/debian_version ]; then
    OS="debian"
    echo -e "\e[32mVersion de linux : $OS compatible avec TRADING-MACHINE\e[0m"
    echo ""
elif [ -f /etc/redhat-release ]; then
    OS="centos"
    echo -e "\e[31mVersion de linux : $OS non compatible avec TRADING-MACHINE\e[0m"
    exit 0
else
    OS="ubuntu"
    echo -e "\e[32mVersion de linux : $OS compatible avec TRADING-MACHINE\e[0m"
    echo ""
fi


echo -e "\e[34mMISE A JOUR DU SYSTEME \e[0m"
echo -e "\e[34m------------------------\e[0m"
echo ""
# mise a jour du systeme
sudo dpkg --configure -a
sudo apt-get update -y
sudo apt-get upgrade -y 
sudo mkdir /etc/letsencrypt/live/ -p
echo -e "\e[34mINSTALLATION DES DEPENDANCES \e[0m"
echo -e "\e[34m-----------------------------\e[0m"
echo ""
sudo apt-get install gcc g++ make -y
sudo apt-get install jq -y


echo -e "\e[34mINSTALLATION DE GIT \e[0m"
echo -e "\e[34m--------------------\e[0m"
echo ""
# Vérifier si git est installé
if ! command -v git &> /dev/null
then
    sudo apt-get install -y git
else
    echo -e "\e[32mGit est déjà installé sur ce système\e[0m"
fi

echo -e "\e[34mINSTALLATION DE NODEJS ET NPM \e[0m"
echo -e "\e[34m------------------------------\e[0m"
echo ""

# Vérifier si Node.js est installé et installer si nécessaire
if ! command -v node >/dev/null; then
    echo -e "\e[31mNode.js n'est pas installé.\e[0m"
    echo -e "\e[32mInstallation de nodejs ...\e[0m"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get update
    sudo apt-get install -y nodejs
else
    echo -e "\e[32mNode JS est déjà installé sur ce système\e[0m"
fi

# Vérifier npm est installé  et installer si nécessaire
if ! command -v npm >/dev/null; then
    echo -e "\e[31mNPM n'est pas installé.\e[0m"
    echo -e "\e[32mInstallation de NPM ...\e[0m"
    sudo apt-get install -y npm
else
    echo -e "\e[32mNPM est déjà installé sur ce système\e[0m"
fi

echo -e "\e[34mTELECHARGEMENT DE TRADING-MACHINE \e[0m"
echo -e "\e[34m----------------------------------\e[0m"
echo ""

git clone https://github.com/telecom4all/Trading-Machine.git
cd Trading-Machine
cd scripts_app
npm install
sudo npm install -g pm2

echo ""
echo -e "\e[34mINSTALLATION CERTBOT pour le HTTPS \e[0m"
echo -e "\e[34m------------------------------\e[0m"
echo ""
# Demande à l'utilisateur s'il veut installer CERTBOT
read -p $'\e[35mVoulez-vous installer CERTBOT pour le HTTPS (y/n)? \e[0m' answercertbot
if [[ $answercertbot == [Yy] || $answercertbot == [Yy][Ee][Ss] ]]; then
    # Installer les dépendances pour Certbot
    sudo apt-get install -y snapd
    snap install core
    snap refresh core
    snap install --classic certbot

    echo ""
    echo -e "\e[32mGénération des certificats SSL\e[0m"
    # Générer le certificat SSL avec Certbot
    # Demande le nom d'utilisateur, le mot de passe et le nom de la base de données
    read -p $'\e[35mEntrez le nom domaine du serveur: \e[0m' domaine
    read -p $'\e[35mEntrez une addresse email pour certbot: \e[0m' email
    
    mkdir /etc/letsencrypt/live/$domaine/ -p

    certbot certonly --standalone --agree-tos --non-interactive --email $email -d $domaine
    # Lancer le renouvellement automatique de Certbot avec un service systemd
    sudo systemctl enable certbot.timer
    sudo systemctl start certbot.timer
    echo ""
    echo -e "\e[32mCertificat SSL généré avec succès et le renouvellement automatique est activé.\e[0m"
    echo ""
else
  echo ""
fi

echo ""
echo -e "\e[34mINSTALLATION du Serveur MYSQL  \e[0m"
echo -e "\e[34m-------------------------------\e[0m"
echo ""

# Demande à l'utilisateur s'il veut installer MYSQL
read -p $'\e[35mVoulez-vous installer le Serveur MYSQL (y/n)? \e[0m' answermysql
if [[ $answermysql == [Yy] || $answermysql == [Yy][Ee][Ss] ]]; then
    sudo apt-get install mysql-server -y

    # Demande le nom d'utilisateur, le mot de passe et le nom de la base de données
    read -p $'\e[35mEntrez le nom de l utilisateur MySQL: \e[0m' username
    read -p $'\e[35mEntrez le mot de passe de l utilisateur MySQL: \e[0m' password
    read -p $'\e[35mEntrez le nom de la base de données MySQL: \e[0m' dbname
    
    # Se connecte en tant que root
    sudo mysql -u root <<MYSQL_SCRIPT
    # Vérifie si l'utilisateur et la base de données existent
    SELECT COUNT(*) FROM mysql.user WHERE User='$username' AND Host='localhost';
    SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '$dbname';
    
    # Si l'utilisateur et la base de données n'existent pas, on les crée avec tous les droits pour l'utilisateur
    SET @userExists = FOUND_ROWS();
    SET @dbNameExists = FOUND_ROWS();
    IF (@userExists = 0 AND @dbNameExists = 0) THEN
        CREATE USER '$username'@'localhost' IDENTIFIED BY '$password';
        CREATE DATABASE $dbname;
        GRANT ALL PRIVILEGES ON $dbname.* TO '$username'@'localhost';
        FLUSH PRIVILEGES;
        echo -e "\e[32mL'utilisateur et la base de données ont été créés avec succès.\e[0m"
    
    # Si l'utilisateur existe mais que la base de données n'existe pas, on crée la base de données et on donne tous les droits à l'utilisateur
    ELSEIF (@userExists > 0 AND @dbNameExists = 0) THEN
        CREATE DATABASE $dbname;
        GRANT ALL PRIVILEGES ON $dbname.* TO '$username'@'localhost';
        FLUSH PRIVILEGES;
        echo -e "\e[32mLa base de données a été créée avec succès.\e[0m"
    
    # Si la base de données existe mais que l'utilisateur n'existe pas, on crée l'utilisateur et on lui donne tous les droits sur la base de données
    ELSEIF (@userExists = 0 AND @dbNameExists > 0) THEN
        CREATE USER '$username'@'localhost' IDENTIFIED BY '$password';
        GRANT ALL PRIVILEGES ON $dbname.* TO '$username'@'localhost';
        FLUSH PRIVILEGES;
        echo -e "\e[32mL'utilisateur a été créé avec succès.\e[0m"
    
    # Sinon, l'utilisateur et la base de données existent déjà
    ELSE
        echo -e "\e[33mL'utilisateur et la base de données existent déjà.\e[0m"
    END IF;
    
MYSQL_SCRIPT

    # Vérifie la connexion à la base de données avec le nouvel utilisateur
    sudo mysql -u "$username" -p"$password" -e "use $dbname"
    if [ $? -eq 0 ]; then
        echo -e "\e[32mConnexion à la base de données réussie!\e[0m"
    else
        echo -e "\e[31mErreur de connexion à la base de données.\e[0m"
    fi

fi
    


echo ""
echo -e "\e[34mMODIFICATION DU FICHIER DE CONFIGURATION  \e[0m"
echo -e "\e[34m------------------------------------------\e[0m"
echo ""


cd ..
path_machine="$PWD"
newjson_file="$PWD/scripts_app/config_secret.json"
json_file="$PWD/jsons/configs/config_secret.json"
if [[ $answercertbot == [Yy] || $answercertbot == [Yy][Ee][Ss] ]]; then
     sed -i "s#\"sslKeyPath\" : \".*\"#\"sslKeyPath\" : \"/etc/letsencrypt/live/$domaine/privkey.pem\"#" $json_file
    sed -i "s#\"sslCertPath\": \".*\"#\"sslCertPath\": \"/etc/letsencrypt/live/$domaine/fullchain.pem\"#" $json_file

    
fi
sleep 2
if [[ $answermysql == [Yy] || $answermysql == [Yy][Ee][Ss] ]]; then
     sed -i "s#\"user\": \".*\"#\"user\": \"$username\"#" $json_file
    sed -i "s#\"password\": \".*\"#\"password\": \"$password\"#" $json_file
    sed -i "s#\"database\": \".*\"#\"database\": \"$dbname\"#" $json_file
    sed -i "s#\"mysql_active\": \".*\"#\"mysql_active\": \"true\"#" $json_file
fi

cd scripts_app


echo ""
echo -e "\e[34mRESUME  \e[0m"
echo -e "\e[34m------------------------------------------\e[0m"
echo ""
#sauvedarge des informations
echo -e "\e[33m********************************************************************************************************\e[0m" > informations.txt
echo -e "\e[33m********************************************************************************************************\e[0m" >> informations.txt
echo -e "\e[33m* Vous pourrez revoir ces informations ultérieurement dans le fichier :                                *\e[0m" >> informations.txt 
echo -e "\e[33m*                                                                                                      *\e[0m" >> informations.txt
echo -e "\e[33m*$path_machine/scripts_bash/informations.txt                                            *\e[0m" >> informations.txt
echo -e "\e[33m*                                                                                                      *\e[0m" >> informations.txt
echo -e "\e[33m*                                                                                                      *\e[0m" >> informations.txt

#affichage
echo -e "\e[33m********************************************************************************************************\e[0m" 
echo -e "\e[33m********************************************************************************************************\e[0m" 
echo -e "\e[33m* Vous pourrez revoir ces informations ultérieurement dans le fichier :                                *\e[0m" 
echo -e "\e[33m*                                                                                                      *\e[0m" 
echo -e "\e[33m*$path_machine/scripts_bash/informations.txt                                            *\e[0m"
echo -e "\e[33m*                                                                                                      *\e[0m" 
echo -e "\e[33m*                                                                                                      *\e[0m" 

if [[ $answercertbot == [Yy] || $answercertbot == [Yy][Ee][Ss] ]]; then
    echo -e "\e[33m* Voici les informations pour le HTTPS a mettre dans le fichier jsons/configs/config_secret.json       *\e[0m" >> informations.txt
    echo -e "\e[33m* Dans la partie node du fichierjsons/configs/config_secret.json changer ces infos :                   *\e[0m" >> informations.txt
    echo -e "\e[33m*                                                                                                      *\e[0m" >> informations.txt
    echo -e "\e[33m* 'sslKeyPath' : '/etc/letsencrypt/live/$domaine/privkey.pem',                                         *\e[0m" >> informations.txt
    echo -e "\e[33m* 'sslCertPath' : '/etc/letsencrypt/live/$domaine/fullchain.pem',                                      *\e[0m" >> informations.txt
    echo -e "\e[33m*                                                                                                      *\e[0m" >> informations.txt

    #affichage
    echo -e "\e[33m* Voici les informations pour le HTTPS a mettre dans le fichier jsons/configs/config_secret.json       *\e[0m" 
    echo -e "\e[33m* Dans la partie node du fichierjsons/configs/config_secret.json changer ces infos :                   *\e[0m" 
    echo -e "\e[33m*                                                                                                      *\e[0m" 
    echo -e "\e[33m* 'sslKeyPath' : '/etc/letsencrypt/live/$domaine/privkey.pem',                                         *\e[0m"
    echo -e "\e[33m* 'sslCertPath' : '/etc/letsencrypt/live/$domaine/fullchain.pem',                                      *\e[0m"
    echo -e "\e[33m*                                                                                                      *\e[0m" 

fi
if [[ $answermysql == [Yy] || $answermysql == [Yy][Ee][Ss] ]]; then
    echo -e "\e[33m* Voici les informations pour MYSQL a mettre dans le fichier jsons/configs/config_secret.json          *\e[0m" >> informations.txt
    echo -e "\e[33m* Dans la partie mysql du fichierjsons/configs/config_secret.json changer ces infos :                  *\e[0m" >> informations.txt
    echo -e "\e[33m*                                                                                                      *\e[0m" >> informations.txt
    echo -e "\e[33m* 'user' : '$username',                                                                                *\e[0m" >> informations.txt
    echo -e "\e[33m* 'password' : '$password',                                                                            *\e[0m" >> informations.txt
    echo -e "\e[33m* 'database' : '$dbname',                                                                              *\e[0m" >> informations.txt
    echo -e "\e[33m*                                                                                                      *\e[0m" >> informations.txt


    echo -e "\e[33m*                                                                                                      *\e[0m"
    echo -e "\e[33m* Voici les informations pour MYSQL a mettre dans le fichier jsons/configs/config_secret.json          *\e[0m" 
    echo -e "\e[33m* Dans la partie mysql du fichierjsons/configs/config_secret.json changer ces infos :                  *\e[0m"
    echo -e "\e[33m*                                                                                                      *\e[0m"
    echo -e "\e[33m* 'user' : '$username',                                                                                *\e[0m"
    echo -e "\e[33m* 'password' : '$password',                                                                            *\e[0m"
    echo -e "\e[33m* 'database' : '$dbname',                                                                              *\e[0m"


fi


echo -e "\e[33m*                                                                                                      *\e[0m" >> informations.txt
echo -e "\e[33m********************************************************************************************************\e[0m" >> informations.txt
echo -e "\e[33m********************************************************************************************************\e[0m" >> informations.txt


#affichage
echo -e "\e[33m*                                                                                                      *\e[0m"
echo -e "\e[33m********************************************************************************************************\e[0m"
echo -e "\e[33m********************************************************************************************************\e[0m"

cd $path_machine
npm install
sudo node TradingMachine.js