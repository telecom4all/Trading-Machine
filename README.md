# Trading-Machine

Ce projet est un bot de trading qui peut également être utilisé en mode manuel.

## Installation

1. Clonez le dépôt `git clone https://github.com/telecom4all/Trading-Machine.git`
2. Accédez au dossier `cd Trading-Machine`
3. Accédez au dossier des scripts `cd scripts_app`
4. Exécutez le script d'installation `sudo bash install.sh`
5. Installer la lib bcrypt pour le cryptage de mot de passe `npm install bcrypt` 
6. Cryptez votre nouveau mot de passe en exécutant `node crypt_password.js`
7. Accédez au dossier principal `cd ..`
8. Installez les dépendances `npm install`
9. Modifiez le fichier `Trading-Machine/jsons/configs/config_secret.json` avec les informations pour l'échange et pour HTTPS que le script d'installation a fourni, ainsi que votre nouveau mot de passe. 
    Le mot de passe par défaut est `123456`. 
    Si vous voulez activer HTTPS, modifiez `"isSSL": true` et ajoutez les valeurs reçues du fichier d'installation `"sslKeyPath" : "/etc/letsencrypt/live/xxxxxx/privkey.pem"` et `"sslCertPath": "/etc/letsencrypt/live/xxxxxx/fullchain.pem"`.
10. Pour tester si tout va bien  `sudo node /home/<xxxxx>/Trading-Machine/TradingMachine.js`
    
11. Pour démarrer le noeud, exécutez `sudo pm2 start /home/<xxxxx>/Trading-Machine/TradingMachine.js --name "Bots" --log /home/<xxxxx>/Trading-Machine/logs/pm2.log`
12. Pour redémarrer le noeud, exécutez `sudo pm2 restart 0`
13. Pour forcer la sauvegarde du noeud, exécutez `pm2 save --force`
    
14. Toujours redémarrer le noeud après toute modification dans les fichiers `config.json` et `config_secret.json` en exécutant `sudo pm2 restart 0`.


## Utilisation

Une fois le noeud démarré, le bot de trading devrait fonctionner automatiquement. Vous pouvez également utiliser le bot en mode manuel.
