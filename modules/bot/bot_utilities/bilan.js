
const fs = require('fs');
const logger = require('../../logger');



function timestampToDate(timestamp) {
    let date = new Date(timestamp);
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString();
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
  

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
        
        
        const historiquesSoldes = JSON.parse(fs.readFileSync(filePath, 'utf-8')).evolution;
 
        // Initialize variables
        let initAmount = parseFloat(historiquesSoldes[0].montant);
        let bestSoldeToday = initAmount;
        let lastExecBot = amount;
        let since6Hours = initAmount;
        let since12Hours = initAmount;
        let since1Day = initAmount;
        let since3Day = initAmount;
        let since7Day = initAmount;
        let since14Day = initAmount;
        let since1Month = initAmount;
        let since2Month = initAmount;
        let sinceBegin = initAmount;

        let bestSoldeThisDay = -1;
        let dateBestSoldeThisDay = "";
        let worstSoldeThisDay = -1;
        let dateWorstSoldeThisDay = "";
        let bestSoldeThisMonth = -1;
        let dateBestSoldeThisMonth = "";
        let worstSoldeThisMonth = -1;
        let dateWorstSoldeThisMonth = "";
        let bestSoldeThisYear = initAmount;
        let dateBestSoldeThisYear = "";
        let worstSoldeThisYear = initAmount;
        let dateWorstSoldeThisYear = "";
        
        let now = Date.now();
        let sixHoursAgo = now - 6 * 60 * 60 * 1000;
        let twelveHoursAgo = now - 12 * 60 * 60 * 1000;
        let oneDayAgo = now - 24 * 60 * 60 * 1000;
        let threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
        let sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        let fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
        let oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
        let twoMonthsAgo = now - 60 * 24 * 60 * 60 * 1000;
        let oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

        let last6Hours = [];
        let last12Hours = [];
        let last1Day = [];
        let last3Days = [];
        let last7Days = [];
        let last14Days = [];
        let last1Month = [];
        let last2Months = [];
        let since1Begin = [];

        const avantDerniereValeur = historiquesSoldes[historiquesSoldes.length - 2];
        const montantAvantDernier = avantDerniereValeur.montant;
        const dateAvantDernier = avantDerniereValeur.date;

        for (let i = 0; i < historiquesSoldes.length; i++) {

            let balance = parseFloat(historiquesSoldes[i].montant);
            let timestamp = Date.parse(historiquesSoldes[i].date + " " + historiquesSoldes[i].heure);

            // Update bestSoldeToday
            if (balance > bestSoldeToday) {
                
                bestSoldeToday = balance;
            }

            // Update lastExecBot
            if (timestamp > lastExecBot.timestamp) {
                lastExecBot = {
                balance: balance,
                timestamp: timestamp
                };
            }

            
            // Update last 6 hours
            if (timestamp > sixHoursAgo) {
                last6Hours.push(balance);
            }

            // Update last 12 hours
            if (timestamp > twelveHoursAgo) {
                last12Hours.push(balance);
            }

            // Update last 1 day
            if (timestamp > oneDayAgo) {
                last1Day.push(balance);
                if(balance > bestSoldeThisDay || bestSoldeThisDay == -1){
                    bestSoldeThisDay = balance;
                    dateBestSoldeThisDay = timestampToDate(timestamp);
                }

                if((balance < worstSoldeThisDay) || worstSoldeThisDay == -1){
                    worstSoldeThisDay = balance;
                    dateWorstSoldeThisDay = timestampToDate(timestamp);
                }
                 
            }

            // Update last 3 day
            if (timestamp > threeDaysAgo) {
                last3Days.push(balance);
            }

            // Update last 7 day
            if (timestamp > sevenDaysAgo) {
                last7Days.push(balance);
            }

            // Update last 14 day
            if (timestamp > fourteenDaysAgo) {
                last14Days.push(balance);
            }

            // Update last 1 Month
            if (timestamp > oneMonthAgo) {
                last1Month.push(balance);

                if(balance > bestSoldeThisMonth || bestSoldeThisMonth == -1){
                    bestSoldeThisMonth = balance;
                    dateBestSoldeThisMonth = timestampToDate(timestamp);
                }

                if((balance < worstSoldeThisMonth) || worstSoldeThisMonth == -1){
                    worstSoldeThisMonth = balance;
                    dateWorstSoldeThisMonth = timestampToDate(timestamp);
                }
            }

            // Update last 2 Month
            if (timestamp > twoMonthsAgo) {
                last2Months.push(balance);
            }


            // one year ago 
            if (timestamp > oneYearAgo) {
                if(balance > bestSoldeThisYear || bestSoldeThisYear == -1){
                    bestSoldeThisYear = balance;
                    dateBestSoldeThisYear = timestampToDate(timestamp);
                }

                if((balance < worstSoldeThisYear) || worstSoldeThisYear == -1){
                    worstSoldeThisYear = balance;
                    dateWorstSoldeThisYear = timestampToDate(timestamp);
                }
            }
            
            // Update since begin
            since1Begin.push(balance);

        }


        
        // Calculate the necessary data
        let bestSoldeToday_Evolution = ((bestSoldeToday - initAmount) / initAmount) * 100;
        let lastExecBot_Evolution = ((lastExecBot - initAmount) / initAmount) * 100;

        if (last6Hours.length > 0) {
            let last6HoursSum = last6Hours.reduce((a, b) => a + b, 0);
            since6Hours = last6HoursSum / last6Hours.length;
            since6Hours_Evolution = ((since6Hours - initAmount) / initAmount) * 100;
        }

        if (last12Hours.length > 0) {
            let last12HoursSum = last12Hours.reduce((a, b) => a + b, 0);
            since12Hours = last12HoursSum / last12Hours.length;
            since12Hours_Evolution = ((since12Hours - initAmount) / initAmount) * 100;
        }

        
        if (last1Day.length > 0) {
            let last1DaySum = last1Day.reduce((a, b) => a + b, 0);
            since1Day = last1DaySum / last1Day.length;
            since1Day_Evolution = ((since1Day - initAmount) / initAmount) * 100;
        }

        if (last3Days.length > 0) {
            let last3DaySum = last3Days.reduce((a, b) => a + b, 0);
            since3Day = last3DaySum / last3Days.length;
            since3Day_Evolution = ((since3Day - initAmount) / initAmount) * 100;
        }

        if (last7Days.length > 0) {
            let last7DaySum = last7Days.reduce((a, b) => a + b, 0);
            since7Day = last7DaySum / last7Days.length;
            since7Day_Evolution = ((since7Day - initAmount) / initAmount) * 100;
        }

        if (last14Days.length > 0) {
            let last14DaySum = last14Days.reduce((a, b) => a + b, 0);
            since14Day = last14DaySum / last14Days.length;
            since14Day_Evolution = ((since14Day - initAmount) / initAmount) * 100;
        }


        if (last1Month.length > 0) {
            let since1MonthSum = last1Month.reduce((a, b) => a + b, 0);
            since1Month = since1MonthSum / last1Month.length;
            since1Month_Evolution = ((since1Month - initAmount) / initAmount) * 100;
        }

        if (last2Months.length > 0) {
            let since2MonthSum = last2Months.reduce((a, b) => a + b, 0);
            since2Month = since2MonthSum / last2Months.length;
            since2Month_Evolution = ((since2Month - initAmount) / initAmount) * 100;
        }

        if (since1Begin.length > 0) {
            let since1BeginSum = since1Begin.reduce((a, b) => a + b, 0);
            sinceBegin = since1BeginSum / since1Begin.length;
            sinceBegin_Evolution = ((sinceBegin - initAmount) / initAmount) * 100;
        }
        
      
        let retour = {
            initAmount,
			bestSoldeToday,
			bestSoldeToday_Evolution,
			lastExecBot,
			lastExecBot_Evolution,
			since6Hours,
			since6Hours_Evolution,
			since12Hours,
			since12Hours_Evolution,
			since1Day,
			since1Day_Evolution,
			since3Day,
			since3Day_Evolution,
			since7Day,
			since7Day_Evolution,
			since14Day,
			since14Day_Evolution,
			since1Month,
			since1Month_Evolution,
			since2Month,
			since2Month_Evolution,
			sinceBegin,
			sinceBegin_Evolution,
            bestSoldeThisDay,
            dateBestSoldeThisDay,
            worstSoldeThisDay,
            dateWorstSoldeThisDay,
            bestSoldeThisMonth,
            dateBestSoldeThisMonth,
            worstSoldeThisMonth,
            dateWorstSoldeThisMonth,
            bestSoldeThisYear,
            dateBestSoldeThisYear,
            worstSoldeThisYear,
            dateWorstSoldeThisYear,
            montantAvantDernier,
            dateAvantDernier
            
		}

        return retour;       
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
    
    let message = `\n=====================================\n`;
    message += "\nBilan de performance :\n\n";
    if (typeof data.bestSoldeThisDay !== 'undefined') {
        bestSoldeThisDay = round(data.bestSoldeThisDay, 3);
        message += ` - Best solde aujourd'hui : ${bestSoldeThisDay}$ le ${data.dateBestSoldeThisDay} \n`;
    }
    if (typeof data.bestSoldeThisMonth !== 'undefined') {
        bestSoldeThisMonth = round(data.bestSoldeThisMonth, 3);
        message += ` - Best solde ce mois-ci : ${bestSoldeThisMonth}$ le ${data.dateBestSoldeThisMonth}\n`;
    }
    if (typeof data.bestSoldeThisYear !== 'undefined') {
        bestSoldeThisYear = round(data.bestSoldeThisYear, 3);
        message += ` - Best solde cette année : ${bestSoldeThisYear}$ le ${data.dateBestSoldeThisYear}\n\n`;
    }
    //message += " ";
    if (typeof data.worstSoldeThisDay !== 'undefined') {
        worstSoldeThisDay = round(data.worstSoldeThisDay, 3);
        message += ` - Pire solde aujourd'hui : ${worstSoldeThisDay}$ à ${data.dateWorstSoldeThisDay}h \n`;
    }
    if (typeof data.worstSoldeThisMonth !== 'undefined') {
        worstSoldeThisMonth = round(data.worstSoldeThisMonth, 3);
        message += ` - Pire solde ce mois-ci : ${worstSoldeThisMonth}$ le ${data.dateWorstSoldeThisMonth}\n`;
    }
    if (typeof data.worstSoldeThisYear !== 'undefined') {
        worstSoldeThisYear = round(data.worstSoldeThisYear, 3);
        message += ` - Pire solde cette année : ${worstSoldeThisYear}$ le ${data.dateWorstSoldeThisYear}\n`;
    }
    
    
    return message;

}

