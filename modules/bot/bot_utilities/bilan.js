
const fs = require('fs');
const logger = require('../../logger');



async function getBilan(config, amount, filePath, etiquette_bot) {
    try {
        // Vérifie si le fichier existe
        if (!fs.existsSync(filePath)) {
            // Si le fichier n'existe pas, on le crée avec une structure de base
            const initialData = {
                evolution: []
            };
            
            fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
        }

        let addAmount = await addNewAmount(config, amount, filePath, etiquette_bot);
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentDate = now.getDate();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        let soldeMinAnnee=amount;
        let jourMinAnnee=0;
        let moisMinAnnee=0;
        let anneeMinAnnee=0;
        let heureMinAnnee=0;

        let soldeMinMois=amount;
        let jourMinMois=0;
        let moisMinMois=0;
        let anneeMinMois=0;
        let heureMinMois=0;

        let soldeMinJour=amount;
        let jourMinJour=0;
        let moisMinJour=0;
        let anneeMinJour=0;
        let heureMinJour=0;

        let soldeMaxAnnee=amount;
        let jourMaxAnnee=0;
        let moisMaxAnnee=0;
        let anneeMaxAnnee=0;
        let heureMaxAnnee=0;

        let soldeMaxMois=amount;
        let jourMaxMois=0;
        let moisMaxMois=0;
        let anneeMaxMois=0;
        let heureMaxMois=0;

        let soldeMaxJour=amount;
        let jourMaxJour=0;
        let moisMaxJour=0;
        let anneeMaxJour=0;
        let heureMaxJour=0;

        let solde6heures=0;
        let solde12heures=0;
        let solde1jours=0;
        let solde3jours=0;
        let solde7jours=0;
        let solde14jours=0;
        let solde1mois=0;
        let solde2mois=0;
        let soldeLastExec=0;

        const historiquesSoldes = JSON.parse(fs.readFileSync(filePath, 'utf-8')).evolution;
        
        historiquesSoldes.forEach((historique) => {
            
            const date = historique.date;
            const hour = historique.heure;
            const amount = historique.montant;
            const dateArray = date.split('-');
            const annee = parseInt(dateArray[0], 10);
            const mois = parseInt(dateArray[1], 10);
            const jour = parseInt(dateArray[2], 10);
            const hourArray = hour.split(':');
            const heure = parseInt(hourArray[0], 10);
            const minutes = parseInt(hourArray[1], 10);
            const solde = parseFloat(amount)

            
            // 1. permet de trouver le jour où vous avez eu le plus petit montant cette année
            if (soldeMinAnnee>solde && annee==currentYear) {
                soldeMinAnnee=solde;
                jourMinAnnee=jour;
                moisMinAnnee=mois;
                anneeMinAnnee=annee;
                heureMinAnnee=heure;
            }

            // 2. permet de trouver le jour où vous avez eu le plus petit montant ce mois-ci
            if (soldeMinMois>solde && annee==currentYear && mois==currentMonth) {
                soldeMinMois=solde;
                jourMinMois=jour;
                moisMinMois=mois;
                anneeMinMois=annee;
                heureMinMois=heure;   
            }

            // 3. permet de trouver l'heure où vous avez eu le plus petit montant aujourd'hui
            if (soldeMinJour>solde && annee==currentYear && mois==currentMonth && jour==currentDate) {
                soldeMinJour=solde;
                jourMinJour=jour;
                moisMinJour=mois;
                anneeMinJour=annee;
                heureMinJour=heure;
            }

            // 4. permet de trouver le jour où vous avez eu le plus gros montant cette année
            if (soldeMaxAnnee<solde && annee==currentYear) {
                soldeMaxAnnee=solde;
                jourMaxAnnee=jour;
                moisMaxAnnee=mois;
                anneeMaxAnnee=annee;
                heureMaxAnnee=heure;
            }

            // 5. permet de trouver le jour où vous avez eu le plus gros montant ce mois-ci
            if (soldeMaxMois<solde && annee==currentYear && mois==currentMonth) {
                soldeMaxMois=solde;
                jourMaxMois=jour;
                moisMaxMois=mois;
                anneeMaxMois=annee;
                heureMaxMois=heure;
            }

            // 6. permet de trouver l'heure où vous avez eu le plus gros montant aujourd'hui
            if (soldeMaxJour<solde && annee==currentYear && mois==currentMonth && jour==currentDate) {
                soldeMaxJour=solde;
                jourMaxJour=jour;
                moisMaxJour=mois;
                anneeMaxJour=annee;
                heureMaxJour=heure;
            }
            
            // 7. permet de trouver le montant de 6 heures auparavant
            if (currentHour<=6) {
                if ((currentDate-1==jour) && (currentMonth==mois) && (currentYear==annee)){
                    if((24-(6-currentHour)==heure)){
                        solde6heures=solde;
                    }
                }
                if(currentDate==1 && ((currentMonth-1==mois) && (currentYear==annee)) || ((currentMonth==1) && (currentYear-1==annee) && (jour==31))){
                    if((24-(6-currentHour)==heure)){
                        solde6heures=solde;
                    }
                }
            }
            else if( (currentHour-6==heure) && (currentDate==jour) && (currentMonth==mois) && (currentYear==annee) ){
                solde6heures=solde;
            }

            // 8. permet de trouver le montant de 12 heures auparavant
            if (currentHour <= 12) {
                if ((currentDate-1==jour) && (currentMonth==mois) && (currentYear==annee)){
                    if((24-(12-currentHour)==heure)){
                        solde12heures=solde;
                    }
                    else if(currentDate==1 && ((currentMonth-1==mois) && (currentYear==annee)) || ((currentMonth==1) && (currentYear-1==annee) && (jour==31))){
                        if((24-(12-currentHour)==heure)){
                            solde12heures=solde;
                        }
                    }
                }
            }
            else if( (currentHour-12==heure) && (currentDate==jour) && (currentMonth==mois) && (currentYear==annee) ){
                solde12heures=solde;
            }

            // 9. permet de trouver le montant de 1 jours auparavant
            if (currentDate<=1) {
                if ((currentMonth-1==mois) && (currentYear==annee))  {
                    if (mois==1 || mois==3 || mois==5 || mois==7 || mois==8 || mois==10 || mois==12) {
                        if((31-currentDate+1==jour)){
                            solde1jours=solde;
                        }
                        else{
                            if((30-currentDate+1==jour)){
                                solde1jours=solde;
                            }
                        }
                    }
                }
                if (((currentMonth==1 && mois==12) && (currentYear-1==annee))) {
                    if (mois==1 || mois==3 || mois==5 || mois==7 || mois==8 || mois==10 || mois==12) {
                        if((31-currentDate+1==jour)){
                            solde1jours=solde;
                        }
                        else{
                            if((30-currentDate+1==jour)){
                                solde1jours=solde;
                            }
                        }
                    }
                }
            }
            else if( (currentDate-1==jour) && (currentMonth==mois) && (currentYear==annee) ){
                solde1jours=solde;
            }
            
            // 10. permet de trouver le montant de 3 jours auparavant
            if(currentDate<=3){
                if (((currentMonth-1==mois) && (currentYear==annee)) || ((currentMonth==1 && mois==12) && (currentYear-1==annee))){
                    if (mois==1 || mois==3 || mois==5 || mois==7 || mois==8 || mois==10 || mois==12){
                        if((31-currentDate+3==jour)){
                            solde3jours=solde;
                        }
                    }
                    else{
                        if((30-currentDate+3==jour)){
                            solde3jours=solde;
                        }
                    }
                }
            }
            else if ( (currentDate-3==jour) && (currentMonth==mois) && (currentYear==annee) ){
                solde3jours=solde ;
            }

            // 11. permet de trouver le montant de 7 jours auparavant
            if(currentDate<=7){
                if (((currentMonth-1==mois) && (currentYear==annee)) || ((currentMonth==1 && mois==12) && (currentYear-1==annee))) {
                    if (mois==1 || mois==3 || mois==5 || mois==7 || mois==8 || mois==10 || mois==12){
                        if((31-currentDate+7==jour)){
                            solde7jours=solde;
                        }
                    }   
                    else{
                        if((30-currentDate+7==jour)){
                            solde7jours=solde;
                        }
                    }     
                }
            }
            else if ( (currentDate-7==jour) && (currentMonth==mois) && (currentYear==annee) ){
                solde7jours=solde;
            }

            // 12. permet de trouver le montant de 14 jours auparavant
            if(currentDate<=14){
                if (((currentMonth-1==mois) && (currentYear==annee)) || ((currentMonth==1 && mois==12) && (currentYear-1==annee))) {
                    if (mois==1 || mois==3 || mois==5 || mois==14 || mois==8 || mois==10 || mois==12){
                        if((31-currentDate+14==jour)){
                            solde14jours=solde;
                        }
                    }
                    else{
                        if((30-currentDate+14==jour)){
                            solde14jours=solde;     
                        }
                    }
                }
            }
            else if ( (currentDate-14==jour) && (currentMonth==mois) && (currentYear==annee) ){
                solde14jours=solde;
            }

            // 13. permet de trouver le montant de 1 mois auparavant
            if(currentMonth==1 && mois==12 && annee==currentYear-1 && currentDate==jour){
                solde1mois=solde;
            }
            else if(currentMonth-1==mois && annee==currentYear && currentDate==jour){
                solde1mois=solde;
            }
            
            // 14. permet de trouver le montant de 2 mois auparavant
            if(currentMonth==1 && mois==11 && annee==currentYear-1 && currentDate==jour){
                solde2mois=solde;
            }
            if(currentMonth==2 && mois==12 && annee==currentYear-1 && currentDate==jour){
                solde2mois=solde;
            }
            else if(currentMonth-2==mois && annee==currentYear && currentDate==jour){
                solde2mois=solde
            }
            
            soldeLastExec=amount;

            
        });
    
        
        const result = {
            soldeMinAnnee,
			jourMinAnnee,
			moisMinAnnee,
			anneeMinAnnee,
			heureMinAnnee,
			soldeMinMois,
			jourMinMois,
			moisMinMois,
			anneeMinMois,
			heureMinMois,
			soldeMinJour,
			jourMinJour,
			moisMinJour,
			anneeMinJour,
			heureMinJour,
			soldeMaxAnnee,
			jourMaxAnnee,
			moisMaxAnnee,
			anneeMaxAnnee,
			heureMaxAnnee,
			soldeMaxMois,
			jourMaxMois,
			moisMaxMois,
			anneeMaxMois,
			heureMaxMois,
			soldeMaxJour,
			jourMaxJour,
			moisMaxJour,
			anneeMaxJour,
			heureMaxJour,
			solde6heures,
			solde12heures,
			solde1jours,
			solde3jours,
			solde7jours,
			solde14jours,
			solde1mois,
			solde2mois,
			soldeLastExec
        };
    
    
        
      //  console.log(result)
        return result;
            
    } catch (error) {
        logger.error(etiquette_bot + " " + error)
        return false;
    }
    
}


