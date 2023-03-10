
const saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', () => {
    
    // parametre généraux
    let delai_log = document.querySelector('#delai_log').value;
    let delai_interface = document.querySelector('#delai_interface').value;
    let delai_price = document.querySelector('#delai_price').value;
    
    
    

    var config = {
        "parametres_generaux" : {
            "delai_log": delai_log,
            "delai_interface": delai_interface,
            "delai_price": delai_price,
        }        
    };

    fetch("/save_config_interface", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(config)
    })
    .then(response => response.text())
    .then(result => {
        const jsonObject = JSON.parse(result);
        
        if(jsonObject.status == false){
            alert("Erreur : " + jsonObject.message)
        }
        else{
            alert("Configuration Sauvegardé il faut redémarer le node pour que cela prenne effet : sudo pm2 restart 0 dans le terminal")
        }
    })
    .catch(error => console.log("error", error));
    
});


