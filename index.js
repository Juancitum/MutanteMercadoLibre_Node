const functions = require('firebase-functions');
var firebase = require("firebase-admin");
const express = require('express');
const engines = require('consolidate');
const bodyParser = require('body-parser');
var serviceAccount = require("./mutantmercadolibre-9e51c4bd3d95.json");
const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://mutantmercadolibre.firebaseio.com"
});

// Get a database reference to our blog
var db = firebase.database();
// hasta la carga de db funciona
//var ref = db.ref("https://mutantmercadolibre.firebaseio.com/");

const app= express();
app.use(bodyParser.urlencoded({ extended: true }));
let validaMutante = function (mutanteString) {
    var matriz =  new Array (mutanteString.length);
    var matrizTraspuesta = new Array (mutanteString.length);
    var cadena = null;

    for (let i = 0; i < mutanteString.length; i++) {
        matriz[i] = new Array(mutanteString.length);
        cadena = mutanteString[i].valueOf();
        var agrego = cadena.split("");
        for (let j = 0; j < agrego.length; j++) {
            matriz[i][j] = agrego[j].valueOf();
        }
    }

    // Trasponer la matriz y comparar

		for (let i = 0; i < mutanteString.length; i++) {
         matrizTraspuesta[i] = new Array(mutanteString.length);
		for (let j = 0; j < mutanteString.length; j++) {   
            matrizTraspuesta[i][j] = matriz[j][i].valueOf();
			}
		}
        var mutante = 0;
		var vectorCompara = new Array (mutanteString.length);
        var almacenoValFila = "";
        var contadorColumna = 1;
		var contadorFila = 1;
		var contadorOblicuo = 1;
		var separo = null;
		// por columna
		for (let i = 0; i < mutanteString.length; i++) {
			cadena = mutanteString[i].valueOf();
			separo = cadena.split("");

			for (let j = 0; j < separo.length; j++) {
				if (j != 0) {
					if (almacenoValFila==separo[j].valueOf()) {
						contadorColumna++;
						if (contadorColumna == 4) {
							mutante++;
						}
					} else {
                        almacenoValFila = separo[j].valueOf();
						contadorColumna = 1;
					}

				}

			}
		}

        
		for (let i = 0; i < mutanteString.length; i++) {
			almacenoValFila = "";
			for (let j = 0; j < mutanteString.length; j++) {
				separo[j] = matrizTraspuesta[i][j].valueOf();

			}
			for (let j = 0; j < separo.length; j++) {
				if (almacenoValFila==separo[j].valueOf()) {
					contadorFila++;
					if (contadorFila == 4) {
						mutante++;
					}
				} else {
					almacenoValFila = separo[j].valueOf();
					contadorFila = 1;
				}
			}
        }

        
		almacenoValFila = "";
		for (let i = 0; i < mutanteString.length; i++) {
			if (i == 0) {
				cadena = mutanteString[i].valueOf();
				vectorCompara = cadena.split("");
				contadorOblicuo = 1;
			} else {
				for (let j = 0; j < separo.length-1; j++) {
					cadena = mutanteString[i].valueOf();
					separo = cadena.split("");
					if (vectorCompara[j].valueOf()==separo[j+1].valueOf()) {
						contadorOblicuo++;
						if (contadorOblicuo == 4) {
							mutante++;
						}
					}
				}
				vectorCompara = cadena.split("");
			}
		}

		if (mutante > 1) {
			return true;
		} else {
			return false;
		}
  }

  
app.post('/mutant', (req, res) => {
   // console.log('Got body:', req.body);
    const myArrStr = JSON.stringify(req.body);
    

  //  var ingreso1 =myArrStr.replace("{ “dna”", "").replace("dna:[", "").replace("]", "").replace(" ", "").replace("}", "").replace("{", "");
   var dna = myArrStr.replace('{"dna":[', "").replace("]}", "").replace("]}", "").replace(/"/g, "");
   var  dna1 = dna.split(",");
   var cadena = null;
   var validoCaracteres = 0;
   for (let i = 0; i < dna1.length; i++) {
    cadena = dna1[i];
    var agrego = cadena.split("");
    for (let j = 0; j < agrego.length; j++) {
        if (agrego[j].valueOf()!="A" && agrego[j].valueOf()!="T" && agrego[j].valueOf()!="G" && agrego[j].valueOf()!="C"){
            validoCaracteres = 1;
            break;
            }
    }
   }
   if(validoCaracteres>0 ){
    res.status(500).send('Error, a ingresado cadena de ADN errornea. Verifique e Intente Nuevamente')
   }else{
    var retorno = validaMutante(dna1);
   }
   var cadenaMutante = db.ref("mutant").push();
       if(retorno == true){
		 cadenaMutante.set({
			dna:req.body, mutant: true
		 });
		   res.status(200).send("Usted es Mutante");
       }else{
		cadenaMutante.set({
			dna:req.body, mutant: false
		 });
        res.status(403).send("Usted NO es Mutante");
       }
    res.send ("Envio cadena: " + myArrStr);
});

exports.app = functions.https.onRequest(app);

