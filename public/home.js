let chartsBots = {};
window.addEventListener("load",function(){
    
    const data = {
        
    };
    fetch("/processes_bots", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(result => {
        affichage_list_process(result);
        //console.log(result)
    })
    .catch(error => console.log("Erreur", error));

    get_log_bots();
});


function affichage_list_process(data){
    const div = document.getElementById("list_bots_content");
    div.innerHTML = "";
    
    const jsonObject = JSON.parse(data);
    
    var html = "";
    Object.entries(jsonObject).forEach(([key, value]) => {
        html += "<div class='bot_content' id='bot_"+value.pid+ "'>";
            html += "<h3>"+value.botName + " démaré le : " + value.dateStartString +"</h3>";
            html += "<table class='tableau_general_infos_bot'>";
                html += "<tr class='tr_general_infos_bot'>"
                    html += '<td class="td-left-col">';
                        html += '<h4>Infos Bot</h4>';    
                        html += '<table class="tableau_infos_bot">';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Nom Bot</td>';
                                html += '<td class="td_droite">'+ value.botName +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Running</td>';

                                html += '<td class="td_droite">' + '<label><input id="is_running_' + value.pid + '" class="check_pastille" type="checkbox" ' + (value.isRunnig ? 'checked' : '') + ' disabled><span></span></label>' + '</td>';
                                html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Date Start</td>';
                                html += '<td class="td_droite">'+ value.dateStartString +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">PID</td>';
                                html += '<td class="td_droite">'+ value.pid +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Production</td>';
                                html += '<td class="td_droite">' + '<label><input type="checkbox" class="check_pastille" ' + (value.production ? 'checked' : '') + ' disabled><span></span></label>' + '</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Stratégie</td>';
                                html += '<td class="td_droite">'+ value.stratSelected +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Exchange</td>';
                                html += '<td class="td_droite">'+ value.exchangeSelected +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Mysql</td>';
                                html += '<td class="td_droite">' + '<label><input type="checkbox" class="check_pastille" ' + (value.isMysql ? 'checked' : '') + ' disabled><span></span></label>' + '</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Télégram</td>';
                                html += '<td class="td_droite">' + '<label><input type="checkbox" class="check_pastille" ' + (value.telegram_on ? 'checked' : '') + ' disabled><span></span></label>' + '</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">StableCoin</td>';
                                html += '<td class="td_droite">'+ value.stableCoin +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">TimeFrame</td>';
                                html += '<td class="td_droite">'+ value.timeframeBot +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Leverage</td>';
                                html += '<td class="td_droite">'+ value.leverage +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">TakeProfit</td>';
                                html += '<td class="td_droite">' + '<label><input type="checkbox" class="check_pastille" ' + (value.is_tp ? 'checked' : '') + ' disabled><span></span></label>' + '</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">StopLoss</td>';
                                html += '<td class="td_droite">' + '<label><input type="checkbox" class="check_pastille" ' + (value.is_sl ? 'checked' : '') + ' disabled><span></span></label>' + '</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Max Positions</td>';
                                html += '<td class="td_droite">'+ value.maxOpenPosition +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Type Trade</td>';
                                html += '<td class="td_droite">'+ value.typeTrade +'</td>';
                            html += '</tr>';
                            html += '<tr class="tr_infos_bot">';
                                html += '<td class="td_gauche">Investissement</td>';
                                html += '<td class="td_droite">'+ value.totalInvestment + ' ' + value.stableCoin+ '</td>';
                            html += '</tr>';
                        html += '</table>';
                        html += '<input type="button" value="Infos" class="infos-button" onclick="infos_process('+value.pid+')">'
                        html += '<input type="button" value="Stopper" class="stop-button" onclick="delete_process('+value.pid+')">'
                    html += '</td>';
                    html += '<td class="td-right-col">';
                        html += '<h4>Evolution Wallet</h4>'; 
                        html += '<div id="div_evolution_wallet'+value.pid+'" class="evolution_wallet_info" >'
                            html += '<table class="tableau_infos_wallet_evolution"';
                            html += '<tr>';
                            html += '<td class="td_gauche_evol"><span class="titre_infos_evol">Wallet Initial : </span><span class="valeur_infos_evol">'+value.totalInvestment+'</span><span class="titre_infos_evol"> '+value.stableCoin+' </span></td>';
                            html += '<td class="td_centre_evol"><span class="titre_infos_evol">Wallet Actuel : </span><span id="actual_wallet_'+value.pid+'" class="valeur_infos_evol"></span></td>';
                            html += '<td class="td_droite_evol"><span class="titre_infos_evol">Evolution : </span><span id="evolution_wallet_'+value.pid+'" class="valeur_infos_evol"></span> <span class="titre_infos_evol"> % </span> </td>';
                            html += '</tr>';
                            html += '</table>';
                        html += '</div>'; 
                        html += '<canvas id="myChart_'+value.pid+'"></canvas>';
                    html += '</td>';
                html += "</tr>";    
            html += "</table>";
            html += "<div class='div_lite_trade'>";
                html += '<h4>Liste des Trades</h4>';
                html += '<div class="div_list_trade" id="div_list_trade'+value.pid+'" >';
                    
                html += '</div>';
            html += "</div>";
        html += "</div>";
    });


    //titre.appendChild(list);
    document.getElementById('list_bots_content').innerHTML = html;

    // vérification du status des process
    Object.entries(jsonObject).forEach(([key, value]) => {
        
        let labels = [];
        let data = [];
        let lastMontant = 0;
        let walletData ;
        if (value.isMysql == true) {
            walletData = JSON.parse(value.historiques.mysql.walletData);

            // Remplir les tableaux labels et data avec les données de portefeuille
            walletData.forEach((wallet) => {
                const datetime = wallet.dateheure;
                const [date, time] = datetime.split(' ');
                const [day, month, year] = date.split('/');
                const [hour, minute, second] = time.split(':');
                const dateheure = new Date(year, month - 1, day, hour, minute, second);
                const formattedDate = dateheure.getDate() + '/' + (dateheure.getMonth() + 1) + '/' + dateheure.getFullYear() + ' ' + dateheure.getHours() + ':' + dateheure.getMinutes() + ':' + dateheure.getSeconds();
                labels.push(formattedDate);
                lastMontant = parseFloat(wallet.montant);
                data.push(lastMontant);
            });
        }
        else{
            walletData = value.historiques.json;

            // Remplir les tableaux labels et data avec les données de portefeuille
            walletData.forEach((wallet) => {
                const dateheure = new Date(wallet.date + ' ' + wallet.heure);
                const formattedDate = dateheure.getDate() + '/' + (dateheure.getMonth() + 1) + '/' + dateheure.getFullYear() + ' ' + dateheure.getHours() + ':' + dateheure.getMinutes() + ':' + dateheure.getSeconds();
                labels.push(formattedDate);
                lastMontant = parseFloat(wallet.montant);
                data.push(lastMontant);
            });
        }

        let id_montant_wallet = document.getElementById('actual_wallet_' + value.pid);
        id_montant_wallet.textContent  = lastMontant.toFixed(2) + " " + value.stableCoin ;
        let evolution = ((lastMontant - value.totalInvestment)/value.totalInvestment)*100
        let id_evolution = document.getElementById('evolution_wallet_' + value.pid);
        id_evolution.textContent  = evolution.toFixed(2)  ;

        if(evolution > 0){
            id_evolution.style.color = 'green';
          }
          else if(evolution < 0){
            id_evolution.style.color = 'red';
          }
          else{
            id_evolution.style.color = 'white';
          }

          /* Graphique */
        createChart(value.pid);
       
        updateChart(value.pid, data, labels );
        
        update_isRunning(value.pid);
        if (value.isMysql == true) {
            update_trades(value);
        }
   });
}

function createChart(pid) {
    const ctx = document.getElementById('myChart_' + pid).getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
        labels: [],
        datasets: [{
            label: 'Évolution du portefeuille en USDT',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
        },
        options: {
        scales: {
            yAxes: [{
            ticks: {
                beginAtZero: true
            }
            }]
        }
        }
    });

    // Ajouter le graphique au dictionnaire
    chartsBots[pid] = myChart;
}


