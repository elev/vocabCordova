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
        //app.receivedEvent('deviceready');
        console.log('deviceready is here');
        app.dbTransact();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        // console.log('Received Event: ' + id);
    },

    // Initial DB and Tests, This needs to be refactored...
    dbTransact: function(){
        function populateDB(tx) {
            tx.executeSql('DROP TABLE IF EXISTS WORDS');
            tx.executeSql('CREATE TABLE IF NOT EXISTS WORDS (id unique, name, definition)');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (1, "assuage", "To make (an unpleasant) feeling less intense")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (2, "profligate", "Utterly and shamelessly immoral or dissipated recklessly prodigal or extravagant.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (3, "succinct", "Expressed with few words, concise.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (4, "carapace", "A bony or chitinous shield, test, or shell covering some or all of the dorsal part of an animal, as of a turtle.")');
            tx.executeSql('INSERT INTO WORDS (id, name, definition) VALUES (5, "efficacious", "Capable of having the desired result or effect. Effective as a means, measure, remedy, etc.")');
        }

        function errorCB(err) {
            alert("Error processing SQL: "+err.code);
        }

        function queryDB(tx){
            tx.executeSql('SELECT * FROM WORDS', [], querySuccess, errorCB);
        }
        function querySuccess(tx, results){
            console.log('returned rows = ' + results.rows.length);
            app.wordCount = results.rows.length;
            for (var i = 0; i < results.rows.length; i++){
                console.log('Word: ' + results.rows.item(i).name + ' def ' + results.rows.item(i).definition);
            }
            // for (var i = 0; i < results.rows.length; i++) {
            //     console.log('Row: ' + i + ' ID ' + results.rows.item(i).id + ' data ' + results.rows.item(i).definition);
            // };
        }

        function successCB() {
            alert("success!");// !!!
            console.log('hit');
            app.db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
            app.db.transaction(queryDB, errorCB);
            app.db.transaction(app.loadWord, errorCB);
        }

        app.db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
        app.db.transaction(populateDB, errorCB, successCB);
    },
    // get the answer
    loadWord : function(tx){
        var rand = Math.floor((Math.random() * app.wordCount) + 1);
        tx.executeSql('SELECT * FROM WORDS WHERE id = ' + rand + ' LIMIT 1', [], app.loadDOM, app.signalError);
    },
    // get definitions that are not the answer
    getDefs : function(tx){
        console.log(app.correctDef);
        tx.executeSql('SELECT * FROM WORDS WHERE id <> ' + app.correctID + ' LIMIT 3', [], app.loadDefs, app.signalError);
    },
    // load definitions,
    // assign correct class
    // add click correct event listener
    loadDefs : function(tx, results){
        console.log('defs');
        for (var i = 0; i < results.rows.length; i++){
            console.log(results.rows.item(i).definition);
            app.definitionArray.push(results.rows.item(i).definition);
        }
        app.definitionArray.shuffle();
        var list = document.getElementById('definitionTest');
        for (var i = app.definitionArray.length - 1; i >= 0; i--) {
            var l = document.createElement('li');
            list.appendChild(l);
            l.innerHTML = app.definitionArray[i];
            // if this is the correct word, let it know...
            if (app.definitionArray[i] == app.correctDef){
                console.log('correcto');
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
        console.log('there was a problem');
    },
    // check if it is the correct
    clickCorrect : function(elem){
        // slowly fade background
        // if it's correct reload the dom,
        // if it isn't bring them back

        var message = '';
        // create the message
        if (elem.classList.contains('correct')){
            message = 'You are correct.';
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