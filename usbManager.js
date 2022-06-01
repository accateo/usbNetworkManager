/**
 * 
 * USB Network Manager Debian Linux
 * 
 * Inserendo una chiavetta USB con questo applicativo posso aggiornare la
 * configurazione di rete (file /etc/network/wpa.conf e /etc/network/interfaces)
 * Inoltre gestisco lampeggio di un LED collegato ad un gpio
 * v.0.3.0
 */

//libreria per istruzioni da linea di comando
const cmd = require('node-cmd');
//fs per gestire filesystem
var fs = require('fs');
//axios per chiamate http
var axios = require('axios')
//nodo per calcolo checksum
var checksum  = require('checksum');
//libreria per gestire gpio 
var gpio = require('./gpio.js');
///////////////////////////////////////////////////
//attuale percorso usb drive nel filesystem
var fileSystemUsbPath = "/dev/sda1";
//nuovo percorso predefinito usb drive
var pathUsb = "/mnt/usbdrive";





//entry point
mainRoutine()




/** --------------------------------- */

/** funzione init */
function mainRoutine(){
    //inizializzo gpio led asus
    gpio.initGpio();

    //start update
    startUpdate();
}

/** funzione che esegue attività iniziali 
 * 
 *  montare usb in un percorso predefinito 
*/
function startUpdate(){

    //se c'è effettivamente chiavetta inserita
    if (fs.existsSync(fileSystemUsbPath)) {
        cmd.run('sudo umount '+fileSystemUsbPath);
        cmd.run('sudo mkdir '+pathUsb);
        cmd.get('sudo mount '+fileSystemUsbPath+' '+pathUsb,function(err,data,stderr){
            //se non ci sono errori, comincio a gestire file su chiavetta
            if(!err){
                manageFiles();
            }
        })
    }
    

    
}

/** Accesso all'usb e cerco i vari file. Se ci sono li sposto */
async function manageFiles(){

    let updateApp,
        ChecksumCheckResult;

    //aggiornamento network bridges
    let update2 = await updateNetworkConf();
    if(update2==1){
        //installo
        ChecksumCheckResult = await checkSumCheck();
        
    }
    
    //se ho installato l'aggiornamento
    if(update1==2 || ChecksumCheckResult==1){
        //devo riavviare, almeno un aggiornamento fatto
        console.log("riavvio");
        //lampeggio gpio
        gpio.intervalLed();
        setTimeout(function(){gpio.stopLed(1);restart();},3000);
    }
    else{
        console.log("nessun aggiornamento effettuato");
    }


    

}


/** aggiornamento parte rete */
async function updateNetworkConf(){

    return new Promise(resolve => {

            //configurazione rete
            //se esiste almeno un file configurazione di rete
            cmd.get('test -f "'+pathUsb+'/network/wpa.conf" && echo "1"' ,function(err, data, stderr){
                console.log(data)
                if(data==="1\n"){
                    console.log("ok network");

                       
                       resolve(1);

                    
                    
                }

                if(err){
                    console.log("Configurazione di rete non presente su chiavetta");
                    resolve(0);
                }
                
            });


    });

}

/** controllo che i file di configurazione di rete non siano simili a quelli già presenti sul dispositivo */
async function checkSumCheck(){

        await cmd.run('cp "'+pathUsb+'/network/wpa.conf" /tmp/wpa.conf');
        await cmd.run('cp "'+pathUsb+'/network/interfaces" /tmp/interfaces');


        let checksum1local = await generateChecksum('/etc/network/interfaces');
        
        let checksum2local = await generateChecksum('/etc/network/wpa.conf');
        
        
        let checksum1usb = await generateChecksum('/tmp/interfaces');
        
        let checksum2usb = await generateChecksum('/tmp/wpa.conf');
        

        let result = await moveFileOrNot(checksum1local,checksum2local,checksum1usb,checksum2usb);
        //elimino copie file
        console.log("ora elimino i file");
        await Promise.all([deleteFile('/tmp/interfaces'),deleteFile('/tmp/wpa.conf')]).then(data => {
            console.log("Data", data);
            
            return data;
        });
        if(result==1){
            //ho aggiornato network
            console.log("torno indietro"); 
            
            //torno un valore
            return 1;

        }
        else{
            //non ho aggiornato
            return 0;
        }
        
        
}


/** in base alla condizione copio o no i file */
function moveFileOrNot(checksum1local,checksum2local,checksum1usb,checksum2usb){

    return new Promise(resolve => {
        //checksum uguali...non aggiorno configurazione 
        if(checksum1local==checksum1usb && checksum2local==checksum2usb){
            console.log("non sposto i file");
            resolve(0);
            
        }
        else{
            console.log("sposto i file");
            //sposto tutti i file
            cmd.get('yes | cp "'+pathUsb+'/network/wpa.conf" /etc/network/ | cp "'+pathUsb+'/network/interfaces" /etc/network/', function(err,data,stderr){
                console.log("sposto file network");
                if(!err){

                    resolve(1);
                    console.log("Aggiornamento configurazione di rete effettuato");
                    
                    
                    

                }
            })
            
        }
    });
}


/** --------------------------------- */

/** funzione vera e propria che genera checksum */
function generateChecksum(file) {
    
    return new Promise(resolve => {
       checksum.file(file, function (err, sum) {
           resolve(sum);
        })
     });
}

/** Riavvio per confermare aggiornamento */
function restart(){

    cmd.run('sudo reboot')
}

/** funzione che elimina copie create */
function deleteFile(file){

    return new Promise((resolve,reject) => {
        cmd.run('rm -rf '+file);
        resolve(1);
        
      });
}




