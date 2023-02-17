# Demander à l'utilisateur les informations nécessaires pour l'importation
read -p "Nom de la base de données sur le serveur de destination : " destination_dbname
read -p "Nom d'utilisateur du serveur de destination : " username
read -p "Mot de passe du serveur de destination : " password

read -p "Fichier a importer : " file

# Importer la table dans la base de données sur le serveur de destination
mysql -u $username -p$password $destination_dbname < $file
echo "Importation Terminé"