async function addNewAmount(config, amount, filePath, etiquette_bot) {
    try {
        // Vérifie si le fichier existe
        if (!fs.existsSync(filePath)) {
            // Si le fichier n'existe pas, on le crée avec une structure de base
            const initialData = {
            evolution: []
            };
            
            fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
        }
        
        // Récupère les données du fichier
        const historiquesSoldes = JSON.parse(fs.readFileSync(filePath, 'utf8')).evolution;
        
        // Récupère la date et l'heure actuelle
        const now = new Date();
        const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        const hour = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        
        // Ajoute le nouveau montant à la liste des historiques
        historiquesSoldes.push({
            date,
            heure: hour,
            montant: amount
        });
        
        // Enregistre les données mises à jour dans le fichier
        fs.writeFileSync(filePath, JSON.stringify({ evolution: historiquesSoldes }, null, 2), 'utf8');   
        logger.info(etiquette_bot + "Entrée ajouté dans le fichier : " + filePath)
        return true; 
    } catch (error) {
        logger.error(etiquette_bot + " " + error)
        return false;
    }
    
}

async function getBilanPerf(config, data, etiquette_bot) {
    //console.log(data)
    let message = "\n===================\n";
    message += "Bilan de performance :\n";
    if (typeof data.soldeMaxJour !== 'undefined') {
        soldeMaxJour = round(data.soldeMaxJour, 3);
        message += ` - Best solde aujourd'hui : ${data.soldeMaxJour}$ à ${data.heureMaxJour}h \n`;
    }
    if (typeof soldeMaxMois !== 'undefined') {
        soldeMaxMois = round(soldeMaxMois, 3);
        message += ` - Best solde ce mois-ci : ${data.soldeMaxMois}$ le ${data.jourMaxMois}/${data.moisMaxMois} à ${data.heureMaxMois}h \n`;
    }
    if (typeof soldeMaxAnnee !== 'undefined') {
        soldeMaxAnnee = round(soldeMaxAnnee, 3);
        message += ` - Best solde cette année : ${data.soldeMaxAnnee}$ le ${data.jourMaxAnnee}/${data.moisMaxAnnee}/${data.anneeMaxAnnee} à ${data.heureMaxAnnee}h \n`;
    }
    message += " ";
    if (typeof soldeMinJour !== 'undefined') {
        soldeMinJour = round(soldeMinJour, 3);
        message += ` - Pire solde aujourd'hui : ${data.soldeMinJour}$ à ${data.heureMinJour}h \n`;
    }
    if (typeof soldeMinMois !== 'undefined') {
        soldeMinMois = round(soldeMinMois, 3);
        message += ` - Pire solde ce mois-ci : ${data.soldeMinMois}$ le ${data.jourMinMois}/${data.moisMinMois} à ${data.heureMinMois}h \n`;
    }
    if (typeof soldeMinAnnee !== 'undefined') {
        soldeMinAnnee = round(soldeMinAnnee, 3);
        message += ` - Pire solde cette année : ${data.soldeMinAnnee}$ le ${data.jourMinAnnee}/${data.moisMinAnnee}/${data.anneeMinAnnee} à ${data.heureMinAnnee}h \n`;
    }
    return message;

}

