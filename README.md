# Trading-Machine
Mix Bot de trading et trade manuel

cd Trading-Machine

cd scripts_app

sudo bash install.sh

crypter le nouveau mot de passe :

node crypt_password.js




cd ..

npm install



modifier le fichier : Trading-Machine/jsons/configs/config_secret.json avec les infos pour l'exchange et pour https que le script d'install a donné et le nouveau mot de passe 

le mot de passe par defaut est : 123456

si on veut activer le https changer 
"isSSL": true,
et mettre les valeur recu du fichier d'installation
"sslKeyPath" : "/etc/letsencrypt/live/xxxxxx/privkey.pem",
"sslCertPath": "/etc/letsencrypt/live/xxxxxx/fullchain.pem",



pour démaré le node:
sudo pm2 start /home/<xxxxx>/Trading-Machine/TradingMachine.js --name "Bots" --log /home/<xxxxx>/Trading-Machine/logs/pm2.log


pour redemarer le node
sudo pm2 restart 0


pour forcer la sauvegarde du node
pm2 save --force


toujours redémare le node apres un changement dans les fichier de config.json et config_secret.json
sudo pm2 restart 0