/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    // database object
    db : {},
    // a count of the words in the db...
    wordCount : 0,
    correctDef : '',
    correctID : 0,
    definitionArray : [],
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },


    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },


    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.dbTransact();
    },


    // Create the Databse.
    dbTransact: function(){
        function populateDB(tx) {
            tx.executeSql('DROP TABLE IF EXISTS WORDS');
            tx.executeSql('CREATE TABLE IF NOT EXISTS WORDS (id unique, name, definition)');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (1, "Assuage", "To make (an unpleasant) feeling less intense")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (2, "Profligate", "Utterly and shamelessly immoral or dissipated recklessly prodigal or extravagant.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (3, "Succinct", "Expressed with few words, concise.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (4, "Carapace", "A bony or chitinous shield, test, or shell covering some or all of the dorsal part of an animal, as of a turtle.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (5, "Gossamer", "A fine cobweb in the bushes or floating calmly, especailly in autumn; A thread or web of substance; Light flimsy or delicate")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (6, "Ephemeral", "Lasting only a short time; short lived; transitory; lasting but one day.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (7, "Efficacious", "Capable of having the desired result or effect. Effective as a means, measure, remedy, etc.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (8, "Misnomer", "A misapplied or inappropriate name or designation; An error in naming a person or thing.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (9, "Venerable", "Commanding respect because of great age or impressive dignity; Impressive or interesting because of age.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (10, "Frenetic", "Frantic; Frenzied")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (11, "Equanimity", "Mental calmness, composure, and evenness of temper, especially in a difficult situation.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (12, "Quiescent", "Being at rest, quiet, still")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (13, "Ostensibly", "Apparently or purportedly, but perhaps not actually.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (14, "Subsume", "Include or absorb (something) in something else.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (15, "Obsequious", "Obedient or attentive to an excessive or servile degree.")');
        }

        function errorCB(err) {
            alert("Error processing SQL: "+err.code);
        }

        // query db to get word count
        function queryDB(tx){
            tx.executeSql('SELECT * FROM WORDS', [], querySuccess, errorCB);
        }
        
        // if successful query, set the apps word count...
        function querySuccess(tx, results){
            app.wordCount = results.rows.length;
            console.log('X ' + app.wordCount);
        }


        function successCB() {
            app.db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
            app.db.transaction(queryDB, errorCB);
            app.db.transaction(app.loadWord, errorCB);
        }

        app.db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
        app.db.transaction(populateDB, errorCB, successCB);
    },


    // get the answer
    loadWord : function(tx){
        function getRand(num, count){
            var rand = Math.floor(Math.random()*(app.wordCount-1+1)+1);
            if (rand != num){
                return rand;
            } else {
                return getRand(num, count);
            }
        }
        var rand = getRand(app.correctID, app.wordCount);
        var sql = 'SELECT * FROM WORDS WHERE id = ' + rand + ' AND id <> ' + app.correctID + ' LIMIT 1';
        tx.executeSql(sql, [], app.loadDOM, app.signalError);
    },


    // get definitions that are not the answer
    getDefs : function(tx){
        tx.executeSql('SELECT * FROM WORDS', [], app.loadDefs, app.signalError);
    },
    // load definitions,
    // assign correct class
    // add click correct event listener
    loadDefs : function(tx, results){
        function getRand(num, count){
            var rand = Math.floor(Math.random()*(app.wordCount-1+1)+1);
            if (rand != num){
                return rand;
            } else {
                return getRand(num, count);
            }
        }

        // dynamically creates an array of unique numbers...
        function randArr(num, count){
            var arr = [];
            var i = 0;
            while (i < 3){
                var rand = getRand(num, count) -1;
                if (arr.indexOf(rand) == -1 ){
                    //more crazy work around because sql random won't work...
                    if (results.rows.item(rand).id != num){
                        arr.push(rand);
                        i++;
                    }
                }
            }
            return arr;
        }
        var keep = randArr(app.correctID, app.wordCount, keep);
        
        for (var i = 0; i < keep.length; i++){
            app.definitionArray.push(results.rows.item(keep[i]).definition);
        }
        app.definitionArray.shuffle();
        var list = document.getElementById('definitionTest');
        for (var i = app.definitionArray.length - 1; i >= 0; i--) {
            var l = document.createElement('li');
            list.appendChild(l);
            l.innerHTML = app.definitionArray[i];
            // if this is the correct word, let it know...
            if (app.definitionArray[i] == app.correctDef){
                l.className += 'correct';
            }
            l.addEventListener('click',function(){ app.clickCorrect(this) });
        };
    },
    // create the new word, get the other defintions
    loadDOM : function(tx, results){
        var nameSelector = document.querySelector('.word-name');
        nameSelector.innerHTML = results.rows.item(0).name;
        app.correctDef = results.rows.item(0).definition;
        app.definitionArray.push(app.correctDef);
        app.correctID = results.rows.item(0).id;
        app.db.transaction(app.getDefs);
    },
    signalError : function(){
        alert('database Error');
    },
    // check if it is the correct
    clickCorrect : function(elem){
        // slowly fade background
        // if it's correct reload the dom,
        // if it isn't bring them back

        var message = '';
        var answer = false;
        // create the message
        if (elem.classList.contains('correct')){
            message = 'You are correct.';
            answer = true;
        } else {
            message = 'Incorrect, please try again.';
        }

        // create a div id of overlay....
        overlay = document.createElement("div");
        overlay.setAttribute("id", "overlay");
        document.body.appendChild(overlay);

        // fade it in
        fadeIn(overlay, 0.7);

        // fade in the text
        overText = document.createElement("div");
        overText.setAttribute("id", "overText");
        overText.innerHTML= message;
        document.body.appendChild(overText);
        fadeIn(overText, 1);

        // click event
        overlay.addEventListener('click', function(){app.removeNode(answer)});


    },
    removeNode : function(x){
        fadeOut();
        if (x === true){
            // empty out the word
            var nameSelector = document.querySelector('.word-name');
            nameSelector.innerHTML = '';

            // empty out the list
            var list = document.getElementById('definitionTest');
            list.innerHTML = '';

            // reset all the things
            app.correctDef = '';
            app.definitionArray = [];

            // reload all the things...
            app.db.transaction(app.loadWord, app.signalError);
        }
    }


};

// Helpers

/*
 * Add a shuffle function to Array object prototype
 * Usage : 
 *  var tmpArray = ["a", "b", "c", "d", "e"];
 *  tmpArray.shuffle();
 */
Array.prototype.shuffle = function (){
    var i = this.length, j, temp;
    if ( i == 0 ) return;
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
};


/* bring in an overlay */
function fadeIn(element, finalOp) {
    var op = 0;  // initial opacity
    var timer = setInterval(function () {
        if (op >= finalOp){
            clearInterval(timer);
        }
        element.style.opacity = op;
        op += 0.05;
    }, 20);
};

/* fade out the overlay */
// fade out
function fadeOut() {
    overlay = document.getElementById('overlay');
    overText = document.getElementById('overText');
    var op = .7;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            document.body.removeChild(overlay);
            document.body.removeChild(overText);
        }
        op -=  0.05;
        overlay.style.opacity = op;
        overText.style.opacity = op;
    }, 20);
}