async function getEvolutionContinue(config, data, etiquette_bot) {
    
    let message = `\n=====================================\n\n`;
    
    let gain = 0;
    let bonus = 0;
    if (typeof data.lastExecBot !== 'undefined') {
        let bonus = 100 * (data.montantAvantDernier - data.lastExecBot) / data.lastExecBot;
        gain = round(bonus / 100 * data.lastExecBot, 5);
        bonus = round(bonus, 3);
        gain = round(gain, 5);
        let lastExecBotRounded = round(data.lastExecBot, 3);
      
        if (gain < 0) {
          message += ` - Dernière execution du bot : ${bonus}% (${lastExecBotRounded}$ ${gain}$) \n`;
        } else {
          message += ` - Dernière execution du bot : +${bonus}% (${lastExecBotRounded}$ +${gain}$) \n`;
        }
      }
      
      if (typeof data.since6Hours !== 'undefined') {
        bonus = 100 * (data.montantAvantDernier - data.since6Hours) / data.since6Hours;
        gain = round(bonus / 100 * data.montantAvantDernier, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        since6Hours = round(data.since6Hours, 3);
      
        if ( gain < 0) {
          message += ` - il y a 6h : ${bonus}% (${since6Hours}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 6h : +${bonus}% (${since6Hours}$ +${gain}$) \n`;
        }
      }
      
      if (typeof data.since12Hours !== 'undefined') {
        bonus = 100 * (data.montantAvantDernier - data.since12Hours) / data.since12Hours;
        gain = round(bonus / 100 * data.montantAvantDernier, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        since12Hours = round(data.since12Hours, 3);
      
        if ( gain < 0) {
          message += ` - il y a 12h : ${bonus}% (${since12Hours}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 12h : +${bonus}% (${since12Hours}$ +${gain}$) \n`;
        }
      }

      if (typeof data.since1Day !== 'undefined') {
        bonus = 100 * (data.montantAvantDernier - data.since1Day) / data.since1Day;
        gain = round(bonus / 100 * data.montantAvantDernier, 2);
        bonus = round(bonus, 3);
        gain = round(gain, 5);
        since1Day = round(data.since1Day, 5);
      
        if (gain < 0) {
          message += ` - il y a 1j : ${bonus}% (${since1Day}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 1j : +${bonus}% (${since1Day}$ +${gain}$) \n`;
        }
      }
      
      if (typeof data.since3Day !== 'undefined') {
        bonus = 100 * (data.montantAvantDernier - data.since3Day) / data.since3Day;
        gain = round(bonus / 100 * data.montantAvantDernier, 2);
        bonus = round(bonus, 3);
        gain = round(gain, 5);
        since3Day = round(data.since3Day, 3);
      
        if ( gain < 0) {
          message += ` - il y a 3j : ${bonus}% (${since3Day}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 3j : +${bonus}% (${since3Day}$ +${gain}$) \n`;
        }
      }
      
      if (typeof data.since7Day !== 'undefined') {
        bonus = 100 * (data.montantAvantDernier - data.since7Day) / data.since7Day;
        gain = round(bonus / 100 * data.montantAvantDernier, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        since7Day = round(data.since7Day, 3);
      
        if ( gain < 0) {
          message += ` - il y a 7j : ${bonus}% (${since7Day}$ ${gain}$) \n`;
        } else {
          message += ` - il y a 7j : +${bonus}% (${since7Day}$ +${gain}$) \n`;
        }
      }

      if (typeof data.since14Day !== 'undefined') {
        bonus = 100 * (data.montantAvantDernier - data.since14Day) / data.solde14Day;
        gain = round(bonus / 100 * data.montantAvantDernier, 2);
        bonus = round(bonus, 3);
        gain = round(gain, 5);
        since14Day = round(data.since14Day, 3);
        if (gain < 0) {
          message += ` - il y a 14j : ${bonus}% (${since14Day}$ ${ gain}$) \n`;
        } else {
          message += ` - il y a 14j : +${bonus}% (${since14Day}$ +${ gain}$) \n`;
        }
      }
      
      if (typeof data.since1Month !== 'undefined') {
        bonus = 100 * (data.montantAvantDernier - data.since1Month) / data.since1Month;
        gain = round(bonus / 100 * data.montantAvantDernier, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        since1Month = round(data.since1Month, 3);
        if ( gain < 0) {
          message += ` - il y a 1 mois : ${bonus}% (${since1Month}$ ${ gain}$) \n`;
        } else {
          message += ` - il y a 1 mois : +${bonus}% (${since1Month}$ +${ gain}$) \n`;
        }
      }
      
      if (typeof data.since2Month !== 'undefined') {
        bonus = 100 * (data.montantAvantDernier - data.since2Month) / data.since2Month;
        gain = round(bonus / 100 * data.montantAvantDernier, 2);
        bonus = round(bonus, 3);
        gain = round( gain, 5);
        since2Month = round(data.since2Month, 3);
        if ( gain < 0) {
          message += ` - il y a 2 mois : ${bonus}% (${since2Month}$ ${ gain}$) \n`;
        } else {
          message += ` - il y a 2 mois : +${bonus}% (${since2Month}$ +${ gain}$) \n`;
        }
      }

   
    return message;
}


async function getResume(config, data, etiquette_bot) {
    let totalInvestment = config.historique.totalInvestment;
    let bonus = 100 * (data.lastExecBot - totalInvestment) / totalInvestment;
    let gain = Math.round((bonus / 100) * totalInvestment * 1000) / 1000;
    bonus = Math.round(bonus * 1000) / 1000;
    totalInvestment = Math.round(totalInvestment * 100000) / 100000;

    let message = `\n=====================================\n\n`;
    message += `INVESTISSEMENT INITIAL => ${totalInvestment}$ \n`;

    if ( gain < 0 ) {
    message += `PERTE TOTAL => ${gain} $ (${bonus}%)\n`;
    } else {
    message += `gain TOTAL => +${gain} $ (+${bonus}%)\n`;
    }

    message += `SOLDE TOTAL => ${data.lastExecBot}$\n`;
    

    message += `\n*****************************************************\n`;
    message += `N'hésitez pas à me soutenir pour le travail du bot :\n`;
    message += `• Adresse BTC : 1CetuWt9PuppZ338MzBzQZSvtMW3NnpjMr\n`;
    message += `• Adresse ETH (Réseau ERC20) : 0x18f71abd7c2ee05eab7292d8f34177e7a1b62236\n`;
    message += `• Adresse SOL : AsLvBCG1fpmpaueTYBmU5JN5QKVkt9a1dLR44BAGUZbV\n`;
    message += `• Adresse MATIC : 0x18f71abd7c2ee05eab7292d8f34177e7a1b62236\n`;
    message += `• Adresse BNB : 0x18f71abd7c2ee05eab7292d8f34177e7a1b62236\n\n`;

   

 //   message = message.replace('-USDT', '');
 //   message = message.replace(', ', ' ');

    return message;
}

const round = (value, decimals) => {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

module.exports = { getBilan, addNewAmount , getBilanPerf, getEvolutionContinue, getResume};