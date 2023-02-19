#!/bin/bash

# Demander à l'utilisateur les informations nécessaires pour l'exportation
read -p "Nom de la base de données : " dbname
read -p "Nom de la table : " tablename
read -p "username DATABASE : " username

# Exporter la table dans un fichier SQL
mysqldump -u $username -p $dbname $tablename > $tablename.sql