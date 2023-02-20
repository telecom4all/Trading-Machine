#!/bin/bash

# Couleurs
GREEN="\e[32m"
YELLOW="\e[33m"
RED="\e[31m"
NC="\e[0m" # reset color

# Chemin absolu du répertoire du script
script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Demander le nom d'utilisateur et le mot de passe MySQL
echo -n "Entrez le nom d'utilisateur MySQL : "
read username
echo -n "Entrez le nom dde la base de donnee MySQL : "
read dbname
echo -n "Entrez le mot de passe MySQL : "
read -s password


# Stocker le nom d'utilisateur et le mot de passe dans un fichier d'options
echo "[client]" > $script_dir/my.cnf
echo "user=$username" >> $script_dir/my.cnf
echo "password=$password" >> $script_dir/my.cnf
chmod 600 $script_dir/my.cnf

while true; do
  clear
  # Afficher le menu principal
  echo -e "${GREEN}Menu Principal :${NC}"
  echo "1. Afficher les tables dans la base de données $dbname"
  echo "2. Supprimer une table dans la base de données $dbname"
  echo "3. Quitter"
  echo ""

  # Demander le choix de l'utilisateur
  read -p "Entrez le numéro de l'option : " choice

  case $choice in
    1)
        # Afficher la liste des tables dans la base de données
        echo ""
        echo -e "${GREEN}Liste des tables dans la base de données $dbname :${NC}"
        mysql --defaults-extra-file=$script_dir/my.cnf -e "use $dbname; show tables;" | awk '{print NR-1, $0}'

        # Demander si l'utilisateur veut voir les entrées d'une table
        echo ""
        read -p "Voulez-vous voir les entrées d'une table ? (y/n) " confirm
        if [ "$confirm" == "y" ]; then
        # Demander le numéro de la table à afficher
        echo ""
        echo -n "Entrez le numéro de la table à afficher : "
        read table_number

        # Récupérer le nom de la table à afficher
        table_name=$(mysql --defaults-extra-file=$script_dir/my.cnf -N -B -e "use $dbname; show tables;" | sed -n "${table_number}p")

        # Afficher toutes les entrées de la table
        echo ""
        echo -e "${GREEN}Voici les entrées dans la table $table_name :${NC}"
        mysql --defaults-extra-file=$script_dir/my.cnf -e "use $dbname; select * from $table_name;"

        # Demander si l'utilisateur veut revenir au menu principal
        echo ""
        read -p "Appuyez sur 'm' pour revenir au menu principal ou sur n'importe quelle autre touche pour quitter : " confirm
        if [ "$confirm" == "m" ]; then
            # Revenir au menu principal
            continue
        else
            # Quitter le script
            break
        fi
        else
        # Demander si l'utilisateur veut revenir au menu principal
        echo ""
        read -p "Appuyez sur 'm' pour revenir au menu principal ou sur n'importe quelle autre touche pour quitter : " confirm
        if [ "$confirm" == "m" ]; then
            # Revenir au menu principal
            continue
        else
            # Quitter le script
            break
        fi
        fi
        ;;
    2)
      # Afficher la liste des tables dans la base de données
      echo ""
      echo -e "${GREEN}Liste des tables dans la base de données $dbname :${NC}"
      mysql --defaults-extra-file=$script_dir/my.cnf -e "use $dbname; show tables;" | awk '{print NR-1, $0}'

      # Demander le numéro de la table à supprimer
      echo ""
      echo -n "Entrez le numéro de la table à supprimer : "
      read table_number

      # Récupérer le nom de la table à supprimer
      table_name=$(mysql --defaults-extra-file=$script_dir/my.cnf -N -B -e "use $dbname; show tables;" | sed -n "${table_number}p")

      # Afficher toutes les entrées de la table
      echo ""
      echo -e "${GREEN}Voici les entrées dans la table $table_name :${NC}"
      mysql --defaults-extra-file=$script_dir/my.cnf -e "use $dbname; select * from $table_name;"

      # Demander confirmation avant de supprimer la table
      echo ""
      read -p "Vous êtes sur le point de supprimer la table $table_name dans la base de données $dbname. Voulez-vous continuer ? (y/n) " confirm
      if [ "$confirm" == "y" ]; then
        # Supprimer la table
        mysql --defaults-extra-file=$script_dir/my.cnf -e "use $dbname; drop table $table_name;"
        echo -e "${GREEN}La table $table_name a été supprimée avec succès de la base de données $dbname.${NC}"
      else
        echo -e "${YELLOW}La table n'a pas été supprimée.${NC}"
      fi
      ;;
    3)
      # Quitter le script
      echo ""
      echo -e "${GREEN}Merci d'avoir utilisé ce script. À bientôt !${NC}"
      exit
      ;;
    *)
      # Afficher un message d'erreur en cas de choix invalide
      echo ""
      echo -e "${RED}Choix invalide. Veuillez entrer un numéro valide.${NC}"
      ;;
  esac
done