async function getEvolutionContinue(config, data, etiquette_bot) {
    let message = "";
    let gain = 0;
    let bonus = 0;
    if (typeof data.soldeLastExec !== 'undefined') {
        let bonus = 100 * (data.todaySolde - data.soldeLastExec) / data.soldeLastExec;
        gain = round(bonus / 100 * data.soldeLastExec, 5);
        bonus = round(bonus, 3);
        gain = round(gain, 5);
        let soldeLastExecRounded = round(data.soldeLastExec, 3);
      
        if (gain < 0) {
          message += ` - Dernière execution du bot : ${bonus}% (${soldeLastExecRounded}$ ${gain}$) \n`;
        } else {
          message += ` - Dernière execution du bot : +${bonus}% (${soldeLastExecRounded}$ +${gain}$) \n`;
        }
      }
      
      if (typeof data.solde6heures !== 'undefined') {
        bonus = 100 * (data.todaySolde - data.solde6heures) / data.solde6heures;
        gain = round(bonus / 100 * data.todaySolde, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        solde6heures = round(data.solde6heures, 3);
      
        if ( gain < 0) {
          message += ` - il y a 6h : ${bonus}% (${solde6heures}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 6h : +${bonus}% (${solde6heures}$ +${gain}$) \n`;
        }
      }
      
      if (typeof data.solde12heures !== 'undefined') {
        bonus = 100 * (data.todaySolde - data.solde12heures) / data.solde12heures;
        gain = round(bonus / 100 * data.todaySolde, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        solde12heures = round(data.solde12heures, 3);
      
        if ( gain < 0) {
          message += ` - il y a 12h : ${bonus}% (${solde12heures}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 12h : +${bonus}% (${solde12heures}$ +${gain}$) \n`;
        }
      }

      if (typeof data.solde1jours !== 'undefined') {
        bonus = 100 * (data.todaySolde - data.solde1jours) / data.solde1jours;
        gain = round(bonus / 100 * data.todaySolde, 2);
        bonus = round(bonus, 3);
        gain = round(gain, 5);
        solde1jours = round(data.solde1jours, 5);
      
        if (gain < 0) {
          message += ` - il y a 1j : ${bonus}% (${solde1jours}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 1j : +${bonus}% (${solde1jours}$ +${gain}$) \n`;
        }
      }
      
      if (typeof data.solde3jours !== 'undefined') {
        bonus = 100 * (data.todaySolde - data.solde3jours) / data.solde3jours;
        gain = round(bonus / 100 * data.todaySolde, 2);
        bonus = round(bonus, 3);
        gain = round(gain, 5);
        solde3jours = round(data.solde3jours, 3);
      
        if ( gain < 0) {
          message += ` - il y a 3j : ${bonus}% (${solde3jours}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 3j : +${bonus}% (${solde3jours}$ +${gain}$) \n`;
        }
      }
      
      if (typeof data.solde7jours !== 'undefined') {
        bonus = 100 * (data.todaySolde - data.solde7jours) / data.solde7jours;
        gain = round(bonus / 100 * data.todaySolde, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        solde7jours = round(data.solde7jours, 3);
      
        if ( gain < 0) {
          message += ` - il y a 7j : ${bonus}% (${solde7jours}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 7j : +${bonus}% (${solde7jours}$ +${gain}$) \n`;
        }
      }

      if (typeof data.solde14jours !== 'undefined') {
        bonus = 100 * (data.todaySolde - data.solde14jours) / data.solde14jours;
        gain = round(bonus / 100 * data.todaySolde, 2);
        bonus = round(bonus, 3);
        gain = round(gain, 5);
        solde14jours = round(data.solde14jours, 3);
        if (gain < 0) {
          message += ` - il y a 14j : ${bonus}% (${solde14jours}$ ${ gain}$) \n`;
        } else {
          message += ` - il y a 14j : +${bonus}% (${solde14jours}$ +${ gain}$) \n`;
        }
      }
      
      if (typeof data.solde1mois !== 'undefined') {
        bonus = 100 * (data.todaySolde - data.solde1mois) / data.solde1mois;
        gain = round(bonus / 100 * data.todaySolde, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        solde1mois = round(data.solde1mois, 3);
        if ( gain < 0) {
          message += ` - il y a 1 mois : ${bonus}% (${solde1mois}$ ${ gain}$) \n`;
        } else {
          message += ` - il y a 1 mois : +${bonus}% (${solde1mois}$ +${ gain}$) \n`;
        }
      }
      
      if (typeof data.solde2mois !== 'undefined') {
        bonus = 100 * (data.todaySolde - data.solde2mois) / data.solde2mois;
        gain = round(bonus / 100 * data.todaySolde, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        solde2mois = round(data.solde2mois, 3);
        if ( gain < 0) {
          message += ` - il y a 2 mois : ${bonus}% (${solde2mois}$ ${ gain}$) \n`;
        } else {
          message += ` - il y a 2 mois : +${bonus}% (${solde2mois}$ +${ gain}$) \n`;
        }
      }


    return message;
}


async function getResume(config, data, etiquette_bot) {
    let totalInvestment = config.historique.totalInvestment;
    let bonus = 100 * (data.todaySolde - totalInvestment) / totalInvestment;
    let gain = Math.round((bonus / 100) * totalInvestment * 1000) / 1000;
    bonus = Math.round(bonus * 1000) / 1000;
    totalInvestment = Math.round(totalInvestment * 100000) / 100000;

    let message = `\n===================\n`;
    message += `INVESTISSEMENT INITIAL => ${totalInvestment}$ \n`;

    if ( gain < 0 ) {
    message += `PERTE TOTAL => ${gain} $ (${bonus}%)\n`;
    } else {
    message += `gain TOTAL => +${gain} $ (+${bonus}%)\n`;
    }

    message += `SOLDE TOTAL => ${data.soldeLastExec}$`;
    message += `N'hésitez pas à me soutenir pour le travail du bot :\n`;
    message += `• Adresse BTC : 1CetuWt9PuppZ338MzBzQZSvtMW3NnpjMr\n`;
    message += `• Adresse ETH (Réseau ERC20) : 0x18f71abd7c2ee05eab7292d8f34177e7a1b62236\n`;
    message += `• Adresse SOL : AsLvBCG1fpmpaueTYBmU5JN5QKVkt9a1dLR44BAGUZbV\n`;
    message += `• Adresse MATIC : 0x18f71abd7c2ee05eab7292d8f34177e7a1b62236\n`;
    message += `• Adresse BNB : 0x18f71abd7c2ee05eab7292d8f34177e7a1b62236\n`;

    message = message.replace('-USDT', '');
    message = message.replace(', ', ' ');

    return message;
}

const round = (value, decimals) => {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

module.exports = { getBilan, addNewAmount , getBilanPerf, getEvolutionContinue, getResume};