// Mettre à jour le graphique avec les nouvelles données
function updateChart(pid, data, labels ) {
                    
    // Récupérer le graphique à mettre à jour
    const chart = chartsBots[pid];

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;

    // Mettre à jour le graphique
    chart.update();
}  


function update_isRunning(pid){
    const data = {
        pid: pid,
        title:"Bot"
    };
    fetch("/processe_infos" , {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(result => {
        const jsonObject = JSON.parse(result);
        if(jsonObject.status == false){
            var checkbox = document.getElementById("is_running_" + pid);
            checkbox.checked = false;
        }
        else{
            var checkbox = document.getElementById("is_running_" + pid);
            checkbox.checked = true; // Pour cocher la checkbox
            }
    })
    .catch(error => console.log( error + " delete the process and re create it"));
}

function update_trades(value){
                    
    let htmlTrades = "<table class='tableau_trades'>";
    htmlTrades += "<tr class='tr_trades_titre'>";
    htmlTrades += "<th class='th_trades'>Date</th>";
    htmlTrades += "<th class='th_trades'>Symbol</th>";
    htmlTrades += "<th class='th_trades'>Type</th>";
    htmlTrades += "<th class='th_trades'>Qte Crypto</th>";
    htmlTrades += "<th class='th_trades'>Valeur " + value.stableCoin+ "</th>";
    htmlTrades += "<th class='th_trades'>Prix</th>";
    htmlTrades += "</tr>";

    //let trades = ;
    const trades = JSON.parse(value.historiques.mysql.tradesData);
    for (let i = 0; i < trades.length; i++) {
        if(trades[i].type == "Open Long"){
            htmlTrades += "<tr class='tr_trades_value' style='color:rgb(50, 167, 50)'>";
        }
        if(trades[i].type == "Close Long"){
            htmlTrades += "<tr class='tr_trades_value' style='color:rgb(7, 87, 83)'>";
        }
        if(trades[i].type == "Open Short"){
            htmlTrades += "<tr class='tr_trades_value' style='color:rgb(207, 34, 34)'>";
        }
        if(trades[i].type == "Close Short"){
            htmlTrades += "<tr class='tr_trades_value' style='color:rgb(150, 46, 124)'>";
        }
        
        htmlTrades += "<td class='td_trades'>" + trades[i].dateheure + "</td>";
        htmlTrades += "<td class='td_trades'>" + trades[i].symbol + "</td>";
        htmlTrades += "<td class='td_trades'>" + trades[i].type + "</td>";
        htmlTrades += "<td class='td_trades'>" + trades[i].montantCrypto + "</td>";
        htmlTrades += "<td class='td_trades'>" + trades[i].montantUsd + "</td>";
        htmlTrades += "<td class='td_trades'>" + trades[i].prix + "</td>";
        htmlTrades += "</tr>";
    }
    
    
    htmlTrades += "</table>";
   
    const div = document.getElementById("div_list_trade"+value.pid);
    div.innerHTML = htmlTrades;
}


function infos_process(pid){
    const data = {
        pid: pid,
        title:"Bot"
    };
    fetch("/processe_infos" , {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(result => {
        const jsonObject = JSON.parse(result);
        if(jsonObject.status == false){
            alert(jsonObject.message  + " effacez le Bot et re créé le")
        }
        else{
            alert("Bot : " + jsonObject.pid + " toujours actif")
        }
    })
    .catch(error => alert("error : " +  error + " effacez le Bot et re créé le"));
}


function delete_process(pid){
    if (confirm("Etes-vous sûr de vouloir supprimer ce bot avec le pid " + pid + " ?")) {
        const data = {
            pid: pid,
            title: "Bot"
        
        };
        fetch("/processe_delete" , {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(result => {
            if(result == "true"){
                alert("Bot Effacé.")
                const data = {
        
                };
                fetch("/processes_bots", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.text())
                .then(result => {
                    
                    affichage_list_process(result);
                })
                .catch(error => console.log("Erreur", error));
            }else{
                alert(result);
            }
        })
        .catch(error => console.log("Erreur", error));
    }
}


function get_log_bots(){
    // alert("getlog")
     const data = {        
        
     };
     fetch("/get_log" , {
         method: "POST",
         headers: {
             "Content-Type": "application/json"
         },
         body: JSON.stringify(data)
     })
    .then(response => response.text())
    .then(result => {
        if(result == "false"){
            console.log("error dans les logs")
        }
        else{
            const div = document.getElementById("log_node_content");
            div.innerHTML = result;
            div.scrollTop = div.scrollHeight;
        }
    })
    .catch(error => console.log("error : " +  error ));
}


function update_list_bot(){
    const data = {
                        
    };
    fetch("/processes_bots", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(result => {
        const jsonObject = JSON.parse(result);
        
        Object.entries(jsonObject).forEach(([key, value]) => {
            let labels = [];
            let data = [];
            let lastMontant = 0;
            let walletData ;
            if (value.isMysql == true) {
                walletData = JSON.parse(value.historiques.mysql.walletData);

                // Remplir les tableaux labels et data avec les données de portefeuille
                walletData.forEach((wallet) => {
                    const datetime = wallet.dateheure;
                    const [date, time] = datetime.split(' ');
                    const [day, month, year] = date.split('/');
                    const [hour, minute, second] = time.split(':');
                    const dateheure = new Date(year, month - 1, day, hour, minute, second);
                    const formattedDate = dateheure.getDate() + '/' + (dateheure.getMonth() + 1) + '/' + dateheure.getFullYear() + ' ' + dateheure.getHours() + ':' + dateheure.getMinutes() + ':' + dateheure.getSeconds();
                    labels.push(formattedDate);
                    lastMontant = parseFloat(wallet.montant);
                    data.push(lastMontant);
                });
            }
            else{
                walletData = value.historiques.json;

                // Remplir les tableaux labels et data avec les données de portefeuille
                walletData.forEach((wallet) => {
                    const dateheure = new Date(wallet.date + ' ' + wallet.heure);
                    const formattedDate = dateheure.getDate() + '/' + (dateheure.getMonth() + 1) + '/' + dateheure.getFullYear() + ' ' + dateheure.getHours() + ':' + dateheure.getMinutes() + ':' + dateheure.getSeconds();
                    labels.push(formattedDate);
                    lastMontant = parseFloat(wallet.montant);
                    data.push(lastMontant);
                });
            }

            let id_montant_wallet = document.getElementById('actual_wallet_' + value.pid);
            id_montant_wallet.textContent  = lastMontant.toFixed(2) + " " + value.stableCoin ;
            let evolution = ((lastMontant - value.totalInvestment)/value.totalInvestment)*100
            let id_evolution = document.getElementById('evolution_wallet_' + value.pid);
            id_evolution.textContent  = evolution.toFixed(2)  ;

            if(evolution > 0){
                id_evolution.style.color = 'green';
            }
            else if(evolution < 0){
                id_evolution.style.color = 'red';
            }
            else{
                id_evolution.style.color = 'white';
            }
            
            /* Graphique */
            createChart(value.pid);
            
            updateChart(value.pid, data, labels );
            
            update_isRunning(value.pid);
            if (value.isMysql == true) {
                update_trades(value);
            }
            update_isRunning(value.pid);
        });
        
        

    })
    .catch(error => console.log("error", error));        
}

 