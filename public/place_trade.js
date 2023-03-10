let debounceTimer;
let pair = document.getElementById('pair');
pair.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
        get_price();
    }, 1000); // Temps en millisecondes avant d'exécuter la fonction
});

window.addEventListener("load",function(){
    getListProcess();
    get_log_bots();
});

function getListProcess(){
    const data = {
        
    };
    fetch("/processes_trades", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(result => {
        affichage_list_process_trades(result);
    })
    .catch(error => console.log("error", error));
}


function put_price_on_pair(price){
    document.getElementById('price').value = price;
}

function get_price(){
    var pairSelect = document.getElementById('pair').value;
    var exchange = document.getElementById("exchange_active").value;
    
    if (pairSelect && pairSelect.length > 0) {
        pairSelect = pairSelect.toUpperCase();
        const data = {
            pair: pairSelect,
            exchangeReq: exchange
        };
        fetch("/get_price", {
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
                console.log("Erreur : " + jsonObject.message)
            }
            else{
                document.getElementById('currentPrice').innerHTML = jsonObject.message;
            }
        })
    } 
}


function affichage_list_process_trades(data){
    const div = document.getElementById("content_process");
    div.innerHTML = "";
                
    const list = document.createElement('ul');
    const jsonObject = JSON.parse(data);
    
   
    Object.entries(jsonObject).forEach(([key, value]) => {
        
        const item = document.createElement('li');
        var html_tableau = "<table>";
            html_tableau += "<tr>";
                html_tableau += "<td>";
                    html_tableau += "pid : " + value.processInfo.pid   
                html_tableau += "</td>";
                html_tableau += "<td>";
                    html_tableau += "Pair : " + value.pair   
                html_tableau += "</td>";
                html_tableau += "<td>";
                    html_tableau += "amount : " + value.amount + " $"
                html_tableau += "</td>";
            html_tableau += "</tr>";

            html_tableau += "<tr>";
                html_tableau += "<td>";
                    html_tableau += "Type : " + value.position   
                html_tableau += "</td>";
                html_tableau += "<td>";
                    html_tableau += "Tigger Price : " + value.price   
                html_tableau += "</td>";
                html_tableau += "<td>";
                    html_tableau += "timeframe : " + value.timeframe   
                html_tableau += "</td>";
            html_tableau += "</tr>";

            html_tableau += "<tr>";
                html_tableau += "<td>";
                    html_tableau += '<input type="button" value="Infos" class="infos-button" onclick="infos_process('+value.processInfo.pid+')">'  
                html_tableau += "</td>";
                html_tableau += "<td>";
                       
                html_tableau += "</td>";
                html_tableau += "<td>";
                    html_tableau += '<input type="button" value="Delete" class="delete-button" onclick="delete_process('+value.processInfo.pid+')">'
                html_tableau += "</td>";
            html_tableau += "</tr>";
          
                
        html_tableau += "</table>";
        item.innerHTML = html_tableau
        
        
        list.appendChild(item);
    });
   
    //titre.appendChild(list);
    document.getElementById('content_process').appendChild(list);
}

function infos_process(pid){
    const data = {
        pid: pid,
        title: "Trade Manuel"
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
            alert(jsonObject.message  + " effacez le Trade et re créé le")
        }
        else{
            alert("Trade : " + jsonObject.pid + " toujours actif")
        }
        })
    .catch(error => alert("Erreur : " +  error + " effacez le trade et re crée le"));
}


function delete_process(pid){ 
    if (confirm("Etes-vous sûr de vouloir supprimer ce trade avec le pid " + pid + " ?")) {
        const data = {
            pid: pid,
            title:"Trade Manuel"
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
            const data = {
        
            };
            fetch("/processes_trades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(response => response.text())
            .then(result => {
                affichage_list_process_trades(result);
            })
            .catch(error => console.log("error", error));
        })
        .catch(error => console.log("error", error));
    }
}


// Select the elements
const tpSlider = document.getElementById('tp');
const slSlider = document.getElementById('sl');
const tpValue = document.getElementById('tpValue');
const tpPercentage = document.getElementById('tpPercentage');
const tpAmount = document.getElementById('tp_amount');

const slValue = document.getElementById('slValue');
const slPercentage = document.getElementById('slPercentage');
const slAmount = document.getElementById('sl_amount');

// Add event listeners
tpSlider.addEventListener('input', function() {
tpValue.textContent = (this.value*100).toFixed(2) + '%';
tpPercentage.textContent = (this.value*100).toFixed(2);
});
slSlider.addEventListener('input', function() {
slValue.textContent = (this.value*100).toFixed(2) + '%';
slPercentage.textContent = (this.value*100).toFixed(2);
});
 
function send_trade() {
    var timeframe = document.getElementById("timeframe").value;
    var exchange = document.getElementById("exchange_active").value;
    var price = document.getElementById("price").value;
    var position = document.getElementById("position").value;
    var amount = document.getElementById("amount").value;
    var tp_switch = document.getElementById("tp_switch").checked;
    var tp_percentage = document.getElementById("tp").value;
    var tp_amount = document.getElementById("tp_amount").value;
    var sl_switch = document.getElementById("sl_switch").checked;
    var sl_percentage = document.getElementById("sl").value;
    var pair = document.getElementById("pair").value.toUpperCase();

    // check if required variables are empty or non-existent
    if (!price || !amount || !pair) {
        alert("au moins une valeur est manquante (price, amount, pair).");
        return; // exit the function
    }

    // check if tp_switch is true and tp_amount,tp_percentage is empty or non-existent
    if (tp_switch !== false) {
        if (!tp_amount || !tp_percentage) {
            alert("tp_amount ou le tp_percentage est vide alors que le tp est activé.");
            return; // exit the function
        }
    }

    // check if sl_switch is true and sl_amount, sl_percentage is empty or non-existent
    if (sl_switch !== false) {
        if ( !sl_percentage) {
            alert("sl_percentage est vide alors que le sl est activé.");
            return; // exit the function
        }
    }

    if(tp_switch != true){
        tp_switch = "None";
    }
    

    if(sl_switch != true){
        sl_switch = "None";
    }
    

    const data = {
        timeframe: timeframe,
        price: price,
        position: position,
        amount: amount,
        tp_switch: tp_switch,
        tp_percentage: tp_percentage,
        tp_amount: tp_amount,
        sl_switch: sl_switch,
        sl_percentage: sl_percentage,
        pair : pair,
        exchange : exchange

    };

    fetch("/trade", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => response.text())
        .then(result => {
            getListProcess();
        })
        .catch(error => console.log("error", error));

}

function get_log_bots(){
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
